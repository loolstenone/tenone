import { NextRequest, NextResponse } from 'next/server';
import { requireIntraAdmin, getAdminClient } from '../_auth';

export const runtime = 'nodejs';

// GET /api/madleague/admin/articles
export async function GET(req: NextRequest) {
  const auth = await requireIntraAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const sb = getAdminClient();
  const { data, error } = await sb
    .from('mad_articles')
    .select('id, slug, title, category, is_published, is_featured, published_at, author_name, club_id')
    .order('published_at', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data ?? [] });
}

// PATCH { id, is_published?, is_featured? }
export async function PATCH(req: NextRequest) {
  const auth = await requireIntraAdmin(req);
  if (auth instanceof NextResponse) return auth;

  let body: { id?: string; is_published?: boolean; is_featured?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }
  if (!body.id) return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.is_published === 'boolean') update.is_published = body.is_published;
  if (typeof body.is_featured === 'boolean') update.is_featured = body.is_featured;

  const sb = getAdminClient();
  const { error } = await sb.from('mad_articles').update(update).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
