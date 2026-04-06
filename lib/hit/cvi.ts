// lib/hit/cvi.ts — 경력 유효성 지수(CVI) 산출 엔진
// 특허 명세 §6.4 구현
// Ten:One™ Universe · HeRo

// 계수 (특허 명세 확정값 — 변경 금지)
const ALPHA = 0.8
const BETA  = 0.6
const GAMMA = 0.4

export type CviGrade = 'HIGH' | 'MID' | 'LOW'
export type FNextRoute = 'B' | 'C' | 'recovery'

export interface CviInput {
  breakMonths: number           // 단절 기간(월)
  jobChangeVelocity: number     // 직무변화속도 0~1
  latentScore: number           // 공백역량점수 0~100
}

export interface CviResult {
  cviRaw: number
  cviGrade: CviGrade
  nextRoute: FNextRoute
  breakdown: { decayComponent: number; latentComponent: number }
}

export function calculateCVI(input: CviInput): CviResult {
  const { breakMonths: T, jobChangeVelocity: V, latentScore: L } = input
  const decay  = (100 - T * V * ALPHA) * BETA
  const latent = L * GAMMA
  const cviRaw = Math.max(0, Math.min(100, decay + latent))

  const cviGrade: CviGrade = cviRaw >= 70 ? 'HIGH' : cviRaw >= 40 ? 'MID' : 'LOW'
  const nextRoute: FNextRoute = cviGrade === 'HIGH' ? 'recovery' : cviGrade === 'MID' ? 'C' : 'B'

  return {
    cviRaw: Math.round(cviRaw * 10) / 10,
    cviGrade,
    nextRoute,
    breakdown: {
      decayComponent: Math.round(decay * 10) / 10,
      latentComponent: Math.round(latent * 10) / 10,
    },
  }
}

// 직군별 직무변화속도 참조표
export const JOB_VELOCITY_TABLE: Record<string, number> = {
  software_dev: 0.9,
  data_science: 0.85,
  marketing_digital: 0.75,
  marketing_brand: 0.55,
  finance: 0.4,
  accounting: 0.35,
  hr: 0.45,
  sales: 0.5,
  design_ux: 0.7,
  design_graphic: 0.6,
  education: 0.3,
  healthcare: 0.4,
  legal: 0.3,
  manufacturing: 0.5,
  consulting: 0.6,
  public_sector: 0.2,
  default: 0.5,
}

export function getJobVelocity(jobCategory: string): number {
  return JOB_VELOCITY_TABLE[jobCategory] ?? JOB_VELOCITY_TABLE.default
}
