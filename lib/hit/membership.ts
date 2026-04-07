/**
 * HIT 멤버십 차등 시스템
 * 4개 tier (guest/free/premium/professional)별로 접근 가능한 기능을 정의한다.
 */
// Note: server-only client is dynamically imported inside getMembershipTier
// to keep this module client-safe (used by useMembership/MembershipGate).

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

// Server-only helpers (getMembershipTier, gateApi) live in ./membership-server.ts
