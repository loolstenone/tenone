/**
 * HIT 멤버십 — 서버 전용 함수 (next/headers 사용)
 * 클라이언트 컴포넌트에서는 절대 import 금지.
 */
import { createClient } from '@/lib/supabase/server';
import type { MembershipTier, HitFeature } from './membership';
import { canAccess, getUpgradeMessage } from './membership';

/**
 * 서버사이드에서 member의 membership_tier 조회
 */
export async function getMembershipTier(memberId: string | null | undefined): Promise<MembershipTier> {
  if (!memberId) return 'guest';
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('members')
      .select('membership_tier')
      .eq('id', memberId)
      .single();
    if (error || !data) return 'guest';
    return ((data as { membership_tier?: MembershipTier }).membership_tier as MembershipTier) || 'free';
  } catch {
    return 'guest';
  }
}

/**
 * API 게이트 — 권한 없으면 Response 반환, 있으면 null 반환
 */
export async function gateApi(
  memberId: string | null | undefined,
  feature: HitFeature
): Promise<Response | null> {
  const tier = await getMembershipTier(memberId);
  if (canAccess(tier, feature)) return null;
  return new Response(
    JSON.stringify({
      error: 'membership_required',
      tier,
      requiredFeature: feature,
      message: getUpgradeMessage(tier, feature),
    }),
    { status: 403, headers: { 'Content-Type': 'application/json' } }
  );
}
