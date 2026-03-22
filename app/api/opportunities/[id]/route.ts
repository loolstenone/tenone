import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/opportunities/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from('opportunities').select('*, assignee:members!assigned_to(id, name)').eq('id', id).single();
    if (error) return errorResponse('기회를 찾을 수 없습니다.', 404);
    return successResponse(data);
}

// PATCH /api/opportunities/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase.from('opportunities')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data);
}

// DELETE /api/opportunities/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    if (error) return errorResponse(error.message);
    return successResponse({ message: '삭제 완료' });
}
