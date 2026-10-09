export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/api-guard';

const supabase = createAdminClient();

/**
 * UC 원장 정정 (2026-10-10 통합 관리 점검)
 *   원장 행은 고치거나 지우지 않는다 — 금액 수정·삭제를 없애고 "정정 거래"(반대 방향 행 추가)로 바로잡는다. 누가·언제·왜 고쳤는지 원장에 남는다
 *   PATCH = 메모만 수정 (금액·유형 불가) · POST = 정정 거래 추가 (한 거래에 한 번만)
 */

/** PATCH /api/uc/admin/transaction — Body: { transaction_id, note } */
export async function PATCH(request: NextRequest) {
  const auth = await requireStaff(request);
  if (auth instanceof NextResponse) return auth;

  const { transaction_id, note } = await request.json();
  if (!transaction_id || typeof note !== 'string') return NextResponse.json({ error: 'transaction_id · note 필요 (금액은 정정 거래로)' }, { status: 400 });

  const { error } = await supabase.from('uc_transactions').update({ note }).eq('id', transaction_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

/** POST /api/uc/admin/transaction — 정정 거래. Body: { transaction_id, reason } */
export async function POST(request: NextRequest) {
  const auth = await requireStaff(request);
  if (auth instanceof NextResponse) return auth;

  const { transaction_id, reason } = await request.json();
  if (!transaction_id || !reason?.trim()) return NextResponse.json({ error: '정정 사유를 입력하세요' }, { status: 400 });

  const { data: tx } = await supabase
    .from('uc_transactions')
    .select('id, member_id, type, amount, brand_id, action_key')
    .eq('id', transaction_id)
    .single();
  if (!tx) return NextResponse.json({ error: '거래를 찾을 수 없습니다' }, { status: 404 });
  if (tx.action_key === 'correction') return NextResponse.json({ error: '정정 거래는 다시 정정할 수 없습니다' }, { status: 400 });
  if (tx.type !== 'earn' && tx.type !== 'redeem') return NextResponse.json({ error: `${tx.type} 거래는 정정 대상이 아닙니다` }, { status: 400 });

  const { data: already } = await supabase.from('uc_transactions').select('id')
    .eq('action_key', 'correction').eq('ref_id', tx.id).limit(1);
  if ((already ?? []).length) return NextResponse.json({ error: '이미 정정된 거래입니다' }, { status: 409 });

  const { data: bal } = await supabase.from('uc_balances').select('balance, lifetime_earned').eq('member_id', tx.member_id).maybeSingle();
  const amount = tx.amount as number;
  const reversingEarn = tx.type === 'earn';
  const balance = ((bal?.balance as number) ?? 0) + (reversingEarn ? -amount : amount);
  const lifetime = ((bal?.lifetime_earned as number) ?? 0) - (reversingEarn ? amount : 0);

  const { error: insErr } = await supabase.from('uc_transactions').insert({
    member_id: tx.member_id,
    type: reversingEarn ? 'redeem' : 'earn',
    amount,
    balance_after: Math.max(0, balance),
    action_key: 'correction',
    brand_id: tx.brand_id,
    ref_id: tx.id,
    note: `정정: ${reason.trim()}${auth.kind === 'user' && auth.email ? ` (${auth.email})` : ''}`,
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  await supabase.from('uc_balances').upsert({
    member_id: tx.member_id,
    balance: Math.max(0, balance),
    lifetime_earned: Math.max(0, lifetime),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'member_id' });

  return NextResponse.json({ success: true, balance: Math.max(0, balance) });
}
