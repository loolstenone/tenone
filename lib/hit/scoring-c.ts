/**
 * HIT C 채점 알고리즘 — 경력전환 분석 (HIT_C_Final.md 기반)
 * 7점 리커트 척도 기반 · 122문항 (120 + 미끼 2)
 *
 * 모듈1 capital — domain_expertise, achievement, relational, transferable
 * 모듈2 motivation — push, pull
 * 모듈3 transferability — skill_transfer, market_fit, adaptation
 * 모듈4 readiness — doc, interview, timing, psychological
 * 추가: CTYPE 산출, decoy(faking) 검출
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
    if (reverse) value = 8 - value;  // 7점 역채점

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

/** 단일 응답 raw 값 추출 (역채점 적용 후 1~7) */
function rawValue(r: ResponseRow | undefined): number | null {
  if (!r) return null;
  const parts = r.option_value.split(':');
  let value = NaN;
  let reverse = false;
  if (parts.length >= 2) {
    value = parseInt(parts[1], 10);
    reverse = parts[2] === 'r';
  } else {
    value = parseInt(parts[0], 10);
  }
  if (isNaN(value)) return null;
  if (reverse) value = 8 - value;
  return value;
}

function avgFromIds(responses: ResponseRow[], ids: string[]): number {
  const vals: number[] = [];
  for (const id of ids) {
    const v = rawValue(responses.find(r => r.question_id === id));
    if (v !== null) vals.push(v);
  }
  return scaleToHundred(vals);
}

// ── 경력 자본 ──

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
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length,
  );

  return { scores, overall };
}

// ── 이직 동기 ──

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

/** Push/Pull 내부 sub 영역 (CTYPE 산출용) */
export function scorePushPullSubs(responses: ResponseRow[]): {
  pushGrowth: number;
  pushCulture: number;
  pullGrowth: number;
  pullReward: number;
} {
  return {
    pushGrowth: avgFromIds(responses, ['c_pu01', 'c_pu02', 'c_pu09']),
    pushCulture: avgFromIds(responses, ['c_pu04', 'c_pu05', 'c_pu10']),
    pullGrowth: avgFromIds(responses, ['c_pl01', 'c_pl06', 'c_pl08']),
    pullReward: avgFromIds(responses, ['c_pl03']),
  };
}

// ── 전환 가능성 ──

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

  const transferabilityIndex = Math.round(
    scores.skill_transfer * 0.4 +
    scores.market_fit * 0.3 +
    scores.adaptation * 0.3,
  );

  return { scores, transferabilityIndex };
}

// ── 준비도 ──

export function scoreReadiness(responses: ResponseRow[]): {
  doc: number;
  interview: number;
  timing: number;
  psychological: number;
  total: number;
  preparation: number;
  gapAwareness: number;
  transitionReadiness: number;
} {
  const readiness = responses.filter(r => r.module === 'readiness');
  const subscaleMap = buildSubscaleMap(readiness);

  // 신규 키 우선, 구버전 키 fallback
  const doc = scaleToHundred(subscaleMap['doc'] || subscaleMap['doc_readiness'] || []);
  const interview = scaleToHundred(subscaleMap['interview'] || subscaleMap['interview_readiness'] || []);
  const timing = scaleToHundred(subscaleMap['timing'] || []);
  const psychological = scaleToHundred(subscaleMap['psychological'] || subscaleMap['psych_readiness'] || []);

  const total = Math.round((doc + interview + timing + psychological) / 4);

  // 기존 호환
  const preparation = Math.round((doc + interview + timing) / 3);
  const gapAwareness = psychological;
  const transitionReadiness = Math.round(preparation * 0.6 + gapAwareness * 0.4);

  return { doc, interview, timing, psychological, total, preparation, gapAwareness, transitionReadiness };
}

// ── 갭 영역 ──

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

// ── CTYPE (전환유형) ──

export type CType = 'CTYPE-STRATEGIC' | 'CTYPE-GROWTH' | 'CTYPE-ESCAPE' | 'CTYPE-EXPLORER';

export function scoreCType(params: {
  capitalScores: { domain_expertise: number; achievement: number; relational: number; transferable: number };
  motivationPush: number;
  motivationPull: number;
  pullGrowth: number;
  pushGrowth: number;
  transferScores: { skill_transfer: number; market_fit: number; adaptation: number };
}): CType {
  const cc_domain = params.capitalScores.domain_expertise;
  const HIGH = 67;
  const MID_HIGH = 50;

  // STRATEGIC: domain HIGH + pushGrowth HIGH + skill_transfer HIGH
  if (cc_domain >= HIGH && params.pushGrowth >= HIGH && params.transferScores.skill_transfer >= HIGH) {
    return 'CTYPE-STRATEGIC';
  }

  // GROWTH: domain MID + pullGrowth HIGH + adaptation HIGH
  if (cc_domain >= MID_HIGH && cc_domain < HIGH && params.pullGrowth >= HIGH && params.transferScores.adaptation >= HIGH) {
    return 'CTYPE-GROWTH';
  }

  // ESCAPE: push >= 70 AND pull < 50
  if (params.motivationPush >= 70 && params.motivationPull < 50) {
    return 'CTYPE-ESCAPE';
  }

  // EXPLORER: 둘 다 낮으면서 적응력 높음
  if (params.motivationPush < 50 && params.motivationPull < 50 && params.transferScores.adaptation >= HIGH) {
    return 'CTYPE-EXPLORER';
  }

  // 기본: 가장 강한 신호
  if (params.motivationPush > params.motivationPull + 15) return 'CTYPE-ESCAPE';
  if (params.pullGrowth >= HIGH) return 'CTYPE-GROWTH';
  if (cc_domain >= HIGH) return 'CTYPE-STRATEGIC';
  return 'CTYPE-EXPLORER';
}

// ── 미끼 (faking) 판정 ──

export function scoreCDecoy(responses: ResponseRow[]): boolean {
  const v1 = rawValue(responses.find(r => r.question_id === 'c_val01'));
  const v2 = rawValue(responses.find(r => r.question_id === 'c_val02'));
  if (v1 === null || v2 === null) return false;
  return v1 >= 6 && v2 >= 6;
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
  // 신규
  readinessScores: { doc: number; interview: number; timing: number; psychological: number; total: number };
  ctype: CType;
  fakingFlag: boolean;
}

export function scoreHitC(responses: ResponseRow[]): HitCScoreResult {
  const capital = scoreCapital(responses);
  const motivation = scoreMotivation(responses);
  const transfer = scoreTransferability(responses);
  const readiness = scoreReadiness(responses);
  const gapAreas = identifyGapAreas(capital.scores, transfer.scores, readiness.preparation);

  const pushPullSubs = scorePushPullSubs(responses);
  const ctype = scoreCType({
    capitalScores: capital.scores as { domain_expertise: number; achievement: number; relational: number; transferable: number },
    motivationPush: motivation.push,
    motivationPull: motivation.pull,
    pushGrowth: pushPullSubs.pushGrowth,
    pullGrowth: pushPullSubs.pullGrowth,
    transferScores: transfer.scores as { skill_transfer: number; market_fit: number; adaptation: number },
  });
  const fakingFlag = scoreCDecoy(responses);

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
    readinessScores: {
      doc: readiness.doc,
      interview: readiness.interview,
      timing: readiness.timing,
      psychological: readiness.psychological,
      total: readiness.total,
    },
    ctype,
    fakingFlag,
  };
}
