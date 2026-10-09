import { NextRequest, NextResponse } from 'next/server';
import { suggestSaferRoute } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cityId, fromLat, fromLng, toLat, toLng } = body;
    if (!cityId || fromLat == null || toLat == null) {
      return NextResponse.json({ error: 'cityId, fromLat/Lng, toLat/Lng required' }, { status: 400 });
    }
    const result = await suggestSaferRoute(cityId, fromLat, fromLng, toLat, toLng);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
