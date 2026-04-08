/**
 * HIT D 채점 알고리즘 — 시니어 리더십 전환
 * 7점 리커트 척도 기반
 * 모듈1: expertise — domain_depth, tacit_knowledge, redeployment, personal_brand
 * 모듈2: leadership — exec_leadership, strategic_leadership, coaching_leadership, independent_leadership
 * 모듈3: identity — identity_strength, new_role, identity_recon
 * 모듈4: network — strong_ties, weak_ties
 * 모듈5: seniorReadiness — positioning, compensation, reference, senior_psych
 * 심화: CH Deep D맞춤 + AP Deep D맞춤 (scoreChDeepB/scoreApDeepB 재사용)
 */

// CH/AP Deep 채점은 B와 동일 구조 (character_deep/aptitude_deep 모듈 필터)
import { scoreChDeepB, scoreApDeepB } from './scoring-b';
export { scoreChDeepB as scoreChDeepD, scoreApDeepB as scoreApDeepD } from './scoring-b';
export type { CHDeepBSubscale as CHDeepDSubscale, HollandType } from './data/b-deep-questions';

interface ResponseRow {
  module: string;
  question_id: string;
  option_value: string;  // 'subscale:value[:r]'
}

function buildSubscaleMap(responses: ResponseRow[]): Record<string, number[]> {
  const map: Record<string, number[]> = {};
  for (const r of responses) {
    const parts = r.option_value.split(':');
    let subscale: string;
    let value: number;
    let reverse = false;

    if (parts.length >= 2) {
      subscale = parts[0];
      value = parseInt(parts[1], 10);
      reverse = parts[2] === 'r';
    } else {
      subscale = 'unknown';
      value = parseInt(r.option_value, 10);
    }

    if (isNaN(value)) continue;
    if (reverse) value = 8 - value;  // 7점 역채점: 1→7, 7→1

    if (!map[subscale]) map[subscale] = [];
    map[subscale].push(value);
  }
  return map;
}

function scaleToHundred(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(((avg - 1) / 6) * 100);
}

// ── 전문성 자산 채점 ──

export function scoreExpertise(responses: ResponseRow[]): {
  expertise_depth: number;
  expertise_breadth: number;
  expertise_domains: Record<string, number>;
} {
  const expertise = responses.filter(r => r.module === 'expertise');
  const subscaleMap = buildSubscaleMap(expertise);

  const domain_depth = scaleToHundred(subscaleMap['domain_depth'] || []);
  const tacit_knowledge = scaleToHundred(subscaleMap['tacit_knowledge'] || []);
  const redeployment = scaleToHundred(subscaleMap['redeployment'] || []);
  const personal_brand = scaleToHundred(subscaleMap['personal_brand'] || []);

  // expertise_depth: 도메인 깊이 + 암묵지 평균
  const expertise_depth = Math.round((domain_depth + tacit_knowledge) / 2);
  // expertise_breadth: 재배치 가능성 + 퍼스널 브랜드 평균
  const expertise_breadth = Math.round((redeployment + personal_brand) / 2);

  const expertise_domains: Record<string, number> = {
    domain_depth,
    tacit_knowledge,
    redeployment,
    personal_brand,
  };

  return { expertise_depth, expertise_breadth, expertise_domains };
}

// ── 리더십 유형 채점 ──

export type LeadershipType = 'exec_leadership' | 'strategic_leadership' | 'coaching_leadership' | 'independent_leadership';

