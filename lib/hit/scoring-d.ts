/**
 * HIT D 채점 알고리즘 — 시니어 리더십 전환
 * 7점 리커트 척도 기반: expertise, leadership, identity, network
 */

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

// ── 전문성 채점 ──

export function scoreExpertise(responses: ResponseRow[]): {
  expertise_depth: number;
  expertise_breadth: number;
  expertise_domains: Record<string, number>;
} {
  const expertise = responses.filter(r => r.module === 'expertise');
  const subscaleMap = buildSubscaleMap(expertise);

  const expertise_depth = scaleToHundred(subscaleMap['expertise_depth'] || []);
  const expertise_breadth = scaleToHundred(subscaleMap['expertise_breadth'] || []);

  const expertise_domains: Record<string, number> = {
    depth: expertise_depth,
    breadth: expertise_breadth,
  };

  return { expertise_depth, expertise_breadth, expertise_domains };
}

// ── 리더십 채점 ──

export type LeadershipType = 'visionary' | 'coaching' | 'democratic' | 'commanding';

export function scoreLeadership(responses: ResponseRow[]): {
  leadership_type: LeadershipType;
  leadership_scores: Record<LeadershipType, number>;
} {
  const leadership = responses.filter(r => r.module === 'leadership');
  const subscaleMap = buildSubscaleMap(leadership);

  const leadership_scores: Record<LeadershipType, number> = {
    visionary: scaleToHundred(subscaleMap['visionary'] || []),
    coaching: scaleToHundred(subscaleMap['coaching'] || []),
    democratic: scaleToHundred(subscaleMap['democratic'] || []),
    commanding: scaleToHundred(subscaleMap['commanding'] || []),
  };

  // 최고 점수 유형을 leadership_type으로 결정
  let leadership_type: LeadershipType = 'visionary';
  let maxScore = 0;
  for (const [type, score] of Object.entries(leadership_scores)) {
    if (score > maxScore) {
      maxScore = score;
      leadership_type = type as LeadershipType;
    }
  }

  return { leadership_type, leadership_scores };
}

// ── 정체성 유연성 채점 ──

export function scoreIdentity(responses: ResponseRow[]): {
  role_identity: number;
  change_openness: number;
  self_reinvention: number;
  identity_flexibility: number;
} {
  const identity = responses.filter(r => r.module === 'identity');
  const subscaleMap = buildSubscaleMap(identity);

  const role_identity = scaleToHundred(subscaleMap['role_identity'] || []);
  const change_openness = scaleToHundred(subscaleMap['change_openness'] || []);
  const self_reinvention = scaleToHundred(subscaleMap['self_reinvention'] || []);

  // 정체성 유연성 지수: 역할 정체성 30% + 변화 개방성 35% + 자기 재발명 35%
  const identity_flexibility = Math.round(
    role_identity * 0.3 +
    change_openness * 0.35 +
    self_reinvention * 0.35
  );

  return { role_identity, change_openness, self_reinvention, identity_flexibility };
}

// ── 네트워크 & 시니어 준비도 채점 ──

export function scoreNetwork(responses: ResponseRow[]): {
  network_quality: number;
  network_breadth: number;
  senior_readiness: number;
} {
  const network = responses.filter(r => r.module === 'network');
  const subscaleMap = buildSubscaleMap(network);

  const network_quality = scaleToHundred(subscaleMap['network_quality'] || []);
  const network_breadth = scaleToHundred(subscaleMap['network_breadth'] || []);
  const senior_readiness = scaleToHundred(subscaleMap['senior_readiness'] || []);

  return { network_quality, network_breadth, senior_readiness };
}

// ── 다음 역할 매트릭스 ──

export interface NextRoleOption {
  role: string;
  fit_score: number;
  description: string;
}

export function buildNextRoleMatrix(
  expertise_depth: number,
  expertise_breadth: number,
  leadershipType: LeadershipType,
  identity_flexibility: number,
  senior_readiness: number,
): { current_role: string; possible_roles: NextRoleOption[] } {
  const roles: NextRoleOption[] = [];

  // CxO / 경영진
  const cxoScore = Math.round(
    senior_readiness * 0.35 +
    expertise_depth * 0.2 +
    expertise_breadth * 0.2 +
    identity_flexibility * 0.25
  );
  roles.push({
    role: 'CxO / 경영진',
    fit_score: cxoScore,
    description: '조직 전체의 전략적 방향을 설계하고 실행하는 최고 의사결정자',
  });

  // 사외이사 / 자문역
  const advisorScore = Math.round(
    expertise_depth * 0.35 +
    senior_readiness * 0.3 +
    expertise_breadth * 0.2 +
    identity_flexibility * 0.15
  );
  roles.push({
    role: '사외이사 / 자문역',
    fit_score: advisorScore,
    description: '깊은 전문성과 경험을 바탕으로 조직에 전략적 조언을 제공',
  });

  // 창업 / 독립 경영
  const founderScore = Math.round(
    identity_flexibility * 0.3 +
    expertise_breadth * 0.25 +
    senior_readiness * 0.2 +
    expertise_depth * 0.25
  );
  roles.push({
    role: '창업 / 독립 경영',
    fit_score: founderScore,
    description: '축적된 전문성과 네트워크를 기반으로 새로운 사업을 직접 운영',
  });

  // 전문 코칭 / 멘토링
  const coachScore = Math.round(
    (leadershipType === 'coaching' ? 90 : 50) * 0.3 +
    expertise_depth * 0.3 +
    identity_flexibility * 0.2 +
    expertise_breadth * 0.2
  );
  roles.push({
    role: '전문 코칭 / 멘토링',
    fit_score: coachScore,
    description: '후배 리더 육성과 조직 코칭에 전문성을 발휘',
  });

  // 교수 / 연구
  const academicScore = Math.round(
    expertise_depth * 0.45 +
    expertise_breadth * 0.2 +
    identity_flexibility * 0.15 +
    senior_readiness * 0.2
  );
  roles.push({
    role: '교수 / 연구',
    fit_score: academicScore,
    description: '깊은 전문 지식을 학계나 연구기관에서 체계화하고 전수',
  });

  // 비영리 / 사회공헌
  const nonprofitScore = Math.round(
    identity_flexibility * 0.3 +
    expertise_breadth * 0.25 +
    senior_readiness * 0.2 +
    expertise_depth * 0.25
  );
  roles.push({
    role: '비영리 / 사회공헌 리더',
    fit_score: nonprofitScore,
    description: '경험과 네트워크를 사회적 임팩트 창출에 활용',
  });

  // 정렬: fit_score 내림차순
  roles.sort((a, b) => b.fit_score - a.fit_score);

  // 현재 역할 추정
  let current_role = '시니어 관리자';
  if (senior_readiness >= 70 && expertise_depth >= 70) current_role = '임원급';
  else if (expertise_depth >= 60) current_role = '팀장 / 디렉터급';

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
  next_role_matrix: { current_role: string; possible_roles: NextRoleOption[] };
}

export function scoreHitD(responses: ResponseRow[]): HitDScoreResult {
  const expertise = scoreExpertise(responses);
  const leadership = scoreLeadership(responses);
  const identity = scoreIdentity(responses);
  const network = scoreNetwork(responses);
  const next_role_matrix = buildNextRoleMatrix(
    expertise.expertise_depth,
    expertise.expertise_breadth,
    leadership.leadership_type,
    identity.identity_flexibility,
    network.senior_readiness,
  );

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
    senior_readiness: network.senior_readiness,
    next_role_matrix,
  };
}
