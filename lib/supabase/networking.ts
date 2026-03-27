/**
 * Networking 모듈 Supabase CRUD
 * networking_events, networking_rsvps
 */
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import type {
  NetworkingEvent, NetworkingRsvp,
  CreateNetworkingEventInput, UpdateNetworkingEventInput,
  CreateRsvpInput, UpdateRsvpInput,
} from '@/types/networking';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── 유틸 ──

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    const snakeKey = key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
    result[snakeKey] = value;
  }
  return result;
}

function toEvent(row: Record<string, unknown>): NetworkingEvent {
  return snakeToCamel(row) as unknown as NetworkingEvent;
}

function toRsvp(row: Record<string, unknown>): NetworkingRsvp {
  return snakeToCamel(row) as unknown as NetworkingRsvp;
}

// ── Events ──

export async function fetchEvents(brandId?: string): Promise<NetworkingEvent[]> {
  let query = supabase
    .from('networking_events')
    .select('*')
    .order('start_at', { ascending: true });

  if (brandId) query = query.eq('brand_id', brandId);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(toEvent);
}

export async function fetchEventById(id: string): Promise<(NetworkingEvent & { rsvpCount: number }) | null> {
  const { data, error } = await supabase
    .from('networking_events')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;

  // RSVP count (registered + attended only)
  const { count } = await supabase
    .from('networking_rsvps')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', id)
    .in('status', ['registered', 'attended']);

  const event = toEvent(data) as NetworkingEvent & { rsvpCount: number };
  event.rsvpCount = count || 0;
  return event;
}

export async function createEvent(input: CreateNetworkingEventInput): Promise<NetworkingEvent> {
  const row: Record<string, unknown> = {
    brand_id: input.brandId,
    title: input.title,
    description: input.description || null,
    type: input.type,
    status: input.status || 'draft',
    location: input.location || null,
    online_url: input.onlineUrl || null,
    start_at: input.startAt,
    end_at: input.endAt || null,
    max_attendees: input.maxAttendees || null,
    organizer_id: input.organizerId || null,
    tags: input.tags || [],
    cover_image: input.coverImage || null,
  };

  const { data, error } = await supabase
    .from('networking_events')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return toEvent(data);
}

export async function updateEvent(id: string, input: UpdateNetworkingEventInput): Promise<NetworkingEvent> {
  const row = camelToSnake(input as unknown as Record<string, unknown>);
  row.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('networking_events')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return toEvent(data);
}

// ── RSVPs ──

export async function fetchRsvps(eventId: string): Promise<NetworkingRsvp[]> {
  const { data, error } = await supabase
    .from('networking_rsvps')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(toRsvp);
}

export async function createRsvp(input: CreateRsvpInput): Promise<NetworkingRsvp> {
  const row: Record<string, unknown> = {
    event_id: input.eventId,
    user_id: input.userId || null,
    name: input.name,
    email: input.email,
    company: input.company || null,
    status: input.status || 'registered',
    note: input.note || null,
  };

  const { data, error } = await supabase
    .from('networking_rsvps')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return toRsvp(data);
}

export async function updateRsvp(id: string, input: UpdateRsvpInput): Promise<NetworkingRsvp> {
  const row = camelToSnake(input as unknown as Record<string, unknown>);
  row.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('networking_rsvps')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return toRsvp(data);
}
