import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyzeCitizenReports } from '@/lib/ai';

export async function GET(req: NextRequest) {
  const cityId = req.nextUrl.searchParams.get('cityId') || 'mumbai';
  const analyze = req.nextUrl.searchParams.get('analyze') === 'true';

  const reports = await db.citizenReport.findMany({
    where: { city: cityId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  if (analyze) {
    const analysis = await analyzeCitizenReports(cityId, reports);
    return NextResponse.json({ reports, analysis: analysis.data });
  }

  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, category, title, description, lat, lng, severity, imageUrl, voiceNote } = body;

    if (!city || !category || !title || lat == null || lng == null) {
      return NextResponse.json({ error: 'city, category, title, lat, lng required' }, { status: 400 });
    }

    const report = await db.citizenReport.create({
      data: {
        city,
        category,
        title,
        description: description || '',
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        severity: severity || 'medium',
        imageUrl: imageUrl || null,
        voiceNote: voiceNote || null,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Report POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action } = body;
    if (action === 'upvote') {
      const report = await db.citizenReport.update({
        where: { id },
        data: { upvotes: { increment: 1 } },
      });
      return NextResponse.json({ success: true, report });
    }
    if (action === 'verify') {
      const report = await db.citizenReport.update({
        where: { id },
        data: { status: 'verified' },
      });
      return NextResponse.json({ success: true, report });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
