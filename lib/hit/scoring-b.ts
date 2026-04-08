/**
 * HIT B 채점 알고리즘 — 신입·사회초년생 기초역량 분석
 * 7점 리커트 척도 기반 · 80문항
 * HIT_B_Final.md 설계서 기준 (확정판)
 *
 * 모듈1: competency_core — 공통 기초역량 18문항 (6역량 × 3문항)
 *   - problem_solving, communication, initiative, collaboration, self_management, learning_agility
 * 모듈2: competency     — 직무별 전문역량 30문항 (기존 DB 트랙별 추출)
 * 모듈3: readiness_core — 공통 준비도 32문항 (4영역 × 8문항)
 *   - self_understanding, job_understanding, skill_readiness, action_readiness
 *
 * 등급: A(≥75) / B(50~74) / C(25~49) / D(<25)
 */

interface ResponseRow {
  module: string;
  question_id: string;
  option_value: string;  // 'subscale:value[:r]'
}

// ── 공통 유틸 ──────────────────────────────────────────────────────

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

/** A(≥75) / B(50~74) / C(25~49) / D(<25) */
export function gradeScore(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= 75) return 'A';
  if (score >= 50) return 'B';
  if (score >= 25) return 'C';
  return 'D';
}

// ── 모듈1: 공통 기초역량 채점 (competency_core) ────────────────────

export function scoreCoreCompetency(responses: ResponseRow[]): {
  scores: Record<string, number>;
  grades: Record<string, 'A' | 'B' | 'C' | 'D'>;
  overallScore: number;
  overallGrade: 'A' | 'B' | 'C' | 'D';
} {
  const core = responses.filter(r => r.module === 'competency_core');
  const subscaleMap = buildSubscaleMap(core);

  const competencies = [
    'problem_solving',
    'communication',
    'initiative',
    'collaboration',
    'self_management',
    'learning_agility',
  ];

  const scores: Record<string, number> = {};
  const grades: Record<string, 'A' | 'B' | 'C' | 'D'> = {};

  for (const comp of competencies) {
    scores[comp] = scaleToHundred(subscaleMap[comp] || []);
    grades[comp] = gradeScore(scores[comp]);
  }

  const values = Object.values(scores);
  const overallScore = values.length > 0
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;
  const overallGrade = gradeScore(overallScore);

  return { scores, grades, overallScore, overallGrade };
}

// ── 모듈2: 직무별 전문역량 채점 (competency) ──────────────────────

/**
 * 기존 DB module='competency' 트랙별 30문항 채점
 * option_value: 'subscale:value' 형식
 */
export function scoreTrackCompetency(responses: ResponseRow[]): {
  trackScores: Record<string, number>;
  trackGrades: Record<string, 'A' | 'B' | 'C' | 'D'>;
  trackOverallScore: number;
  trackOverallGrade: 'A' | 'B' | 'C' | 'D';
} {
  const track = responses.filter(r => r.module === 'competency');
  const subscaleMap = buildSubscaleMap(track);

  const trackScores: Record<string, number> = {};
  const trackGrades: Record<string, 'A' | 'B' | 'C' | 'D'> = {};

  for (const [subscale, values] of Object.entries(subscaleMap)) {
    if (subscale === 'unknown') continue;
    trackScores[subscale] = scaleToHundred(values);
    trackGrades[subscale] = gradeScore(trackScores[subscale]);
  }

  const vals = Object.values(trackScores);
  const trackOverallScore = vals.length > 0
    ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
    : 0;
  const trackOverallGrade = gradeScore(trackOverallScore);

  return { trackScores, trackGrades, trackOverallScore, trackOverallGrade };
}

// ── 모듈3: 공통 준비도 채점 (readiness_core) ──────────────────────

