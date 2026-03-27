/**
 * Networking Event Detail API
 * GET /api/networking/:id  (with RSVP count)
 * PUT /api/networking/:id
 */
import { NextRequest, NextResponse } from 'next/server';
import * as networkingDb from '@/lib/supabase/networking';
import type { UpdateNetworkingEventInput } from '@/types/networking';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const event = await networkingDb.fetchEventById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error('fetchEventById error:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json() as UpdateNetworkingEventInput;
    const event = await networkingDb.updateEvent(id, body);
    return NextResponse.json(event);
  } catch (error) {
    console.error('updateEvent error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}
