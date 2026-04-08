/**
 * HIT F 채점 알고리즘 — 경력 공백 복귀 분석
 * 7점 리커트 척도 기반 · 154문항 (152 + 미끼 2)
 *
 * 모듈1: break_context — disruption_context, hidden_competency, gap_activities
 * 모듈2: viability     — job_viability, skill_currency, market_reentry
 * 모듈3: resilience    — self_narrative, self_esteem, retry_willingness
 * 모듈4: direction     — career_restoration, career_pivot, fresh_start
 * 모듈5: readiness     — skill_update, network_status, self_presentation, field_language
 * 미끼: DECOY          — f_val01, f_val02
 *
 * CVI (Career Validity Index) 통합
 */

import { calculateCVI, getJobVelocity } from '@/lib/hit/cvi';
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
export function scoreDecoyF(responses: ResponseRow[]): {
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
  const ctx = responses.filter(r => r.module === 'break_context');
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
  const viab = responses.filter(r => r.module === 'viability' || r.module === 'latent_skills');
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
  const dir = responses.filter(r => r.module === 'direction' || r.module === 'reentry');
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
  const ready = responses.filter(
    r => r.module === 'readiness' ||
         // 구버전 호환: 방향+준비도가 'reentry'로 묶여 들어올 경우
         (r.module === 'reentry' && (
           r.question_id.startsWith('f_su') ||
           r.question_id.startsWith('f_ns') ||
           r.question_id.startsWith('f_sp') ||
           r.question_id.startsWith('f_fl') ||
           r.question_id.startsWith('hit_f_12') ||
           r.question_id.startsWith('hit_f_13') ||
           r.question_id.startsWith('hit_f_14') ||
           r.question_id.startsWith('hit_f_15')
         )),
  );
  const subscaleMap = buildSubscaleMap(ready);

  const readinessScores: Record<string, number> = {
    skill_update:      scaleToHundred(subscaleMap['skill_update']      || []),
    network_status:    scaleToHundred(subscaleMap['network_status']    || []),
    self_presentation: scaleToHundred(subscaleMap['self_presentation'] || []),
    field_language:    scaleToHundred(subscaleMap['field_language']    || []),
  };

  // 실질 준비도: 4항목 평균
  const practicalReadiness = Math.round(
    (readinessScores.skill_update +
     readinessScores.network_status +
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

  if (cviGrade === 'HIGH') {
    parts.push('경력 유효성이 높아 빠른 복귀가 가능합니다.');
  } else if (cviGrade === 'MID') {
    parts.push('경력 유효성이 보통 수준으로, 전략적 전환이 권장됩니다.');
  } else {
    parts.push('경력 유효성이 낮아 기초 역량 점검이 필요합니다.');
  }

  if (latentScore >= 70) parts.push('경력 유효성 진단이 양호합니다.');
  else if (latentScore < 40) parts.push('직무 유효성 및 스킬 현재성 보강이 시급합니다.');

  if (resilienceScore >= 70) parts.push('심리적 회복력이 높아 복귀 과정을 잘 견딜 수 있습니다.');
  else if (resilienceScore < 40) parts.push('자존감 회복과 재도전 의지 강화가 우선입니다.');

  if (reentryReadiness >= 70) parts.push('실질적 복귀 준비가 잘 되어 있습니다.');
  else if (reentryReadiness < 40) parts.push('구체적인 복귀 준비 활동이 필요합니다.');

  parts.push(`주도 방향: ${directionTop.label}`);

  const routeLabel = nextRoute === 'recovery' ? 'Recovery(복귀)' : nextRoute === 'C' ? 'HIT C(전환)' : 'HIT B(기본)';
  parts.push(`추천 경로: ${routeLabel}`);

  return parts.join(' ');
}

// ── 통합 결과 타입 ─────────────────────────────────────────────

export interface HitFScoreResult {
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
  cviRaw:            number;
  cviGrade:          CviGrade;
  nextRoute:         FNextRoute;
  jobChangeVelocity: number;
  // 라우팅
  routingRationale: string;
  // 미끼
  fakingFlag:   boolean;
  decoyDetail:  { val01: number; val02: number };
}

// ── 통합 채점 ──────────────────────────────────────────────────

export function scoreHitF(
  responses: ResponseRow[],
  breakMonths: number,
  jobCategory: string,
): HitFScoreResult {
  const context    = scoreBreakContext(responses);
  const viability  = scoreViability(responses);
  const resilience = scoreResilience(responses);
  const direction  = scoreDirection(responses);
  const readiness  = scoreReadiness(responses);
  const decoy      = scoreDecoyF(responses);

  // CVI 계산
  const jobChangeVelocity = getJobVelocity(jobCategory);
  const cviResult = calculateCVI({
    breakMonths,
    jobChangeVelocity,
    latentScore: viability.latentScore,
  });

  // 재진입 준비도 통합: 실질준비 55% + 복귀동기 45%
  const reentryReadinessFinal = Math.round(
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
    cviRaw:            cviResult.cviRaw,
    cviGrade:          cviResult.cviGrade,
    nextRoute:         cviResult.nextRoute,
    jobChangeVelocity,
    // 라우팅
    routingRationale,
    // 미끼
    fakingFlag:  decoy.fakingFlag,
    decoyDetail: decoy.decoyDetail,
  };
}
