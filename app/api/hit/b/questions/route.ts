import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createAdminClient as createClient } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/api-guard';

type RawQuestion = { id: string; question_text: string; sub_domain: string; reverse_scored: boolean; track_id: string | null };

function mapQ(q: RawQuestion) {
  return { id: q.id, text: q.question_text, subscale: q.sub_domain, reverse: q.reverse_scored || false, track: q.track_id };
}

/**
 * GET /api/hit/b/questions?trackId=
 * HIT B "역량과 방향" (2026-10-12 재정의): competency(핵심 30 + 트랙 30) · efficacy 36 · career_insight 16
 * 회원 전용
 */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  try {
    const trackId = request.nextUrl.searchParams.get('trackId');
    const supabase = createClient();
    const sel = 'id, question_text, sub_domain, reverse_scored, track_id';
    const base = () => supabase.from('hit_questions').select(sel).eq('test_type', 'B');

    const trackQuery = trackId
      ? base().eq('module', 'competency').eq('track_id', trackId).order('question_index')
      : Promise.resolve({ data: [] as RawQuestion[] });

    const [{ data: core }, { data: track }, { data: efficacy }, { data: insight }] = await Promise.all([
      base().eq('module', 'competency_core').order('question_index'),
      trackQuery,
      base().eq('module', 'efficacy').order('question_index'),
      base().eq('module', 'career_insight').order('question_index'),
    ]);

    return successResponse({
      competency: [...((core as RawQuestion[]) || []).map(mapQ), ...((track as RawQuestion[]) || []).map(mapQ)],
      efficacy: ((efficacy as RawQuestion[]) || []).map(mapQ),
      insight: ((insight as RawQuestion[]) || []).map(mapQ),
      trackId: trackId || null,
    });
  } catch (error) {
    console.error('[HIT B Questions]:', error);
    return errorResponse('문항 로드 실패', 500);
  }
}
