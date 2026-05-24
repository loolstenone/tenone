// Phase 3.4 — Hallucination 영속화
// run-scan 파이프라인에서 호출. siteTruth와 ai-probe factComparison을 정규화 테이블에 저장.
//
// 입력:
//   - admin: Supabase 어드민 클라이언트
//   - scanId: smarcomm_scans.id
//   - domain: 도메인
//   - siteTruth: fact-extractor 결과 (Ground truth)
//   - probeRows: insert 직후 받은 probe row 배열 ({ id, platform, query, factComparison })
//
// 저장:
//   - smarcomm_brand_facts: siteTruth의 각 field별 row
//   - smarcomm_hallucinations: factComparison의 match=wrong/partial/missing rows
//
// 정직성: factComparison이 없거나 LLM 분석 실패 시 아무것도 저장하지 않음 (가짜 데이터 0건).

import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrandFacts } from './analyzers/fact-extractor';

type ProbeRowMeta = {
    id: string;
    platform: string;
    query: string;
    factComparison?: Array<{
        field: string;
        match: 'exact' | 'partial' | 'wrong' | 'missing';
        siteValue?: string;
        aiValue?: string;
        reason?: string;
    }>;
};

const SEVERITY_BY_MATCH: Record<string, 'factual_error' | 'partial_match' | 'unverifiable' | null> = {
    wrong: 'factual_error',
    partial: 'partial_match',
    missing: 'unverifiable',
    exact: null,  // exact는 환각 아님 — 저장하지 않음
};

export async function persistBrandFacts(
    admin: SupabaseClient,
    scanId: string,
    domain: string,
    siteTruth: BrandFacts | null,
): Promise<number> {
    if (!siteTruth) return 0;
    const rows: Record<string, unknown>[] = [];

    if (siteTruth.price) {
        rows.push({
            scan_id: scanId,
            domain,
            fact_type: 'price',
            fact_value: siteTruth.price,
            source: findSource(siteTruth, 'price'),
            raw_excerpt: findRawExcerpt(siteTruth, 'price'),
            confidence: 100,
        });
    }

    if (typeof siteTruth.founded === 'number') {
        rows.push({
            scan_id: scanId,
            domain,
            fact_type: 'founded',
            fact_value: { year: siteTruth.founded },
            source: findSource(siteTruth, 'founded'),
            raw_excerpt: findRawExcerpt(siteTruth, 'founded'),
            confidence: 100,
        });
    }

    if (siteTruth.category) {
        rows.push({
            scan_id: scanId,
            domain,
            fact_type: 'category',
            fact_value: { value: siteTruth.category },
            source: findSource(siteTruth, 'category'),
            raw_excerpt: findRawExcerpt(siteTruth, 'category'),
            confidence: 100,
        });
    }

    if (siteTruth.features && siteTruth.features.length > 0) {
        rows.push({
            scan_id: scanId,
            domain,
            fact_type: 'features',
            fact_value: { items: siteTruth.features },
            source: findSource(siteTruth, 'features'),
            raw_excerpt: findRawExcerpt(siteTruth, 'features'),
            confidence: 90,
        });
    }

    if (siteTruth.strengths && siteTruth.strengths.length > 0) {
        rows.push({
            scan_id: scanId,
            domain,
            fact_type: 'strengths',
            fact_value: { items: siteTruth.strengths },
            source: findSource(siteTruth, 'strengths'),
            raw_excerpt: findRawExcerpt(siteTruth, 'strengths'),
            confidence: 80,
        });
    }

    if (rows.length === 0) return 0;
    const { error } = await admin.from('smarcomm_brand_facts').insert(rows);
    if (error) {
        console.error('[hallucination-persist] brand_facts insert failed:', error.message);
        return 0;
    }
    return rows.length;
}

export async function persistHallucinations(
    admin: SupabaseClient,
    scanId: string,
    probes: ProbeRowMeta[],
): Promise<number> {
    const rows: Record<string, unknown>[] = [];

    for (const p of probes) {
        if (!p.factComparison || p.factComparison.length === 0) continue;
        for (const c of p.factComparison) {
            const severity = SEVERITY_BY_MATCH[c.match];
            if (!severity) continue;  // exact는 환각 아님

            rows.push({
                scan_id: scanId,
                probe_id: p.id,
                platform: p.platform,
                claim_text: c.aiValue || '(AI가 해당 사실 미언급)',
                claim_type: c.field,
                ground_truth: c.siteValue ? { value: c.siteValue } : null,
                severity,
                explanation: c.reason || null,
                confidence: 80,
            });
        }
    }

    if (rows.length === 0) return 0;
    const { error } = await admin.from('smarcomm_hallucinations').insert(rows);
    if (error) {
        console.error('[hallucination-persist] hallucinations insert failed:', error.message);
        return 0;
    }
    return rows.length;
}

function findSource(facts: BrandFacts, field: string): string {
    const source = facts.sources?.find(s => s.field === field);
    return source?.from ?? 'fact-extractor';
}

function findRawExcerpt(facts: BrandFacts, field: string): string | null {
    const source = facts.sources?.find(s => s.field === field);
    return source?.raw ?? null;
}
