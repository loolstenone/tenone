import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { earnUC } from '@/lib/supabase/uc';

const supabase = createAdminClient();

// GET: 모임 목록
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');
  const leaderParam = searchParams.get('leader');
  const memberParam = searchParams.get('member');

  // member=me: 내가 참여(approved)한 모임 목록
  if (memberParam === 'me') {
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
    if (!member) return NextResponse.json({ groups: [] });

    // 내가 승인된 모임 ID 목록 조회
    let gmQuery = supabase
      .from('badak_group_members')
      .select('group_id')
      .eq('member_id', member.id)
      .eq('status', 'approved');
    const { data: memberships } = await gmQuery;
    const groupIds = (memberships ?? []).map((m: { group_id: string }) => m.group_id);
    if (groupIds.length === 0) return NextResponse.json({ groups: [] });

    let q = supabase
      .from('badak_groups')
      .select(`
        id, slug, title, status, meeting_type, max_members, current_members,
        event_date, schedule, location, fee, tags, cover_image_url, season_number,
        leader:badak_members!badak_groups_leader_id_fkey(id, display_name, job_function, avatar_url)
      `)
      .in('id', groupIds)
      .order('event_date', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ groups: data || [] });
  }

  let query = supabase
    .from('badak_groups')
    .select(`
      id, slug, title, tagline, description, status, meeting_type, join_type,
      max_members, current_members, season_number, parent_group_id,
      event_date, schedule, next_date, location, location_detail, fee, tags, cover_image_url, created_at,
      leader:badak_members!badak_groups_leader_id_fkey(id, display_name, job_function, experience_years, avatar_url),
      need:badak_needs!badak_groups_need_id_fkey(id, display_text, count)
    `)
    .order('event_date', { ascending: true })
    .limit(limit);

  if (leaderParam === 'me') {
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
    if (!member) return NextResponse.json({ groups: [] });
    query = query.eq('leader_id', member.id);
  }

  if (status) {
    query = query.eq('status', status);
  } else if (leaderParam !== 'me') {
    query = query.neq('status', 'pending_review');
  }

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

  const groupType = body.groupType || 'community';
  // community 모임은 반드시 관리자 승인 필요 (pending_review)
  // curated(관리자 직접 개설)만 바로 recruiting
  const initialStatus = groupType === 'curated' ? 'recruiting' : 'pending_review';

  // 임계값 체크: curated(직접 개설)인 경우만 15명 기준 적용
  // pending_review(바닥장 신청)는 관리자가 검토하므로 제한 없음
  if (groupType === 'curated' && body.needId) {
    const { data: need } = await supabase
      .from('badak_needs')
      .select('count')
      .eq('id', body.needId)
      .single();

    if (need && need.count < 15) {
      return NextResponse.json(
        { error: `관심 ${need.count}명 — 15명 이상 모여야 모임을 개설할 수 있습니다` },
        { status: 400 },
      );
    }
  }

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
      tagline: body.tagline || null,
      description: body.description || null,
      intro_who: body.introWho || null,
      structure: body.sessions?.length > 0 ? body.sessions : null,
      guide: body.guide || null,
      notice: body.notice || null,
      leader_id: member.id,
      leader_reason: body.leaderReason || null,
      leader_career: body.leaderCareer || null,
      group_type: groupType,
      meeting_type: meetingType,
      join_type: body.joinType || 'approval',
      status: initialStatus,
      max_members: body.maxMembers || 20,
      series_count: meetingType === 'series' ? (body.seriesCount || null) : null,
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
      parent_group_id: body.parentGroupId || null,
      season_number: body.seasonNumber || 1,
      show_leader_reviews: body.showLeaderReviews || false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // UC 코인 지급 (모임 개설)
  const { data: memberRow } = await supabase
    .from('members')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();
  if (memberRow) {
    await earnUC(memberRow.id, 'create_group', 'badak');
  }

  // 바닥장을 자동으로 approved 멤버로 추가
  await supabase.from('badak_group_members').insert({
    group_id: group.id,
    member_id: member.id,
    status: 'approved',
  });

  // 니즈 자동 매핑 + 알림 (non-blocking)
  (async () => {
    try {
      let linkedNeedId: string | null = body.needId || null;

      if (!linkedNeedId) {
        // 제목 embedding → 유사 니즈 매핑
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
          const embRes = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ model: 'text-embedding-3-small', input: body.title }),
          });
          if (embRes.ok) {
            const embJson = await embRes.json();
            const embedding = embJson.data?.[0]?.embedding;
            if (embedding) {
              const { data: matched } = await supabase.rpc('match_badak_needs', {
                query_embedding: embedding,
                match_threshold: 0.6,
                match_count: 5,
              });
              const best = (matched ?? []).find(
                (r: { id: string; status: string }) => r.status === 'approved',
              );
              if (best) {
                linkedNeedId = best.id;
                await supabase
                  .from('badak_groups')
                  .update({ need_id: linkedNeedId })
                  .eq('id', group.id);
              }
            }
          }
        }
      }

      if (!linkedNeedId) return;

      // 니즈 has_group 플래그 업데이트
      await supabase
        .from('badak_needs')
        .update({ has_group: true })
        .eq('id', linkedNeedId);

      // 알림 대상: 관심 등록 멤버 + 니즈 작성자
      const [{ data: interests }, { data: need }] = await Promise.all([
        supabase
          .from('badak_need_interests')
          .select('member_id')
          .eq('need_id', linkedNeedId),
        supabase
          .from('badak_needs')
          .select('created_by_user_id, display_text')
          .eq('id', linkedNeedId)
          .single(),
      ]);

      const notifyIds = new Set<string>();

      if (interests && interests.length > 0) {
        const memberIds = interests.map((i: { member_id: string }) => i.member_id);
        const { data: members } = await supabase
          .from('badak_members')
          .select('user_id')
          .in('id', memberIds);
        (members ?? []).forEach((m: { user_id: string }) => {
          if (m.user_id) notifyIds.add(m.user_id);
        });
      }
      if (need?.created_by_user_id) notifyIds.add(need.created_by_user_id);
      notifyIds.delete(user.id); // 바닥장 본인 제외

      if (notifyIds.size === 0) return;

      const needText = need?.display_text ?? body.title;
      await supabase.from('badak_notifications').insert(
        Array.from(notifyIds).map((uid) => ({
          user_id: uid,
          type: 'group_matched',
          title: '관심 니즈의 모임이 생겼어요 🙌',
          body: `"${needText}" 니즈와 연결된 모임이 열렸어요`,
          link: `/badak/groups/${group.id}`,
          metadata: { groupId: group.id, needId: linkedNeedId },
        })),
      );
    } catch { /* 매핑 실패 시 모임 생성에는 영향 없음 */ }
  })();

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
  if (body.coverImageUrl !== undefined) updates.cover_image_url = body.coverImageUrl;

  // 리더가 변경 가능한 상태 전환만 허용
  if (body.status !== undefined) {
    const LEADER_ALLOWED: Record<string, string[]> = {
      recruiting: ['confirmed', 'closed'],
      confirmed: ['recruiting', 'closed'],
    };
    const { data: currentGroup } = await supabase
      .from('badak_groups')
      .select('status')
      .eq('id', body.groupId)
      .single();

    const allowed = currentGroup ? (LEADER_ALLOWED[currentGroup.status] ?? []) : [];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: '허용되지 않은 상태 전환입니다' }, { status: 400 });
    }
    updates.status = body.status;
  }

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
