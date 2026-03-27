/**
 * Networking Events API
 * GET  /api/networking?brandId=
 * POST /api/networking
 */
import { NextRequest, NextResponse } from 'next/server';
import * as networkingDb from '@/lib/supabase/networking';
import type { CreateNetworkingEventInput } from '@/types/networking';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brandId') || undefined;

  try {
    const events = await networkingDb.fetchEvents(brandId);
    return NextResponse.json(events);
  } catch (error) {
    console.error('fetchEvents error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateNetworkingEventInput;

    if (!body.brandId || !body.title || !body.type || !body.startAt) {
      return NextResponse.json(
        { error: 'brandId, title, type, startAt are required' },
        { status: 400 }
      );
    }

    const event = await networkingDb.createEvent(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('createEvent error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
