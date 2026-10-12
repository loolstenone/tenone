/**
 * HIT B 채점 — "역량과 방향" (전 회원 공통, 2026-10-12 재정의)
 * 7점 리커트 · 약 112문항 (트랙 1개 기준)
 *
 * 모듈1 competency_core — 핵심역량 6 × 5문항 = 30
 *   problem_solving · communication · initiative · collaboration · self_management · learning_agility
 * 모듈2 competency      — 직무 트랙 역량 30 (hit_competency_tracks 중 선택 1개)
 * 모듈3 efficacy        — RIASEC 효능감("할 수 있다") 6 × 6 = 36
 *   HIT A의 흥미(aptitude_core, "끌린다")와 교차 → 흥미×효능 매트릭스
 * 모듈4 career_insight  — 자기 이해 8 · 직무 이해 8 = 16
 *
 * 폐지(2026-10-12): personality 84(A CH와 중복) · riasec 60(A AP와 중복) · 준비도(진입 단계 C로 이동) · CH/AP 심화 재사용
 * 점수 0~100 = (평균-1)/6 (전 모듈 공통 바닥 0). 등급 A(≥75)/B(≥50)/C(≥25)/D
 */

interface ResponseRow {
  module: string;
  question_id: string;
  option_value: string;  // 'subscale:value[:r]'
}

export type Grade = 'A' | 'B' | 'C' | 'D';
export type HollandType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export const HOLLAND_TYPES: HollandType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
export const HOLLAND_LABELS: Record<HollandType, string> = {
  R: '현실형', I: '탐구형', A: '예술형', S: '사회형', E: '진취형', C: '관습형',
};

export const CORE_COMPETENCIES = [
  'problem_solving', 'communication', 'initiative', 'collaboration', 'self_management', 'learning_agility',
] as const;
export type CoreCompetency = typeof CORE_COMPETENCIES[number];
export const CORE_COMPETENCY_LABELS: Record<CoreCompetency, string> = {
  problem_solving: '문제해결', communication: '소통', initiative: '주도성',
  collaboration: '협업', self_management: '자기관리', learning_agility: '학습민첩성',
};

// ── 공통 유틸 ──

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
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

export function gradeScore(score: number): Grade {
  if (score >= 75) return 'A';
  if (score >= 50) return 'B';
  if (score >= 25) return 'C';
  return 'D';
}

// ── 모듈1 핵심역량 ──

export function scoreCoreCompetency(responses: ResponseRow[]) {
  const map = buildSubscaleMap(responses.filter(r => r.module === 'competency_core'));
  const scores = {} as Record<CoreCompetency, number>;
  const grades = {} as Record<CoreCompetency, Grade>;
  for (const c of CORE_COMPETENCIES) {
    scores[c] = scaleToHundred(map[c] || []);
    grades[c] = gradeScore(scores[c]);
  }
  const overallScore = avg(Object.values(scores));
  return { scores, grades, overallScore, overallGrade: gradeScore(overallScore) };
}

// ── 모듈2 직무 트랙 역량 ──

export function scoreTrackCompetency(responses: ResponseRow[]) {
  const map = buildSubscaleMap(responses.filter(r => r.module === 'competency'));
  const trackScores: Record<string, number> = {};
  const trackGrades: Record<string, Grade> = {};
  for (const [sub, values] of Object.entries(map)) {
    if (sub === 'unknown') continue;
    trackScores[sub] = scaleToHundred(values);
    trackGrades[sub] = gradeScore(trackScores[sub]);
  }
  const trackOverallScore = avg(Object.values(trackScores));
  return { trackScores, trackGrades, trackOverallScore, trackOverallGrade: gradeScore(trackOverallScore) };
}

// ── 모듈3 효능감 + 흥미×효능 매트릭스 ──

export type MatrixCell = '최적영역' | '탐색학습필요' | '소진리스크' | '비관심영역' | '미측정';

export function scoreEfficacy(responses: ResponseRow[]) {
  const map = buildSubscaleMap(responses.filter(r => r.module === 'efficacy'));
  const scores = {} as Record<HollandType, number>;
  for (const t of HOLLAND_TYPES) scores[t] = scaleToHundred(map[t] || map[t.toLowerCase()] || []);
  const top3Code = [...HOLLAND_TYPES].sort((x, y) => scores[y] - scores[x]).slice(0, 3).join('');
  return { scores, top3Code };
}

