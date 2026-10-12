/**
 * HIT C 채점 — "진입: 대학생·사회 초년" (2026-10-12 신설, docs/HIT_Structure_Consulting_2026-10.md)
 * 7점 리커트 · 약 78문항
 *
 * 모듈1 readiness       — 취업 준비 상태: self·portfolio·interview·network(공통 20) + skill_readiness·action_readiness(16) + 트랙 준비도(12)
 * 모듈2 onboarding      — 첫 직무 적응: org_adaptation·learning_speed·relationship_building·feedback_acceptance (각 5)
 * 모듈3 career_decision — 진로 결정 확신 (10)
 *
 * 준비도는 "상태"라 Journey 체크리스트(lib/hero/journey-checklists.ts stage c)와 겹친다 —
 * 검사 점수는 자기 인식, 체크리스트는 실제 완료. 결과 페이지는 둘 다 보여준다.
 */

interface ResponseRow {
  module: string;
  question_id: string;
  option_value: string;  // 'subscale:value[:r]'
}

export type Grade = 'A' | 'B' | 'C' | 'D';

function buildSubscaleMap(responses: ResponseRow[]): Record<string, number[]> {
  const map: Record<string, number[]> = {};
  for (const r of responses) {
    const parts = r.option_value.split(':');
    let subscale = 'unknown';
    let value = NaN;
    let reverse = false;
    if (parts.length >= 2) { subscale = parts[0]; value = parseInt(parts[1], 10); reverse = parts[2] === 'r'; }
    else value = parseInt(r.option_value, 10);
    if (isNaN(value)) continue;
    if (reverse) value = 8 - value;
    (map[subscale] ??= []).push(value);
  }
  return map;
}

function scaleToHundred(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(((avg - 1) / 6) * 100);
}

function avg(values: number[]): number {
  const v = values.filter(x => Number.isFinite(x));
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
}

export function gradeScore(score: number): Grade {
  if (score >= 75) return 'A';
  if (score >= 50) return 'B';
  if (score >= 25) return 'C';
  return 'D';
}

export const READINESS_LABELS: Record<string, string> = {
  self: '자기 이해', portfolio: '포트폴리오', interview: '면접', network: '네트워킹',
  skill_readiness: '스킬 준비', action_readiness: '실행 준비', track: '직무 트랙 준비',
};
export const ONBOARDING_LABELS: Record<string, string> = {
  org_adaptation: '조직 적응', learning_speed: '학습 속도', relationship_building: '관계 형성', feedback_acceptance: '피드백 수용',
};

export function scoreReadiness(responses: ResponseRow[]) {
  // 트랙 문항(ready_{트랙약어}_NNN)도 sub_domain이 self·portfolio 등 공통 이름이라 subscale로는 못 가른다 (2026-10-12 —
  // 트랙 문항이 공통 차원 평균에 섞이고 '직무 트랙 준비'가 한 번도 안 나왔다). 문항 id로 가른다: 공통 = ready_c_* · b_*
  const readiness = responses.filter(r => r.module === 'readiness');
  const isCommon = (id: string) => id.startsWith('ready_c_') || id.startsWith('b_');
  const map = buildSubscaleMap(readiness.filter(r => isCommon(r.question_id)));
  const common = ['self', 'portfolio', 'interview', 'network', 'skill_readiness', 'action_readiness'];
  const scores: Record<string, number> = {};
  for (const k of common) if (map[k]?.length) scores[k] = scaleToHundred(map[k]);
  const trackVals = Object.values(buildSubscaleMap(readiness.filter(r => !isCommon(r.question_id)))).flat();
  if (trackVals.length) scores.track = scaleToHundred(trackVals);
  const total = avg(Object.values(scores));
  const gaps = Object.entries(scores).filter(([, v]) => v < 50).map(([k]) => READINESS_LABELS[k] ?? k);
  return { scores, total, grade: gradeScore(total), gaps };
}

export function scoreOnboarding(responses: ResponseRow[]) {
  const map = buildSubscaleMap(responses.filter(r => r.module === 'onboarding'));
  const scores: Record<string, number> = {};
  for (const k of Object.keys(ONBOARDING_LABELS)) scores[k] = scaleToHundred(map[k] || []);
  const total = avg(Object.values(scores));
  return { scores, total, grade: gradeScore(total) };
}

export function scoreCareerDecision(responses: ResponseRow[]) {
  const map = buildSubscaleMap(responses.filter(r => r.module === 'career_decision'));
  const score = scaleToHundred(map['career_decision'] || []);
  return { score, grade: gradeScore(score) };
}

export function determineCStage(readinessTotal: number, decision: number): string {
  if (readinessTotal >= 75 && decision >= 75) return 'ready';
  if (readinessTotal >= 50 && decision >= 50) return 'developing';
  if (decision >= 25) return 'exploring';
  return 'discovering';
}

export interface HitCScoreResult {
  readinessScores: Record<string, number>;
  readinessTotal: number;
  readinessGrade: Grade;
  readinessGaps: string[];
  onboardingScores: Record<string, number>;
  onboardingTotal: number;
  onboardingGrade: Grade;
  careerDecision: number;
  careerDecisionGrade: Grade;
  journeyStage: string;
}

export function scoreHitC(responses: ResponseRow[]): HitCScoreResult {
  const r = scoreReadiness(responses);
  const o = scoreOnboarding(responses);
  const d = scoreCareerDecision(responses);
  return {
    readinessScores: r.scores, readinessTotal: r.total, readinessGrade: r.grade, readinessGaps: r.gaps,
    onboardingScores: o.scores, onboardingTotal: o.total, onboardingGrade: o.grade,
    careerDecision: d.score, careerDecisionGrade: d.grade,
    journeyStage: determineCStage(r.total, d.score),
  };
}
