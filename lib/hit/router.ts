// lib/hit/router.ts — 생애주기 분기 (2026-10-12 재편: 공통 A·B 뒤 C~F 한 개 + 상황 GAP)
// Ten:One™ Universe · HeRo — 체계 SSOT: lib/hit/stages.ts

import type { HitStageKey } from './stages';

export type RoutedLayer = Extract<HitStageKey, 'c' | 'd' | 'e' | 'f'>;

export interface LifeStageInput {
  careerYears: number;
  isManager: boolean;
  isRetired: boolean;
  isCareerBreak: boolean;
  careerBreakMonths?: number;
  isCareerChange: boolean;
}

export interface RoutingResult {
  layer: RoutedLayer;
  /** 경력 공백·복귀 상황 모듈을 함께 권할지 */
  addGap: boolean;
  reason: string;
}

export function resolveHitLayer(input: LifeStageInput): RoutingResult {
  const addGap = input.isCareerBreak;
  const gapNote = addGap ? ` 경력 공백 ${input.careerBreakMonths ?? '?'}개월 → 상황 모듈(GAP)도 함께.` : '';
  if (input.isRetired) return { layer: 'f', addGap, reason: `은퇴·퇴직 후 인생 2막.${gapNote}` };
  if ((input.careerYears >= 10 && input.isManager) || input.careerYears >= 15) return { layer: 'e', addGap, reason: `경력 ${input.careerYears}년 리더십 전환.${gapNote}` };
  if (input.careerYears >= 3) return { layer: 'd', addGap, reason: `경력 ${input.careerYears}년${input.isCareerChange ? ' 이직 고려' : ''} → 전환.${gapNote}` };
  return { layer: 'c', addGap, reason: `경력 ${input.careerYears}년 → 진입.${gapNote}` };
}
