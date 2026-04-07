/**
 * HIT 멤버십 차등 시스템
 * 4개 tier (guest/free/premium/professional)별로 접근 가능한 기능을 정의한다.
 */
import { createClient } from '@/lib/supabase/server';

export type MembershipTier = 'guest' | 'free' | 'premium' | 'professional';

export type HitFeature =
  | 'HIT_A_TAKE'
  | 'HIT_A_RESULT_FULL'
  | 'HIT_A_RESULT_TEASER'
  | 'HIT_A_PDF_SCORES'
  | 'HIT_A_PDF_FULL'
  | 'HIT_DEEP'
  | 'HIT_LAYER_ONE'
  | 'HIT_LAYER_UNLIMITED'
  | 'HIT_CROSS_REPORT'
  | 'HIT_AI_CHAT_BASIC'
  | 'HIT_AI_CHAT_UNLIMITED'
  | 'HIT_EXPERT_CONSULT'
  | 'HIT_CAREER_ROADMAP'
  | 'HIT_RETAKE_FREE';

const TIER_FEATURES: Record<MembershipTier, HitFeature[]> = {
  guest: ['HIT_A_TAKE', 'HIT_A_RESULT_TEASER'],
  free: ['HIT_A_TAKE', 'HIT_A_RESULT_FULL', 'HIT_A_PDF_SCORES', 'HIT_AI_CHAT_BASIC'],
  premium: [
    'HIT_A_TAKE',
    'HIT_A_RESULT_FULL',
    'HIT_A_PDF_SCORES',
    'HIT_A_PDF_FULL',
    'HIT_DEEP',
    'HIT_LAYER_ONE',
    'HIT_CROSS_REPORT',
    'HIT_AI_CHAT_BASIC',
    'HIT_AI_CHAT_UNLIMITED',
  ],
  professional: [
    'HIT_A_TAKE',
    'HIT_A_RESULT_FULL',
    'HIT_A_PDF_SCORES',
    'HIT_A_PDF_FULL',
    'HIT_DEEP',
    'HIT_LAYER_ONE',
    'HIT_LAYER_UNLIMITED',
    'HIT_CROSS_REPORT',
    'HIT_AI_CHAT_BASIC',
    'HIT_AI_CHAT_UNLIMITED',
    'HIT_EXPERT_CONSULT',
    'HIT_CAREER_ROADMAP',
    'HIT_RETAKE_FREE',
  ],
};

export function canAccess(tier: MembershipTier | null | undefined, feature: HitFeature): boolean {
  const t: MembershipTier = tier || 'guest';
  return TIER_FEATURES[t]?.includes(feature) ?? false;
}

export function getUpgradeMessage(currentTier: MembershipTier, requiredFeature: HitFeature): string {
  const tierName: Record<MembershipTier, string> = {
    guest: '비가입',
    free: '무료',
    premium: '유료',
    professional: '프로',
  };

  const featureRequirement: Partial<Record<HitFeature, MembershipTier>> = {
    HIT_A_RESULT_FULL: 'free',
    HIT_A_PDF_SCORES: 'free',
    HIT_AI_CHAT_BASIC: 'free',
    HIT_DEEP: 'premium',
    HIT_LAYER_ONE: 'premium',
    HIT_LAYER_UNLIMITED: 'professional',
    HIT_CROSS_REPORT: 'premium',
    HIT_A_PDF_FULL: 'premium',
    HIT_AI_CHAT_UNLIMITED: 'premium',
    HIT_EXPERT_CONSULT: 'professional',
    HIT_CAREER_ROADMAP: 'professional',
    HIT_RETAKE_FREE: 'professional',
  };

  const required = featureRequirement[requiredFeature];
  if (!required) return '이 기능은 추가 결제가 필요합니다.';

  if (currentTier === 'guest' && required === 'free') {
    return '무료 회원 가입 후 이용 가능합니다.';
  }
  if ((currentTier === 'guest' || currentTier === 'free') && required === 'premium') {
    return '유료 회원(Premium) 전용 기능입니다.';
  }
  if (required === 'professional') {
    return '프로 회원(Professional) 전용 기능입니다.';
  }
  return `${tierName[required]} 이상에서 이용 가능합니다.`;
}

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
