// 마케팅 캘린더 API — events + comm_events 통합

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const monthStr = searchParams.get('month'); // YYYY-MM
    const target = monthStr ? new Date(`${monthStr}-01T00:00:00Z`) : new Date();
    const start = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), 1));
    const end = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 1));

    const admin = createAdminClient();
    const [eventsR, commEventsR] = await Promise.all([
        admin.from('events').select('id, title, description, start_at, end_at, all_day, location, color')
            .gte('start_at', start.toISOString()).lt('start_at', end.toISOString())
            .order('start_at', { ascending: true }),
        admin.from('comm_events').select('id, title, description, start_at, end_at, event_type, location, source')
            .gte('start_at', start.toISOString()).lt('start_at', end.toISOString())
            .order('start_at', { ascending: true }),
    ]);

    const events = (eventsR.data ?? []).map(r => ({
        id: r.id as string,
        title: (r.title as string) ?? '',
        description: (r.description as string) ?? '',
        start_at: r.start_at as string,
        end_at: r.end_at as string | null,
        all_day: (r.all_day as boolean) ?? false,
        location: (r.location as string) ?? '',
        color: (r.color as string) ?? '#3b82f6',
        source: 'events' as const,
        kind: 'general',
    }));

    const commEvents = (commEventsR.data ?? []).map(r => ({
        id: r.id as string,
        title: (r.title as string) ?? '',
        description: (r.description as string) ?? '',
        start_at: r.start_at as string,
        end_at: r.end_at as string | null,
        all_day: false,
        location: (r.location as string) ?? '',
        color: '#8b5cf6',
        source: 'comm_events' as const,
        kind: (r.event_type as string) ?? 'comm',
    }));

    const all = [...events, ...commEvents].sort((a, b) => a.start_at.localeCompare(b.start_at));

    return NextResponse.json({
        month: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`,
        total: all.length,
        events: all,
    });
}