export function scoreCoreReadiness(responses: ResponseRow[]): {
  scores: {
    self_understanding:  number;
    job_understanding:   number;
    skill_readiness:     number;
    action_readiness:    number;
  };
  grades: {
    self_understanding:  'A' | 'B' | 'C' | 'D';
    job_understanding:   'A' | 'B' | 'C' | 'D';
    skill_readiness:     'A' | 'B' | 'C' | 'D';
    action_readiness:    'A' | 'B' | 'C' | 'D';
  };
  readinessTotal: number;
  readinessGrade: 'A' | 'B' | 'C' | 'D';
  gaps: string[];
} {
  const ready = responses.filter(r => r.module === 'readiness_core');
  const subscaleMap = buildSubscaleMap(ready);

  const su = scaleToHundred(subscaleMap['self_understanding'] || []);
  const ju = scaleToHundred(subscaleMap['job_understanding']  || []);
  const sr = scaleToHundred(subscaleMap['skill_readiness']    || []);
  const ar = scaleToHundred(subscaleMap['action_readiness']   || []);

  const readinessTotal = Math.round((su + ju + sr + ar) / 4);

  const AREA_LABELS: Record<string, string> = {
    self_understanding: '자기이해',
    job_understanding:  '직무이해',
    skill_readiness:    '역량준비',
    action_readiness:   '실행준비',
  };

  const areaScores = { self_understanding: su, job_understanding: ju, skill_readiness: sr, action_readiness: ar };
  const gaps: string[] = [];
  for (const [key, score] of Object.entries(areaScores)) {
    if (score < 50) gaps.push(AREA_LABELS[key] || key);
  }

  return {
    scores: areaScores,
    grades: {
      self_understanding: gradeScore(su),
      job_understanding:  gradeScore(ju),
      skill_readiness:    gradeScore(sr),
      action_readiness:   gradeScore(ar),
    },
    readinessTotal,
    readinessGrade: gradeScore(readinessTotal),
    gaps,
  };
}

// ── 여정 단계 판별 ──────────────────────────────────────────────────

export function determineJourneyStage(readinessTotal: number, competencyOverall: number): string {
  if (readinessTotal >= 75 && competencyOverall >= 75) return 'ready';
  if (readinessTotal >= 50 && competencyOverall >= 50) return 'developing';
  if (readinessTotal >= 25) return 'exploring';
  return 'discovering';
}

// ── 주의 신호 (소비자 비노출) ────────────────────────────────────────

export function computeAlertScores(personalityScores: Record<string, number>): {
  alertN1: number;
  alertM1: number;
  alertP1: number;
  alertLevel: number;
} {
  const alertN1 = personalityScores['narcissism_dark'] ?? 0;
  const alertM1 = personalityScores['machiavellianism_dark'] ?? 0;
  const alertP1 = personalityScores['psychopathy_dark'] ?? 0;

  let alertLevel = 0;
  if (alertN1 >= 70) alertLevel++;
  if (alertM1 >= 70) alertLevel++;
  if (alertP1 >= 70) alertLevel++;

  return { alertN1, alertM1, alertP1, alertLevel };
}

export function computeAlertScoresFromDB(
  responses: ResponseRow[],
  alertQuestions: { question_id: string; alert_code: string }[],
  personalityScoresFallback: Record<string, number>,
): {
  alertN1: number;
  alertM1: number;
  alertP1: number;
  alertLevel: number;
} {
  if (alertQuestions.length === 0) {
    return computeAlertScores(personalityScoresFallback);
  }

  const n1Ids = new Set(alertQuestions.filter(q => q.alert_code === 'N1').map(q => q.question_id));
  const m1Ids = new Set(alertQuestions.filter(q => q.alert_code === 'M1').map(q => q.question_id));
  const p1Ids = new Set(alertQuestions.filter(q => q.alert_code === 'P1').map(q => q.question_id));

  function aggregateAlertGroup(questionIds: Set<string>): number {
    if (questionIds.size === 0) return 0;
    const matching = responses.filter(r => questionIds.has(r.question_id));
    if (matching.length === 0) return 0;
    const values = matching.map(r => {
      const parts = r.option_value.split(':');
      const raw = parseInt(parts.length >= 2 ? parts[1] : parts[0], 10);
      return isNaN(raw) ? 0 : raw;
    });
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(((avg - 1) / 6) * 100);
  }

  const alertN1 = aggregateAlertGroup(n1Ids);
  const alertM1 = aggregateAlertGroup(m1Ids);
  const alertP1 = aggregateAlertGroup(p1Ids);

  let alertLevel = 0;
  if (alertN1 >= 70) alertLevel++;
  if (alertM1 >= 70) alertLevel++;
  if (alertP1 >= 70) alertLevel++;

  return { alertN1, alertM1, alertP1, alertLevel };
}