export function scoreLeadership(responses: ResponseRow[]): {
  leadership_type: LeadershipType;
  leadership_scores: Record<LeadershipType, number>;
} {
  const leadership = responses.filter(r => r.module === 'leadership');
  const subscaleMap = buildSubscaleMap(leadership);

  const leadership_scores: Record<LeadershipType, number> = {
    exec_leadership: scaleToHundred(subscaleMap['exec_leadership'] || []),
    strategic_leadership: scaleToHundred(subscaleMap['strategic_leadership'] || []),
    coaching_leadership: scaleToHundred(subscaleMap['coaching_leadership'] || []),
    independent_leadership: scaleToHundred(subscaleMap['independent_leadership'] || []),
  };

  // 최고 점수 유형을 leadership_type으로 결정
  let leadership_type: LeadershipType = 'exec_leadership';
  let maxScore = 0;
  for (const [type, score] of Object.entries(leadership_scores)) {
    if (score > maxScore) {
      maxScore = score;
      leadership_type = type as LeadershipType;
    }
  }

  return { leadership_type, leadership_scores };
}

// ── 경력 정체성 유연성 채점 ──

export function scoreIdentity(responses: ResponseRow[]): {
  role_identity: number;
  change_openness: number;
  self_reinvention: number;
  identity_flexibility: number;
} {
  const identity = responses.filter(r => r.module === 'identity');
  const subscaleMap = buildSubscaleMap(identity);

  const role_identity = scaleToHundred(subscaleMap['identity_strength'] || []);
  const change_openness = scaleToHundred(subscaleMap['new_role'] || []);
  const self_reinvention = scaleToHundred(subscaleMap['identity_recon'] || []);

  // 정체성 유연성 지수 (HIT_D_Final.md):
  // ((100 - role_identity) + new_role + identity_recon) / 3
  const identity_flexibility = Math.round(
    ((100 - role_identity) + change_openness + self_reinvention) / 3
  );

  return { role_identity, change_openness, self_reinvention, identity_flexibility };
}

// ── 네트워크 자본 채점 ──

export function scoreNetwork(responses: ResponseRow[]): {
  network_quality: number;
  network_breadth: number;
} {
  const network = responses.filter(r => r.module === 'network');
  const subscaleMap = buildSubscaleMap(network);

  const network_quality = scaleToHundred(subscaleMap['strong_ties'] || []);
  const network_breadth = scaleToHundred(subscaleMap['weak_ties'] || []);

  return { network_quality, network_breadth };
}

// ── 고년차 이직 준비도 채점 ──

export function scoreSeniorReadiness(responses: ResponseRow[]): {
  senior_readiness: number;
  senior_readiness_scores: Record<string, number>;
} {
  const readiness = responses.filter(r => r.module === 'seniorReadiness');
  const subscaleMap = buildSubscaleMap(readiness);

  const senior_readiness_scores: Record<string, number> = {
    positioning: scaleToHundred(subscaleMap['positioning'] || []),
    compensation: scaleToHundred(subscaleMap['compensation'] || []),
    reference: scaleToHundred(subscaleMap['reference'] || []),
    senior_psych: scaleToHundred(subscaleMap['senior_psych'] || []),
  };

  const senior_readiness = Math.round(
    Object.values(senior_readiness_scores).reduce((a, b) => a + b, 0) /
    Object.keys(senior_readiness_scores).length
  );

  return { senior_readiness, senior_readiness_scores };
}

// ── 미끼 채점 (validity / faking flag) ──

export function scoreDecoyD(responses: ResponseRow[]): boolean {
  const getVal = (id: string): number => {
    const r = responses.find(x => x.question_id === id);
    if (!r) return 0;
    const parts = r.option_value.split(':');
    return parseInt(parts[1] || parts[0], 10) || 0;
  };
  return getVal('d_val01') >= 6 && getVal('d_val02') >= 6;
}

// ── 다음 역할 매트릭스 ──

export interface NextRoleOption {
  code: string;       // 'DROLE-CXO' (신규)
  role: string;       // 한글 라벨 (기존 호환)
  fit_score: number;
  description: string;
}

