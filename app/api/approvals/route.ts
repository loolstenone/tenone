import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/approvals
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const requesterId = searchParams.get('requesterId');
    const factor = searchParams.get('factor');

    let query = supabase.from('approvals')
        .select('*, requester:members!requester_id(id, name, avatar_initials)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (requesterId) query = query.eq('requester_id', requesterId);
    if (factor) query = query.eq('factor', factor);

    const { data, error, count } = await query.order('created_at', { ascending: false });
    if (error) return errorResponse(error.message);
    return successResponse({ data, total: count });
}

// POST /api/approvals
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();

    // 문서번호 자동 생성
    if (!body.doc_no) {
        const year = new Date().getFullYear();
        const { count } = await supabase.from('approvals').select('*', { count: 'exact', head: true });
        body.doc_no = `APR-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
    }

    const { data, error } = await supabase.from('approvals').insert(body).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}
