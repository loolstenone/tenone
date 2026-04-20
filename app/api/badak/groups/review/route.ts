import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

async function requireAdmin(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (member?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return { userId: user.id };
}

// GET: 심사 대기 모임 목록
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending_review';

  const { data, error } = await supabase
    .from('badak_groups')
    .select(`
      id, title, description, status, group_type, max_members, current_members,
      event_date, location, fee, tags, leader_reason, created_at,
      reviewed_at, reject_reason,
      leader:badak_members!badak_groups_leader_id_fkey(id, display_name, job_function, experience_years)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ groups: data || [] });
}

// PATCH: 심사 처리 (승인/반려/완료)
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { groupId, action, rejectReason } = body;

  if (!groupId || !['approve', 'reject', 'complete'].includes(action)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  // 모임 완료 처리
  if (action === 'complete') {
    // 모임 정보 + 바닥장 id 조회
    const { data: group, error: groupErr } = await supabase
      .from('badak_groups')
      .select('id, status, leader_id')
      .eq('id', groupId)
      .single();

    if (groupErr || !group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    if (!['recruiting', 'confirmed'].includes(group.status)) {
      return NextResponse.json({ error: 'Only recruiting/confirmed groups can be completed' }, { status: 400 });
    }

    // 모임 상태 → completed
    const { error: updateErr } = await supabase
      .from('badak_groups')
      .update({ status: 'completed' })
      .eq('id', groupId);

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 400 });

    // 바닥장 completed_groups_count +1
    const { data: member, error: memberErr } = await supabase
      .from('badak_members')
      .select('id, leader_level, completed_groups_count, specialist_invited')
      .eq('id', group.leader_id)
      .single();

    if (memberErr || !member) return NextResponse.json({ success: true, promoted: false });

    const newCount = (member.completed_groups_count ?? 0) + 1;
    await supabase
      .from('badak_members')
      .update({ completed_groups_count: newCount, level_updated_at: new Date().toISOString() })
      .eq('id', member.id);

    // 자동승급 체크 (Specialist는 초대 필요 → 제외)
    const currentLevel = member.leader_level ?? 'C';
    let newLevel: string | null = null;

    if (currentLevel === 'C' && newCount >= 3) newLevel = 'B';
    else if (currentLevel === 'B' && newCount >= 10) newLevel = 'A';

    if (newLevel) {
      await supabase
        .from('badak_members')
        .update({ leader_level: newLevel, level_updated_at: new Date().toISOString() })
        .eq('id', member.id);

      await supabase
        .from('badak_level_history')
        .insert({
          member_id: member.id,
          from_level: currentLevel,
          to_level: newLevel,
          reason: 'auto_promotion',
        });

      return NextResponse.json({ success: true, promoted: true, from: currentLevel, to: newLevel });
    }

    return NextResponse.json({ success: true, promoted: false });
  }

  const updateData: Record<string, unknown> = {
    status: action === 'approve' ? 'recruiting' : 'rejected',
    reviewed_at: new Date().toISOString(),
  };

  if (action === 'reject' && rejectReason) {
    updateData.reject_reason = rejectReason;
  }

  const { data: updatedGroup, error } = await supabase
    .from('badak_groups')
    .update(updateData)
    .eq('id', groupId)
    .select('id, need_id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 승인 시 연결된 니즈 상태 → group_created
  if (action === 'approve' && updatedGroup?.need_id) {
    await supabase
      .from('badak_needs')
      .update({ status: 'group_created', updated_at: new Date().toISOString() })
      .eq('id', updatedGroup.need_id);
  }

  return NextResponse.json({ success: true, status: updateData.status });
}
