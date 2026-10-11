import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withMadAuthors } from '@/lib/madleague-people';

export const runtime = 'nodejs';

// GET /api/madleague/posts?category=free&limit=30 (동아리 방 글은 2026-10-11 폐지)
export async function GET(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 100);

  let q = sb
    .from('mad_posts')
    .select('*, mad_clubs(slug, name, color)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (category && category !== 'all') q = q.eq('category', category);
  // 동아리 방(club_id) 글은 2026-10-11 폐지 — 커뮤니티 피드는 club_id null만
  q = q.is('club_id', null);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: await withMadAuthors(data ?? []) });
}

// POST { category, title, content, clubId? }
export async function POST(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id, club_id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  interface MediaItem { url: string; type: 'image' | 'video' | 'file'; name: string; size: number; }
  let body: { category?: string; title?: string; content?: string; media?: MediaItem[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }
  if (!body.title || !body.content) return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  // 동아리 방 글(clubId)은 2026-10-11 폐지 — 커뮤니티 글만
  if (body.category && !['free', 'question', 'share', 'insight', 'pinboard'].includes(body.category)) {
    return NextResponse.json({ error: 'INVALID_CATEGORY' }, { status: 400 });
  }

  const media = Array.isArray(body.media) ? body.media.slice(0, 5) : [];

  const { data, error } = await sb
    .from('mad_posts')
    .insert({
      author_id: (member as { id: string }).id,
      club_id: null,
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
