import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/projects/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from('projects')
        .select('*, pm:members!pm_id(id, name, avatar_initials), jobs(*), project_members(*, member:members(id, name, avatar_initials, department))')
        .eq('id', id).single();
    if (error) return errorResponse('프로젝트를 찾을 수 없습니다.', 404);
    return successResponse(data);
}

// PATCH /api/projects/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    if (body.billing !== undefined || body.external_cost !== undefined || body.internal_cost !== undefined) {
        body.revenue = (body.billing || 0) - (body.external_cost || 0);
        body.profit = body.revenue - (body.internal_cost || 0);
    }

    const { data, error } = await supabase.from('projects')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data);
}

// DELETE /api/projects/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return errorResponse(error.message);
    return successResponse({ message: '삭제 완료' });
}
