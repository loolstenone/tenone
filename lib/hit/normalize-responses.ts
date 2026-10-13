/**
 * HIT 응답 정규화 — 채점 전에 문항의 모듈·척도(sub_domain)·역채점을 DB hit_questions에서 다시 붙인다 (2026-10-13).
 * 브라우저가 보낸 option_value('척도:점수[:r]')에서는 점수만 믿는다 — 척도·r 표시는 화면 코드가 바뀌거나 조작되면 어긋난다.
 * trackId를 주면 트랙 전용 문항(track_id 있음)은 그 트랙 것만 남긴다 (도중에 트랙을 바꾼 세션에서 점수가 섞이던 것 방지).
 * 결과 option_value는 채점 함수가 읽는 '척도:점수[:r]' 형식 그대로.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export interface RawResponse { question_id: string; module: string; option_value: string }
export interface NormalizedResponse { question_id: string; module: string; option_value: string; track_id: string | null }

export async function normalizeHitResponses(
  sb: SupabaseClient,
  testType: string,
  raw: RawResponse[],
  opts: { trackId?: string | null } = {},
): Promise<NormalizedResponse[]> {
  if (raw.length === 0) return [];
  const { data } = await sb
    .from('hit_questions')
    .select('id, module, sub_domain, reverse_scored, track_id')
    .eq('test_type', testType)
    .in('id', raw.map(r => r.question_id));
  const meta = new Map((data ?? []).map(q => [q.id as string, q as { module: string; sub_domain: string | null; reverse_scored: boolean | null; track_id: string | null }]));
  return raw.flatMap(r => {
    const m = meta.get(r.question_id);
    if (!m?.sub_domain) return [];
    if (m.track_id && opts.trackId && m.track_id !== opts.trackId) return [];
    const parts = String(r.option_value).split(':'); // '척도:점수[:r]' 또는 '점수'
    const value = parseInt(parts.length >= 2 ? parts[1] : parts[0], 10);
    if (isNaN(value) || value < 1 || value > 7) return [];
    return [{ question_id: r.question_id, module: m.module, track_id: m.track_id, option_value: `${m.sub_domain}:${value}${m.reverse_scored ? ':r' : ''}` }];
  });
}
