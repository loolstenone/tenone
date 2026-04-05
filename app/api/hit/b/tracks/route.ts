import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industryId = searchParams.get('industry');
    const jobFunctionId = searchParams.get('jobFunction');

    const supabase = createClient();

    // 산업군 + 직군 목록
    if (!industryId && !jobFunctionId) {
      const [{ data: industries }, { data: jobFunctions }] = await Promise.all([
        supabase.from('hit_industries').select('id, name_ko').eq('is_active', true).order('display_order'),
        supabase.from('hit_job_functions').select('id, name_ko').eq('is_active', true).order('display_order'),
      ]);
      return successResponse({ industries: industries || [], jobFunctions: jobFunctions || [] });
    }

    // 트랙 매칭 (3단계 폴백)
    if (industryId && jobFunctionId) {
      // 1단계: 산업×직군 전용 트랙
      const { data: specificTracks } = await supabase
        .from('hit_competency_tracks')
        .select('id, name_ko, description, is_active, is_generic')
        .eq('industry_id', industryId)
        .eq('job_function_id', jobFunctionId)
        .eq('is_active', true);

      if (specificTracks && specificTracks.length > 0) {
        return successResponse({ tracks: specificTracks, matchType: 'specific' });
      }

      // 2단계: 직군 범용 폴백 트랙
      const { data: fallbackTracks } = await supabase
        .from('hit_competency_tracks')
        .select('id, name_ko, description, is_active, is_generic')
        .eq('fallback_for_job_fn', jobFunctionId)
        .eq('is_active', true);

      if (fallbackTracks && fallbackTracks.length > 0) {
        return successResponse({ tracks: fallbackTracks, matchType: 'fallback' });
      }

      // 3단계: 트랙 없음
      return successResponse({ tracks: [], matchType: 'none' });
    }

    return errorResponse('industry와 jobFunction 둘 다 필요합니다.', 400);
  } catch (error) {
    console.error('[HIT B Tracks]:', error);
    return errorResponse('조회 실패', 500);
  }
}
