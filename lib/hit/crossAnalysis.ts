// lib/hit/crossAnalysis.ts — HIT A 교차분석 엔진
// 특허 명세 §6.3 구현 · 순수 함수 (사이드이펙트 없음)
// Ten:One™ Universe · HeRo

export type SPowerDimension =
  | 'Strategic' | 'Execution' | 'Creativity' | 'Interpersonal'
  | 'Analytical' | 'Harmony' | 'Breakthrough' | 'Guard'

const SPOWER_DIMENSIONS: SPowerDimension[] = [
  'Strategic', 'Execution', 'Creativity', 'Interpersonal',
  'Analytical', 'Harmony', 'Breakthrough', 'Guard',
]

// 4×4 → 8D 사영 행렬 (DISC×MBTI 교차 → S-Power 기여도)
const PROJECTION_MATRIX: number[][] = [
  [0.8, 0.7, 0.3, 0.6, 0.3, 0.6, 0.2, 0.4, 0.1, 0.4, 0.1, 0.3, 0.5, 0.6, 0.3, 0.5], // Strategic
  [0.4, 0.2, 0.3, 0.8, 0.3, 0.2, 0.2, 0.6, 0.2, 0.1, 0.3, 0.7, 0.3, 0.1, 0.4, 0.8], // Execution
  [0.2, 0.5, 0.2, 0.2, 0.7, 0.8, 0.3, 0.2, 0.1, 0.5, 0.2, 0.1, 0.4, 0.6, 0.2, 0.2], // Creativity
  [0.1, 0.2, 0.6, 0.2, 0.8, 0.3, 0.8, 0.4, 0.6, 0.2, 0.7, 0.5, 0.2, 0.2, 0.5, 0.3], // Interpersonal
  [0.3, 0.4, 0.7, 0.3, 0.2, 0.3, 0.4, 0.2, 0.2, 0.4, 0.3, 0.2, 0.8, 0.7, 0.7, 0.4], // Analytical
  [0.1, 0.2, 0.4, 0.3, 0.3, 0.3, 0.5, 0.5, 0.7, 0.4, 0.9, 0.7, 0.2, 0.2, 0.5, 0.4], // Harmony
  [0.6, 0.3, 0.2, 0.2, 0.4, 0.4, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.3, 0.2, 0.2], // Breakthrough
  [0.2, 0.3, 0.4, 0.5, 0.1, 0.2, 0.3, 0.4, 0.3, 0.3, 0.4, 0.5, 0.6, 0.6, 0.7, 0.8], // Guard
]

export interface UFVector {
  sibling: number; parent: number; family: number; peer: number
  self: number; temperament: number; economic: number
  trauma: number; cultural: number
}

export interface MbtiVector {
  ie: number; ns: number; ft: number; pj: number  // -100 ~ +100
}

export interface DiscVector {
  d: number; i: number; s: number; c: number  // 합산 1.0
}

export interface SPowerProfile {
  Strategic: number; Execution: number; Creativity: number; Interpersonal: number
  Analytical: number; Harmony: number; Breakthrough: number; Guard: number
  top3: SPowerDimension[]
  growthAreas: SPowerDimension[]
}

function buildWeightMatrix(uf: UFVector): number[][] {
  const clamp = (v: number) => Math.max(0.3, Math.min(1.7, v))
  const ieBoost = uf.peer * 0.3 + uf.self * 0.2
  const nsBoost = uf.cultural * 0.2 + uf.family * 0.1
  const ftBoost = uf.parent * 0.3 + uf.sibling * 0.15
  const tp = uf.trauma * 0.2
  const b = 1.0
  return [
    [b + ieBoost - tp * 0.3, b + ieBoost * 0.5, b - ieBoost * 0.3, b - ieBoost * 0.2].map(clamp),
    [b + nsBoost * 0.4, b + nsBoost, b - nsBoost * 0.2, b + nsBoost * 0.6].map(clamp),
    [b - ftBoost * 0.3, b + ftBoost * 0.5, b + ftBoost, b - ftBoost * 0.4].map(clamp),
    [b + uf.self * 0.2, b + uf.peer * 0.1, b + uf.family * 0.2, b + uf.economic * 0.15].map(clamp),
  ]
}

function outerProduct(mbti: MbtiVector, disc: DiscVector): number[][] {
  const m = [(mbti.ie + 100) / 200, (mbti.ns + 100) / 200, (mbti.ft + 100) / 200, (mbti.pj + 100) / 200]
  const d = [disc.d, disc.i, disc.s, disc.c]
  return m.map(mi => d.map(di => mi * di))
}

function elementwiseMultiply(a: number[][], b: number[][]): number[][] {
  return a.map((row, i) => row.map((v, j) => v * b[i][j]))
}

export function runCrossAnalysis(
  uf: UFVector,
  mbti: MbtiVector,
  disc: DiscVector,
): { spower: SPowerProfile; rawCrossMatrix: number[][] } {
  const C = outerProduct(mbti, disc)
  const W = buildWeightMatrix(uf)
  const S_raw = elementwiseMultiply(C, W)
  const flat = S_raw.flat()

  const scores = {} as Record<SPowerDimension, number>
  SPOWER_DIMENSIONS.forEach((dim, i) => {
    const row = PROJECTION_MATRIX[i]
    const raw = flat.reduce((sum, v, j) => sum + v * row[j], 0)
    const max = row.reduce((s, v) => s + v, 0)
    scores[dim] = Math.round(Math.min(100, (raw / max) * 100))
  })

  const sorted = (Object.entries(scores) as [SPowerDimension, number][]).sort((a, b) => b[1] - a[1])
  return {
    spower: {
      ...scores,
      top3: sorted.slice(0, 3).map(([d]) => d),
      growthAreas: sorted.slice(-2).map(([d]) => d),
    },
    rawCrossMatrix: S_raw,
  }
}

export function mbtiVectorToType(v: MbtiVector): string {
  return [
    v.ie >= 0 ? 'E' : 'I',
    v.ns >= 0 ? 'S' : 'N',
    v.ft >= 0 ? 'T' : 'F',
    v.pj >= 0 ? 'J' : 'P',
  ].join('')
}

export function discVectorToPrimary(v: DiscVector): { primary: string; secondary: string | null } {
  const sorted = Object.entries(v).sort((a, b) => b[1] - a[1])
  return {
    primary: sorted[0][0].toUpperCase(),
    secondary: sorted[1][1] > 0.25 ? sorted[1][0].toUpperCase() : null,
  }
}
