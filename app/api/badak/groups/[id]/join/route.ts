import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// POST: 모임 참여 신청
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

  if (!member) return NextResponse.json({ error: 'Badak member not found' }, { status: 404 });

  // 모임 정보 확인
  const { data: group } = await supabase
    .from('badak_groups')
    .select('id, current_members, max_members, status')
    .eq('id', groupId)
    .single();

  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  if (group.status === 'closed' || group.status === 'completed') {
    return NextResponse.json({ error: 'Group is closed' }, { status: 400 });
  }
  if (group.current_members >= group.max_members) {
    return NextResponse.json({ error: 'Group is full' }, { status: 400 });
  }

  // 이미 참여 중인지 확인
  const { data: existing } = await supabase
    .from('badak_group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('member_id', member.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Already applied', status: 'already_applied' }, { status: 409 });
  }

  // 참여 신청 (insert, not upsert)
  const { error } = await supabase
    .from('badak_group_members')
    .insert({ group_id: groupId, member_id: member.id, status: 'applied' });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // current_members 원자적 증가 (race condition 방지)
  await supabase.rpc('badak_increment_group_members', { group_uuid: groupId });

  return NextResponse.json({ status: 'applied' });
}
