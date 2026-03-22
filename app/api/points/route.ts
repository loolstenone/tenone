import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// 포인트 로그 조회
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase.from('point_logs').select('*', { count: 'exact' });
    if (memberId) query = query.eq('member_id', memberId);
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return errorResponse(error.message);
    return successResponse({ data, total: count });
}

// 포인트 부여
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from('point_logs')
        .insert({
            member_id: body.memberId,
            member_name: body.memberName,
            category: body.category,
            points: body.points,
            balance: body.balance,
            description: body.description,
            reference_id: body.referenceId,
            reference_type: body.referenceType,
            created_by: body.createdBy || '시스템',
        })
        .select()
        .single();

    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
}
