import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/api-guard';

type RawQuestion = { id: string; question_text: string; sub_domain: string; reverse_scored: boolean; track_id: string | null };
const mapQ = (q: RawQuestion) => ({ id: q.id, text: q.question_text, subscale: q.sub_domain, reverse: q.reverse_scored || false, track: q.track_id });

/**
 * GET /api/hit/c/questions?trackId=
 * 진입 검사: readiness(공통 36 + 트랙 12) · onboarding 20 · career_decision 10 — 회원 전용
 */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;
  try {
    const trackId = request.nextUrl.searchParams.get('trackId');
    const sb = createAdminClient();
    const sel = 'id, question_text, sub_domain, reverse_scored, track_id';
    const base = () => sb.from('hit_questions').select(sel).eq('test_type', 'C');
    const [{ data: common }, { data: track }, { data: onboarding }, { data: decision }] = await Promise.all([
      base().eq('module', 'readiness').is('track_id', null).order('question_index'),
      trackId ? base().eq('module', 'readiness').eq('track_id', trackId).order('question_index') : Promise.resolve({ data: [] as RawQuestion[] }),
      base().eq('module', 'onboarding').order('question_index'),
      base().eq('module', 'career_decision').order('question_index'),
    ]);
    return successResponse({
      readiness: [...((common as RawQuestion[]) || []), ...((track as RawQuestion[]) || [])].map(mapQ),
      onboarding: ((onboarding as RawQuestion[]) || []).map(mapQ),
      decision: ((decision as RawQuestion[]) || []).map(mapQ),
      trackId: trackId || null,
    });
  } catch (error) {
    console.error('[HIT C Questions]:', error);
    return errorResponse('문항 로드 실패', 500);
  }
}
