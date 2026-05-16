// 트래픽 분석 API — wio_analytics_events 기반
// V2.0 § 3-B Smart-Data Hub 유입 로그 소스

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') ?? '30', 10), 365);
    const brand = searchParams.get('brand');

    const admin = createAdminClient();
    const since = new Date(Date.now() - days * 86400 * 1000).toISOString();

    let q = admin
        .from('wio_analytics_events')
        .select('event_type, brand_id, user_id, session_id, page_path, duration_sec, created_at')
        .gte('created_at', since)
        .limit(5000);
    if (brand) q = q.eq('brand_id', brand);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const events = data ?? [];

    // 일자별 집계
    const dailyMap = new Map<string, { date: string; pageViews: number; sessions: Set<string>; users: Set<string> }>();
    const pageMap = new Map<string, number>();
    const brandMap = new Map<string, number>();
    const sessionDurations: number[] = [];
    const sessionPageCounts = new Map<string, number>();

    for (const e of events) {
        const d = (e.created_at as string).slice(0, 10);
        if (!dailyMap.has(d)) dailyMap.set(d, { date: d, pageViews: 0, sessions: new Set(), users: new Set() });
        const day = dailyMap.get(d)!;

        if (e.event_type === 'page_view') {
            day.pageViews += 1;
            if (e.session_id) day.sessions.add(e.session_id as string);
            if (e.user_id) day.users.add(e.user_id as string);
            if (e.page_path) pageMap.set(e.page_path as string, (pageMap.get(e.page_path as string) ?? 0) + 1);
            if (e.session_id) sessionPageCounts.set(e.session_id as string, (sessionPageCounts.get(e.session_id as string) ?? 0) + 1);
        }
        if (e.event_type === 'session_end' && e.duration_sec) {
            sessionDurations.push(e.duration_sec as number);
        }
        if (e.brand_id) brandMap.set(e.brand_id as string, (brandMap.get(e.brand_id as string) ?? 0) + 1);
    }

    const timeline = Array.from(dailyMap.values())
        .map(d => ({ date: d.date, pageViews: d.pageViews, sessions: d.sessions.size, users: d.users.size }))
        .sort((a, b) => a.date.localeCompare(b.date));

    const topPages = Array.from(pageMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([path, views]) => ({ path, views }));

    const brandBreakdown = Array.from(brandMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([brand, count]) => ({ brand, count }));

    const totalPageViews = timeline.reduce((s, d) => s + d.pageViews, 0);
    const totalSessions = new Set(events.filter(e => e.event_type === 'page_view').map(e => e.session_id)).size;
    const totalUsers = new Set(events.filter(e => e.user_id).map(e => e.user_id)).size;
    const avgDuration = sessionDurations.length > 0
        ? Math.round(sessionDurations.reduce((s, x) => s + x, 0) / sessionDurations.length)
        : 0;
    const singlePageSessions = Array.from(sessionPageCounts.values()).filter(c => c === 1).length;
    const bounceRate = totalSessions > 0 ? Math.round((singlePageSessions / totalSessions) * 100) : 0;

    return NextResponse.json({
        days,
        kpi: { totalPageViews, totalSessions, totalUsers, avgDuration, bounceRate },
        timeline,
        topPages,
        brandBreakdown,
    });
}
