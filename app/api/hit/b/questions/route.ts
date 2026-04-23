import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createClient } from '@/lib/supabase/client';

type RawQuestion = { id: string; question_text: string; sub_domain: string; reverse_scored: boolean; track_id: string | null };

function mapQ(q: RawQuestion) {
  return { id: q.id, text: q.question_text, subscale: q.sub_domain, reverse: q.reverse_scored || false, track: q.track_id };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId');

    const supabase = createClient();
    const sel = 'id, question_text, sub_domain, reverse_scored, track_id';

    // competency_core(공통 18) + 트랙별 30 = 최대 48문항
    let trackCompQuery = supabase.from('hit_questions').select(sel)
      .eq('test_type', 'B').eq('module', 'competency').order('question_index');
    // readiness: track=NULL 공통 문항만 사용
    const readyQuery = supabase.from('hit_questions').select(sel)
      .eq('test_type', 'B').eq('module', 'readiness').is('track_id', null).order('question_index');

    if (trackId) {
      trackCompQuery = trackCompQuery.eq('track_id', trackId);
    } else {
      trackCompQuery = trackCompQuery.is('track_id', null);  // 트랙 없으면 빈 배열
    }

    const [
      { data: personalityData },
      { data: riasecData },
      { data: coreCompData },
      { data: trackCompData },
      { data: readyData },
    ] = await Promise.all([
      supabase.from('hit_questions').select(sel).eq('test_type', 'B').eq('module', 'personality').order('question_index'),
      supabase.from('hit_questions').select(sel).eq('test_type', 'B').eq('module', 'riasec').order('question_index'),
      supabase.from('hit_questions').select(sel).eq('test_type', 'B').eq('module', 'competency_core').order('question_index'),
      trackCompQuery,
      readyQuery,
    ]);

    return successResponse({
      personality: (personalityData as RawQuestion[] || []).map(mapQ),
      riasec: (riasecData as RawQuestion[] || []).map(mapQ),
      // competency_core + 트랙별 = UI에서는 하나의 'competency' 배열로 합산
      competency: [
        ...(coreCompData as RawQuestion[] || []).map(mapQ),
        ...(trackCompData as RawQuestion[] || []).map(mapQ),
      ],
      readiness: (readyData as RawQuestion[] || []).map(mapQ),
      trackId: trackId || null,
    });
  } catch (error) {
    console.error('[HIT B Questions]:', error);
    return errorResponse('문항 로드 실패', 500);
  }
}
