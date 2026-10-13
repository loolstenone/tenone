/**
 * HIT GAP 채점 알고리즘 — 경력 공백 복귀 분석
 * 7점 리커트 척도 기반 · 154문항 (152 + 미끼 2)
 *
 * 모듈1: latent_capability    — disruption_context, hidden_competency, gap_activities
 * 모듈2: career_viability     — job_viability, skill_currency, market_reentry
 * 모듈3: resilience           — self_narrative, self_esteem, retry_willingness
 * 모듈4: direction_bifurcation — career_restoration, career_pivot, fresh_start
 * 모듈5: reentry_readiness    — skill_update, network, self_presentation, field_language
 * 미끼: DECOY                 — f_val01, f_val02
 *
 * CVI (Career Validity Index) 통합
 * 심화(CH/AP Deep) 재사용은 2026-10-12 폐지 — 성품은 A, 효능감은 B에서 한 번만
 */

import { calculateCVI } from '@/lib/hit/cvi';

export type HollandType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
import type { CviGrade, FNextRoute } from '@/lib/hit/cvi';

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

// ── 미끼 탐지 ──────────────────────────────────────────────────────

/**
 * 미끼 문항 신뢰도 탐지
 * f_val01, f_val02: 7점(완전 동의)이면 사회적 바람직성 편향
 */
export function scoreDecoyGap(responses: ResponseRow[]): {
  fakingFlag: boolean;
  decoyDetail: { val01: number; val02: number };
} {
  const getDecoyValue = (qid: string): number => {
    const row = responses.find(r => r.question_id === qid);
    if (!row) return 0;
    const parts = row.option_value.split(':');
    return parseInt(parts.length >= 2 ? parts[1] : parts[0], 10) || 0;
  };

  const val01 = getDecoyValue('f_val01');
  const val02 = getDecoyValue('f_val02');

  // 둘 다 6~7점이면 신뢰도 의심
  const fakingFlag = val01 >= 6 && val02 >= 6;

  return { fakingFlag, decoyDetail: { val01, val02 } };
}

// ── 공백 맥락 채점 (break_context 모듈) ──────────────────────────

export function scoreBreakContext(responses: ResponseRow[]): {
  disruptionContext: number;
  hiddenCompetency: number;
  gapActivities: number;
  breakContextScore: number;
  breakReasonScore: number;
  overallContext: number;
} {
  const ctx = responses.filter(r => r.module === 'latent_capability');
  const subscaleMap = buildSubscaleMap(ctx);

  const disruptionContext = scaleToHundred(subscaleMap['disruption_context'] || []);
  const hiddenCompetency = scaleToHundred(subscaleMap['hidden_competency'] || []);
  const gapActivities = scaleToHundred(subscaleMap['gap_activities'] || []);

  // breakContextScore: 단절 맥락 명확성 (맥락 + 활동 평균)
  const breakContextScore = Math.round((disruptionContext + gapActivities) / 2);
  // breakReasonScore: 공백기 숨겨진 역량
  const breakReasonScore = hiddenCompetency;

  const overallContext = Math.round(breakContextScore * 0.5 + breakReasonScore * 0.5);

  return {
    disruptionContext,
    hiddenCompetency,
    gapActivities,
    breakContextScore,
    breakReasonScore,
    overallContext,
  };
}

// ── 경력 유효성 채점 (viability 모듈) ────────────────────────────

export function scoreViability(responses: ResponseRow[]): {
  scores: Record<string, number>;
  latentScore: number;
} {
  const viab = responses.filter(r => r.module === 'career_viability');
  const subscaleMap = buildSubscaleMap(viab);

  const scores: Record<string, number> = {
    job_viability:  scaleToHundred(subscaleMap['job_viability']  || []),
    skill_currency: scaleToHundred(subscaleMap['skill_currency'] || []),
    market_reentry: scaleToHundred(subscaleMap['market_reentry'] || []),
  };

  // 경력 유효성 종합: 직무유효성 40% + 스킬현재성 30% + 시장재진입 30%
  const latentScore = Math.round(
    scores.job_viability  * 0.4 +
    scores.skill_currency * 0.3 +
    scores.market_reentry * 0.3,
  );

  return { scores, latentScore };
}

/** @deprecated scoreViability 사용 권장 */
export const scoreLatentSkills = scoreViability;

// ── 심리적 회복력 채점 (resilience 모듈) ─────────────────────────

export function scoreResilience(responses: ResponseRow[]): {
  scores: Record<string, number>;
  resilienceScore: number;
} {
  const res = responses.filter(r => r.module === 'resilience');
  const subscaleMap = buildSubscaleMap(res);

  const scores: Record<string, number> = {
    self_narrative:     scaleToHundred(subscaleMap['self_narrative']     || []),
    self_esteem:        scaleToHundred(subscaleMap['self_esteem']        || []),
    retry_willingness:  scaleToHundred(subscaleMap['retry_willingness']  || []),
  };

  // 회복탄력성 종합: 자기서사 30% + 자존감 35% + 재도전의지 35%
  const resilienceScore = Math.round(
    scores.self_narrative    * 0.3 +
    scores.self_esteem       * 0.35 +
    scores.retry_willingness * 0.35,
  );

  return { scores, resilienceScore };
}

