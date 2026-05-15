// SmarComm Insights API — V2.0 § 3-B Smart-Data Hub
// 도메인별 시계열 인사이트 — 진단·4지표·트렌드

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { computeInsights, type ScanTimePoint } from '@/lib/smarcomm/insights';
import { analyzeInsightsLLM } from '@/lib/smarcomm/insights-llm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);

    if (!domain) {
        return NextResponse.json({ error: 'domain required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('smarcomm_scans')
        .select('short_id, created_at, smarcomm_index, findability_score, trust_score, citability_score, grade, breakdown')
        .eq('domain', domain)
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 50));

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const scans: ScanTimePoint[] = (data ?? []).map(s => ({
        short_id: s.short_id,
        created_at: s.created_at,
        smarcomm_index: s.smarcomm_index,
        findability_score: s.findability_score,
        trust_score: s.trust_score,
        citability_score: s.citability_score,
        grade: s.grade,
        brand_journey: (s.breakdown as { brandJourney?: ScanTimePoint['brand_journey'] } | null)?.brandJourney ?? null,
    }));

    const summary = computeInsights(scans);

    // V2.1 § 1.10 — LLM 동적 인사이트 (휴리스틱 텍스트 분기 보강)
    const llmInsight = await analyzeInsightsLLM(scans).catch(() => null);

    return NextResponse.json({ domain, summary, llmInsight });
}
