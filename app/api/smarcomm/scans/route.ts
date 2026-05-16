// SmarComm Scans 리스트 API
// 워크스페이스의 과거 진단 리포트 목록을 반환한다.
// 필터: domain, grade, 기간 (days), search (도메인 부분일치)

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const grade = searchParams.get('grade');
    const search = searchParams.get('search');
    const days = parseInt(searchParams.get('days') ?? '0', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
    const memberId = searchParams.get('member_id');

    const admin = createAdminClient();
    let query = admin
        .from('smarcomm_scans')
        .select('short_id, member_id, url, domain, industry, smarcomm_index, findability_score, trust_score, citability_score, performance_score, grade, pages_analyzed, favicon_url, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (domain) query = query.eq('domain', domain);
    if (grade) query = query.eq('grade', grade);
    if (search) query = query.ilike('domain', `%${search}%`);
    if (memberId) query = query.eq('member_id', memberId);
    if (days > 0) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', cutoff);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 도메인별 집계 (최신 점수·평균·진단 횟수)
    const domainStats: Record<string, { domain: string; scans: number; latest_index: number; avg_index: number; latest_at: string }> = {};
    for (const s of data ?? []) {
        if (!domainStats[s.domain]) {
            domainStats[s.domain] = {
                domain: s.domain,
                scans: 0,
                latest_index: s.smarcomm_index,
                avg_index: 0,
                latest_at: s.created_at,
            };
        }
        const ds = domainStats[s.domain];
        ds.scans += 1;
        ds.avg_index += s.smarcomm_index;
        if (s.created_at > ds.latest_at) {
            ds.latest_at = s.created_at;
            ds.latest_index = s.smarcomm_index;
        }
    }
    const domains = Object.values(domainStats).map(d => ({ ...d, avg_index: Math.round(d.avg_index / d.scans) }));
    domains.sort((a, b) => (a.latest_at < b.latest_at ? 1 : -1));

    return NextResponse.json({
        scans: data ?? [],
        domains,
        total: data?.length ?? 0,
    });
}
