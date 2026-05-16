// AI 답변 변화 이벤트 API — smarcomm_ai_diff_events 조회
// V2.0 § 3-C AIRM ④ 검증 단계 + § 3-B Smart-Data Hub 모니터링 소스

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const DIFF_TYPES = [
    'improved',
    'degraded',
    'unchanged',
    'sentiment_flip',
    'fact_corrected',
    'fact_introduced',
] as const;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const diffType = searchParams.get('diff_type');
    const platform = searchParams.get('platform');
    const days = parseInt(searchParams.get('days') ?? '30', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '200', 10), 500);

    const admin = createAdminClient();
    const since = new Date(Date.now() - days * 86400 * 1000).toISOString();

    let q = admin
        .from('smarcomm_ai_diff_events')
        .select('id, tenant_id, flag_id, before_scan_id, after_scan_id, platform, query, diff_type, before_excerpt, after_excerpt, summary, detected_at')
        .gte('detected_at', since)
        .order('detected_at', { ascending: false })
        .limit(limit);

    if (diffType) q = q.eq('diff_type', diffType);
    if (platform) q = q.eq('platform', platform);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const events = data ?? [];

    // 집계
    const byType: Record<string, number> = Object.fromEntries(DIFF_TYPES.map(t => [t, 0]));
    const byPlatform: Record<string, number> = {};
    for (const e of events) {
        byType[e.diff_type as string] = (byType[e.diff_type as string] ?? 0) + 1;
        const p = e.platform as string;
        byPlatform[p] = (byPlatform[p] ?? 0) + 1;
    }

    // 일자별 추이 (최근 30일)
    const timeline: { date: string; improved: number; degraded: number; other: number }[] = [];
    const buckets = new Map<string, { improved: number; degraded: number; other: number }>();
    for (const e of events) {
        const d = (e.detected_at as string).slice(0, 10);
        if (!buckets.has(d)) buckets.set(d, { improved: 0, degraded: 0, other: 0 });
        const b = buckets.get(d)!;
        if (e.diff_type === 'improved' || e.diff_type === 'fact_corrected') b.improved += 1;
        else if (e.diff_type === 'degraded' || e.diff_type === 'fact_introduced') b.degraded += 1;
        else b.other += 1;
    }
    for (const [date, counts] of [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        timeline.push({ date, ...counts });
    }

    return NextResponse.json({
        events,
        total: events.length,
        byType,
        byPlatform,
        timeline,
        days,
    });
}
