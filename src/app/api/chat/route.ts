import { NextRequest, NextResponse } from 'next/server';
import { chatWithCityAssistant } from '@/lib/ai';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, cityId, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    let history: { role: string; content: string }[] = [];
    if (sessionId) {
      try {
        const dbHistory = await db.chatHistory.findMany({
          where: { sessionId },
          orderBy: { createdAt: 'desc' },
          take: 6,
        });
        history = dbHistory.reverse().map((h) => ({ role: h.role, content: h.content }));
      } catch {}
    }

    const result = await chatWithCityAssistant(message, cityId, history);

    if (sessionId) {
      try {
        await db.chatHistory.createMany({
          data: [
            { sessionId, role: 'user', content: message, city: cityId || null },
            { sessionId, role: 'assistant', content: result.content, city: cityId || null },
          ],
        });
      } catch {}
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        content: 'Service temporarily unavailable. Please explore the map and tabs in the meantime.',
      },
      { status: 500 }
    );
  }
}
