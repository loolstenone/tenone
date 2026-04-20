import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

// 유저 전체 기준 1회 (brand_id 무관)
const LIFE_ONCE_GLOBAL = new Set([
  'signup_complete',
  'profile_complete',
  'profile_advanced',
]);

// 브랜드별 1회 (brand_id 포함해서 중복 체크)
const LIFE_ONCE_PER_BRAND = new Set([
  'first_purchase',
  'service_onboard',
]);

interface EarnResult {
  granted: boolean;
  amount: number;
  reason?: string;
}

export async function earnUC(
  memberId: string,
  actionKey: string,
  brandId: string | null = null,
): Promise<EarnResult> {
  // 1. 룰 조회
  let ruleQuery = supabase
    .from('uc_earn_rules')
    .select('amount, monthly_cap')
    .eq('action_key', actionKey)
    .is('valid_until', null); // 만료되지 않은 룰

  if (brandId) {
    ruleQuery = ruleQuery.eq('brand_id', brandId);
  } else {
    ruleQuery = ruleQuery.is('brand_id', null);
  }

  const { data: rule } = await ruleQuery.maybeSingle();
  if (!rule) return { granted: false, amount: 0, reason: 'no_rule' };

  // 2. 일회성 액션 중복 체크
  if (LIFE_ONCE_GLOBAL.has(actionKey)) {
    const { count } = await supabase
      .from('uc_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('action_key', actionKey);
    if ((count ?? 0) > 0) return { granted: false, amount: 0, reason: 'already_earned' };
  }

  if (LIFE_ONCE_PER_BRAND.has(actionKey)) {
    let q = supabase
      .from('uc_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('action_key', actionKey);
    if (brandId) q = q.eq('brand_id', brandId);
    else q = q.is('brand_id', null);
    const { count } = await q;
    if ((count ?? 0) > 0) return { granted: false, amount: 0, reason: 'already_earned' };
  }

  // 3. 월별 한도 체크
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let countQuery = supabase
    .from('uc_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('action_key', actionKey)
    .eq('type', 'earn')
    .gte('created_at', monthStart);

  if (brandId) {
    countQuery = countQuery.eq('brand_id', brandId);
  } else {
    countQuery = countQuery.is('brand_id', null);
  }

  const { count: monthCount } = await countQuery;

  if ((monthCount ?? 0) >= rule.monthly_cap) {
    return { granted: false, amount: 0, reason: 'monthly_cap_reached' };
  }

  // 4. 트랜잭션 기록
  const txInsert: Record<string, unknown> = {
    member_id: memberId,
    action_key: actionKey,
    amount: rule.amount,
    type: 'earn',
  };
  if (brandId) txInsert.brand_id = brandId;

  const { error: txError } = await supabase.from('uc_transactions').insert(txInsert);
  if (txError) return { granted: false, amount: 0, reason: 'tx_failed' };

  // 5. 잔액 업데이트 (upsert)
  const { data: existing } = await supabase
    .from('uc_balances')
    .select('balance, lifetime_earned')
    .eq('member_id', memberId)
    .maybeSingle();

  await supabase.from('uc_balances').upsert({
    member_id: memberId,
    balance: (existing?.balance ?? 0) + rule.amount,
    lifetime_earned: (existing?.lifetime_earned ?? 0) + rule.amount,
    updated_at: new Date().toISOString(),
  });

  return { granted: true, amount: rule.amount };
}

interface RedeemResult {
  success: boolean;
  amount: number;
  reason?: string;
}

/**
 * UC 사용 (결제 시 차감)
 * - 결제 금액의 10% 초과 불가
 * - 잔액 부족 시 거부
 * - reference_id: 결제 트랜잭션 ID (환불 시 복구용)
 */
export async function redeemUC(
  memberId: string,
  amount: number,
  paymentAmount: number,
  brandId: string | null = null,
  referenceId: string | null = null,
): Promise<RedeemResult> {
  if (amount <= 0) return { success: false, amount: 0, reason: 'invalid_amount' };

  const maxAllowed = Math.floor(paymentAmount * 0.1);
  if (amount > maxAllowed) {
    return { success: false, amount: 0, reason: 'exceeds_10pct_cap' };
  }

  const { data: bal } = await supabase
    .from('uc_balances')
    .select('balance')
    .eq('member_id', memberId)
    .maybeSingle();

  const currentBalance = bal?.balance ?? 0;
  if (currentBalance < amount) {
    return { success: false, amount: 0, reason: 'insufficient_balance' };
  }

  const txData: Record<string, unknown> = {
    member_id: memberId,
    action_key: 'redeem',
    amount,
    type: 'redeem',
  };
  if (brandId) txData.brand_id = brandId;
  if (referenceId) txData.reference_id = referenceId;

  const { error: txError } = await supabase.from('uc_transactions').insert(txData);
  if (txError) return { success: false, amount: 0, reason: 'tx_failed' };

  await supabase.from('uc_balances').upsert({
    member_id: memberId,
    balance: currentBalance - amount,
    updated_at: new Date().toISOString(),
  });

  return { success: true, amount };
}

interface RestoreResult {
  success: boolean;
  amount: number;
  reason?: string;
}

/**
 * UC 복구 (결제 취소/환불 시 원상복구)
 * - reference_id로 원래 redeem 트랜잭션을 찾아서 복구
 * - 이미 복구된 경우 거부
 */
export async function restoreUC(
  memberId: string,
  referenceId: string,
): Promise<RestoreResult> {
  const { data: original } = await supabase
    .from('uc_transactions')
    .select('id, amount, brand_id')
    .eq('member_id', memberId)
    .eq('action_key', 'redeem')
    .eq('reference_id', referenceId)
    .eq('type', 'redeem')
    .maybeSingle();

  if (!original) return { success: false, amount: 0, reason: 'original_not_found' };

  // 이미 restore된 트랜잭션 확인
  const { count } = await supabase
    .from('uc_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('action_key', 'redeem_restore')
    .eq('reference_id', referenceId);

  if ((count ?? 0) > 0) return { success: false, amount: 0, reason: 'already_restored' };

  const txData: Record<string, unknown> = {
    member_id: memberId,
    action_key: 'redeem_restore',
    amount: original.amount,
    type: 'earn',
    reference_id: referenceId,
  };
  if (original.brand_id) txData.brand_id = original.brand_id;

  const { error: txError } = await supabase.from('uc_transactions').insert(txData);
  if (txError) return { success: false, amount: 0, reason: 'tx_failed' };

  const { data: bal } = await supabase
    .from('uc_balances')
    .select('balance')
    .eq('member_id', memberId)
    .maybeSingle();

  await supabase.from('uc_balances').upsert({
    member_id: memberId,
    balance: (bal?.balance ?? 0) + original.amount,
    updated_at: new Date().toISOString(),
  });

  return { success: true, amount: original.amount };
}
