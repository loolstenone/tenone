import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// GET /api/projects
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const pmId = searchParams.get('pmId');

    let query = supabase.from('projects').select('*, pm:members!pm_id(id, name, avatar_initials)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    if (pmId) query = query.eq('pm_id', pmId);

    const { data, error, count } = await query.order('created_at', { ascending: false });
    if (error) return errorResponse(error.message);
    return successResponse({ data, total: count });
}

// POST /api/projects
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();

    // 프로젝트 코드 자동 생성
    if (!body.code) {
        const year = new Date().getFullYear();
        const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true });
        body.code = `PRJ-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
    }

    // 매출/이익 자동 계산
    body.revenue = (body.billing || 0) - (body.external_cost || 0);
    body.profit = body.revenue - (body.internal_cost || 0);

    const { data, error } = await supabase.from('projects').insert(body).select().single();
    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}
