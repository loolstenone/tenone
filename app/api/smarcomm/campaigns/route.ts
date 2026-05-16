// 캠페인 API — marketing_campaigns 테이블 CRUD

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function row(r: Record<string, unknown>) {
    return {
        id: r.id as string,
        name: (r.name as string) ?? '',
        type: (r.type as string) ?? 'paid_search',
        status: (r.status as string) ?? 'draft',
        brand_id: (r.brand_id as string) ?? '',
        budget: (r.budget as number) ?? 0,
        spent: (r.spent as number) ?? 0,
        start_date: r.start_date as string | null,
        end_date: r.end_date as string | null,
        target_audience: (r.target_audience as string) ?? '',
        channel: (r.channel as string) ?? '',
        metrics: r.metrics ?? {},
        created_at: ((r.created_at as string) ?? '').slice(0, 10),
    };
}

export async function GET() {
    const admin = createAdminClient();
    const { data, error } = await admin.from('marketing_campaigns').select('*').order('start_date', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const campaigns = (data ?? []).map(row);
    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
    const byStatus: Record<string, number> = {};
    const byChannel: Record<string, number> = {};
    for (const c of campaigns) {
        byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
        if (c.channel) byChannel[c.channel] = (byChannel[c.channel] ?? 0) + 1;
    }
    return NextResponse.json({ campaigns, total: campaigns.length, totalBudget, totalSpent, byStatus, byChannel });
}

export async function POST(request: NextRequest) {
    const b = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from('marketing_campaigns').insert({
        name: b.name,
        type: b.type ?? 'paid_search',
        status: b.status ?? 'draft',
        brand_id: b.brand_id ?? 'smarcomm',
        budget: b.budget ?? 0,
        spent: b.spent ?? 0,
        start_date: b.start_date ?? null,
        end_date: b.end_date ?? null,
        target_audience: b.target_audience ?? '',
        channel: b.channel ?? '',
        metrics: b.metrics ?? {},
        tenant_id: 'tenone',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ campaign: row(data) });
}

export async function PATCH(request: NextRequest) {
    const b = await request.json();
    if (!b.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const u: Record<string, unknown> = { updated_at: new Date().toISOString() };
    ['name', 'type', 'status', 'brand_id', 'budget', 'spent', 'start_date', 'end_date', 'target_audience', 'channel', 'metrics'].forEach(k => {
        if (b[k] !== undefined) u[k] = b[k];
    });
    const admin = createAdminClient();
    const { data, error } = await admin.from('marketing_campaigns').update(u).eq('id', b.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ campaign: row(data) });
}

export async function DELETE(request: NextRequest) {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const admin = createAdminClient();
    const { error } = await admin.from('marketing_campaigns').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
