import { NextRequest, NextResponse } from 'next/server';
import { generateCityInsights } from '@/lib/ai';

export async function GET(req: NextRequest) {
  const cityId = req.nextUrl.searchParams.get('cityId') || 'mumbai';
  const result = await generateCityInsights(cityId);
  return NextResponse.json(result);
}
