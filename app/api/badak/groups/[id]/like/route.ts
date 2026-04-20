import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

// GET: 좋아요 수 + 현재 유저 좋아요 여부
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;

  const { count } = await supabase
    .from('badak_group_likes')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);

  const authHeader = request.headers.get('authorization');
  let liked = false;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      const { data: member } = await supabase
        .from('badak_members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (member) {
        const { data } = await supabase
          .from('badak_group_likes')
          .select('id')
          .eq('group_id', groupId)
          .eq('member_id', member.id)
          .maybeSingle();
        liked = !!data;
      }
    }
  }

  return NextResponse.json({ count: count ?? 0, liked });
}

// POST: 좋아요 토글
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
    .maybeSingle();
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const { data: existing } = await supabase
    .from('badak_group_likes')
    .select('id')
    .eq('group_id', groupId)
    .eq('member_id', member.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('badak_group_likes').delete().eq('id', existing.id);
  } else {
    await supabase.from('badak_group_likes').insert({ group_id: groupId, member_id: member.id });
  }

  const { count } = await supabase
    .from('badak_group_likes')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);

  return NextResponse.json({ liked: !existing, count: count ?? 0 });
}
