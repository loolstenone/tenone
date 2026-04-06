// lib/hit/router.ts — 생애단계 분기 라우팅 엔진
// Ten:One™ Universe · HeRo

export type RoutedLayer = 'B' | 'C' | 'D' | 'E' | 'F'

export interface LifeStageInput {
  careerYears: number
  isManager: boolean
  isRetired: boolean
  isCareerBreak: boolean
  careerBreakMonths?: number
  isCareerChange: boolean
  breakReason?: string
}

export interface RoutingResult {
  layer: RoutedLayer
  reason: string
}

export function resolveHitLayer(input: LifeStageInput): RoutingResult {
  if (input.isCareerBreak) {
    return {
      layer: 'F',
      reason: `경력단절 ${input.careerBreakMonths ?? '?'}개월. HIT F로 경력 유효성 진단 후 경로 결정.`,
    }
  }
  if (input.isRetired) {
    return {
      layer: 'E',
      reason: '은퇴·퇴직 후 인생 2막. HIT E로 잔여 열정·방향 탐색.',
    }
  }
  if (input.careerYears >= 10 && input.isManager) {
    return {
      layer: 'D',
      reason: `경력 ${input.careerYears}년 관리자. HIT D로 전문성 자산·리더십 재정의.`,
    }
  }
  if (input.careerYears >= 15) {
    return {
      layer: 'D',
      reason: `경력 ${input.careerYears}년 고년차. HIT D.`,
    }
  }
  if (input.careerYears >= 3 && input.isCareerChange) {
    return {
      layer: 'C',
      reason: `경력 ${input.careerYears}년 이직 고려. HIT C로 경력 자본·전직 가능성 진단.`,
    }
  }
  if (input.careerYears >= 10) {
    return {
      layer: 'C',
      reason: `경력 ${input.careerYears}년. HIT C.`,
    }
  }
  return {
    layer: 'B',
    reason: `경력 ${input.careerYears}년. HIT B로 인성·적성·역량·준비도 진단.`,
  }
}
