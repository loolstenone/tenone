import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAuth } from '@/lib/supabase/api-utils';

// GET /api/approvals (인증 필요)
export async function GET() {
    const { supabase, error: authErr } = await requireAuth();
    if (authErr) return authErr;

    const { data, error, count } = await supabase!.from('approvals')
        .select('*, requester:members!requester_id(id, name, avatar_initials)', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (error) return errorResponse('Failed to fetch approvals', 500);
    return successResponse({ data, total: count });
}

// POST /api/approvals (인증 필요)
export async function POST(request: NextRequest) {
    const { supabase, error: authErr } = await requireAuth();
    if (authErr) return authErr;

    const body = await request.json();

    if (!body.title || !body.factor) {
        return errorResponse('title and factor are required');
    }

    // 문서번호 자동 생성
    if (!body.doc_no) {
        const year = new Date().getFullYear();
        const { count } = await supabase!.from('approvals').select('*', { count: 'exact', head: true });
        body.doc_no = `APR-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
    }

    const { data, error } = await supabase!.from('approvals').insert(body).select().single();
    if (error) return errorResponse('Failed to create approval', 500);
    return successResponse(data, 201);
}