// ── 방향 채점 (direction 모듈) ───────────────────────────────────

const DIRECTION_LABELS: Record<string, string> = {
  career_restoration: '경력 복원',
  career_pivot:       '경력 전환',
  fresh_start:        '새 출발',
};

export function scoreDirection(responses: ResponseRow[]): {
  directionScores: Record<string, number>;
  directionTop: { code: string; label: string; score: number };
  reentryMotivation: number;
} {
  const dir = responses.filter(r => r.module === 'direction_bifurcation');
  const subscaleMap = buildSubscaleMap(dir);

  const career_restoration = scaleToHundred(subscaleMap['career_restoration'] || []);
  const career_pivot       = scaleToHundred(subscaleMap['career_pivot']       || []);
  const fresh_start        = scaleToHundred(subscaleMap['fresh_start']        || []);

  const directionScores = { career_restoration, career_pivot, fresh_start };

  // Top 1 방향
  const topCode = Object.entries(directionScores).reduce((a, b) => (a[1] >= b[1] ? a : b))[0] as keyof typeof directionScores;
  const directionTop = {
    code:  topCode,
    label: DIRECTION_LABELS[topCode] ?? topCode,
    score: directionScores[topCode],
  };

  // 재진입 동기: 3방향 중 최대값
  const reentryMotivation = Math.max(career_restoration, career_pivot, fresh_start);

  return { directionScores, directionTop, reentryMotivation };
}

// ── 재진입 준비도 채점 (readiness 모듈) ──────────────────────────

export function scoreReadiness(responses: ResponseRow[]): {
  readinessScores: Record<string, number>;
  practicalReadiness: number;
  reentryReadiness: number;
} {
  const ready = responses.filter(r => r.module === 'reentry_readiness');
  const subscaleMap = buildSubscaleMap(ready);

  const readinessScores: Record<string, number> = {
    skill_update:      scaleToHundred(subscaleMap['skill_update']      || []),
    network:           scaleToHundred(subscaleMap['network']           || []),
    self_presentation: scaleToHundred(subscaleMap['self_presentation'] || []),
    field_language:    scaleToHundred(subscaleMap['field_language']    || []),
  };

  // 실질 준비도: 4항목 평균
  const practicalReadiness = Math.round(
    (readinessScores.skill_update +
     readinessScores.network +
     readinessScores.self_presentation +
     readinessScores.field_language) / 4,
  );

  // 재진입 준비도 (direction 없이 순수 준비 점수)
  const reentryReadiness = practicalReadiness;

  return { readinessScores, practicalReadiness, reentryReadiness };
}

// ── 라우팅 근거 ──────────────────────────────────────────────────

export function buildRoutingRationale(
  cviGrade: CviGrade,
  nextRoute: FNextRoute,
  latentScore: number,
  resilienceScore: number,
  reentryReadiness: number,
  directionTop: { code: string; label: string },
): string {
  const parts: string[] = [];

  // 문장으로 읽히게 (2026-10-13) — 경로 이름은 결과 화면 '추천 복귀 경로'와 같게
  if (cviGrade === 'HIGH') {
    parts.push('경력 유효성이 높아, 원래 하던 일로 비교적 빠르게 돌아갈 수 있습니다.');
  } else if (cviGrade === 'MID') {
    parts.push('경력 유효성이 보통이라, 예전 일을 그대로 잇기보다 경험을 살려 방향을 조정하는 것이 현실적입니다.');
  } else {
    parts.push('경력 유효성이 낮은 편이라, 지금의 역량과 방향부터 다시 점검하는 것이 좋습니다.');
  }

  // 기준 75/50 — 화면 점수 구간과 같게 (2026-10-13, 기존 70/40). 준비도 0 = 체크 전이라 언급하지 않는다
  if (latentScore >= 75) parts.push('직무·스킬·시장 조건이 전반적으로 갖춰져 있습니다.');
  else if (latentScore < 50) parts.push('직무 유효성과 스킬 현재성을 먼저 보강하면 좋습니다.');

  if (resilienceScore >= 75) parts.push('마음의 회복력도 높아 복귀 과정을 잘 견딜 수 있습니다.');
  else if (resilienceScore < 50) parts.push('자존감과 재도전 의지를 먼저 챙기면 좋습니다.');

  if (reentryReadiness >= 75) parts.push('실제 복귀 준비도 잘 되어 있습니다.');
  else if (reentryReadiness > 0 && reentryReadiness < 50) parts.push('구체적인 복귀 준비를 조금 더 해 두면 좋습니다.');

  parts.push(`마음이 가장 가는 쪽은 '${directionTop.label}'입니다.`);

  const routeLabel = nextRoute === 'recovery'
    ? '그래서 기존 경력으로 복귀하는 길을 추천합니다.'
    : nextRoute === 'C'
      ? '그래서 다음 검사로 HIT - Departure(이직)를 추천합니다.'
      : '그래서 HIT - Bounce(역량과 방향)부터 다시 점검하기를 추천합니다.';
  parts.push(routeLabel);

  return parts.join(' ');
}

