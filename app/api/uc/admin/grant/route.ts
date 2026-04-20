import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

/**
 * POST /api/uc/admin/grant
 * Staff-only. Manually grant or deduct UC for any member.
 * Body: { member_id, action_key, amount, brand_id?, note? }
 * - action_key: 'admin_grant' | 'admin_deduct'
 * - Bypasses earn rules and monthly caps entirely
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Staff check
  const { data: caller } = await supabase
    .from('members')
    .select('id, roles')
    .eq('auth_id', user.id)
    .single();

  if (!caller) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const roles: string[] = caller.roles ?? [];
  if (!roles.includes('staff') && !roles.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { member_id, action_key, amount, brand_id = null, note = null } = body;

  if (!member_id) return NextResponse.json({ error: 'member_id required' }, { status: 400 });
  if (!['admin_grant', 'admin_deduct'].includes(action_key)) {
    return NextResponse.json({ error: 'action_key must be admin_grant or admin_deduct' }, { status: 400 });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
  }

  const isDeduct = action_key === 'admin_deduct';

  const { data: bal } = await supabase
    .from('uc_balances')
    .select('balance, lifetime_earned')
    .eq('member_id', member_id)
    .maybeSingle();

  const currentBalance = bal?.balance ?? 0;
  const currentLifetime = bal?.lifetime_earned ?? 0;

  if (isDeduct && currentBalance < amount) {
    return NextResponse.json({ error: 'insufficient_balance' }, { status: 402 });
  }

  const txData: Record<string, unknown> = {
    member_id,
    action_key,
    amount,
    type: isDeduct ? 'redeem' : 'earn',
  };
  if (brand_id) txData.brand_id = brand_id;
  if (note) txData.note = note;

  const { error: txError } = await supabase.from('uc_transactions').insert(txData);
  if (txError) return NextResponse.json({ error: 'tx_failed', detail: txError.message }, { status: 500 });

  const newBalance = isDeduct ? currentBalance - amount : currentBalance + amount;
  const newLifetime = isDeduct ? currentLifetime : currentLifetime + amount;

  await supabase.from('uc_balances').upsert({
    member_id,
    balance: newBalance,
    lifetime_earned: newLifetime,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, amount, balance: newBalance });
}
