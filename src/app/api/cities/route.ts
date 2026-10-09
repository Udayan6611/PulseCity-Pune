import { NextResponse } from 'next/server';
import { cities, places } from '@/lib/city-data';

export async function GET() {
  return NextResponse.json({
    cities,
    places,
    lastUpdated: new Date().toISOString(),
  });
}
