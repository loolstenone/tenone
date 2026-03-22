import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// PATCH /api/approvals/[id] — 승인/반려 처리
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase.from('approvals')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id).select().single();

    if (error) return errorResponse(error.message);
    return successResponse(data);
}