/**
 * 흥미(HIT - Archetype aptitude_core, "끌린다") × 효능(HIT - Bounce, "할 수 있다")
 * 기준 60 (R6, 2026-10-12 유지 결정): 50 = '보통이다' 평균이라 50으로 두면 '그저 그렇다'도 끌림으로 분류된다.
 * 60 ≈ 평균 응답 4.6 — '보통'과 '약간 그렇다' 사이를 넘어야 끌림·자신감으로 본다. 화면에도 '60 이상'으로 고지 (HitBResultView)
 */
export function buildInterestEfficacyMatrix(
  interest: Partial<Record<HollandType, number>> | null | undefined,
  efficacy: Record<HollandType, number>,
): { cells: Record<HollandType, MatrixCell>; optimal: HollandType[]; explore: HollandType[]; burnout: HollandType[] } {
  const cells = {} as Record<HollandType, MatrixCell>;
  for (const t of HOLLAND_TYPES) {
    const i = interest?.[t];
    const e = efficacy[t];
    if (typeof i !== 'number') { cells[t] = '미측정'; continue; }
    if (i >= 60 && e >= 60) cells[t] = '최적영역';
    else if (i >= 60 && e < 60) cells[t] = '탐색학습필요';
    else if (i < 60 && e >= 60) cells[t] = '소진리스크';
    else cells[t] = '비관심영역';
  }
  const pick = (c: MatrixCell) => HOLLAND_TYPES.filter(t => cells[t] === c);
  return { cells, optimal: pick('최적영역'), explore: pick('탐색학습필요'), burnout: pick('소진리스크') };
}

// ── 모듈4 자기·직무 이해 ──

export function scoreCareerInsight(responses: ResponseRow[]) {
  const map = buildSubscaleMap(responses.filter(r => r.module === 'career_insight'));
  const self = scaleToHundred(map['self_understanding'] || []);
  const job = scaleToHundred(map['job_understanding'] || []);
  const total = avg([self, job]);
  return { self, job, total, grade: gradeScore(total) };
}

// ── 종합 ──

export function determineBStage(coreOverall: number, insightTotal: number): string {
  if (coreOverall >= 75 && insightTotal >= 75) return 'ready';
  if (coreOverall >= 50 && insightTotal >= 50) return 'developing';
  if (insightTotal >= 25) return 'exploring';
  return 'discovering';
}

export interface HitBScoreResult {
  coreCompetencyScores: Record<CoreCompetency, number>;
  coreCompetencyGrades: Record<CoreCompetency, Grade>;
  coreCompetencyOverall: number;
  coreCompetencyGrade: Grade;
  trackScores: Record<string, number>;
  trackGrades: Record<string, Grade>;
  trackOverallScore: number;
  trackOverallGrade: Grade;
  efficacyScores: Record<HollandType, number>;
  efficacyTop3: string;
  matrix: ReturnType<typeof buildInterestEfficacyMatrix>;
  insightSelf: number;
  insightJob: number;
  insightTotal: number;
  insightGrade: Grade;
  journeyStage: string;
}

export function scoreHitB(
  responses: ResponseRow[],
  interest: Partial<Record<HollandType, number>> | null | undefined,
): HitBScoreResult {
  const core = scoreCoreCompetency(responses);
  const track = scoreTrackCompetency(responses);
  const eff = scoreEfficacy(responses);
  const insight = scoreCareerInsight(responses);
  return {
    coreCompetencyScores: core.scores,
    coreCompetencyGrades: core.grades,
    coreCompetencyOverall: core.overallScore,
    coreCompetencyGrade: core.overallGrade,
    trackScores: track.trackScores,
    trackGrades: track.trackGrades,
    trackOverallScore: track.trackOverallScore,
    trackOverallGrade: track.trackOverallGrade,
    efficacyScores: eff.scores,
    efficacyTop3: eff.top3Code,
    matrix: buildInterestEfficacyMatrix(interest, eff.scores),
    insightSelf: insight.self,
    insightJob: insight.job,
    insightTotal: insight.total,
    insightGrade: insight.grade,
    journeyStage: determineBStage(core.overallScore, insight.total),
  };
}