// ── CH Deep B 채점 ─────────────────────────────────────────────────

import { CH_DEEP_B_SUBSCALES, type CHDeepBSubscale, type HollandType } from './data/b-deep-questions';

/**
 * CH Deep B맞춤 채점 (45문항 → 14구독척도, decoy 제외)
 * responses: character_deep module 응답만 전달 or 전체에서 필터링됨
 * option_value 형식: 'subscale:value' 또는 'subscale:value:r'
 */
export function scoreChDeepB(responses: ResponseRow[]): {
  scores: Record<CHDeepBSubscale, number>;
  grades: Record<CHDeepBSubscale, 'A' | 'B' | 'C' | 'D'>;
  overallScore: number;
  overallGrade: 'A' | 'B' | 'C' | 'D';
  decoyScore: number;   // 1~7 평균 (낮을수록 솔직)
  alertFlags: { NR: number; PP: number; MK: number; SP: number };
} {
  const filtered = responses.filter(r => r.module === 'character_deep');
  const subscaleMap = buildSubscaleMap(filtered);

  const scores = {} as Record<CHDeepBSubscale, number>;
  const grades = {} as Record<CHDeepBSubscale, 'A' | 'B' | 'C' | 'D'>;

  for (const sub of CH_DEEP_B_SUBSCALES) {
    scores[sub] = scaleToHundred(subscaleMap[sub] || []);
    grades[sub] = gradeScore(scores[sub]);
  }

  const vals = Object.values(scores);
  const overallScore = vals.length > 0
    ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
    : 0;
  const overallGrade = gradeScore(overallScore);

  // decoy 점수 (raw 1~7 평균, 채점 제외)
  const decoyRaw = (subscaleMap['decoy'] || []);
  const decoyScore = decoyRaw.length > 0
    ? Math.round((decoyRaw.reduce((a, b) => a + b, 0) / decoyRaw.length) * 10) / 10
    : 0;

  // 다크 플래그별 점수 (NR·PP·MK·SP)
  const alertFlags = {
    NR: scaleToHundred(subscaleMap['NR'] || subscaleMap['social_boldness'] || []),
    PP: scaleToHundred(subscaleMap['PP'] || []),
    MK: scaleToHundred(subscaleMap['MK'] || subscaleMap['suspicion'] || []),
    SP: scaleToHundred(subscaleMap['SP'] || subscaleMap['adventure'] || []),
  };

  return { scores, grades, overallScore, overallGrade, decoyScore, alertFlags };
}

// ── AP Deep B 채점 ─────────────────────────────────────────────────

const HOLLAND_LABELS: Record<HollandType, string> = {
  R: '현실형',
  I: '탐구형',
  A: '예술형',
  S: '사회형',
  E: '기업형',
  C: '관습형',
};

/**
 * AP Deep B맞춤 채점 (30문항 → R/I/A/S/E/C 6개 점수 + top3Code)
 * AP Deep은 역채점 없음 (모두 정방향)
 */
export function scoreApDeepB(responses: ResponseRow[]): {
  scores: Record<HollandType, number>;
  grades: Record<HollandType, 'A' | 'B' | 'C' | 'D'>;
  top3Code: string;        // e.g. 'ESA'
  top3Labels: string[];    // e.g. ['기업형','사회형','예술형']
  dominantType: HollandType;
} {
  const filtered = responses.filter(r => r.module === 'aptitude_deep');
  const subscaleMap = buildSubscaleMap(filtered);

  const hollandTypes: HollandType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  const scores = {} as Record<HollandType, number>;
  const grades = {} as Record<HollandType, 'A' | 'B' | 'C' | 'D'>;

  for (const type of hollandTypes) {
    scores[type] = scaleToHundred(subscaleMap[type] || []);
    grades[type] = gradeScore(scores[type]);
  }

  // top3 정렬 (점수 내림차순)
  const sorted = hollandTypes
    .map(t => ({ type: t, score: scores[t] }))
    .sort((a, b) => b.score - a.score);

  const top3 = sorted.slice(0, 3);
  const top3Code = top3.map(t => t.type).join('');
  const top3Labels = top3.map(t => HOLLAND_LABELS[t.type]);
  const dominantType = top3[0].type;

  return { scores, grades, top3Code, top3Labels, dominantType };
}

