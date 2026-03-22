import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

// 포인트 리더보드 (멤버별 총 포인트 순위)
export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('member_point_summary')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(50);

    if (error) return errorResponse(error.message);
    return successResponse({ data });
}
