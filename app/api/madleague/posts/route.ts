import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET /api/madleague/posts?category=free&club=madleap&limit=30
export async function GET(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const clubSlug = url.searchParams.get('club');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 100);

  let q = sb
    .from('mad_posts')
    .select('*, mad_members!author_id(name, avatar_url), mad_clubs(slug, name, color)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (category && category !== 'all') q = q.eq('category', category);
  if (clubSlug) {
    const { data: club } = await sb.from('mad_clubs').select('id').eq('slug', clubSlug).maybeSingle();
    if (club) q = q.eq('club_id', club.id);
  }
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

// POST { category, title, content, clubId? }
export async function POST(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id, club_id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  interface MediaItem { url: string; type: 'image' | 'video' | 'file'; name: string; size: number; }
  let body: { category?: string; title?: string; content?: string; clubId?: string; clubSlug?: string; media?: MediaItem[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }
  if (!body.title || !body.content) return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  if (body.category && !['free', 'question', 'share', 'insight', 'pinboard'].includes(body.category)) {
    return NextResponse.json({ error: 'INVALID_CATEGORY' }, { status: 400 });
  }

  let clubId: string | null = body.clubId ?? null;
  if (!clubId && body.clubSlug) {
    const { data: c } = await sb.from('mad_clubs').select('id').eq('slug', body.clubSlug).maybeSingle();
    clubId = c?.id ?? null;
  }

  const media = Array.isArray(body.media) ? body.media.slice(0, 5) : [];

  const { data, error } = await sb
    .from('mad_posts')
    .insert({
      author_id: (member as { id: string }).id,
      club_id: clubId,
      category: body.category ?? 'free',
      title: body.title.trim().slice(0, 200),
      content: body.content.trim().slice(0, 10000),
      media,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, post: data });
}
