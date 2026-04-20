import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

// GET: 글 상세 + 조회수 증가 (로그인 유저: 중복 방지 / 비로그인: 매 요청 +1)
export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  const authHeader = request.headers.get('authorization');
  let shouldIncrement = true;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      // 이미 조회한 기록이 있으면 증가 안 함
      const { error: insertError } = await supabase
        .from('badak_community_views')
        .insert({ post_id: postId, user_id: user.id });
      // PK 충돌 = 이미 조회함
      shouldIncrement = !insertError || insertError.code !== '23505';
    }
  }

  if (shouldIncrement) {
    const { data: current } = await supabase
      .from('badak_community_posts')
      .select('views_count')
      .eq('id', postId)
      .single();

    if (current) {
      await supabase
        .from('badak_community_posts')
        .update({ views_count: (current.views_count || 0) + 1 })
        .eq('id', postId);
    }
  }

  const { data: post } = await supabase
    .from('badak_community_posts')
    .select('*, member:badak_members!member_id(display_name, job_function, avatar_url)')
    .eq('id', postId)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: comments } = await supabase
    .from('badak_community_comments')
    .select('*, member:badak_members!member_id(display_name, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  return NextResponse.json({ post, comments: comments || [] });
}

// PUT: 글 수정
export async function PUT(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 본인 글만 수정 가능
  const { data: post } = await supabase
    .from('badak_community_posts')
    .select('id, user_id')
    .eq('id', postId)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.title?.trim()) updates.title = body.title.trim();
  if (body.content?.trim()) updates.content = body.content.trim();
  if (body.tags) updates.tags = body.tags;
  if (body.rating !== undefined) updates.rating = body.rating;
  if (body.targetMembers !== undefined) updates.target_members = body.targetMembers;
  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from('badak_community_posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ post: updated });
}

// DELETE: 글 삭제
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: post } = await supabase
    .from('badak_community_posts')
    .select('id, user_id')
    .eq('id', postId)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // 댓글, 좋아요 먼저 삭제
  await supabase.from('badak_community_comments').delete().eq('post_id', postId);
  await supabase.from('badak_community_likes').delete().eq('post_id', postId);
  await supabase.from('badak_community_posts').delete().eq('id', postId);

  return NextResponse.json({ deleted: true });
}
