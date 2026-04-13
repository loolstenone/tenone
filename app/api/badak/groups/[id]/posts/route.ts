import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET: 모임 게시글 목록
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;

  const { data, error } = await supabase
    .from('badak_group_posts')
    .select(`
      id, title, content, images, pinned, created_at,
      author:badak_members!badak_group_posts_author_id_fkey(id, display_name, avatar_url, job_function)
    `)
    .eq('group_id', groupId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 댓글 수 추가
  const posts = await Promise.all(
    (data || []).map(async (post) => {
      const { count } = await supabase
        .from('badak_group_comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', post.id);
      return { ...post, commentCount: count || 0 };
    }),
  );

  return NextResponse.json({ posts });
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
