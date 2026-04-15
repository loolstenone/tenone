import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET /api/badak/groups/[id] — 모임 상세
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('badak_groups')
    .select(`
      id, title, description, status, meeting_type,
      max_members, current_members,
      event_date, schedule, location, location_detail,
      fee, tags, cover_image_url, created_at,
      leader:badak_members!badak_groups_leader_id_fkey(
        id, display_name, job_function, experience_years, bio
      ),
      need:badak_needs!badak_groups_need_id_fkey(
        id, display_text, count
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ group: data });
}

// PATCH /api/badak/groups/[id] — 모임 설정 변경 (바닥장 전용)
// 현재 지원 필드: join_type
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

  // 바닥장 확인
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
