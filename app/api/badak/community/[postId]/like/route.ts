import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

// POST: 좋아요 토글
export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 이미 좋아요 했는지 확인
  const { data: existing } = await supabase
    .from('badak_community_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('badak_community_likes').delete().eq('id', existing.id);
  } else {
    await supabase.from('badak_community_likes').insert({ post_id: postId, user_id: user.id });
  }

  // 카운트 재계산
  const { count } = await supabase
    .from('badak_community_likes')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  await supabase
    .from('badak_community_posts')
    .update({ likes_count: count || 0 })
    .eq('id', postId);

  return NextResponse.json({ liked: !existing, likesCount: count || 0 });
}