export interface AContext {
  bt: { d: number; i: number; s: number; c: number };
  sp: {
    strategic: number; execution: number; creativity: number; interpersonal: number;
    analytical: number; harmony: number; breakthrough: number; guard: number;
  };
  ch: { integrity: number; relational: number; emotional: number; ethics: number; growth: number };
  ap: { R: number; I: number; A: number; S: number; E: number; C: number };
  uf: { self: number; parent: number; peer: number };
}

export function buildNextRoleMatrix(
  expertise: ReturnType<typeof scoreExpertise>,
  leadership: ReturnType<typeof scoreLeadership>,
  identity: ReturnType<typeof scoreIdentity>,
  seniorReadiness: ReturnType<typeof scoreSeniorReadiness>,
  aCtx?: AContext,
): { current_role: string; possible_roles: NextRoleOption[] } {
  const bt = aCtx?.bt ?? { d: 50, i: 50, s: 50, c: 50 };
  const sp = aCtx?.sp ?? {
    strategic: 50, execution: 50, creativity: 50, interpersonal: 50,
    analytical: 50, harmony: 50, breakthrough: 50, guard: 50,
  };
  const ch = aCtx?.ch ?? { integrity: 50, relational: 50, emotional: 50, ethics: 50, growth: 50 };
  const ap = aCtx?.ap ?? { R: 50, I: 50, A: 50, S: 50, E: 50, C: 50 };
  const uf = aCtx?.uf ?? { self: 50, parent: 50, peer: 50 };

  const lScores = leadership.leadership_scores;
  const eDomains = expertise.expertise_domains;
  const identityFlex = identity.identity_flexibility;

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  const fit_cxo = clamp(
    lScores.strategic_leadership * 0.30 + eDomains.personal_brand * 0.25 + bt.d * 0.20 +
    identityFlex * 0.15 + sp.strategic * 0.10
  );

  const fit_advisor = clamp(
    eDomains.domain_depth * 0.30 + eDomains.tacit_knowledge * 0.25 + lScores.coaching_leadership * 0.20 +
    sp.analytical * 0.15 + uf.self * 0.10
  );

  const fit_startup = clamp(
    lScores.exec_leadership * 0.25 + identityFlex * 0.25 + sp.breakthrough * 0.20 +
    ch.growth * 0.15 + ap.E * 0.15
  );

  const fit_consulting = clamp(
    eDomains.domain_depth * 0.25 + eDomains.tacit_knowledge * 0.20 + sp.analytical * 0.20 +
    sp.strategic * 0.20 + lScores.independent_leadership * 0.15
  );

  const fit_coach = clamp(
    lScores.coaching_leadership * 0.30 + eDomains.personal_brand * 0.20 + ap.S * 0.20 +
    bt.i * 0.15 + ch.relational * 0.15
  );

  const fit_expert = clamp(
    eDomains.tacit_knowledge * 0.25 + lScores.independent_leadership * 0.25 + sp.guard * 0.20 +
    eDomains.domain_depth * 0.20 + ap.C * 0.10
  );

  const fit_board = clamp(
    eDomains.domain_depth * 0.25 + eDomains.personal_brand * 0.25 + expertise.expertise_depth * 0.15 +
    sp.strategic * 0.20 + bt.d * 0.15
  );

  const roles: NextRoleOption[] = [
    { code: 'DROLE-CXO', role: 'CxO / 경영진', fit_score: fit_cxo,
      description: '조직 전체의 전략적 방향을 설계하고 실행하는 최고 의사결정자' },
    { code: 'DROLE-ADVISOR', role: '사외이사 / 자문역', fit_score: fit_advisor,
      description: '깊은 전문성과 경험을 바탕으로 조직에 전략적 조언을 제공' },
    { code: 'DROLE-STARTUP', role: '스타트업 조인', fit_score: fit_startup,
      description: '축적된 경험으로 초기 단계 사업의 성장을 가속' },
    { code: 'DROLE-CONSULTING', role: '전문 컨설턴트', fit_score: fit_consulting,
      description: '분석적 사고와 깊은 전문성을 바탕으로 문제 해결' },
    { code: 'DROLE-COACH', role: '코치 / 교육자', fit_score: fit_coach,
      description: '후배 리더 육성과 조직 코칭에 전문성을 발휘' },
    { code: 'DROLE-EXPERT', role: '독립 전문가 / 프리랜서', fit_score: fit_expert,
      description: '조직 외부에서 독자적 전문가로 활동' },
    { code: 'DROLE-BOARD', role: '이사회 / 상임고문', fit_score: fit_board,
      description: '다수 조직에 영향력을 행사하는 고위 자문' },
  ];

  roles.sort((a, b) => b.fit_score - a.fit_score);

  // 현재 역할 추정
  let current_role = '시니어 관리자';
  if (seniorReadiness.senior_readiness >= 70 && expertise.expertise_depth >= 70) current_role = '임원급';
  else if (expertise.expertise_depth >= 60) current_role = '팀장 / 디렉터급';

  return { current_role, possible_roles: roles };
}

