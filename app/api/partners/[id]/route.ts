import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from('partners').select('*').eq('id', id).single();
    if (error) return errorResponse('파트너를 찾을 수 없습니다.', 404);
    return successResponse(data);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase.from('partners').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data);
}
