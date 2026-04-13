import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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

    if (need && need.count < 20) {
      return NextResponse.json(
        { error: `관심 ${need.count}명 — 20명 이상 모여야 모임을 개설할 수 있습니다` },
        { status: 400 },
      );
    }
  }

  const groupType = body.groupType || 'community';
  // 조건 2: community 모임은 반드시 관리자 승인 필요 (pending_review)
  const initialStatus = groupType === 'curated' ? 'recruiting' : 'pending_review';

  const { data: group, error } = await supabase
    .from('badak_groups')
    .insert({
      need_id: body.needId || null,
      title: body.title,
      description: body.description || null,
      leader_id: member.id,
      leader_reason: body.leaderReason || null,
      group_type: groupType,
      status: initialStatus,
      max_members: body.maxMembers || 20,
      event_date: body.eventDate || null,
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