// ── 통합 결과 타입 ─────────────────────────────────────────────

export interface HitGapScoreResult {
  // 공백 맥락
  disruptionContext:  number;
  hiddenCompetency:   number;
  gapActivities:      number;
  breakContextScore:  number;
  breakReasonScore:   number;
  overallContext:     number;
  // 경력 유효성
  latentScores:  Record<string, number>;
  latentScore:   number;
  // 심리적 회복력
  resilienceScores: Record<string, number>;
  resilienceScore:  number;
  // 방향
  directionScores: Record<string, number>;
  directionTop:    { code: string; label: string; score: number };
  reentryMotivation: number;
  // 준비도
  readinessScores:  Record<string, number>;
  practicalReadiness: number;
  reentryReadiness:   number;
  // CVI
  cviRaw:    number;
  cviGrade:  CviGrade;
  nextRoute: FNextRoute;
  // 라우팅
  routingRationale: string;
  // 미끼
  fakingFlag:   boolean;
  decoyDetail:  { val01: number; val02: number };
}

// ── 통합 채점 ──────────────────────────────────────────────────

/** 실질 준비도(스킬·네트워크·자기 표현·현장 감각)는 Journey 체크리스트 완료율 (stage gap) — 경로 근거도 같은 값으로 */
export function scoreHitGap(responses: ResponseRow[], opts?: { checklist?: { percent: number; byGroup: Record<string, number> } }): HitGapScoreResult {
  const context    = scoreBreakContext(responses);
  const viability  = scoreViability(responses);
  const resilience = scoreResilience(responses);
  const direction  = scoreDirection(responses);
  const cl = opts?.checklist;
  const readiness = cl
    ? {
        readinessScores: { skill_update: cl.byGroup['스킬'] ?? 0, network: cl.byGroup['네트워크'] ?? 0, self_presentation: cl.byGroup['자기 표현'] ?? 0, field_language: cl.byGroup['현장 감각'] ?? 0 },
        practicalReadiness: cl.percent,
        reentryReadiness: cl.percent,
      }
    : scoreReadiness(responses);
  const decoy      = scoreDecoyGap(responses);

  // CVI 계산 — 설계서 확정 공식: (직무유효성×0.35) + (기술유효성×0.35) + (시장재진입×0.30)
  const cviResult = calculateCVI({
    jobViability:  viability.scores.job_viability,
    skillCurrency: viability.scores.skill_currency,
    marketReentry: viability.scores.market_reentry,
  });

  // 재진입 준비도 통합: 실질준비 55% + 복귀동기 45%
  // 체크리스트를 아직 체크하지 않았으면(완료율 0) 0 = '체크 전' — 복귀 동기만으로 낮은 준비도가 생겨
  // '준비 부족' 해설·'복귀 준비 활동 필요' 문구가 붙던 결함 (2026-10-13, D~F와 같은 규칙)
  const unchecked = !!cl && cl.percent === 0;
  const reentryReadinessFinal = unchecked ? 0 : Math.round(
    readiness.practicalReadiness * 0.55 + direction.reentryMotivation * 0.45,
  );

  const routingRationale = buildRoutingRationale(
    cviResult.cviGrade,
    cviResult.nextRoute,
    viability.latentScore,
    resilience.resilienceScore,
    reentryReadinessFinal,
    direction.directionTop,
  );

  return {
    // 공백 맥락
    disruptionContext: context.disruptionContext,
    hiddenCompetency:  context.hiddenCompetency,
    gapActivities:     context.gapActivities,
    breakContextScore: context.breakContextScore,
    breakReasonScore:  context.breakReasonScore,
    overallContext:    context.overallContext,
    // 경력 유효성
    latentScores: viability.scores,
    latentScore:  viability.latentScore,
    // 심리적 회복력
    resilienceScores: resilience.scores,
    resilienceScore:  resilience.resilienceScore,
    // 방향
    directionScores:   direction.directionScores,
    directionTop:      direction.directionTop,
    reentryMotivation: direction.reentryMotivation,
    // 준비도
    readinessScores:    readiness.readinessScores,
    practicalReadiness: readiness.practicalReadiness,
    reentryReadiness:   reentryReadinessFinal,
    // CVI
    cviRaw:    cviResult.cviRaw,
    cviGrade:  cviResult.cviGrade,
    nextRoute: cviResult.nextRoute,
    // 라우팅
    routingRationale,
    // 미끼
    fakingFlag:  decoy.fakingFlag,
    decoyDetail: decoy.decoyDetail,
  };
}