// ── 통합 결과 타입 ──────────────────────────────────────────────────

export interface HitBScoreResult {
  // 공통 기초역량
  coreCompetencyScores:   Record<string, number>;
  coreCompetencyGrades:   Record<string, 'A' | 'B' | 'C' | 'D'>;
  coreCompetencyOverall:  number;
  coreCompetencyGrade:    'A' | 'B' | 'C' | 'D';
  // 직무별 전문역량
  trackScores:       Record<string, number>;
  trackGrades:       Record<string, 'A' | 'B' | 'C' | 'D'>;
  trackOverallScore: number;
  trackOverallGrade: 'A' | 'B' | 'C' | 'D';
  // 준비도
  readinessScores: {
    self_understanding: number;
    job_understanding:  number;
    skill_readiness:    number;
    action_readiness:   number;
  };
  readinessGrades: {
    self_understanding: 'A' | 'B' | 'C' | 'D';
    job_understanding:  'A' | 'B' | 'C' | 'D';
    skill_readiness:    'A' | 'B' | 'C' | 'D';
    action_readiness:   'A' | 'B' | 'C' | 'D';
  };
  readinessTotal: number;
  readinessGrade: 'A' | 'B' | 'C' | 'D';
  readinessGaps:  string[];
  // CH Deep B맞춤 (optional — 심화 레이어 응답 있을 때)
  chDeepScores?: {
    scores: Record<CHDeepBSubscale, number>;
    grades: Record<CHDeepBSubscale, 'A' | 'B' | 'C' | 'D'>;
    overallScore: number;
    overallGrade: 'A' | 'B' | 'C' | 'D';
    decoyScore: number;
    alertFlags: { NR: number; PP: number; MK: number; SP: number };
  };
  // AP Deep B맞춤 (optional — 심화 레이어 응답 있을 때)
  apDeepScores?: {
    scores: Record<HollandType, number>;
    grades: Record<HollandType, 'A' | 'B' | 'C' | 'D'>;
    top3Code: string;
    top3Labels: string[];
    dominantType: HollandType;
  };
  // 여정
  journeyStage: string;
}

// ── 통합 채점 ───────────────────────────────────────────────────────

export function scoreHitB(
  responses: ResponseRow[],
  competencyTrack: string,
): HitBScoreResult {
  const core     = scoreCoreCompetency(responses);
  const track    = scoreTrackCompetency(responses);
  const readiness = scoreCoreReadiness(responses);

  const journeyStage = determineJourneyStage(readiness.readinessTotal, core.overallScore);

  // competencyTrack은 AI 프롬프트/DB 저장용으로 전달됨 — 채점 자체엔 불필요
  void competencyTrack;

  // CH Deep B / AP Deep B — 해당 모듈 응답이 있을 때만 채점
  const hasChDeep = responses.some(r => r.module === 'character_deep');
  const hasApDeep = responses.some(r => r.module === 'aptitude_deep');

  return {
    // 공통 기초역량
    coreCompetencyScores:  core.scores,
    coreCompetencyGrades:  core.grades,
    coreCompetencyOverall: core.overallScore,
    coreCompetencyGrade:   core.overallGrade,
    // 직무별 전문역량
    trackScores:       track.trackScores,
    trackGrades:       track.trackGrades,
    trackOverallScore: track.trackOverallScore,
    trackOverallGrade: track.trackOverallGrade,
    // 준비도
    readinessScores: readiness.scores,
    readinessGrades: readiness.grades,
    readinessTotal:  readiness.readinessTotal,
    readinessGrade:  readiness.readinessGrade,
    readinessGaps:   readiness.gaps,
    // CH Deep B (심화)
    ...(hasChDeep && { chDeepScores: scoreChDeepB(responses) }),
    // AP Deep B (심화)
    ...(hasApDeep && { apDeepScores: scoreApDeepB(responses) }),
    // 여정
    journeyStage,
  };
}
