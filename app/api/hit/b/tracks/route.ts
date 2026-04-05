import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industryId = searchParams.get('industry');
    const jobFunctionId = searchParams.get('jobFunction');

    const supabase = createClient();

    // 산업군 목록
    if (!industryId && !jobFunctionId) {
      const [{ data: industries }, { data: jobFunctions }] = await Promise.all([
        supabase.from('hit_industries').select('id, name_ko, icon').eq('is_active', true).order('display_order'),
        supabase.from('hit_job_functions').select('id, name_ko, icon').eq('is_active', true).order('display_order'),
      ]);
      return successResponse({ industries: industries || [], jobFunctions: jobFunctions || [] });
    }

    // 매칭 트랙 조회
    if (industryId && jobFunctionId) {
      const { data: tracks } = await supabase
        .from('hit_competency_tracks')
        .select('id, name_ko, description, is_active')
        .eq('industry_id', industryId)
        .eq('job_function_id', jobFunctionId);

      return successResponse({ tracks: tracks || [] });
    }

    return errorResponse('industry와 jobFunction 둘 다 필요합니다.', 400);
  } catch (error) {
    console.error('[HIT B Tracks]:', error);
    return errorResponse('조회 실패', 500);
  }
}
