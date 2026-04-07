/**
 * HIT F 채점 알고리즘 -- 경력 공백 복귀 분석
 * 7점 리커트 척도 기반
 * 모듈1(break_context=latentCapabilityQuestions): disruption_context, hidden_competency, gap_activities
 * 모듈2(latent_skills=viabilityQuestions): job_viability, skill_currency, market_reentry
 * 모듈3(resilience=resilienceQuestions): self_narrative, self_esteem, retry_willingness
 * 모듈4(reentry=directionQuestions+reentryReadinessQuestions): career_restoration, career_pivot, fresh_start, skill_update, network_status, self_presentation, field_language
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

// ── 공백 맥락 채점 (break_context 모듈 = latentCapabilityQuestions) ──

export function scoreBreakContext(responses: ResponseRow[]): {
  breakContextScore: number;
  breakReasonScore: number;
  overallContext: number;
} {
  const ctx = responses.filter(r => r.module === 'break_context');
  const subscaleMap = buildSubscaleMap(ctx);

  const disruptionContext = scaleToHundred(subscaleMap['disruption_context'] || []);
  const hiddenCompetency = scaleToHundred(subscaleMap['hidden_competency'] || []);
  const gapActivities = scaleToHundred(subscaleMap['gap_activities'] || []);

  // breakContextScore: 단절 맥락 명확성
  const breakContextScore = Math.round((disruptionContext + gapActivities) / 2);
  // breakReasonScore: 공백기 숨겨진 역량
  const breakReasonScore = hiddenCompetency;

  const overallContext = Math.round(breakContextScore * 0.5 + breakReasonScore * 0.5);

  return { breakContextScore, breakReasonScore, overallContext };
}

// ── 경력 유효성 채점 (latent_skills 모듈 = viabilityQuestions) ──

export function scoreLatentSkills(responses: ResponseRow[]): {
  scores: Record<string, number>;
  latentScore: number;
} {
  const latent = responses.filter(r => r.module === 'latent_skills');
  const subscaleMap = buildSubscaleMap(latent);

  const scores: Record<string, number> = {
    job_viability: scaleToHundred(subscaleMap['job_viability'] || []),
    skill_currency: scaleToHundred(subscaleMap['skill_currency'] || []),
    market_reentry: scaleToHundred(subscaleMap['market_reentry'] || []),
  };

  // 경력 유효성 종합: 직무유효성 40% + 스킬현재성 30% + 시장재진입 30%
  const latentScore = Math.round(
    scores.job_viability * 0.4 +
    scores.skill_currency * 0.3 +
    scores.market_reentry * 0.3
  );

  return { scores, latentScore };
}

// ── 심리적 회복력 채점 (resilience 모듈) ──

export function scoreResilience(responses: ResponseRow[]): {
  scores: Record<string, number>;
  resilienceScore: number;
} {
  const resilience = responses.filter(r => r.module === 'resilience');
  const subscaleMap = buildSubscaleMap(resilience);

  const scores: Record<string, number> = {
    self_narrative: scaleToHundred(subscaleMap['self_narrative'] || []),
    self_esteem: scaleToHundred(subscaleMap['self_esteem'] || []),
    retry_willingness: scaleToHundred(subscaleMap['retry_willingness'] || []),
  };

  // 회복탄력성 종합: 자기서사 30% + 자존감 35% + 재도전의지 35%
  const resilienceScore = Math.round(
    scores.self_narrative * 0.3 +
    scores.self_esteem * 0.35 +
    scores.retry_willingness * 0.35
  );

  return { scores, resilienceScore };
}

// ── 재진입 준비도 채점 (reentry 모듈 = directionQuestions + reentryReadinessQuestions) ──

export function scoreReentry(responses: ResponseRow[]): {
  practicalReadiness: number;
  reentryMotivation: number;
  reentryReadiness: number;
  directionScores: Record<string, number>;
} {
  const reentry = responses.filter(r => r.module === 'reentry');
  const subscaleMap = buildSubscaleMap(reentry);

  // 재진입 방향 점수
  const career_restoration = scaleToHundred(subscaleMap['career_restoration'] || []);
  const career_pivot = scaleToHundred(subscaleMap['career_pivot'] || []);
  const fresh_start = scaleToHundred(subscaleMap['fresh_start'] || []);

  // 실질 준비도: 스킬업데이트 + 네트워크 + 자기표현 + 현장언어 평균
  const skill_update = scaleToHundred(subscaleMap['skill_update'] || []);
  const network_status = scaleToHundred(subscaleMap['network_status'] || []);
  const self_presentation = scaleToHundred(subscaleMap['self_presentation'] || []);
  const field_language = scaleToHundred(subscaleMap['field_language'] || []);

  const practicalReadiness = Math.round(
    (skill_update + network_status + self_presentation + field_language) / 4
  );

  // 재진입 동기: 방향 점수 중 최대값을 대표 동기로 활용
  const reentryMotivation = Math.max(career_restoration, career_pivot, fresh_start);

  const directionScores = { career_restoration, career_pivot, fresh_start };

  // 재진입 준비도: 실질 준비 55% + 복귀 동기 45%
  const reentryReadiness = Math.round(practicalReadiness * 0.55 + reentryMotivation * 0.45);

  return { practicalReadiness, reentryMotivation, reentryReadiness, directionScores };
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

  if (latentScore >= 70) parts.push('경력 유효성 진단이 양호합니다.');
  else if (latentScore < 40) parts.push('직무 유효성 및 스킬 현재성 보강이 시급합니다.');

  if (resilienceScore >= 70) parts.push('심리적 회복력이 높아 복귀 과정을 잘 견딜 수 있습니다.');
  else if (resilienceScore < 40) parts.push('자존감 회복과 재도전 의지 강화가 우선입니다.');

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
  // 경력 유효성 (latent skills)
  latentScores: Record<string, number>;
  latentScore: number;
  // 심리적 회복력
  resilienceScores: Record<string, number>;
  resilienceScore: number;
  // 재진입 준비도
  practicalReadiness: number;
  reentryMotivation: number;
  reentryReadiness: number;
  directionScores: Record<string, number>;
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
    directionScores: reentry.directionScores,
    cviRaw: cviResult.cviRaw,
    cviGrade: cviResult.cviGrade,
    nextRoute: cviResult.nextRoute,
    jobChangeVelocity,
    routingRationale,
  };
}
