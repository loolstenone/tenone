// SmarComm 소재 목록 / 단건 삭제 / 상태 변경 API
// 테이블: smarcomm_creatives (AI 소재 제작 결과 영속 저장)

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id') ?? 'tenone-demo';
    const type = searchParams.get('type');     // text / banner / video / null=all
    const status = searchParams.get('status'); // draft / active / archived / null=all
    const channel = searchParams.get('channel');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500);

    const admin = createAdminClient();
    let query = admin
        .from('smarcomm_creatives')
        .select('id, tenant_id, type, channel, status, title, body, cta, hashtags, image_prompt, duration, source_prompt, source_context, generated_by, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (channel) query = query.eq('channel', channel);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 집계 — 유형별/상태별/채널별 카운트
    const stats = {
        total: (data ?? []).length,
        byType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        byChannel: {} as Record<string, number>,
    };
    for (const r of data ?? []) {
        stats.byType[r.type] = (stats.byType[r.type] || 0) + 1;
        stats.byStatus[r.status] = (stats.byStatus[r.status] || 0) + 1;
        if (r.channel) stats.byChannel[r.channel] = (stats.byChannel[r.channel] || 0) + 1;
    }

    return NextResponse.json({ creatives: data ?? [], stats });
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const { id, status } = body as { id: string; status: 'draft' | 'active' | 'archived' };
    if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
        .from('smarcomm_creatives')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.from('smarcomm_creatives').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
