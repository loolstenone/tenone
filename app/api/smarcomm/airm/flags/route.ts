// SmarComm AIRM Flags API — V2.0 § 3-C ①·② 발견·분석
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id') ?? 'tenone-demo';
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    const admin = createAdminClient();
    let query = admin
        .from('smarcomm_ai_flags')
        .select('id, platform, query, response_excerpt, flag_type, severity, confidence, status, notes, detected_at, resolved_at, probe_scan_id')
        .eq('tenant_id', tenantId)
        .order('detected_at', { ascending: false })
        .limit(Math.min(limit, 200));

    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 각 flag에 권장 액션 카운트 첨부
    const ids = (data ?? []).map(f => f.id);
    let actionCounts: Record<string, number> = {};
    if (ids.length > 0) {
        const { data: acts } = await admin
            .from('smarcomm_airm_actions')
            .select('flag_id, status')
            .in('flag_id', ids);
        actionCounts = (acts ?? []).reduce((acc: Record<string, number>, a) => {
            acc[a.flag_id] = (acc[a.flag_id] ?? 0) + 1;
            return acc;
        }, {});
    }

    return NextResponse.json({
        flags: (data ?? []).map(f => ({ ...f, action_count: actionCounts[f.id] ?? 0 })),
    });
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const { id, status, notes } = body;
    if (!id || !status) return NextResponse.json({ error: 'id, status required' }, { status: 400 });

    const update: Record<string, unknown> = { status };
    if (notes !== undefined) update.notes = notes;
    if (['verified_fixed', 'wont_fix', 'duplicate'].includes(status)) {
        update.resolved_at = new Date().toISOString();
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('smarcomm_ai_flags')
        .update(update)
        .eq('id', id)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ flag: data });
}
