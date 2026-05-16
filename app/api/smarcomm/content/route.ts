// 콘텐츠 API — marketing_content 테이블 CRUD

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function row(r: Record<string, unknown>) {
    return {
        id: r.id as string,
        title: (r.title as string) ?? '',
        type: (r.type as string) ?? 'blog',
        status: (r.status as string) ?? 'draft',
        brand_id: (r.brand_id as string) ?? '',
        content: (r.content as string) ?? '',
        published_at: r.published_at as string | null,
        channels: (r.channels as string[]) ?? [],
        metrics: r.metrics ?? {},
        campaign_id: r.campaign_id as string | null,
        created_at: ((r.created_at as string) ?? '').slice(0, 10),
    };
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const admin = createAdminClient();
    let q = admin.from('marketing_content').select('*').order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    if (type) q = q.eq('type', type);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const items = (data ?? []).map(row);
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const i of items) {
        byStatus[i.status] = (byStatus[i.status] ?? 0) + 1;
        byType[i.type] = (byType[i.type] ?? 0) + 1;
    }
    return NextResponse.json({ items, total: items.length, byStatus, byType });
}

export async function POST(request: NextRequest) {
    const b = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from('marketing_content').insert({
        title: b.title,
        type: b.type ?? 'blog',
        status: b.status ?? 'draft',
        brand_id: b.brand_id ?? 'smarcomm',
        content: b.content ?? '',
        channels: b.channels ?? [],
        metrics: b.metrics ?? {},
        campaign_id: b.campaign_id ?? null,
        tenant_id: 'tenone',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: row(data) });
}

export async function PATCH(request: NextRequest) {
    const b = await request.json();
    if (!b.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const u: Record<string, unknown> = { updated_at: new Date().toISOString() };
    ['title', 'type', 'status', 'brand_id', 'content', 'channels', 'metrics', 'published_at', 'campaign_id'].forEach(k => {
        if (b[k] !== undefined) u[k] = b[k];
    });
    const admin = createAdminClient();
    const { data, error } = await admin.from('marketing_content').update(u).eq('id', b.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: row(data) });
}

export async function DELETE(request: NextRequest) {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const admin = createAdminClient();
    const { error } = await admin.from('marketing_content').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
