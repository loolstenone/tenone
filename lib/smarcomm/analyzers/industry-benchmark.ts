// 업종 백분위 벤치마크 — smarcomm_industry_benchmarks 조회
// Phase 4 ② SSOT

import { createClient } from '@/lib/supabase/server';

export type IndustryKey =
    | 'ecommerce' | 'saas' | 'restaurant' | 'healthcare'
    | 'finance' | 'education' | 'startup' | 'general';

export interface BenchmarkRow {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    sample_count: number;
}

export interface AxisBenchmark {
    findability: BenchmarkRow;
    trust: BenchmarkRow;
    citability: BenchmarkRow;
    index: BenchmarkRow;
}

export interface BenchmarkResult {
    industry: IndustryKey;
    benchmark: AxisBenchmark;
    /** 0~100 백분위 추정 (p25=25, p50=50, p75=75, p90=90, 그 외 보간) */
    percentiles: {
        findability: number;
        trust: number;
        citability: number;
        index: number;
    };
}

function estimatePercentile(score: number, row: BenchmarkRow): number {
    if (score <= row.p25) return Math.round((score / row.p25) * 25);
    if (score <= row.p50) return 25 + Math.round(((score - row.p25) / (row.p50 - row.p25)) * 25);
    if (score <= row.p75) return 50 + Math.round(((score - row.p50) / (row.p75 - row.p50)) * 25);
    if (score <= row.p90) return 75 + Math.round(((score - row.p75) / (row.p90 - row.p75)) * 15);
    return Math.min(100, 90 + Math.round(((score - row.p90) / (100 - row.p90)) * 10));
}

export async function fetchIndustryBenchmark(
    industry: string,
    scores: { findability: number; trust: number; citability: number; index: number }
): Promise<BenchmarkResult | null> {
    const normalizedIndustry = (industry || 'general').toLowerCase() as IndustryKey;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('smarcomm_industry_benchmarks')
        .select('metric, p25, p50, p75, p90, sample_count')
        .eq('industry', normalizedIndustry);

    // 업종이 없으면 general로 폴백
    const rows = (!error && data && data.length > 0)
        ? data
        : await supabase
            .from('smarcomm_industry_benchmarks')
            .select('metric, p25, p50, p75, p90, sample_count')
            .eq('industry', 'general')
            .then(r => r.data ?? []);

    if (!rows || rows.length === 0) return null;

    const byMetric: Record<string, BenchmarkRow> = {};
    for (const row of rows) {
        byMetric[row.metric] = {
            p25: Number(row.p25), p50: Number(row.p50),
            p75: Number(row.p75), p90: Number(row.p90),
            sample_count: row.sample_count,
        };
    }

    const f = byMetric.findability;
    const t = byMetric.trust;
    const c = byMetric.citability;
    const idx = byMetric.index;
    if (!f || !t || !c || !idx) return null;

    return {
        industry: normalizedIndustry,
        benchmark: { findability: f, trust: t, citability: c, index: idx },
        percentiles: {
            findability: estimatePercentile(scores.findability, f),
            trust: estimatePercentile(scores.trust, t),
            citability: estimatePercentile(scores.citability, c),
            index: estimatePercentile(scores.index, idx),
        },
    };
}

/** 업종 목록 (UI 드롭다운용) */
export const INDUSTRY_OPTIONS: { value: IndustryKey; label: string }[] = [
    { value: 'general',     label: '업종 미지정' },
    { value: 'ecommerce',   label: '이커머스 / 온라인쇼핑' },
    { value: 'saas',        label: 'SaaS / 소프트웨어' },
    { value: 'restaurant',  label: '식당 / F&B' },
    { value: 'healthcare',  label: '의료 / 헬스케어' },
    { value: 'finance',     label: '금융 / 핀테크' },
    { value: 'education',   label: '교육 / 에듀테크' },
    { value: 'startup',     label: '스타트업 / 테크' },
];
