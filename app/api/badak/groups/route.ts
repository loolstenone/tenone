import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

// GET: 모임 목록
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');

  let query = supabase
    .from('badak_groups')
    .select(`
      id, title, description, status, max_members, current_members,
      event_date, location, location_detail, fee, tags, cover_image_url, created_at,
      leader:badak_members!badak_groups_leader_id_fkey(id, display_name, job_function, experience_years),
      need:badak_needs!badak_groups_need_id_fkey(id, display_text, count)
    `)
    .order('event_date', { ascending: true })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ groups: data || [] });
}

// POST: 모임 생성 (바닥장)
export async function POST(request: NextRequest) {
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

  const body = await request.json();

  // 조건 1: 니즈 연결 시 20명 이상 관심이어야 모임 개설 가능
  if (body.needId) {
    const { data: need } = await supabase
      .from('badak_needs')
      .select('count, threshold')
      .eq('id', body.needId)
      .single();

    if (need && need.count < 15) {
      return NextResponse.json(
        { error: `관심 ${need.count}명 — 15명 이상 모여야 모임을 개설할 수 있습니다` },
        { status: 400 },
      );
    }
  }

  const groupType = body.groupType || 'community';
  // 조건 2: community 모임은 반드시 관리자 승인 필요 (pending_review)
  const initialStatus = groupType === 'curated' ? 'recruiting' : 'pending_review';

  // schedule 디스플레이 문자열 생성
  const meetingType = body.meetingType || 'onetime';
  const scheduleText = (() => {
    if (meetingType === 'onetime' && body.eventDate) {
      return new Date(body.eventDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    }
    if (meetingType === 'series' && body.seriesCount) {
      return `${body.seriesCount}회 시리즈`;
    }
    return body.recurringSchedule || null;
  })();

  const { data: group, error } = await supabase
    .from('badak_groups')
    .insert({
      need_id: body.needId || null,
      title: body.title,
      description: body.description || null,
      leader_id: member.id,
      leader_reason: body.leaderReason || null,
      group_type: groupType,
      meeting_type: meetingType,
      join_type: body.joinType || 'approval',
      status: initialStatus,
      max_members: body.maxMembers || 20,
      event_date: body.eventDate || null,
      series_dates: body.seriesDates || null,
      recurring_schedule: body.recurringSchedule || null,
      schedule: scheduleText,
      next_date: (meetingType === 'onetime' || meetingType === 'series') && body.eventDate
        ? body.eventDate.split('T')[0]
        : null,
      location: body.location || null,
      location_detail: body.locationDetail || null,
      fee: body.fee || 0,
      tags: body.tags || [],
      cover_image_url: body.coverImageUrl || null,
      current_members: 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 바닥장을 자동으로 approved 멤버로 추가
  await supabase.from('badak_group_members').insert({
    group_id: group.id,
    member_id: member.id,
    status: 'approved',
  });

  // 연결된 니즈 상태 업데이트
  if (body.needId) {
    await supabase
      .from('badak_needs')
      .update({ status: 'group_created', updated_at: new Date().toISOString() })
      .eq('id', body.needId);
  }

  return NextResponse.json({ group });
}

// PUT: 모임 수정 (리더만)
export async function PUT(request: NextRequest) {
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
  if (!body.groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 });

  const { data: group } = await supabase
    .from('badak_groups')
    .select('id, leader_id')
    .eq('id', body.groupId)
    .single();

  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  if (group.leader_id !== member.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.eventDate !== undefined) updates.event_date = body.eventDate;
  if (body.location !== undefined) updates.location = body.location;
  if (body.locationDetail !== undefined) updates.location_detail = body.locationDetail;
  if (body.maxMembers !== undefined) updates.max_members = body.maxMembers;
  if (body.fee !== undefined) updates.fee = body.fee;
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.status !== undefined) updates.status = body.status;
  if (body.coverImageUrl !== undefined) updates.cover_image_url = body.coverImageUrl;

  const { data: updated, error } = await supabase
    .from('badak_groups')
    .update(updates)
    .eq('id', body.groupId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ group: updated });
}

// DELETE: 모임 삭제 (리더만)
export async function DELETE(request: NextRequest) {
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
  const groupId = searchParams.get('groupId');
  if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 });

  const { data: grp } = await supabase
    .from('badak_groups')
    .select('id, leader_id, current_members')
    .eq('id', groupId)
    .single();

  if (!grp) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  if (grp.leader_id !== member.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // 참여자 있으면 closed 처리
  if (grp.current_members > 1) {
    await supabase.from('badak_groups').update({ status: 'closed' }).eq('id', groupId);
    return NextResponse.json({ closed: true });
  }

  await supabase.from('badak_group_members').delete().eq('group_id', groupId);
  await supabase.from('badak_groups').delete().eq('id', groupId);

  return NextResponse.json({ deleted: true });
}
