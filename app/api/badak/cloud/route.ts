import { NextResponse } from 'next/server';
import { CLOUD_WORDS } from '@/lib/badak-cloud-data';

export async function GET() {
  // Phase 0: mock data. Phase 1: fetch from badak_needs table
  return NextResponse.json({ needs: CLOUD_WORDS });
}
