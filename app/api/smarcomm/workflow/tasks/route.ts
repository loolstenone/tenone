// 워크플로우 태스크 API — workflow_tasks 테이블
// 칸반·프로젝트·파이프라인 페이지 공통 데이터 소스

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const STATUS_NORMALIZE: Record<string, string> = {
    backlog: 'Backlog',
    todo: 'Todo',
    in_progress: 'In Progress',
    'in progress': 'In Progress',
    review: 'Review',
    done: 'Done',
};

function normStatus(s: string | null | undefined): string {
    if (!s) return 'Backlog';
    return STATUS_NORMALIZE[s.toLowerCase()] ?? s;
}

const PRIORITY_NORMALIZE: Record<string, string> = {
    low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent',
};

function normPriority(s: string | null | undefined): string {
    if (!s) return 'Medium';
    return PRIORITY_NORMALIZE[s.toLowerCase()] ?? s;
}

function rowToTask(r: Record<string, unknown>) {
    return {
        id: r.id as string,
        title: (r.title as string) ?? '',
        description: (r.description as string) ?? '',
        status: normStatus(r.status as string),
        priority: normPriority(r.priority as string),
        assignee: (r.assignee as string) ?? '',
        brandId: (r.brand_id as string) ?? 'smarcomm',
        dueDate: (r.due_date as string) ?? undefined,
        tags: (r.tags as string[]) ?? [],
        createdAt: ((r.created_at as string) ?? '').slice(0, 10),
        updatedAt: ((r.updated_at as string) ?? '').slice(0, 10),
    };
}

export async function GET() {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('workflow_tasks')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tasks: (data ?? []).map(rowToTask) });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('workflow_tasks')
        .insert({
            title: body.title,
            description: body.description ?? '',
            status: body.status ?? 'Backlog',
            priority: body.priority ?? 'Medium',
            assignee: body.assignee ?? '',
            brand_id: body.brandId ?? 'smarcomm',
            due_date: body.dueDate ?? null,
            tags: body.tags ?? [],
            tenant_id: 'tenone',
        })
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: rowToTask(data) });
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) update.title = body.title;
    if (body.description !== undefined) update.description = body.description;
    if (body.status !== undefined) update.status = body.status;
    if (body.priority !== undefined) update.priority = body.priority;
    if (body.assignee !== undefined) update.assignee = body.assignee;
    if (body.brandId !== undefined) update.brand_id = body.brandId;
    if (body.dueDate !== undefined) update.due_date = body.dueDate || null;
    if (body.tags !== undefined) update.tags = body.tags;

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('workflow_tasks')
        .update(update)
        .eq('id', body.id)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: rowToTask(data) });
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const admin = createAdminClient();
    const { error } = await admin.from('workflow_tasks').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
