import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET: 심사 대기 모임 목록
export async function GET(request: NextRequest) {
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

// PATCH: 심사 처리 (승인/반려)
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { groupId, action, rejectReason } = body;

  if (!groupId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {
    status: action === 'approve' ? 'recruiting' : 'rejected',
    reviewed_at: new Date().toISOString(),
  };

  if (action === 'reject' && rejectReason) {
    updateData.reject_reason = rejectReason;
  }

  const { error } = await supabase
    .from('badak_groups')
    .update(updateData)
    .eq('id', groupId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, status: updateData.status });
}
