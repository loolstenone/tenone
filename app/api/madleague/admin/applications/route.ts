import { NextRequest, NextResponse } from 'next/server';
import { requireIntraAdmin, getAdminClient } from '../_auth';

export const runtime = 'nodejs';

// GET /api/madleague/admin/applications?status=pending&club=madleap
export async function GET(req: NextRequest) {
  const auth = await requireIntraAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? 'pending';
  const clubSlug = searchParams.get('club');

  const sb = getAdminClient();
  let q = sb
    .from('mad_applications')
    .select('*, mad_clubs(slug, name, region, color)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status !== 'all') q = q.eq('status', status);
  if (clubSlug) {
    const { data: club } = await sb.from('mad_clubs').select('id').eq('slug', clubSlug).maybeSingle();
    if (club) q = q.eq('club_id', club.id);
  }
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data ?? [] });
}

// PATCH /api/madleague/admin/applications
// { id, action: 'accept' | 'reject' | 'reviewing', note? }
export async function PATCH(req: NextRequest) {
  const auth = await requireIntraAdmin(req);
  if (auth instanceof NextResponse) return auth;

  let body: { id?: string; action?: string; note?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  if (!body.id || !body.action) return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  const map: Record<string, string> = { accept: 'accepted', reject: 'rejected', reviewing: 'reviewing' };
  const newStatus = map[body.action];
  if (!newStatus) return NextResponse.json({ error: 'INVALID_ACTION' }, { status: 400 });

  const sb = getAdminClient();
  const { error } = await sb
    .from('mad_applications')
    .update({ status: newStatus, reviewed_at: new Date().toISOString(), reviewer_note: body.note ?? null })
    .eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: newStatus });
}
