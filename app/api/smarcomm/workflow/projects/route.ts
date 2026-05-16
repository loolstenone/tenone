// 워크플로우 프로젝트 API — projects 테이블

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const STATUS_NORMALIZE: Record<string, string> = {
    'in-progress': 'Active',
    in_progress: 'Active',
    active: 'Active',
    draft: 'On Hold',
    'on hold': 'On Hold',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const PHASE_NORMALIZE: Record<string, string> = {
    planning: 'Planning',
    development: 'Development',
    review: 'Review',
    launch: 'Launch',
    complete: 'Complete',
};

function normStatus(s: string | null | undefined): string {
    if (!s) return 'Active';
    return STATUS_NORMALIZE[s.toLowerCase()] ?? s;
}

function normPhase(s: string | null | undefined): string {
    if (!s) return 'Planning';
    return PHASE_NORMALIZE[s.toLowerCase()] ?? s;
}

// status별 진척도 추정 — DB에 progress 컬럼 없으므로 status에서 매핑
const PROGRESS_BY_STATUS: Record<string, number> = {
    Active: 50,
    'On Hold': 10,
    Completed: 100,
    Cancelled: 0,
};

function rowToProject(r: Record<string, unknown>) {
    const status = normStatus(r.status as string);
    return {
        id: r.id as string,
        name: (r.name as string) ?? '',
        brandId: ((r.brand as string) ?? '').toLowerCase(),
        description: (r.description as string) ?? '',
        status,
        phase: normPhase(r.phase as string),
        taskIds: (r.task_ids as string[]) ?? [],
        startDate: ((r.start_date as string) ?? '').slice(0, 10),
        endDate: r.end_date ? ((r.end_date as string).slice(0, 10)) : undefined,
        progress: PROGRESS_BY_STATUS[status] ?? 0,
    };
}

export async function GET() {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('projects')
        .select('id, name, brand, description, status, phase, task_ids, start_date, end_date')
        .order('start_date', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ projects: (data ?? []).map(rowToProject) });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('projects')
        .insert({
            name: body.name,
            brand: body.brandId ?? '',
            description: body.description ?? '',
            status: body.status ?? 'Active',
            phase: body.phase ?? 'Planning',
            task_ids: body.taskIds ?? [],
            start_date: body.startDate ?? null,
            end_date: body.endDate ?? null,
            tenant_id: 'tenone',
        })
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ project: rowToProject(data) });
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) update.name = body.name;
    if (body.brandId !== undefined) update.brand = body.brandId;
    if (body.description !== undefined) update.description = body.description;
    if (body.status !== undefined) update.status = body.status;
    if (body.phase !== undefined) update.phase = body.phase;
    if (body.taskIds !== undefined) update.task_ids = body.taskIds;
    if (body.startDate !== undefined) update.start_date = body.startDate || null;
    if (body.endDate !== undefined) update.end_date = body.endDate || null;

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('projects')
        .update(update)
        .eq('id', body.id)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ project: rowToProject(data) });
}
