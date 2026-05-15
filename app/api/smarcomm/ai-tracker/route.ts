// SmarComm AI Tracker API — V2.0 § 3-B Smart-Data Hub
// 두 진단 간 AI 답변 변화 diff (실시간 추적용)

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { diffAnswers, type AnswerSnapshot } from '@/lib/smarcomm/insights';

export const dynamic = 'force-dynamic';

interface ExtractedFacts {
    sentiment?: 'positive' | 'neutral' | 'negative';
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    if (!domain) return NextResponse.json({ error: 'domain required' }, { status: 400 });

    const admin = createAdminClient();

    // 최근 진단 2건
    const { data: scans, error: scanErr } = await admin
        .from('smarcomm_scans')
        .select('id, short_id, created_at')
        .eq('domain', domain)
        .order('created_at', { ascending: false })
        .limit(2);
    if (scanErr) return NextResponse.json({ error: scanErr.message }, { status: 500 });
    if (!scans || scans.length === 0) return NextResponse.json({ domain, diffs: [], message: 'no scans yet' });

    const afterScan = scans[0];
    const beforeScan = scans[1] ?? null;

    // 각 scan의 ai_probes 조회
    const probeQuery = async (scanId: string) => {
        const { data } = await admin
            .from('smarcomm_ai_probes')
            .select('platform, category, query, mentioned, position, accuracy, extracted_facts, raw_response, measured_at')
            .eq('scan_id', scanId);
        return (data ?? []).map((p): AnswerSnapshot => ({
            platform: p.platform,
            category: p.category,
            query: p.query,
            mentioned: p.mentioned,
            position: p.position,
            accuracy: p.accuracy,
            sentiment: (p.extracted_facts as ExtractedFacts | null)?.sentiment ?? null,
            response_excerpt: (p.raw_response ?? '').slice(0, 300),
            measured_at: p.measured_at,
        }));
    };

    const after = await probeQuery(afterScan.id);
    const before = beforeScan ? await probeQuery(beforeScan.id) : [];

    const diffs = diffAnswers(before, after);

    return NextResponse.json({
        domain,
        before: beforeScan ? { short_id: beforeScan.short_id, at: beforeScan.created_at } : null,
        after: { short_id: afterScan.short_id, at: afterScan.created_at },
        diffs,
        scanCount: scans.length,
    });
}
