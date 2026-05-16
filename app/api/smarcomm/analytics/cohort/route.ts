// 코호트 분석 API — wio_analytics_events
// 사용자별 첫 이벤트 일자(=가입주차) × N일 후 재방문율

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function isoWeek(date: Date): string {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const weeks = Math.min(parseInt(searchParams.get('weeks') ?? '8', 10), 26);

    const admin = createAdminClient();
    const since = new Date(Date.now() - weeks * 7 * 86400 * 1000).toISOString();

    const { data, error } = await admin
        .from('wio_analytics_events')
        .select('user_id, created_at')
        .not('user_id', 'is', null)
        .gte('created_at', since)
        .order('created_at', { ascending: true })
        .limit(10000);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 사용자별 활동일 집합
    const userDays = new Map<string, Set<string>>();
    for (const e of data ?? []) {
        const uid = e.user_id as string;
        const d = (e.created_at as string).slice(0, 10);
        if (!userDays.has(uid)) userDays.set(uid, new Set());
        userDays.get(uid)!.add(d);
    }

    // 사용자별 첫 이벤트 = 코호트 주차
    const userCohort = new Map<string, string>();
    const userFirstDate = new Map<string, Date>();
    for (const [uid, days] of userDays.entries()) {
        const sorted = [...days].sort();
        const first = new Date(sorted[0]);
        userFirstDate.set(uid, first);
        userCohort.set(uid, isoWeek(first));
    }

    // 코호트별 retention 0/1/2/3/4주
    const retentionMap = new Map<string, { cohort: string; size: number; weeks: number[] }>();
    for (const [uid, cohort] of userCohort.entries()) {
        if (!retentionMap.has(cohort)) retentionMap.set(cohort, { cohort, size: 0, weeks: [0, 0, 0, 0, 0] });
        const row = retentionMap.get(cohort)!;
        row.size += 1;
        const first = userFirstDate.get(uid)!;
        const days = userDays.get(uid)!;
        for (let w = 0; w < 5; w++) {
            const weekStart = new Date(first.getTime() + w * 7 * 86400 * 1000);
            const weekEnd = new Date(weekStart.getTime() + 7 * 86400 * 1000);
            const active = [...days].some(d => {
                const dt = new Date(d);
                return dt >= weekStart && dt < weekEnd;
            });
            if (active) row.weeks[w] += 1;
        }
    }

    const cohorts = Array.from(retentionMap.values())
        .sort((a, b) => a.cohort.localeCompare(b.cohort))
        .map(r => ({
            cohort: r.cohort,
            size: r.size,
            retentionPct: r.weeks.map(c => r.size > 0 ? Math.round((c / r.size) * 100) : 0),
        }));

    return NextResponse.json({ weeks, cohorts, totalUsers: userCohort.size });
}
