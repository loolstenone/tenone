import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { earnUC } from '@/lib/supabase/uc';

const supabase = createAdminClient();

// GET: 커뮤니티 글 목록
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const board = searchParams.get('board') || 'chat';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data: posts, error } = await supabase
    .from('badak_community_posts')
    .select('*, member:badak_members!member_id(display_name, job_function, avatar_url)')
    .eq('board', board)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ posts: posts || [] });
}

// PATCH: 관리자 숨김/표시 토글
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, is_hidden } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await supabase
    .from('badak_community_posts')
    .update({ is_hidden })
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ updated: true });
}

// DELETE: 관리자 글 삭제
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await supabase.from('badak_community_comments').delete().eq('post_id', id);
  await supabase.from('badak_community_likes').delete().eq('post_id', id);
  const { error } = await supabase.from('badak_community_posts').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ deleted: true });
}

// POST: 글 작성
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { board, title, content, tags, groupId, rating, targetMembers } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: '제목과 내용을 입력해주세요' }, { status: 400 });
  }

  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: post, error } = await supabase
    .from('badak_community_posts')
    .insert({
      user_id: user.id,
      member_id: member?.id || null,
      board: board || 'chat',
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      group_id: groupId || null,
      rating: rating || null,
      target_members: targetMembers || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // UC 코인 지급 (게시글 작성, review 보드 제외 — write_review로 별도 처리)
  if (board !== 'review') {
    const { data: memberRow } = await supabase
      .from('members')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();
    if (memberRow) {
      await earnUC(memberRow.id, 'write_post', 'badak');
    }
  }

  return NextResponse.json({ post }, { status: 201 });
}
