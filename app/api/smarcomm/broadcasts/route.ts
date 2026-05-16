// 아웃바운드 브로드캐스트 API — smarcomm_broadcasts (kakao/push/sms 공통)

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function row(r: Record<string, unknown>) {
    return {
        id: r.id as string,
        name: (r.name as string) ?? '',
        channel: (r.channel as string) ?? '',
        brand_id: (r.brand_id as string) ?? '',
        template_code: (r.template_code as string) ?? '',
        title: (r.title as string) ?? '',
        content: (r.content as string) ?? '',
        link_url: (r.link_url as string) ?? '',
        image_url: (r.image_url as string) ?? '',
        target_audience: (r.target_audience as string) ?? '',
        target_count: (r.target_count as number) ?? 0,
        status: (r.status as string) ?? 'draft',
        scheduled_at: r.scheduled_at as string | null,
        sent_at: r.sent_at as string | null,
        sent_count: (r.sent_count as number) ?? 0,
        delivered_count: (r.delivered_count as number) ?? 0,
        failed_count: (r.failed_count as number) ?? 0,
        opened_count: (r.opened_count as number) ?? 0,
        clicked_count: (r.clicked_count as number) ?? 0,
        created_at: ((r.created_at as string) ?? '').slice(0, 10),
    };
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const channelFilter = searchParams.get('channel'); // kakao_* | push | sms | app_inbox
    const channelPrefix = searchParams.get('channelPrefix'); // 'kakao' 로 시작
    const admin = createAdminClient();
    let q = admin.from('smarcomm_broadcasts').select('*').order('created_at', { ascending: false });
    if (channelFilter) q = q.eq('channel', channelFilter);
    if (channelPrefix) q = q.like('channel', `${channelPrefix}%`);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const broadcasts = (data ?? []).map(row);
    const byStatus: Record<string, number> = {};
    let totalSent = 0, totalDelivered = 0, totalOpened = 0, totalClicked = 0;
    for (const b of broadcasts) {
        byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
        totalSent += b.sent_count;
        totalDelivered += b.delivered_count;
        totalOpened += b.opened_count;
        totalClicked += b.clicked_count;
    }
    return NextResponse.json({
        broadcasts, total: broadcasts.length, byStatus,
        kpi: { totalSent, totalDelivered, totalOpened, totalClicked },
    });
}

export async function POST(request: NextRequest) {
    const b = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from('smarcomm_broadcasts').insert({
        name: b.name,
        channel: b.channel,
        brand_id: b.brand_id ?? null,
        template_code: b.template_code ?? null,
        title: b.title ?? null,
        content: b.content ?? '',
        link_url: b.link_url ?? null,
        image_url: b.image_url ?? null,
        target_audience: b.target_audience ?? null,
        target_count: b.target_count ?? 0,
        scheduled_at: b.scheduled_at ?? null,
        status: b.status ?? 'draft',
        tenant_id: 'tenone',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ broadcast: row(data) });
}

export async function PATCH(request: NextRequest) {
    const b = await request.json();
    if (!b.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const u: Record<string, unknown> = { updated_at: new Date().toISOString() };
    ['name', 'channel', 'brand_id', 'template_code', 'title', 'content', 'link_url', 'image_url',
        'target_audience', 'target_count', 'scheduled_at', 'sent_at', 'status',
        'sent_count', 'delivered_count', 'failed_count', 'opened_count', 'clicked_count'].forEach(k => {
            if (b[k] !== undefined) u[k] = b[k];
        });
    const admin = createAdminClient();
    const { data, error } = await admin.from('smarcomm_broadcasts').update(u).eq('id', b.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ broadcast: row(data) });
}

export async function DELETE(request: NextRequest) {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const admin = createAdminClient();
    const { error } = await admin.from('smarcomm_broadcasts').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
