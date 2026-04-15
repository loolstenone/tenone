import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

// POST /api/badak/wants — Want 영속화 (사용자가 활성화 액션을 한 순간)
// body: { needIds: string[], memberIds: string[], mode, suggestedTitle?, score?, reasons?, action: 'create_group'|'start_dm'|'save' }
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { needIds = [], memberIds = [], mode = 'needs_match', suggestedTitle, score = 0, reasons, action = 'save' } = body;

  if (!Array.isArray(memberIds) || memberIds.length < 2) {
    return NextResponse.json({ error: '최소 2명 필요' }, { status: 400 });
  }
  if (!memberIds.includes(user.id)) {
    return NextResponse.json({ error: '본인이 포함되어야 함' }, { status: 400 });
  }

  // 중복 방지: 같은 memberIds+mode 조합이 activated/candidate 상태로 이미 있으면 재사용
  // (배열 정렬 후 equals 비교는 SQL로 어렵기 때문에 일단 새로 insert)
  const status = action === 'save' ? 'candidate' : 'activated';

  const { data, error } = await supabase
    .from('badak_wants')
    .insert({
      need_ids: needIds,
      member_ids: memberIds,
      mode,
      score,
      reasons: reasons ?? null,
      suggested_title: suggestedTitle ?? null,
      status,
      activated_at: status === 'activated' ? new Date().toISOString() : null,
    })
    .select('id, status, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ want: data }, { status: 201 });
}

// PATCH /api/badak/wants — body로 id 받아 업데이트
// body: { id, groupId?, connectionId?, status? }
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { id, groupId, connectionId, status } = body as {
    id?: string; groupId?: string; connectionId?: string; status?: string;
  };

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // 본인이 member_ids에 포함된 Want만 수정 가능
  const { data: existing } = await supabase
    .from('badak_wants')
    .select('id, member_ids, status')
    .eq('id', id)
    .single();

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!existing.member_ids.includes(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  if (groupId !== undefined) updates.group_id = groupId;
  if (connectionId !== undefined) updates.connection_id = connectionId;
  if (status !== undefined) {
    if (!['candidate', 'activated', 'dismissed', 'expired'].includes(status)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    }
    updates.status = status;
    if (status === 'activated' && !existing.status.includes('activated')) {
      updates.activated_at = new Date().toISOString();
    }
  }
  // 명시 status 없어도 group_id/connection_id 연결 시 자동 activated
  if ((groupId || connectionId) && existing.status === 'candidate') {
    updates.status = 'activated';
    updates.activated_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('badak_wants')
    .update(updates)
    .eq('id', id)
    .select('id, status, group_id, connection_id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ want: data });
}
