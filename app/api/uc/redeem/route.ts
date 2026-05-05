export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redeemUC } from '@/lib/supabase/uc';

const supabase = createAdminClient();

/**
 * POST /api/uc/redeem
 * Body: { amount, payment_amount, brand_id?, reference_id? }
 * - amount: 사용할 UC 수량
 * - payment_amount: 결제 원금 (UC는 10% 초과 불가)
 * - brand_id: 결제 발생 브랜드 (선택)
 * - reference_id: 결제 트랜잭션 ID (환불 복구용, 선택)
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
  const { amount, payment_amount, brand_id = null, reference_id = null } = body;

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
  }
  if (typeof payment_amount !== 'number' || payment_amount <= 0) {
    return NextResponse.json({ error: 'payment_amount must be a positive number' }, { status: 400 });
  }

  const result = await redeemUC(member.id, amount, payment_amount, brand_id, reference_id);

  if (!result.success) {
    const status = result.reason === 'insufficient_balance' ? 402 : 400;
    return NextResponse.json({ error: result.reason }, { status });
  }

  return NextResponse.json(result);
}
