import { NextRequest, NextResponse } from 'next/server';
import { requireIntraAdmin, getAdminClient } from '../_auth';

export const runtime = 'nodejs';

// GET /api/madleague/admin/articles?status=pending_review
export async function GET(req: NextRequest) {
  const auth = await requireIntraAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const sb = getAdminClient();
  let q = sb
    .from('mad_articles')
    .select('id, slug, title, category, status, is_published, is_featured, published_at, author_name, author_id, club_id, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data ?? [] });
}

// PATCH { id, action?: 'publish' | 'reject', reject_reason?, is_featured?, is_published? }
export async function PATCH(req: NextRequest) {
  const auth = await requireIntraAdmin(req);
  if (auth instanceof NextResponse) return auth;

  let body: { id?: string; action?: string; reject_reason?: string; is_published?: boolean; is_featured?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }
  if (!body.id) return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.action === 'publish') {
    update.status = 'published';
    update.is_published = true;
    update.reviewed_at = new Date().toISOString();
    update.published_at = new Date().toISOString();
  } else if (body.action === 'reject') {
    update.status = 'rejected';
    update.is_published = false;
    update.reviewed_at = new Date().toISOString();
    if (body.reject_reason) update.reject_reason = body.reject_reason;
  } else if (body.action === 'unpublish') {
    update.status = 'draft';
    update.is_published = false;
  }
  if (typeof body.is_published === 'boolean' && !body.action) update.is_published = body.is_published;
  if (typeof body.is_featured === 'boolean') update.is_featured = body.is_featured;

  const sb = getAdminClient();
  const { error } = await sb.from('mad_articles').update(update).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