// ── 통합 채점 ──

export interface HitDScoreResult {
  expertise_depth: number;
  expertise_breadth: number;
  expertise_domains: Record<string, number>;
  leadership_type: LeadershipType;
  leadership_scores: Record<LeadershipType, number>;
  role_identity: number;
  change_openness: number;
  self_reinvention: number;
  identity_flexibility: number;
  network_quality: number;
  network_breadth: number;
  senior_readiness: number;
  senior_readiness_scores: Record<string, number>;
  next_role_matrix: { current_role: string; possible_roles: NextRoleOption[] };
  faking_flag: boolean;
  // CH Deep D맞춤 / AP Deep D맞춤 (심화 레이어 응답 있을 때)
  chDeepScores?: {
    scores: Record<string, number>;
    grades: Record<string, 'A' | 'B' | 'C' | 'D'>;
    overallScore: number;
    overallGrade: 'A' | 'B' | 'C' | 'D';
    decoyScore: number;
    alertFlags: { NR: number; PP: number; MK: number; SP: number };
  };
  apDeepScores?: {
    scores: Record<string, number>;
    grades: Record<string, 'A' | 'B' | 'C' | 'D'>;
    top3Code: string;
    top3Labels: string[];
    dominantType: string;
  };
}

export function scoreHitD(responses: ResponseRow[], aCtx?: AContext): HitDScoreResult {
  const expertise = scoreExpertise(responses);
  const leadership = scoreLeadership(responses);
  const identity = scoreIdentity(responses);
  const network = scoreNetwork(responses);
  const seniorReadiness = scoreSeniorReadiness(responses);
  const next_role_matrix = buildNextRoleMatrix(expertise, leadership, identity, seniorReadiness, aCtx);
  const faking_flag = scoreDecoyD(responses);

  // CH Deep D / AP Deep D — 심화 응답 있을 때만
  const hasChDeep = responses.some(r => r.module === 'character_deep');
  const hasApDeep = responses.some(r => r.module === 'aptitude_deep');

  return {
    expertise_depth: expertise.expertise_depth,
    expertise_breadth: expertise.expertise_breadth,
    expertise_domains: expertise.expertise_domains,
    leadership_type: leadership.leadership_type,
    leadership_scores: leadership.leadership_scores,
    role_identity: identity.role_identity,
    change_openness: identity.change_openness,
    self_reinvention: identity.self_reinvention,
    identity_flexibility: identity.identity_flexibility,
    network_quality: network.network_quality,
    network_breadth: network.network_breadth,
    senior_readiness: seniorReadiness.senior_readiness,
    senior_readiness_scores: seniorReadiness.senior_readiness_scores,
    next_role_matrix,
    faking_flag,
    ...(hasChDeep && { chDeepScores: scoreChDeepB(responses) }),
    ...(hasApDeep && { apDeepScores: scoreApDeepB(responses) }),
  };
}
