import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

// GET: 참여 상태 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ status: 'none' });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ status: 'none' });

  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!member) return NextResponse.json({ status: 'none' });

  // 리더인지 확인
  const { data: group } = await supabase
    .from('badak_groups')
    .select('leader_id')
    .eq('id', groupId)
    .single();

  if (group?.leader_id === member.id) {
    return NextResponse.json({ status: 'leader' });
  }

  // 참여 상태 확인
  const { data: membership } = await supabase
    .from('badak_group_members')
    .select('status')
    .eq('group_id', groupId)
    .eq('member_id', member.id)
    .maybeSingle();

  return NextResponse.json({ status: membership?.status || 'none' });
}

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
    .select('id, current_members, max_members, status, join_type')
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

  // firstcome: 즉시 승인, approval: 대기
  const isFirstcome = group.join_type === 'firstcome';
  const memberStatus = isFirstcome ? 'approved' : 'applied';

  const { error } = await supabase
    .from('badak_group_members')
    .insert({ group_id: groupId, member_id: member.id, status: memberStatus });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // current_members 원자적 증가 (race condition 방지)
  await supabase.rpc('badak_increment_group_members', { group_uuid: groupId });

  // 알림 생성
  const { data: groupFull } = await supabase
    .from('badak_groups')
    .select('title, leader:badak_members!badak_groups_leader_id_fkey(id, user_id, display_name)')
    .eq('id', groupId)
    .single();

  const { data: applicant } = await supabase
    .from('badak_members')
    .select('display_name')
    .eq('id', member.id)
    .single();

  const groupTitle = groupFull?.title ?? '모임';
  const applicantName = applicant?.display_name ?? '새 멤버';
  const leaderData = groupFull?.leader as unknown as { user_id: string; display_name: string } | null;

  // ① 바닥장에게 알림 (승인제 모임만)
  if (!isFirstcome && leaderData?.user_id) {
    await supabase.from('badak_notifications').insert({
      user_id: leaderData.user_id,
      type: 'join_request',
      title: `${applicantName}님이 참여를 신청했습니다`,
      body: groupTitle,
      link: `/badak/groups/${groupId}`,
      metadata: { groupId, memberId: member.id },
    });
  }

  // ② 신청자에게 알림
  if (isFirstcome) {
    // 선착순: 즉시 승인 알림
    await supabase.from('badak_notifications').insert({
      user_id: user.id,
      type: 'join_approved',
      title: `"${groupTitle}" 참여가 확정됐어요! 🎉`,
      body: '바닥장이 일정을 공유할 거예요. 게시판을 확인해보세요.',
      link: `/badak/groups/${groupId}`,
      metadata: { groupId },
    });
  } else {
    // 승인제: 신청 접수 알림
    await supabase.from('badak_notifications').insert({
      user_id: user.id,
      type: 'join_pending',
      title: `"${groupTitle}" 참여 신청이 접수됐어요`,
      body: `바닥장(${leaderData?.display_name ?? ''})이 검토 후 승인하면 알려드릴게요.`,
      link: `/badak/groups/${groupId}`,
      metadata: { groupId },
    });
  }

  return NextResponse.json({ status: memberStatus });
}
