// A/B 테스트 통계적 유의성 — 카이제곱 검정 (2x2 분할표)
//
// 입력: 각 변형의 방문자 수(visitors) + 전환 수(conversions)
// 출력: 전환율·리프트·카이제곱·p-value·유의도(95%/99%/N.S.)
//
// 산식 (df=1, Yates 보정 X — 샘플 작을 때만 권장):
//   chi² = N(ad - bc)² / ((a+b)(c+d)(a+c)(b+d))
//   p-value ≈ erfc(sqrt(chi²/2))  (df=1 카이제곱 분포 ≡ Z² 정규분포 양측)
//
// 출처: SSOT — 외부 라이브러리 없이 정직 산출.

export interface Variant {
    name: string;
    visitors: number;
    conversions: number;
}

export interface ChiSquareResult {
    variants: Array<Variant & { rate: number }>;
    baselineIdx: number;
    winnerIdx: number | null;
    liftPct: number | null;          // 승자 vs baseline 상대 리프트 (%)
    chiSquare: number;
    pValue: number;
    significance: 'none' | '90' | '95' | '99';   // 신뢰수준
    note: string;
    sampleAdequate: boolean;          // 각 셀 ≥5 충족 (카이제곱 가정)
}

/** erfc — 보충 오차함수 (Abramowitz & Stegun 7.1.26 근사) */
function erfc(x: number): number {
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * ax);
    const y = 1 - (((((
        1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
    return sign === 1 ? 1 - y : 1 + y;
}

/** df=1 카이제곱 p-value */
function chiSquareP(chi2: number): number {
    if (chi2 <= 0) return 1;
    return erfc(Math.sqrt(chi2 / 2));
}

export function computeChiSquare(variants: Variant[]): ChiSquareResult | null {
    if (variants.length < 2) return null;
    const v = variants.slice(0, 2);  // 2변형만 (3+는 별도 처리)
    const [a, b] = v;
    if (a.visitors <= 0 || b.visitors <= 0) return null;

    const rates = v.map(x => ({ ...x, rate: x.visitors > 0 ? x.conversions / x.visitors : 0 }));

    // 2x2 분할표: [[conv_a, non_a], [conv_b, non_b]]
    const convA = a.conversions, nonA = a.visitors - a.conversions;
    const convB = b.conversions, nonB = b.visitors - b.conversions;
    const N = a.visitors + b.visitors;

    // 셀 기댓값 ≥5 가정 충족 여부
    const expected = [
        ((convA + convB) * a.visitors) / N,
        ((nonA + nonB) * a.visitors) / N,
        ((convA + convB) * b.visitors) / N,
        ((nonA + nonB) * b.visitors) / N,
    ];
    const sampleAdequate = expected.every(e => e >= 5);

    const num = N * Math.pow(convA * nonB - convB * nonA, 2);
    const den = (convA + nonA) * (convB + nonB) * (convA + convB) * (nonA + nonB);
    const chi2 = den === 0 ? 0 : num / den;
    const p = chiSquareP(chi2);

    let significance: ChiSquareResult['significance'] = 'none';
    if (p < 0.01) significance = '99';
    else if (p < 0.05) significance = '95';
    else if (p < 0.10) significance = '90';

    // 승자: 전환율 더 높은 쪽 (단, 유의해야만)
    const baselineIdx = 0;
    const winnerIdx = significance === 'none' ? null : (rates[1].rate > rates[0].rate ? 1 : 0);
    const liftPct = winnerIdx === null
        ? null
        : rates[0].rate === 0
            ? null
            : ((rates[winnerIdx].rate - rates[baselineIdx].rate) / rates[baselineIdx].rate) * 100;

    let note = '';
    if (!sampleAdequate) note = '⚠ 표본 부족 — 각 셀 기댓값 5 이상 필요 (정확도 낮음)';
    else if (significance === 'none') note = '유의차 없음 — 더 많은 표본 필요 또는 차이 미미';
    else note = `${significance}% 신뢰수준 유의 — ${winnerIdx !== null ? v[winnerIdx].name : ''} 승`;

    return { variants: rates, baselineIdx, winnerIdx, liftPct, chiSquare: chi2, pValue: p, significance, note, sampleAdequate };
}

/** 필요 최소 표본 크기 (정규 근사, 양측 검정)
 *  α=0.05, power=0.80, baseline rate p₁, 검출 리프트 Δ */
export function requiredSampleSize(baselineRate: number, minLiftPct: number, alpha = 0.05, power = 0.8): number {
    const p1 = baselineRate;
    const p2 = p1 * (1 + minLiftPct / 100);
    if (p2 <= 0 || p2 >= 1 || p1 <= 0 || p1 >= 1) return Infinity;
    // Z values
    const zAlpha = alpha === 0.01 ? 2.576 : alpha === 0.10 ? 1.645 : 1.96;  // two-sided
    const zBeta = power === 0.9 ? 1.282 : 0.842;  // default 0.80
    const pBar = (p1 + p2) / 2;
    const num = Math.pow(zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
    const den = Math.pow(p2 - p1, 2);
    return Math.ceil(num / den);
}
