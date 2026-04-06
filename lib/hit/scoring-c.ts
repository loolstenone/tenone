/**
 * HIT C 채점 알고리즘 — 경력전환 분석
 * 7점 리커트 척도 기반: capital, motivation, transferability, readiness
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

// ── 경력 자본 채점 ──

export function scoreCapital(responses: ResponseRow[]): {
  scores: Record<string, number>;
  overall: number;
} {
  const capital = responses.filter(r => r.module === 'capital');
  const subscaleMap = buildSubscaleMap(capital);

  const scores: Record<string, number> = {
    expertise: scaleToHundred(subscaleMap['expertise'] || []),
    network: scaleToHundred(subscaleMap['network'] || []),
    org_understanding: scaleToHundred(subscaleMap['org_understanding'] || []),
    competencies: scaleToHundred(subscaleMap['competencies'] || []),
  };

  const overall = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
  );

  return { scores, overall };
}

// ── 이직 동기 채점 ──

export function scoreMotivation(responses: ResponseRow[]): {
  push: number;
  pull: number;
  motivationType: 'push_driven' | 'pull_driven' | 'balanced';
} {
  const motivation = responses.filter(r => r.module === 'motivation');
  const subscaleMap = buildSubscaleMap(motivation);

  const push = scaleToHundred(subscaleMap['push'] || []);
  const pull = scaleToHundred(subscaleMap['pull'] || []);

  let motivationType: 'push_driven' | 'pull_driven' | 'balanced';
  if (push - pull > 15) motivationType = 'push_driven';
  else if (pull - push > 15) motivationType = 'pull_driven';
  else motivationType = 'balanced';

  return { push, pull, motivationType };
}

// ── 전환 가능성 채점 ──

export function scoreTransferability(responses: ResponseRow[]): {
  scores: Record<string, number>;
  transferabilityIndex: number;
} {
  const transferability = responses.filter(r => r.module === 'transferability');
  const subscaleMap = buildSubscaleMap(transferability);

  const scores: Record<string, number> = {
    skill_portability: scaleToHundred(subscaleMap['skill_portability'] || []),
    industry_adaptability: scaleToHundred(subscaleMap['industry_adaptability'] || []),
    learning_agility: scaleToHundred(subscaleMap['learning_agility'] || []),
  };

  // 전환가능성 지수: 가중 평균 (스킬 40%, 적응력 30%, 학습 30%)
  const transferabilityIndex = Math.round(
    scores.skill_portability * 0.4 +
    scores.industry_adaptability * 0.3 +
    scores.learning_agility * 0.3
  );

  return { scores, transferabilityIndex };
}

// ── 준비도 채점 ──

export function scoreReadiness(responses: ResponseRow[]): {
  preparation: number;
  gapAwareness: number;
  transitionReadiness: number;
} {
  const readiness = responses.filter(r => r.module === 'readiness');
  const subscaleMap = buildSubscaleMap(readiness);

  const preparation = scaleToHundred(subscaleMap['preparation'] || []);
  const gapAwareness = scaleToHundred(subscaleMap['gap_awareness'] || []);

  // 전환 준비도: 준비 60% + 갭 인식 40%
  const transitionReadiness = Math.round(preparation * 0.6 + gapAwareness * 0.4);

  return { preparation, gapAwareness, transitionReadiness };
}

// ── 갭 영역 도출 ──

export function identifyGapAreas(
  capitalScores: Record<string, number>,
  transferScores: Record<string, number>,
  preparation: number,
): string[] {
  const gaps: string[] = [];
  const threshold = 50;

  if (capitalScores.expertise < threshold) gaps.push('전문성 심화 필요');
  if (capitalScores.network < threshold) gaps.push('업계 네트워크 확장 필요');
  if (capitalScores.org_understanding < threshold) gaps.push('조직 이해력 개발 필요');
  if (capitalScores.competencies < threshold) gaps.push('핵심 역량 보강 필요');
  if (transferScores.skill_portability < threshold) gaps.push('스킬 범용성 확보 필요');
  if (transferScores.industry_adaptability < threshold) gaps.push('산업 적응력 개발 필요');
  if (transferScores.learning_agility < threshold) gaps.push('학습 민첩성 향상 필요');
  if (preparation < threshold) gaps.push('이직 준비(이력서/면접/재정) 보강 필요');

  return gaps;
}

// ── 통합 채점 ──

export interface HitCScoreResult {
  capitalScores: Record<string, number>;
  capitalOverall: number;
  motivationPush: number;
  motivationPull: number;
  motivationType: 'push_driven' | 'pull_driven' | 'balanced';
  transferabilityScores: Record<string, number>;
  transferabilityIndex: number;
  preparation: number;
  gapAwareness: number;
  transitionReadiness: number;
  gapAreas: string[];
}

export function scoreHitC(responses: ResponseRow[]): HitCScoreResult {
  const capital = scoreCapital(responses);
  const motivation = scoreMotivation(responses);
  const transfer = scoreTransferability(responses);
  const readiness = scoreReadiness(responses);
  const gapAreas = identifyGapAreas(capital.scores, transfer.scores, readiness.preparation);

  return {
    capitalScores: capital.scores,
    capitalOverall: capital.overall,
    motivationPush: motivation.push,
    motivationPull: motivation.pull,
    motivationType: motivation.motivationType,
    transferabilityScores: transfer.scores,
    transferabilityIndex: transfer.transferabilityIndex,
    preparation: readiness.preparation,
    gapAwareness: readiness.gapAwareness,
    transitionReadiness: readiness.transitionReadiness,
    gapAreas,
  };
}
