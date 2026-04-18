import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// UUID 패턴 감지
function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

const GROUP_SELECT = `
  id, slug, title, tagline, description, intro_who, structure,
  guide, notice, status, join_type, meeting_type,
  max_members, current_members,
  event_date, schedule, next_date, location, location_detail,
  fee, tags, cover_image_url, series_count, series_dates,
  leader_reason, leader_career, leader_bio,
  created_at,
  leader:badak_members!badak_groups_leader_id_fkey(
    id, display_name, job_function, experience_years, bio, avatar_url, career, industry
  ),
  need:badak_needs!badak_groups_need_id_fkey(
    id, display_text, count
  )
`;

// GET /api/badak/groups/[id] — slug 또는 UUID로 모임 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // 인증 토큰 확인 (없으면 비공개 필드 제외)
  const authHeader = req.headers.get('authorization');
  let isAuthed = false;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) isAuthed = true;
  }

  // UUID면 id로, 아니면 slug로 조회
  const field = isUUID(id) ? 'id' : 'slug';
  const { data: groupData, error } = await supabase
    .from('badak_groups')
    .select(GROUP_SELECT)
    .eq(field, id)
    .single();

  if (error || !groupData) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
  }

  // 참여 멤버 목록 (approved)
  const { data: membersData } = await supabase
    .from('badak_group_members')
    .select(`
      member:badak_members!badak_group_members_member_id_fkey(
        id, display_name, job_function, avatar_url
      )
    `)
    .eq('group_id', groupData.id)
    .eq('status', 'approved')
    .limit(20);

  const members = (membersData ?? [])
    .map((r: { member: unknown }) => r.member)
    .filter(Boolean);

  // 관련 모임 (같은 태그, 현재 모임 제외)
  const tags = groupData.tags ?? [];
  let related: unknown[] = [];
  if (tags.length > 0) {
    const { data: relData } = await supabase
      .from('badak_groups')
      .select('id, slug, title, current_members, max_members, tags, cover_image_url')
      .neq('id', groupData.id)
      .eq('status', 'recruiting')
      .overlaps('tags', tags)
      .limit(3);
    related = relData ?? [];
  }

  // 비인증 요청 시 내부 운영 필드 제거
  const { guide, notice, leader_reason, leader_career, leader_bio, ...publicFields } = groupData as typeof groupData & {
    guide: unknown; notice: unknown; leader_reason: unknown; leader_career: unknown; leader_bio: unknown;
  };

  return NextResponse.json({
    group: {
      ...(isAuthed ? groupData : publicFields),
      members,
      reviews: [],
      related,
    },
  });
}

// PATCH /api/badak/groups/[id] — 모임 설정 변경 (바닥장 전용)
export async function PATCH(
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

  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const { data: group } = await supabase
    .from('badak_groups')
    .select('leader_id')
    .eq('id', groupId)
    .single();

  if (!group || group.leader_id !== member.id) {
    return NextResponse.json({ error: 'Only the leader can update this group' }, { status: 403 });
  }

  const body = await request.json();
  const allowedFields: Record<string, unknown> = {};
  if (body.join_type === 'approval' || body.join_type === 'firstcome') {
    allowedFields.join_type = body.join_type;
  }

  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from('badak_groups')
    .update(allowedFields)
    .eq('id', groupId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
