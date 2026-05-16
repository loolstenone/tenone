// 워크플로우 자동화 API — workflow_automations 테이블

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function rowToRule(r: Record<string, unknown>) {
    return {
        id: r.id as string,
        name: (r.name as string) ?? '',
        description: (r.description as string) ?? '',
        trigger: (r.trigger as Record<string, unknown>) ?? { type: 'manual', label: '수동', config: {} },
        conditions: (r.conditions as unknown[]) ?? [],
        actions: (r.actions as unknown[]) ?? [],
        enabled: (r.enabled as boolean) ?? false,
        brandId: (r.brand_id as string) ?? 'general',
        lastTriggered: (r.last_triggered as string) ?? undefined,
        createdAt: ((r.created_at as string) ?? '').slice(0, 10),
    };
}

export async function GET() {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('workflow_automations')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ automations: (data ?? []).map(rowToRule) });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('workflow_automations')
        .insert({
            name: body.name,
            description: body.description ?? '',
            trigger: body.trigger ?? { type: 'manual', label: '수동', config: {} },
            conditions: body.conditions ?? [],
            actions: body.actions ?? [],
            enabled: body.enabled ?? false,
            brand_id: body.brandId ?? 'general',
            tenant_id: 'tenone',
        })
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ automation: rowToRule(data) });
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.description !== undefined) update.description = body.description;
    if (body.trigger !== undefined) update.trigger = body.trigger;
    if (body.conditions !== undefined) update.conditions = body.conditions;
    if (body.actions !== undefined) update.actions = body.actions;
    if (body.enabled !== undefined) update.enabled = body.enabled;
    if (body.brandId !== undefined) update.brand_id = body.brandId;

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('workflow_automations')
        .update(update)
        .eq('id', body.id)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ automation: rowToRule(data) });
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const admin = createAdminClient();
    const { error } = await admin.from('workflow_automations').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
