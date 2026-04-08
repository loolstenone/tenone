// lib/hit/cvi.ts — 경력 유효성 지수(CVI) 산출 엔진
// HIT_F_Final.md 설계서 §CVI 산출 기준
// CVI = (직무유효성 × 0.35) + (기술유효성 × 0.35) + (시장재진입 × 0.30)
// Ten:One™ Universe · HeRo

export type CviGrade = 'HIGH' | 'MID' | 'LOW'

// HIGH → F 자체 리포트(복귀), MID → HIT C(전환), LOW → HIT B(기초 재설계)
export type FNextRoute = 'B' | 'C' | 'recovery'

export interface CviInput {
  jobViability:   number  // 직무유효성 0~100 (f_jv01~f_jv12)
  skillCurrency:  number  // 기술유효성 0~100 (f_sc01~f_sc12)
  marketReentry:  number  // 시장재진입 0~100 (f_mr01~f_mr12)
}

export interface CviResult {
  cviRaw:    number
  cviGrade:  CviGrade
  nextRoute: FNextRoute
  breakdown: {
    jobComponent:    number
    skillComponent:  number
    marketComponent: number
  }
}

/**
 * CVI 산출 (설계서 확정 공식 — 변경 금지)
 * CVI = (직무유효성 × 0.35) + (기술유효성 × 0.35) + (시장재진입 × 0.30)
 *
 * 각 subscale 점수는 scoring-f.ts의 buildSubscaleMap에서
 * 역문항 역산 후 0~100으로 정규화된 값을 입력한다.
 *
 * 등급:
 *   ≥ 67 → HIGH  : 경력 복구 가능성 높음 → F 자체 리포트
 *   34~66 → MID  : 부분 전환 필요 → HIT C 연결
 *   ≤ 33 → LOW   : 새 출발이 현실적 → HIT B 연결
 */
export function calculateCVI(input: CviInput): CviResult {
  const { jobViability, skillCurrency, marketReentry } = input

  const jobComponent    = jobViability   * 0.35
  const skillComponent  = skillCurrency  * 0.35
  const marketComponent = marketReentry  * 0.30

  const cviRaw = Math.round((jobComponent + skillComponent + marketComponent) * 10) / 10

  const cviGrade: CviGrade =
    cviRaw >= 67 ? 'HIGH' :
    cviRaw >= 34 ? 'MID'  : 'LOW'

  const nextRoute: FNextRoute =
    cviGrade === 'HIGH' ? 'recovery' :
    cviGrade === 'MID'  ? 'C' : 'B'

  return {
    cviRaw,
    cviGrade,
    nextRoute,
    breakdown: {
      jobComponent:    Math.round(jobComponent   * 10) / 10,
      skillComponent:  Math.round(skillComponent * 10) / 10,
      marketComponent: Math.round(marketComponent * 10) / 10,
    },
  }
}

// ── 직군별 직무변화속도 참조표 (레거시 호환 — CVI 계산에는 사용 안 함) ──
export const JOB_VELOCITY_TABLE: Record<string, number> = {
  software_dev:     0.9,
  data_science:     0.85,
  marketing_digital: 0.75,
  marketing_brand:  0.55,
  finance:          0.4,
  accounting:       0.35,
  hr:               0.45,
  sales:            0.5,
  design_ux:        0.7,
  design_graphic:   0.6,
  education:        0.3,
  healthcare:       0.4,
  legal:            0.3,
  manufacturing:    0.5,
  consulting:       0.6,
  public_sector:    0.2,
  default:          0.5,
}

/** @deprecated CVI 계산에 더 이상 사용하지 않음. 레거시 호환용 */
export function getJobVelocity(jobCategory: string): number {
  return JOB_VELOCITY_TABLE[jobCategory] ?? JOB_VELOCITY_TABLE.default
}
