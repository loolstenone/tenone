/**
 * Networking RSVP API
 * GET  /api/networking/:id/rsvps
 * POST /api/networking/:id/rsvps
 */
import { NextRequest, NextResponse } from 'next/server';
import * as networkingDb from '@/lib/supabase/networking';
import type { CreateRsvpInput } from '@/types/networking';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const rsvps = await networkingDb.fetchRsvps(id);
    return NextResponse.json(rsvps);
  } catch (error) {
    console.error('fetchRsvps error:', error);
    return NextResponse.json({ error: 'Failed to fetch RSVPs' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json() as Omit<CreateRsvpInput, 'eventId'>;

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'name and email are required' },
        { status: 400 }
      );
    }

    const rsvp = await networkingDb.createRsvp({
      ...body,
      eventId: id,
    });
    return NextResponse.json(rsvp, { status: 201 });
  } catch (error) {
    console.error('createRsvp error:', error);
    return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 });
  }
}
