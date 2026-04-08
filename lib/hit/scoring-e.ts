/**
 * HIT E 채점 알고리즘 — 인생전환검사 (140 + 미끼 2)
 * 7점 리커트 척도 기반
 * 모듈1: satisfaction — life_satisfaction, residual_passion, psych_transition
 * 모듈2: direction — re_employment, entrepreneurship, social_contribution, mentoring, leisure
 * 모듈3: legacy — transferable_legacy, knowledge_transfer, new_capability
 * 모듈4: social — belonging, role_necessity
 * 모듈5: readiness — time_readiness, energy_readiness, financial_readiness, relationship_readiness
 * 미끼: decoy (DECOY)
 * 심화: CH Deep E맞춤 + AP Deep E맞춤 (scoreChDeepB/scoreApDeepB 재사용)
 */

// CH/AP Deep 채점은 B와 동일 구조 (character_deep/aptitude_deep 모듈 필터)
import { scoreChDeepB, scoreApDeepB } from './scoring-b';
export { scoreChDeepB as scoreChDeepE, scoreApDeepB as scoreApDeepE } from './scoring-b';
export type { CHDeepBSubscale as CHDeepESubscale, HollandType } from './data/b-deep-questions';

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

const DIRECTION_LABELS: Record<DirectionType, string> = {
  re_employment: '재취업',
  entrepreneurship: '창업·독립',
  social_contribution: '봉사·사회공헌',
  mentoring: '멘토링·교육',
  leisure: '여가·자기실현',
};

export interface DirectionResult {
  directionType: DirectionType;
  directionScores: Record<DirectionType, number>;
  directionTop2: Array<{ code: DirectionType; label: string; score: number }>;
}

export function scoreDirection(responses: ResponseRow[]): DirectionResult {
  const direction = responses.filter(r => r.module === 'direction');
  const subscaleMap = buildSubscaleMap(direction);

  const directionScores: Record<DirectionType, number> = {
    re_employment: scaleToHundred(subscaleMap['re_employment'] || []),
    entrepreneurship: scaleToHundred(subscaleMap['entrepreneurship'] || []),
    social_contribution: scaleToHundred(subscaleMap['social_contribution'] || []),
    mentoring: scaleToHundred(subscaleMap['mentoring'] || []),
    leisure: scaleToHundred(subscaleMap['leisure'] || []),
  };

  const sorted = (Object.entries(directionScores) as [DirectionType, number][])
    .sort((a, b) => b[1] - a[1]);

  const directionType: DirectionType = sorted[0]?.[0] ?? 're_employment';
  const directionTop2 = sorted.slice(0, 2).map(([code, score]) => ({
    code,
    label: DIRECTION_LABELS[code],
    score,
  }));

  return { directionType, directionScores, directionTop2 };
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

export interface SocialReadinessResult {
  socialNeedScore: number;
  secondActReadiness: number;
  readinessScores: {
    time: number;
    energy: number;
    finance: number;
    relationship: number;
    total: number;
  };
}

export function scoreSocialReadiness(responses: ResponseRow[]): SocialReadinessResult {
  // 기존 'social_readiness' + 신규 'social'/'readiness' 모두 수용
  const socialReadiness = responses.filter(r =>
    r.module === 'social_readiness' || r.module === 'social' || r.module === 'readiness'
  );
  const subscaleMap = buildSubscaleMap(socialReadiness);

  const belonging = scaleToHundred(subscaleMap['belonging'] || []);
  const role_necessity = scaleToHundred(subscaleMap['role_necessity'] || []);

  const time = scaleToHundred(subscaleMap['time_readiness'] || []);
  const energy = scaleToHundred(subscaleMap['energy_readiness'] || []);
  const finance = scaleToHundred(subscaleMap['financial_readiness'] || []);
  const relationship = scaleToHundred(subscaleMap['relationship_readiness'] || []);

  const socialNeedScore = Math.round((belonging + role_necessity) / 2);
  const total = Math.round((time + energy + finance + relationship) / 4);
  const secondActReadiness = total;

  return {
    socialNeedScore,
    secondActReadiness,
    readinessScores: { time, energy, finance, relationship, total },
  };
}

// ── 미끼 (faking) 채점 ──

export function scoreDecoyE(responses: ResponseRow[]): boolean {
  const getVal = (id: string): number => {
    const r = responses.find(x => x.question_id === id);
    if (!r) return 0;
    const parts = r.option_value.split(':');
    return parseInt(parts[1] || parts[0], 10) || 0;
  };
  return getVal('e_val01') >= 6 && getVal('e_val02') >= 6;
}

// ── 통합 채점 ──

export interface HitEScoreResult {
  lifeSatisfaction: number;
  remainingPassion: number;
  psychTransition: number;
  directionType: DirectionType;
  directionScores: Record<DirectionType, number>;
  directionTop2: Array<{ code: DirectionType; label: string; score: number }>;
  legacySkillScore: number;
  legacyAreas: string[];
  socialNeedScore: number;
  secondActReadiness: number;
  readinessScores: {
    time: number;
    energy: number;
    finance: number;
    relationship: number;
    total: number;
  };
  fakingFlag: boolean;
  // CH Deep E맞춤 / AP Deep E맞춤 (심화 레이어 응답 있을 때)
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

export function scoreHitE(responses: ResponseRow[]): HitEScoreResult {
  const satisfaction = scoreLifeSatisfaction(responses);
  const direction = scoreDirection(responses);
  const legacy = scoreLegacy(responses);
  const social = scoreSocialReadiness(responses);
  const fakingFlag = scoreDecoyE(responses);

  // CH Deep E / AP Deep E — 심화 응답 있을 때만
  const hasChDeep = responses.some(r => r.module === 'character_deep');
  const hasApDeep = responses.some(r => r.module === 'aptitude_deep');

  return {
    lifeSatisfaction: satisfaction.lifeSatisfaction,
    remainingPassion: satisfaction.remainingPassion,
    psychTransition: satisfaction.psychTransition,
    directionType: direction.directionType,
    directionScores: direction.directionScores,
    directionTop2: direction.directionTop2,
    legacySkillScore: legacy.legacySkillScore,
    legacyAreas: legacy.legacyAreas,
    socialNeedScore: social.socialNeedScore,
    secondActReadiness: social.secondActReadiness,
    readinessScores: social.readinessScores,
    fakingFlag,
    ...(hasChDeep && { chDeepScores: scoreChDeepB(responses) }),
    ...(hasApDeep && { apDeepScores: scoreApDeepB(responses) }),
  };
}
