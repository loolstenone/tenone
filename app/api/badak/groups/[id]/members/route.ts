import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

/**
 * PUT /api/badak/groups/[id]/members
 * 지원자 승인 / 거절 (리더만)
 *
 * Body: { membershipId: string, action: 'approved' | 'rejected' }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 내 badak_member id
  const { data: me } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!me) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  // 리더 확인
  const { data: group } = await supabase
    .from('badak_groups')
    .select('id, leader_id, current_members, max_members')
    .eq('id', groupId)
    .single();
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  if (group.leader_id !== me.id) {
    return NextResponse.json({ error: 'Forbidden: not the leader' }, { status: 403 });
  }

  const body = await request.json();
  const { membershipId, action } = body as { membershipId: string; action: 'approved' | 'rejected' };
  if (!membershipId || !['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'membershipId and action required' }, { status: 400 });
  }

  // 현재 상태 확인
  const { data: membership } = await supabase
    .from('badak_group_members')
    .select('id, status, member_id')
    .eq('id', membershipId)
    .eq('group_id', groupId)
    .single();
  if (!membership) return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
  if (membership.status !== 'pending' && membership.status !== 'applied') {
    return NextResponse.json({ error: 'Already processed' }, { status: 409 });
  }

  // 승인 시 정원 초과 확인
  if (action === 'approved' && group.current_members >= group.max_members) {
    return NextResponse.json({ error: 'Group is full' }, { status: 400 });
  }

  // 상태 업데이트
  const { error: updateError } = await supabase
    .from('badak_group_members')
    .update({ status: action })
    .eq('id', membershipId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  // 승인 시 current_members 증가
  if (action === 'approved') {
    await supabase.rpc('badak_increment_group_members', { group_uuid: groupId });
  }

  // 신청자에게 알림
  const { data: applicantMember } = await supabase
    .from('badak_members')
    .select('user_id, display_name')
    .eq('id', membership.member_id)
    .single();

  const { data: groupInfo } = await supabase
    .from('badak_groups')
    .select('title')
    .eq('id', groupId)
    .single();

  if (applicantMember?.user_id && groupInfo) {
    await supabase.from('badak_notifications').insert({
      user_id: applicantMember.user_id,
      type: action === 'approved' ? 'join_approved' : 'join_rejected',
      title: action === 'approved'
        ? `"${groupInfo.title}" 참여가 승인되었습니다`
        : `"${groupInfo.title}" 참여 신청이 거절되었습니다`,
      body: null,
      link: action === 'approved' ? `/badak/groups/${groupId}` : null,
      metadata: { groupId, membershipId },
    });
  }

  return NextResponse.json({ success: true, action });
}
