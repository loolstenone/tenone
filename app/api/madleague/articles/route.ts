import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// POST — 매드리거 투고 (draft 또는 pending_review)
export async function POST(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id, club_id, name').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  let body: {
    title?: string; subtitle?: string; content?: string;
    category?: string; tags?: string[]; thumbnail_url?: string;
    action?: 'draft' | 'submit';
  };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  if (!body.title || !body.content || !body.category) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (!['interview', 'case', 'report', 'cover', 'news'].includes(body.category)) {
    return NextResponse.json({ error: 'INVALID_CATEGORY' }, { status: 400 });
  }

  const m = member as { id: string; club_id: string | null; name: string };
  const slugBase = body.title.trim().toLowerCase().replace(/[^가-힣a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const slug = `${slugBase}-${Date.now().toString(36).slice(-5)}`;

  const status = body.action === 'submit' ? 'pending_review' : 'draft';

  const { data, error } = await sb.from('mad_articles').insert({
    slug,
    title: body.title.trim().slice(0, 200),
    subtitle: body.subtitle?.trim().slice(0, 300) || null,
    content: body.content.trim().slice(0, 50000),
    category: body.category,
    club_id: m.club_id,
    author_id: m.id,
    author_name: m.name,
    thumbnail_url: body.thumbnail_url?.trim() || null,
    tags: Array.isArray(body.tags) ? body.tags.slice(0, 10).map(t => String(t).trim().slice(0, 30)).filter(Boolean) : null,
    status,
    is_published: false,
    year: new Date().getFullYear(),
  }).select().single();

  if (error) {
    console.error('[articles POST]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, article: data });
}
