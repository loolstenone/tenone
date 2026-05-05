export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

async function getStaffCaller(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data: caller } = await supabase.from('members').select('id, roles').eq('auth_id', user.id).single();
  if (!caller) return null;
  const roles: string[] = caller.roles ?? [];
  if (!roles.includes('staff') && !roles.includes('admin')) return null;
  return caller;
}

/**
 * PATCH /api/uc/admin/transaction
 * 거래 수정 — amount 또는 note 변경. 잔액 차분 자동 반영.
 * Body: { transaction_id, amount?, note? }
 */
export async function PATCH(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!await getStaffCaller(token)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { transaction_id, amount, note } = await request.json();
  if (!transaction_id) return NextResponse.json({ error: 'transaction_id required' }, { status: 400 });

  const { data: tx } = await supabase
    .from('uc_transactions')
    .select('id, member_id, type, amount')
    .eq('id', transaction_id)
    .single();

  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  const updates: Record<string, unknown> = {};
  if (note !== undefined) updates.note = note;

  let balanceDelta = 0;
  if (amount !== undefined) {
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be positive' }, { status: 400 });
    }
    const oldAmount = tx.amount as number;
    const newAmount = amount;
    // earn: +newAmount - +oldAmount, redeem: -newAmount - -oldAmount
    balanceDelta = tx.type === 'earn' ? newAmount - oldAmount : oldAmount - newAmount;
    updates.amount = newAmount;
  }

  const { error: txErr } = await supabase
    .from('uc_transactions')
    .update(updates)
    .eq('id', transaction_id);

  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });

  if (balanceDelta !== 0) {
    const { data: bal } = await supabase
      .from('uc_balances')
      .select('balance, lifetime_earned')
      .eq('member_id', tx.member_id)
      .single();

    const newBalance = ((bal?.balance as number) ?? 0) + balanceDelta;
    const newLifetime = tx.type === 'earn'
      ? ((bal?.lifetime_earned as number) ?? 0) + balanceDelta
      : (bal?.lifetime_earned as number) ?? 0;

    await supabase.from('uc_balances').upsert({
      member_id: tx.member_id,
      balance: Math.max(0, newBalance),
      lifetime_earned: Math.max(0, newLifetime),
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/uc/admin/transaction
 * 거래 삭제 — 잔액에서 역산 후 행 삭제.
 * Body: { transaction_id }
 */
export async function DELETE(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!await getStaffCaller(token)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { transaction_id } = await request.json();
  if (!transaction_id) return NextResponse.json({ error: 'transaction_id required' }, { status: 400 });

  const { data: tx } = await supabase
    .from('uc_transactions')
    .select('id, member_id, type, amount')
    .eq('id', transaction_id)
    .single();

  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  const { data: bal } = await supabase
    .from('uc_balances')
    .select('balance, lifetime_earned')
    .eq('member_id', tx.member_id)
    .single();

  const amount = tx.amount as number;
  const isEarn = tx.type === 'earn';
  const newBalance = ((bal?.balance as number) ?? 0) + (isEarn ? -amount : amount);
  const newLifetime = isEarn
    ? ((bal?.lifetime_earned as number) ?? 0) - amount
    : (bal?.lifetime_earned as number) ?? 0;

  await supabase.from('uc_balances').upsert({
    member_id: tx.member_id,
    balance: Math.max(0, newBalance),
    lifetime_earned: Math.max(0, newLifetime),
    updated_at: new Date().toISOString(),
  });

  const { error: delErr } = await supabase
    .from('uc_transactions')
    .delete()
    .eq('id', transaction_id);

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
