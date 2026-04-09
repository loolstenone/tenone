import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId'); // null이면 공통 문항만

    const supabase = createClient();

    // 역량 문항: 공통(track_id IS NULL) + 트랙별
    let compQuery = supabase
      .from('hit_questions')
      .select('id, question_text, sub_domain, reverse_scored, track_id')
      .eq('module', 'competency')
      .order('question_index');

    if (trackId) {
      compQuery = compQuery.or(`track_id.is.null,track_id.eq.${trackId}`);
    } else {
      compQuery = compQuery.is('track_id', null);
    }

    // 준비도 문항: 공통 + 트랙별
    let readyQuery = supabase
      .from('hit_questions')
      .select('id, question_text, sub_domain, reverse_scored, track_id')
      .eq('module', 'readiness')
      .order('question_index');

    if (trackId) {
      readyQuery = readyQuery.or(`track_id.is.null,track_id.eq.${trackId}`);
    } else {
      readyQuery = readyQuery.is('track_id', null);
    }

    const [{ data: compQuestions }, { data: readyQuestions }] = await Promise.all([
      compQuery,
      readyQuery,
    ]);

    return successResponse({
      competency: ((compQuestions || []) as Record<string, unknown>[]).map(q => ({
        id: q.id,
        text: q.question_text,
        subscale: q.sub_domain,
        reverse: (q.reverse_scored as boolean) || false,
        track: q.track_id,
      })),
      readiness: ((readyQuestions || []) as Record<string, unknown>[]).map(q => ({
        id: q.id,
        text: q.question_text,
        subscale: q.sub_domain,
        reverse: (q.reverse_scored as boolean) || false,
        track: q.track_id,
      })),
      trackId: trackId || null,
    });
  } catch (error) {
    console.error('[HIT B Questions]:', error);
    return errorResponse('문항 로드 실패', 500);
  }
}
