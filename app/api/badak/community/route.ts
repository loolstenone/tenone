import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

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

  return NextResponse.json({ post }, { status: 201 });
}
