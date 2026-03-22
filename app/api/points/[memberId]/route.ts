import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// 특정 멤버 포인트 이력 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ memberId: string }> }
) {
    const supabase = await createClient();
    const { memberId } = await params;

    const { data, error, count } = await supabase
        .from('point_logs')
        .select('*', { count: 'exact' })
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

    if (error) return errorResponse(error.message);
    return successResponse({ data, total: count });
}
