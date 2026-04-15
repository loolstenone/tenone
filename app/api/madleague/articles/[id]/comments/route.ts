import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET — 댓글 목록
export async function GET(_req: Request, { params }: RouteProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data } = await sb.from('mad_article_comments')
    .select('id, content, created_at, author_id, mad_members!author_id(name, avatar_url)')
    .eq('article_id', id)
    .order('created_at', { ascending: true });
  return NextResponse.json({ comments: data ?? [] });
}

// POST { content } — 댓글 작성
export async function POST(req: Request, { params }: RouteProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  let body: { content?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }
  if (!body.content?.trim()) return NextResponse.json({ error: 'MISSING_CONTENT' }, { status: 400 });

  const { data, error } = await sb.from('mad_article_comments').insert({
    article_id: id,
    author_id: (member as { id: string }).id,
    content: body.content.trim().slice(0, 2000),
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, comment: data });
}
