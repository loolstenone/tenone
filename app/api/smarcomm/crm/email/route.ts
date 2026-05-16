// 이메일 채널 API — email_sends + email_senders + newsletter_subscribers

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') ?? '30', 10), 365);

    const admin = createAdminClient();
    const since = new Date(Date.now() - days * 86400 * 1000).toISOString();

    const [sendsR, sendersR, subsR] = await Promise.all([
        admin.from('email_sends')
            .select('id, to_addr, subject, status, sent_at, delivered_at, opened_at, clicked_at, bounced_at, kind, created_at')
            .gte('created_at', since)
            .order('created_at', { ascending: false })
            .limit(500),
        admin.from('email_senders').select('id, from_addr, from_name, purpose, brand_id, is_active, daily_limit'),
        admin.from('newsletter_subscribers').select('id, email, name, is_active, confirmed_at, unsubscribed_at, last_opened_at, last_clicked_at, bounce_count, created_at'),
    ]);

    if (sendsR.error) return NextResponse.json({ error: sendsR.error.message }, { status: 500 });

    const sends = sendsR.data ?? [];
    const senders = sendersR.data ?? [];
    const subscribers = subsR.data ?? [];

    let delivered = 0, opened = 0, clicked = 0, bounced = 0;
    const byDay = new Map<string, { date: string; sent: number; opened: number; clicked: number }>();
    for (const s of sends) {
        if (s.delivered_at) delivered++;
        if (s.opened_at) opened++;
        if (s.clicked_at) clicked++;
        if (s.bounced_at) bounced++;
        const d = (s.created_at as string).slice(0, 10);
        if (!byDay.has(d)) byDay.set(d, { date: d, sent: 0, opened: 0, clicked: 0 });
        const b = byDay.get(d)!;
        b.sent += 1;
        if (s.opened_at) b.opened += 1;
        if (s.clicked_at) b.clicked += 1;
    }

    const timeline = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
    const totalSent = sends.length;
    const openRate = totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((clicked / totalSent) * 100) : 0;
    const bounceRate = totalSent > 0 ? Math.round((bounced / totalSent) * 100) : 0;

    const activeSubs = subscribers.filter(s => s.is_active && !s.unsubscribed_at).length;
    const confirmedSubs = subscribers.filter(s => s.confirmed_at).length;

    return NextResponse.json({
        days,
        kpi: { totalSent, delivered, opened, clicked, bounced, openRate, clickRate, bounceRate },
        subscribers: {
            total: subscribers.length,
            active: activeSubs,
            confirmed: confirmedSubs,
            unsubscribed: subscribers.filter(s => s.unsubscribed_at).length,
        },
        timeline,
        senders: senders.map(s => ({
            id: s.id, from_addr: s.from_addr, from_name: s.from_name,
            purpose: s.purpose, brand_id: s.brand_id, is_active: s.is_active, daily_limit: s.daily_limit,
        })),
        recentSends: sends.slice(0, 30).map(s => ({
            id: s.id, to: s.to_addr, subject: s.subject, status: s.status, kind: s.kind,
            sent_at: s.sent_at, opened: !!s.opened_at, clicked: !!s.clicked_at, bounced: !!s.bounced_at,
            created_at: s.created_at,
        })),
    });
}
