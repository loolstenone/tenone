import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { earnUC } from '@/lib/supabase/uc';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

// GET: 댓글 목록
export async function GET(_request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  const { data, error } = await supabase
    .from('badak_community_comments')
    .select('*, member:badak_members!member_id(display_name, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ comments: data || [] });
}

// POST: 댓글 작성
export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.content?.trim()) return NextResponse.json({ error: '내용을 입력해주세요' }, { status: 400 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: comment, error } = await supabase
    .from('badak_community_comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      member_id: member?.id || null,
      content: body.content.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // UC 코인 지급 (댓글 작성)
  const { data: memberRow } = await supabase
    .from('members')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();
  if (memberRow) {
    await earnUC(memberRow.id, 'write_comment', 'badak');
  }

  // 원자적 카운트 업데이트
  const { count } = await supabase
    .from('badak_community_comments')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  await supabase
    .from('badak_community_posts')
    .update({ comments_count: count || 0 })
    .eq('id', postId);

  return NextResponse.json({ comment }, { status: 201 });
}

// DELETE: 댓글 삭제
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get('commentId');
  if (!commentId) return NextResponse.json({ error: 'commentId required' }, { status: 400 });

  // 본인 댓글만 삭제 가능
  const { data: comment } = await supabase
    .from('badak_community_comments')
    .select('id, user_id')
    .eq('id', commentId)
    .single();

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (comment.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await supabase.from('badak_community_comments').delete().eq('id', commentId);

  // 카운트 재계산
  const { count } = await supabase
    .from('badak_community_comments')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  await supabase
    .from('badak_community_posts')
    .update({ comments_count: count || 0 })
    .eq('id', postId);

  return NextResponse.json({ deleted: true });
}
