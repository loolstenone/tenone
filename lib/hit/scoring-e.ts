/**
 * HIT E 채점 알고리즘 — 인생 2막 분석
 * 7점 리커트 척도 기반
 * 모듈1: satisfaction — life_satisfaction, residual_passion, psych_transition
 * 모듈2: direction — re_employment, entrepreneurship, social_contribution, mentoring, leisure
 * 모듈3: legacy — transferable_legacy, knowledge_transfer, new_capability
 * 모듈4: social_readiness — belonging, role_necessity, time_readiness, energy_readiness, financial_readiness, relationship_readiness
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

// ── 삶의 만족도 & 잔여 열정 채점 ──

export function scoreLifeSatisfaction(responses: ResponseRow[]): {
  lifeSatisfaction: number;
  remainingPassion: number;
  psychTransition: number;
} {
  const satisfaction = responses.filter(r => r.module === 'satisfaction');
  const subscaleMap = buildSubscaleMap(satisfaction);

  return {
    lifeSatisfaction: scaleToHundred(subscaleMap['life_satisfaction'] || []),
    remainingPassion: scaleToHundred(subscaleMap['residual_passion'] || []),
    psychTransition: scaleToHundred(subscaleMap['psych_transition'] || []),
  };
}

// ── 2막 방향 탐색 채점 ──

export type DirectionType = 're_employment' | 'entrepreneurship' | 'social_contribution' | 'mentoring' | 'leisure';

export function scoreDirection(responses: ResponseRow[]): {
  directionType: DirectionType;
  directionScores: Record<DirectionType, number>;
} {
  const direction = responses.filter(r => r.module === 'direction');
  const subscaleMap = buildSubscaleMap(direction);

  const directionScores: Record<DirectionType, number> = {
    re_employment: scaleToHundred(subscaleMap['re_employment'] || []),
    entrepreneurship: scaleToHundred(subscaleMap['entrepreneurship'] || []),
    social_contribution: scaleToHundred(subscaleMap['social_contribution'] || []),
    mentoring: scaleToHundred(subscaleMap['mentoring'] || []),
    leisure: scaleToHundred(subscaleMap['leisure'] || []),
  };

  // 가장 높은 점수의 방향을 선택
  let directionType: DirectionType = 're_employment';
  let maxScore = -1;
  for (const [key, score] of Object.entries(directionScores) as [DirectionType, number][]) {
    if (score > maxScore) {
      maxScore = score;
      directionType = key;
    }
  }

  return { directionType, directionScores };
}

// ── 역량 재활용 진단 채점 ──

export function scoreLegacy(responses: ResponseRow[]): {
  legacySkillScore: number;
  legacyAreas: string[];
} {
  const legacy = responses.filter(r => r.module === 'legacy');
  const subscaleMap = buildSubscaleMap(legacy);

  const transferable_legacy = scaleToHundred(subscaleMap['transferable_legacy'] || []);
  const knowledge_transfer = scaleToHundred(subscaleMap['knowledge_transfer'] || []);
  const new_capability = scaleToHundred(subscaleMap['new_capability'] || []);

  // 레거시 스킬 종합: 이전가능역량 40% + 지식전수 30% + 신규역량 30%
  const legacySkillScore = Math.round(
    transferable_legacy * 0.4 +
    knowledge_transfer * 0.3 +
    new_capability * 0.3
  );

  const legacyAreas: string[] = [];
  if (transferable_legacy >= 70) legacyAreas.push('이전 가능 역량 우수');
  if (knowledge_transfer >= 70) legacyAreas.push('지식 전수 역량 우수');
  if (new_capability >= 70) legacyAreas.push('신규 역량 개발 의지 높음');
  if (transferable_legacy < 40) legacyAreas.push('이전 가능 역량 개발 필요');
  if (knowledge_transfer < 40) legacyAreas.push('지식 전수 방법 모색 필요');
  if (new_capability < 40) legacyAreas.push('새로운 역량 학습 필요');

  return { legacySkillScore, legacyAreas };
}

// ── 사회적 연결 & 2막 준비도 채점 ──

export function scoreSocialReadiness(responses: ResponseRow[]): {
  socialNeedScore: number;
  secondActReadiness: number;
} {
  const socialReadiness = responses.filter(r => r.module === 'social_readiness');
  const subscaleMap = buildSubscaleMap(socialReadiness);

  const belonging = scaleToHundred(subscaleMap['belonging'] || []);
  const role_necessity = scaleToHundred(subscaleMap['role_necessity'] || []);
  const time_readiness = scaleToHundred(subscaleMap['time_readiness'] || []);
  const energy_readiness = scaleToHundred(subscaleMap['energy_readiness'] || []);
  const financial_readiness = scaleToHundred(subscaleMap['financial_readiness'] || []);
  const relationship_readiness = scaleToHundred(subscaleMap['relationship_readiness'] || []);

  // 사회적 연결 필요도: 소속감 + 역할필요도 평균
  const socialNeedScore = Math.round((belonging + role_necessity) / 2);
  // 2막 준비도: 시간·에너지·재정·관계 평균
  const secondActReadiness = Math.round(
    (time_readiness + energy_readiness + financial_readiness + relationship_readiness) / 4
  );

  return { socialNeedScore, secondActReadiness };
}

// ── 통합 채점 ──

export interface HitEScoreResult {
  lifeSatisfaction: number;
  remainingPassion: number;
  psychTransition: number;
  directionType: DirectionType;
  directionScores: Record<DirectionType, number>;
  legacySkillScore: number;
  legacyAreas: string[];
  socialNeedScore: number;
  secondActReadiness: number;
}

export function scoreHitE(responses: ResponseRow[]): HitEScoreResult {
  const satisfaction = scoreLifeSatisfaction(responses);
  const direction = scoreDirection(responses);
  const legacy = scoreLegacy(responses);
  const social = scoreSocialReadiness(responses);

  return {
    lifeSatisfaction: satisfaction.lifeSatisfaction,
    remainingPassion: satisfaction.remainingPassion,
    psychTransition: satisfaction.psychTransition,
    directionType: direction.directionType,
    directionScores: direction.directionScores,
    legacySkillScore: legacy.legacySkillScore,
    legacyAreas: legacy.legacyAreas,
    socialNeedScore: social.socialNeedScore,
    secondActReadiness: social.secondActReadiness,
  };
}
