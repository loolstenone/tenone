// 프롬프트 관리 API — smarcomm_ai_probes의 query를 그룹화해 노출 분석
// 같은 질문이 5 AI 플랫폼에서 어떻게 응답되는지, 어떤 질문이 가장 잘/못 노출되는지

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface PromptStat {
    query: string;
    category: string;
    total: number;
    mentioned: number;
    mentionRate: number;
    platforms: Array<{ platform: string; mentioned: boolean; accuracy: string }>;
    accuracy: { exact: number; partial: number; wrong: number; absent: number };
    lastSeen: string;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') ?? 'rate-desc'; // rate-desc | rate-asc | recent | total
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '500', 10), 1000);
    const domain = searchParams.get('domain');

    const admin = createAdminClient();

    let scanIds: string[] | null = null;
    if (domain) {
        const scans = await admin.from('smarcomm_scans').select('id').eq('domain', domain);
        if (scans.error) return NextResponse.json({ error: scans.error.message }, { status: 500 });
        scanIds = (scans.data ?? []).map(r => r.id as string);
        if (scanIds.length === 0) return NextResponse.json({ prompts: [], total: 0, categories: {} });
    }

    let q = admin
        .from('smarcomm_ai_probes')
        .select('query, category, platform, mentioned, accuracy, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (category) q = q.eq('category', category);
    if (scanIds) q = q.in('scan_id', scanIds);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 질문별 그룹화
    const groups = new Map<string, PromptStat>();
    for (const p of data ?? []) {
        const key = p.query as string;
        if (!groups.has(key)) {
            groups.set(key, {
                query: key,
                category: p.category as string,
                total: 0,
                mentioned: 0,
                mentionRate: 0,
                platforms: [],
                accuracy: { exact: 0, partial: 0, wrong: 0, absent: 0 },
                lastSeen: p.created_at as string,
            });
        }
        const g = groups.get(key)!;
        g.total += 1;
        if (p.mentioned) g.mentioned += 1;
        if (p.accuracy in g.accuracy) g.accuracy[p.accuracy as keyof typeof g.accuracy] += 1;
        g.platforms.push({ platform: p.platform as string, mentioned: !!p.mentioned, accuracy: p.accuracy as string });
        if ((p.created_at as string) > g.lastSeen) g.lastSeen = p.created_at as string;
    }
    for (const g of groups.values()) {
        g.mentionRate = g.total > 0 ? Math.round((g.mentioned / g.total) * 100) : 0;
    }

    let prompts = Array.from(groups.values());

    // 정렬
    if (sort === 'rate-desc') prompts.sort((a, b) => b.mentionRate - a.mentionRate || b.total - a.total);
    else if (sort === 'rate-asc') prompts.sort((a, b) => a.mentionRate - b.mentionRate || b.total - a.total);
    else if (sort === 'recent') prompts.sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));
    else if (sort === 'total') prompts.sort((a, b) => b.total - a.total);

    // 카테고리별 카운트
    const categories: Record<string, number> = {};
    for (const g of prompts) categories[g.category] = (categories[g.category] || 0) + 1;

    return NextResponse.json({ prompts, total: prompts.length, categories });
}
