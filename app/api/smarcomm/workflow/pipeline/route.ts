// 콘텐츠 파이프라인 API — content_pipeline 테이블

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const STAGE_NORMALIZE: Record<string, string> = {
    idea: 'Idea',
    planning: 'Idea',
    scripting: 'Scripting',
    writing: 'Scripting',
    filming: 'Production',
    editing: 'Production',
    production: 'Production',
    review: 'Review',
    scheduled: 'Scheduled',
    published: 'Published',
};

const TYPE_NORMALIZE: Record<string, string> = {
    blog: 'Blog',
    video: 'Video',
    post: 'Post',
    image: 'Post',
    shorts: 'Shorts',
    music: 'Music',
};

function norm(map: Record<string, string>, fallback: string, value: string | null | undefined): string {
    if (!value) return fallback;
    return map[value.toLowerCase()] ?? value;
}

function rowToItem(r: Record<string, unknown>) {
    return {
        id: r.id as string,
        title: (r.title as string) ?? '',
        type: norm(TYPE_NORMALIZE, 'Post', r.type as string),
        stage: norm(STAGE_NORMALIZE, 'Idea', r.stage as string),
        brandId: (r.brand_id as string) ?? '',
        assignee: (r.assignee as string) ?? '',
        dueDate: r.due_date ? ((r.due_date as string).slice(0, 10)) : undefined,
        aiGenerated: (r.ai_generated as boolean) ?? false,
        description: (r.description as string) ?? '',
        createdAt: ((r.created_at as string) ?? '').slice(0, 10),
    };
}

export async function GET() {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('content_pipeline')
        .select('id, title, type, stage, brand_id, assignee, due_date, ai_generated, description, created_at')
        .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: (data ?? []).map(rowToItem) });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin
        .from('content_pipeline')
        .insert({
            title: body.title,
            type: (body.type ?? 'Post').toLowerCase(),
            stage: (body.stage ?? 'Idea').toLowerCase(),
            brand_id: body.brandId ?? '',
            assignee: body.assignee ?? '',
            due_date: body.dueDate ?? null,
            ai_generated: body.aiGenerated ?? false,
            description: body.description ?? '',
            tenant_id: 'tenone',
        })
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: rowToItem(data) });
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) update.title = body.title;
    if (body.type !== undefined) update.type = body.type.toLowerCase();
    if (body.stage !== undefined) update.stage = body.stage.toLowerCase();
    if (body.brandId !== undefined) update.brand_id = body.brandId;
    if (body.assignee !== undefined) update.assignee = body.assignee;
    if (body.dueDate !== undefined) update.due_date = body.dueDate || null;
    if (body.aiGenerated !== undefined) update.ai_generated = body.aiGenerated;
    if (body.description !== undefined) update.description = body.description;

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('content_pipeline')
        .update(update)
        .eq('id', body.id)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: rowToItem(data) });
}
