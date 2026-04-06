/**
 * HIT E 채점 알고리즘 — 인생 2막 분석
 * 7점 리커트 척도 기반: satisfaction, direction, legacy, social_readiness
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

// ── 삶의 만족도 & 열정 채점 ──

export function scoreLifeSatisfaction(responses: ResponseRow[]): {
  lifeSatisfaction: number;
  remainingPassion: number;
} {
  const satisfaction = responses.filter(r => r.module === 'satisfaction');
  const subscaleMap = buildSubscaleMap(satisfaction);

  return {
    lifeSatisfaction: scaleToHundred(subscaleMap['life_satisfaction'] || []),
    remainingPassion: scaleToHundred(subscaleMap['remaining_passion'] || []),
  };
}

// ── 방향 탐색 채점 ──

export type DirectionType = 'social_contribution' | 'entrepreneurship' | 'education' | 'leisure';

export function scoreDirection(responses: ResponseRow[]): {
  directionType: DirectionType;
  directionScores: Record<DirectionType, number>;
} {
  const direction = responses.filter(r => r.module === 'direction');
  const subscaleMap = buildSubscaleMap(direction);

  const directionScores: Record<DirectionType, number> = {
    social_contribution: scaleToHundred(subscaleMap['social_contribution'] || []),
    entrepreneurship: scaleToHundred(subscaleMap['entrepreneurship'] || []),
    education: scaleToHundred(subscaleMap['education'] || []),
    leisure: scaleToHundred(subscaleMap['leisure'] || []),
  };

  // 가장 높은 점수의 방향을 선택
  let directionType: DirectionType = 'social_contribution';
  let maxScore = -1;
  for (const [key, score] of Object.entries(directionScores) as [DirectionType, number][]) {
    if (score > maxScore) {
      maxScore = score;
      directionType = key;
    }
  }

  return { directionType, directionScores };
}

// ── 레거시 스킬 채점 ──

export function scoreLegacy(responses: ResponseRow[]): {
  legacySkillScore: number;
  legacyAreas: string[];
} {
  const legacy = responses.filter(r => r.module === 'legacy');
  const subscaleMap = buildSubscaleMap(legacy);

  const transferable = scaleToHundred(subscaleMap['transferable_skills'] || []);
  const domain = scaleToHundred(subscaleMap['domain_expertise'] || []);

  // 종합 레거시 스킬 점수: 이전가능 50% + 도메인 50%
  const legacySkillScore = Math.round(transferable * 0.5 + domain * 0.5);

  // 강점 영역 도출
  const legacyAreas: string[] = [];
  if (transferable >= 70) legacyAreas.push('범용 스킬 우수');
  if (domain >= 70) legacyAreas.push('도메인 전문성 우수');
  if (transferable >= 50 && domain >= 50) legacyAreas.push('균형 잡힌 레거시');
  if (transferable < 40) legacyAreas.push('범용 스킬 보강 필요');
  if (domain < 40) legacyAreas.push('전문성 재정비 필요');

  return { legacySkillScore, legacyAreas };
}

// ── 사회적 연결 & 준비도 채점 ──

export function scoreSocialReadiness(responses: ResponseRow[]): {
  socialNeedScore: number;
  secondActReadiness: number;
} {
  const socialReadiness = responses.filter(r => r.module === 'social_readiness');
  const subscaleMap = buildSubscaleMap(socialReadiness);

  return {
    socialNeedScore: scaleToHundred(subscaleMap['social_need'] || []),
    secondActReadiness: scaleToHundred(subscaleMap['second_act_readiness'] || []),
  };
}

// ── 통합 채점 ──

export interface HitEScoreResult {
  lifeSatisfaction: number;
  remainingPassion: number;
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
    directionType: direction.directionType,
    directionScores: direction.directionScores,
    legacySkillScore: legacy.legacySkillScore,
    legacyAreas: legacy.legacyAreas,
    socialNeedScore: social.socialNeedScore,
    secondActReadiness: social.secondActReadiness,
  };
}
