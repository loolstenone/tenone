import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAuth } from '@/lib/supabase/api-utils';

// GET /api/projects (인증 필요)
export async function GET() {
    const { supabase, error: authErr } = await requireAuth();
    if (authErr) return authErr;

    const { data, error, count } = await supabase!.from('projects')
        .select('*, pm:members!pm_id(id, name, avatar_initials)', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (error) return errorResponse('Failed to fetch projects', 500);
    return successResponse({ data, total: count });
}

// POST /api/projects (인증 필요)
export async function POST(request: NextRequest) {
    const { supabase, error: authErr } = await requireAuth();
    if (authErr) return authErr;

    const body = await request.json();

    if (!body.name) {
        return errorResponse('name is required');
    }

    // 프로젝트 코드 자동 생성
    if (!body.code) {
        const year = new Date().getFullYear();
        const { count } = await supabase!.from('projects').select('*', { count: 'exact', head: true });
        body.code = `PRJ-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
    }

    // 매출/이익 자동 계산 (숫자 검증)
    const billing = Number(body.billing) || 0;
    const externalCost = Number(body.external_cost) || 0;
    const internalCost = Number(body.internal_cost) || 0;
    body.revenue = billing - externalCost;
    body.profit = body.revenue - internalCost;

    const { data, error } = await supabase!.from('projects').insert(body).select().single();
    if (error) return errorResponse('Failed to create project', 500);
    return successResponse(data, 201);
}
