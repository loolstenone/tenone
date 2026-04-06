/**
 * HIT F 채점 알고리즘 -- 경력 공백 복귀 분석
 * 7점 리커트 척도 기반: break_context, latent_skills, resilience, reentry
 * CRITICAL: CVI (Career Validity Index) 통합
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
    if (reverse) value = 8 - value;  // 7점 역채점: 1->7, 7->1

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

// ── 공백 맥락 채점 ──

export function scoreBreakContext(responses: ResponseRow[]): {
  breakContextScore: number;
  breakReasonScore: number;
  overallContext: number;
} {
  const ctx = responses.filter(r => r.module === 'break_context');
  const subscaleMap = buildSubscaleMap(ctx);

  const breakContextScore = scaleToHundred(subscaleMap['break_context'] || []);
  const breakReasonScore = scaleToHundred(subscaleMap['break_reason'] || []);

  const overallContext = Math.round(breakContextScore * 0.5 + breakReasonScore * 0.5);

  return { breakContextScore, breakReasonScore, overallContext };
}

// ── 잠재 역량 채점 ──

export function scoreLatentSkills(responses: ResponseRow[]): {
  scores: Record<string, number>;
  latentScore: number;
} {
  const latent = responses.filter(r => r.module === 'latent_skills');
  const subscaleMap = buildSubscaleMap(latent);

  const scores: Record<string, number> = {
    technical_retention: scaleToHundred(subscaleMap['technical_retention'] || []),
    soft_skill_retention: scaleToHundred(subscaleMap['soft_skill_retention'] || []),
    continuous_learning: scaleToHundred(subscaleMap['continuous_learning'] || []),
  };

  // 잠재 역량 종합: 기술 40% + 소프트 스킬 30% + 학습 30%
  const latentScore = Math.round(
    scores.technical_retention * 0.4 +
    scores.soft_skill_retention * 0.3 +
    scores.continuous_learning * 0.3
  );

  return { scores, latentScore };
}

// ── 회복탄력성 채점 ──

export function scoreResilience(responses: ResponseRow[]): {
  scores: Record<string, number>;
  resilienceScore: number;
} {
  const resilience = responses.filter(r => r.module === 'resilience');
  const subscaleMap = buildSubscaleMap(resilience);

  const scores: Record<string, number> = {
    emotional_resilience: scaleToHundred(subscaleMap['emotional_resilience'] || []),
    confidence: scaleToHundred(subscaleMap['confidence'] || []),
    adaptability: scaleToHundred(subscaleMap['adaptability'] || []),
  };

  // 회복탄력성 종합: 정서 30% + 자신감 35% + 적응력 35%
  const resilienceScore = Math.round(
    scores.emotional_resilience * 0.3 +
    scores.confidence * 0.35 +
    scores.adaptability * 0.35
  );

  return { scores, resilienceScore };
}

// ── 재진입 준비도 채점 ──

export function scoreReentry(responses: ResponseRow[]): {
  practicalReadiness: number;
  reentryMotivation: number;
  reentryReadiness: number;
} {
  const reentry = responses.filter(r => r.module === 'reentry');
  const subscaleMap = buildSubscaleMap(reentry);

  const practicalReadiness = scaleToHundred(subscaleMap['practical_readiness'] || []);
  const reentryMotivation = scaleToHundred(subscaleMap['reentry_motivation'] || []);

  // 재진입 준비도: 실질 준비 55% + 복귀 동기 45%
  const reentryReadiness = Math.round(practicalReadiness * 0.55 + reentryMotivation * 0.45);

  return { practicalReadiness, reentryMotivation, reentryReadiness };
}

// ── 라우팅 근거 ──

export function buildRoutingRationale(
  cviGrade: CviGrade,
  nextRoute: FNextRoute,
  latentScore: number,
  resilienceScore: number,
  reentryReadiness: number,
): string {
  const parts: string[] = [];

  if (cviGrade === 'HIGH') {
    parts.push('경력 유효성이 높아 빠른 복귀가 가능합니다.');
  } else if (cviGrade === 'MID') {
    parts.push('경력 유효성이 보통 수준으로, 전략적 전환이 권장됩니다.');
  } else {
    parts.push('경력 유효성이 낮아 기초 역량 점검이 필요합니다.');
  }

  if (latentScore >= 70) parts.push('잠재 역량이 잘 유지되어 있습니다.');
  else if (latentScore < 40) parts.push('잠재 역량 보강이 시급합니다.');

  if (resilienceScore >= 70) parts.push('회복탄력성이 높아 복귀 과정을 잘 견딜 수 있습니다.');
  else if (resilienceScore < 40) parts.push('정서적 지원과 자신감 회복이 우선입니다.');

  if (reentryReadiness >= 70) parts.push('실질적 복귀 준비가 잘 되어 있습니다.');
  else if (reentryReadiness < 40) parts.push('구체적인 복귀 준비 활동이 필요합니다.');

  const routeLabel = nextRoute === 'recovery' ? 'Recovery(복귀)' : nextRoute === 'C' ? 'HIT C(전환)' : 'HIT B(기본)';
  parts.push(`추천 경로: ${routeLabel}`);

  return parts.join(' ');
}

// ── 통합 채점 ──

export interface HitFScoreResult {
  // 공백 맥락
  breakContextScore: number;
  breakReasonScore: number;
  overallContext: number;
  // 잠재 역량
  latentScores: Record<string, number>;
  latentScore: number;
  // 회복탄력성
  resilienceScores: Record<string, number>;
  resilienceScore: number;
  // 재진입 준비도
  practicalReadiness: number;
  reentryMotivation: number;
  reentryReadiness: number;
  // CVI
  cviRaw: number;
  cviGrade: CviGrade;
  nextRoute: FNextRoute;
  jobChangeVelocity: number;
  // 라우팅
  routingRationale: string;
}

export function scoreHitF(
  responses: ResponseRow[],
  breakMonths: number,
  jobCategory: string,
): HitFScoreResult {
  const context = scoreBreakContext(responses);
  const latent = scoreLatentSkills(responses);
  const resilience = scoreResilience(responses);
  const reentry = scoreReentry(responses);

  // CVI 계산
  const jobChangeVelocity = getJobVelocity(jobCategory);
  const cviResult = calculateCVI({
    breakMonths,
    jobChangeVelocity,
    latentScore: latent.latentScore,
  });

  const routingRationale = buildRoutingRationale(
    cviResult.cviGrade,
    cviResult.nextRoute,
    latent.latentScore,
    resilience.resilienceScore,
    reentry.reentryReadiness,
  );

  return {
    breakContextScore: context.breakContextScore,
    breakReasonScore: context.breakReasonScore,
    overallContext: context.overallContext,
    latentScores: latent.scores,
    latentScore: latent.latentScore,
    resilienceScores: resilience.scores,
    resilienceScore: resilience.resilienceScore,
    practicalReadiness: reentry.practicalReadiness,
    reentryMotivation: reentry.reentryMotivation,
    reentryReadiness: reentry.reentryReadiness,
    cviRaw: cviResult.cviRaw,
    cviGrade: cviResult.cviGrade,
    nextRoute: cviResult.nextRoute,
    jobChangeVelocity,
    routingRationale,
  };
}
