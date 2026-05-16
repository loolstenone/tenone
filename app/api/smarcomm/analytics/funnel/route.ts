// 퍼널 분석 API — wio_analytics_events 시퀀스 기반
// session_id로 그룹핑하여 page_path 진행을 추적

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// 기본 퍼널 (실 데이터 기반): 홈 → 진단 → 결과 → 회원가입
const DEFAULT_STEPS = [
    { key: 'landing', label: '랜딩', match: /^\/$|^\/badak$|^\/smarcomm$|^\/jakka$|^\/myverse$/ },
    { key: 'discovery', label: '탐색', match: /\/explore|\/groups|\/about|\/community/ },
    { key: 'engagement', label: '참여', match: /\/my|\/create|\/apply|\/scan/ },
    { key: 'conversion', label: '전환', match: /\/signup|\/login|\/pricing|\/checkout/ },
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') ?? '30', 10), 365);

    const admin = createAdminClient();
    const since = new Date(Date.now() - days * 86400 * 1000).toISOString();

    const { data, error } = await admin
        .from('wio_analytics_events')
        .select('session_id, page_path, created_at')
        .eq('event_type', 'page_view')
        .gte('created_at', since)
        .order('created_at', { ascending: true })
        .limit(5000);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const sessions = new Map<string, Set<string>>();
    for (const e of data ?? []) {
        const sid = e.session_id as string | null;
        const path = e.page_path as string | null;
        if (!sid || !path) continue;
        for (const step of DEFAULT_STEPS) {
            if (step.match.test(path)) {
                if (!sessions.has(sid)) sessions.set(sid, new Set());
                sessions.get(sid)!.add(step.key);
                break;
            }
        }
    }

    const stepCounts: Record<string, number> = {};
    for (const step of DEFAULT_STEPS) stepCounts[step.key] = 0;
    for (const reached of sessions.values()) {
        for (const k of reached) stepCounts[k] = (stepCounts[k] ?? 0) + 1;
    }

    const steps = DEFAULT_STEPS.map((s, i) => {
        const count = stepCounts[s.key] ?? 0;
        const prev = i === 0 ? count : (stepCounts[DEFAULT_STEPS[i - 1].key] ?? 0);
        const conversionFromPrev = i === 0 ? 100 : (prev > 0 ? Math.round((count / prev) * 100) : 0);
        const conversionFromTop = stepCounts[DEFAULT_STEPS[0].key] > 0
            ? Math.round((count / stepCounts[DEFAULT_STEPS[0].key]) * 100)
            : 0;
        return { key: s.key, label: s.label, count, conversionFromPrev, conversionFromTop };
    });

    return NextResponse.json({ days, totalSessions: sessions.size, steps });
}
