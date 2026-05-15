// SmarComm AIRM Actions API — V2.0 § 3-C ③ 교정 액션 큐
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id') ?? 'tenone-demo';
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const flagId = searchParams.get('flag_id');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    const admin = createAdminClient();
    let query = admin
        .from('smarcomm_airm_actions')
        .select('id, flag_id, action_type, title, description, role, assignee_member_id, status, expected_axis, expected_impact, due_date, completed_at, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 200));

    if (status) query = query.eq('status', status);
    if (role) query = query.eq('role', role);
    if (flagId) query = query.eq('flag_id', flagId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ actions: data ?? [] });
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const { id, status, assignee_member_id, due_date, notes } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (status !== undefined) update.status = status;
    if (assignee_member_id !== undefined) update.assignee_member_id = assignee_member_id;
    if (due_date !== undefined) update.due_date = due_date;
    if (notes !== undefined) update.notes = notes;
    if (status === 'done') update.completed_at = new Date().toISOString();

    if (Object.keys(update).length === 0) {
        return NextResponse.json({ error: '갱신 필드 없음' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('smarcomm_airm_actions')
        .update(update)
        .eq('id', id)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ action: data });
}
