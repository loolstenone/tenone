import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET — 글 상세 + 댓글
export async function GET(_req: Request, { params }: RouteProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  const [postRes, commentsRes] = await Promise.all([
    sb.from('mad_posts')
      .select('*, mad_members!author_id(name, avatar_url), mad_clubs(slug, name, color)')
      .eq('id', id)
      .maybeSingle(),
    sb.from('mad_comments')
      .select('*, mad_members!author_id(name, avatar_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
  ]);
  if (!postRes.data) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ post: postRes.data, comments: commentsRes.data ?? [] });
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

  const { data, error } = await sb.from('mad_comments')
    .insert({ post_id: id, author_id: (member as { id: string }).id, content: body.content.trim().slice(0, 2000) })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, comment: data });
}

// DELETE — 본인 글 삭제
export async function DELETE(_req: Request, { params }: RouteProps) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb.from('mad_members').select('id').eq('user_id', user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  const { data: post } = await sb.from('mad_posts').select('author_id').eq('id', id).maybeSingle();
  if (!post) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (post.author_id !== (member as { id: string }).id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const { error } = await sb.from('mad_posts').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
