import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAuth } from '@/lib/supabase/api-utils';

// GET /api/points — 포인트 로그 조회 (인증 필요)
export async function GET(request: NextRequest) {
    const { supabase, error: authErr } = await requireAuth();
    if (authErr) return authErr;

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    let query = supabase!.from('point_logs').select('*', { count: 'exact' });
    if (memberId) query = query.eq('member_id', memberId);
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return errorResponse('Failed to fetch points', 500);
    return successResponse({ data, total: count });
}

// POST /api/points — 포인트 부여 (인증 필요)
export async function POST(request: NextRequest) {
    const { supabase, error: authErr } = await requireAuth();
    if (authErr) return authErr;

    const body = await request.json();

    if (!body.memberId || !body.category || body.points === undefined) {
        return errorResponse('memberId, category, points are required');
    }

    const { data, error } = await supabase!
        .from('point_logs')
        .insert({
            member_id: body.memberId,
            member_name: body.memberName,
            category: body.category,
            points: Number(body.points) || 0,
            balance: Number(body.balance) || 0,
            description: body.description,
            reference_id: body.referenceId,
            reference_type: body.referenceType,
            created_by: body.createdBy || '시스템',
        })
        .select()
        .single();

    if (error) return errorResponse('Failed to create point log', 500);
    return successResponse(data, 201);
}
