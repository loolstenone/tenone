// A/B 테스트 API — mkt_experiments 테이블 CRUD

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function row(r: Record<string, unknown>) {
    return {
        id: r.id as string,
        name: (r.name as string) ?? '',
        brand_id: (r.brand_id as string) ?? '',
        status: (r.status as string) ?? 'draft',
        type: (r.type as string) ?? 'split',
        hypothesis: (r.hypothesis as string) ?? '',
        start_date: r.start_date as string | null,
        end_date: r.end_date as string | null,
        sample_size: (r.sample_size as number) ?? 0,
        confidence: (r.confidence as number) ?? 0,
        variants: r.variants ?? [],
        winner: r.winner as string | null,
        notes: (r.notes as string) ?? '',
        created_at: ((r.created_at as string) ?? '').slice(0, 10),
    };
}

export async function GET() {
    const admin = createAdminClient();
    const { data, error } = await admin.from('mkt_experiments').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const experiments = (data ?? []).map(row);
    const byStatus: Record<string, number> = {};
    for (const e of experiments) byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
    return NextResponse.json({ experiments, total: experiments.length, byStatus });
}

export async function POST(request: NextRequest) {
    const b = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from('mkt_experiments').insert({
        name: b.name,
        brand_id: b.brand_id ?? 'smarcomm',
        status: b.status ?? 'draft',
        type: b.type ?? 'split',
        hypothesis: b.hypothesis ?? '',
        start_date: b.start_date ?? null,
        end_date: b.end_date ?? null,
        sample_size: b.sample_size ?? 0,
        confidence: b.confidence ?? 0,
        variants: b.variants ?? [{ name: 'A', traffic: 50 }, { name: 'B', traffic: 50 }],
        notes: b.notes ?? '',
        tenant_id: 'tenone',
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ experiment: row(data) });
}

export async function PATCH(request: NextRequest) {
    const b = await request.json();
    if (!b.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const u: Record<string, unknown> = { updated_at: new Date().toISOString() };
    ['name', 'status', 'type', 'hypothesis', 'start_date', 'end_date', 'sample_size', 'confidence', 'variants', 'winner', 'notes'].forEach(k => {
        if (b[k] !== undefined) u[k] = b[k];
    });
    const admin = createAdminClient();
    const { data, error } = await admin.from('mkt_experiments').update(u).eq('id', b.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ experiment: row(data) });
}

export async function DELETE(request: NextRequest) {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const admin = createAdminClient();
    const { error } = await admin.from('mkt_experiments').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
