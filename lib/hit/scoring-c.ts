/**
 * HIT C 채점 알고리즘 — 경력전환 분석
 * 7점 리커트 척도 기반
 * 모듈1: careerCapital — domain_expertise, achievement, relational, transferable
 * 모듈2: motivation — push, pull
 * 모듈3: transferability — skill_transfer, market_fit, adaptation
 * 모듈4: readiness — doc_readiness, interview_readiness, timing, psych_readiness
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
  const capital = responses.filter(r => r.module === 'careerCapital');
  const subscaleMap = buildSubscaleMap(capital);

  const scores: Record<string, number> = {
    domain_expertise: scaleToHundred(subscaleMap['domain_expertise'] || []),
    achievement: scaleToHundred(subscaleMap['achievement'] || []),
    relational: scaleToHundred(subscaleMap['relational'] || []),
    transferable: scaleToHundred(subscaleMap['transferable'] || []),
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
    skill_transfer: scaleToHundred(subscaleMap['skill_transfer'] || []),
    market_fit: scaleToHundred(subscaleMap['market_fit'] || []),
    adaptation: scaleToHundred(subscaleMap['adaptation'] || []),
  };

  // 전환가능성 지수: 스킬전이 40% + 시장적합 30% + 적응력 30%
  const transferabilityIndex = Math.round(
    scores.skill_transfer * 0.4 +
    scores.market_fit * 0.3 +
    scores.adaptation * 0.3
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

  const docReadiness = scaleToHundred(subscaleMap['doc_readiness'] || []);
  const interviewReadiness = scaleToHundred(subscaleMap['interview_readiness'] || []);
  const timing = scaleToHundred(subscaleMap['timing'] || []);
  const psychReadiness = scaleToHundred(subscaleMap['psych_readiness'] || []);

  // 실질 준비: 서류·면접·타이밍 평균
  const preparation = Math.round((docReadiness + interviewReadiness + timing) / 3);
  // 심리 준비도를 갭 인식으로 활용
  const gapAwareness = psychReadiness;

  // 전환 준비도: 준비 60% + 갭인식 40%
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

  if (capitalScores.domain_expertise < threshold) gaps.push('전문성 심화 필요');
  if (capitalScores.achievement < threshold) gaps.push('성과 수량화 필요');
  if (capitalScores.relational < threshold) gaps.push('업계 네트워크 확장 필요');
  if (capitalScores.transferable < threshold) gaps.push('이전 가능 역량 개발 필요');
  if (transferScores.skill_transfer < threshold) gaps.push('스킬 이전 가능성 강화 필요');
  if (transferScores.market_fit < threshold) gaps.push('목표 시장 이해도 제고 필요');
  if (transferScores.adaptation < threshold) gaps.push('적응력 개발 필요');
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
