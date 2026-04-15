import { NextRequest, NextResponse } from 'next/server';
import { requireIntraAdmin, getAdminClient } from '../_auth';

export const runtime = 'nodejs';

// GET /api/madleague/admin/hero?status=pending
export async function GET(req: NextRequest) {
  const auth = await requireIntraAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? 'pending';
  const sb = getAdminClient();
  let q = sb.from('mad_hero_applications').select('*').order('created_at', { ascending: false }).limit(200);
  if (status !== 'all') q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data ?? [] });
}

// PATCH { id, status }
export async function PATCH(req: NextRequest) {
  const auth = await requireIntraAdmin(req);
  if (auth instanceof NextResponse) return auth;

  let body: { id?: string; status?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }
  if (!body.id || !body.status) return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  if (!['pending', 'contacted', 'matched', 'closed'].includes(body.status)) {
    return NextResponse.json({ error: 'INVALID_STATUS' }, { status: 400 });
  }

  const sb = getAdminClient();
  const { error } = await sb.from('mad_hero_applications').update({ status: body.status }).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
