import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

// GET: 모임 게시글 목록
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');

  // 전체 카운트
  const { count: totalCount } = await supabase
    .from('badak_group_posts')
    .select('id', { count: 'exact', head: true })
    .eq('group_id', groupId);

  const { data, error } = await supabase
    .from('badak_group_posts')
    .select(`
      id, title, content, images, pinned, created_at, author_id,
      author:badak_members!badak_group_posts_author_id_fkey(id, display_name, avatar_url, job_function)
    `)
    .eq('group_id', groupId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 댓글 수 — postId 목록으로 한 번에 가져오기
  const postIds = (data || []).map(p => p.id);
  const commentCounts: Record<string, number> = {};

  if (postIds.length > 0) {
    const { data: countData } = await supabase
      .from('badak_group_comments')
      .select('post_id')
      .in('post_id', postIds);

    for (const row of countData || []) {
      commentCounts[row.post_id] = (commentCounts[row.post_id] || 0) + 1;
    }
  }

  const posts = (data || []).map(post => ({
    ...post,
    commentCount: commentCounts[post.id] || 0,
  }));

  return NextResponse.json({ posts, total: totalCount || 0 });
}

// POST: 게시글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const body = await request.json();
  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
  }

  const { data: post, error } = await supabase
    .from('badak_group_posts')
    .insert({
      group_id: groupId,
      author_id: member.id,
      title: body.title.trim(),
      content: body.content.trim(),
      images: body.images || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ post });
}

// PUT: 게시글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await params; // groupId not needed for auth check
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const body = await request.json();
  if (!body.postId) return NextResponse.json({ error: 'postId required' }, { status: 400 });

  // 본인 글만 수정
  const { data: post } = await supabase
    .from('badak_group_posts')
    .select('id, author_id')
    .eq('id', body.postId)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.author_id !== member.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updates: Record<string, unknown> = {};
  if (body.title?.trim()) updates.title = body.title.trim();
  if (body.content?.trim()) updates.content = body.content.trim();
  if (body.images) updates.images = body.images;

  const { data: updated, error } = await supabase
    .from('badak_group_posts')
    .update(updates)
    .eq('id', body.postId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ post: updated });
}

// DELETE: 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 });

  const { data: post } = await supabase
    .from('badak_group_posts')
    .select('id, author_id')
    .eq('id', postId)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.author_id !== member.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await supabase.from('badak_group_comments').delete().eq('post_id', postId);
  await supabase.from('badak_group_posts').delete().eq('id', postId);

  return NextResponse.json({ deleted: true });
}
