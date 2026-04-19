import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { restoreUC } from '@/lib/supabase/uc';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * POST /api/uc/restore
 * Body: { reference_id }
 * - reference_id: 원래 redeem 시 사용한 결제 트랜잭션 ID
 * 결제 취소/환불 시 차감된 UC를 원상복구한다.
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('auth_id', user.id)
    .single();
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const body = await request.json();
  const { reference_id } = body;

  if (!reference_id) {
    return NextResponse.json({ error: 'reference_id required' }, { status: 400 });
  }

  const result = await restoreUC(member.id, reference_id);

  if (!result.success) {
    const status = result.reason === 'original_not_found' ? 404 : 409;
    return NextResponse.json({ error: result.reason }, { status });
  }

  return NextResponse.json(result);
}
