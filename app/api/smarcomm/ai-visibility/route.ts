// AI 가시성 집계 API — smarcomm_ai_probes 시계열 + 매트릭스 분석
// 5 플랫폼 × 7 카테고리 노출률, accuracy 분포, 최근 probe 응답.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const PLATFORMS = ['claude', 'chatgpt', 'perplexity', 'naver-cue', 'google-aio'] as const;
const CATEGORIES = ['brand_direct', 'product_generic', 'use_case', 'competitor', 'pricing', 'howto', 'local'] as const;
type Platform = typeof PLATFORMS[number];
type Category = typeof CATEGORIES[number];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const days = parseInt(searchParams.get('days') ?? '0', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500);

    const admin = createAdminClient();

    // 도메인 필터 적용 시 먼저 scan_id 목록 확보
    let scanIds: string[] | null = null;
    if (domain) {
        const scansQ = await admin
            .from('smarcomm_scans')
            .select('id')
            .eq('domain', domain);
        if (scansQ.error) return NextResponse.json({ error: scansQ.error.message }, { status: 500 });
        scanIds = (scansQ.data ?? []).map(r => r.id as string);
        if (scanIds.length === 0) {
            return NextResponse.json({ total: 0, mentionRate: 0, platformBreakdown: [], categoryBreakdown: [], accuracyDist: {}, matrix: [], recent: [] });
        }
    }

    let probesQ = admin
        .from('smarcomm_ai_probes')
        .select('id, scan_id, platform, category, query, mentioned, position, accuracy, citations, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (scanIds) probesQ = probesQ.in('scan_id', scanIds);
    if (days > 0) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        probesQ = probesQ.gte('created_at', cutoff);
    }

    const { data, error } = await probesQ;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const probes = data ?? [];

    // 전체 집계
    const total = probes.length;
    const mentionedCount = probes.filter(p => p.mentioned).length;
    const mentionRate = total > 0 ? Math.round((mentionedCount / total) * 100) : 0;

    // 플랫폼별
    const platformBreakdown = PLATFORMS.map(pf => {
        const sub = probes.filter(p => p.platform === pf);
        const mentioned = sub.filter(p => p.mentioned).length;
        return {
            platform: pf,
            total: sub.length,
            mentioned,
            rate: sub.length > 0 ? Math.round((mentioned / sub.length) * 100) : 0,
            skipped: sub.length === 0,
        };
    });

    // 카테고리별
    const categoryBreakdown = CATEGORIES.map(cat => {
        const sub = probes.filter(p => p.category === cat);
        const mentioned = sub.filter(p => p.mentioned).length;
        return {
            category: cat,
            total: sub.length,
            mentioned,
            rate: sub.length > 0 ? Math.round((mentioned / sub.length) * 100) : 0,
        };
    });

    // accuracy 분포
    const accuracyDist = { exact: 0, partial: 0, wrong: 0, absent: 0 };
    for (const p of probes) {
        if (p.accuracy in accuracyDist) accuracyDist[p.accuracy as keyof typeof accuracyDist] += 1;
    }

    // 5 × 7 매트릭스 (플랫폼 × 카테고리)
    const matrix: Array<{ platform: Platform; category: Category; total: number; mentioned: number; rate: number }> = [];
    for (const pf of PLATFORMS) {
        for (const cat of CATEGORIES) {
            const sub = probes.filter(p => p.platform === pf && p.category === cat);
            const mentioned = sub.filter(p => p.mentioned).length;
            matrix.push({
                platform: pf,
                category: cat,
                total: sub.length,
                mentioned,
                rate: sub.length > 0 ? Math.round((mentioned / sub.length) * 100) : 0,
            });
        }
    }

    // 최근 N개 probe (간략 데이터만)
    const recent = probes.slice(0, 25).map(p => ({
        id: p.id,
        scan_id: p.scan_id,
        platform: p.platform,
        category: p.category,
        query: p.query,
        mentioned: p.mentioned,
        position: p.position,
        accuracy: p.accuracy,
        created_at: p.created_at,
    }));

    return NextResponse.json({
        total,
        mentionRate,
        platformBreakdown,
        categoryBreakdown,
        accuracyDist,
        matrix,
        recent,
    });
}
