/**
 * HIT 검사 Supabase CRUD
 */
import { createClient } from './client';

const supabase = createClient();

// ── 세션 ──

export async function createHitSession(testType: 'A' | 'B', memberId?: string) {
  const sessionToken = crypto.randomUUID();
  const { data, error } = await supabase
    .from('hit_sessions')
    .insert({
      session_token: sessionToken,
      test_type: testType,
      member_id: memberId || null,
      status: 'in_progress',
      current_module: testType === 'A' ? 'base' : 'personality',
      current_index: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHitSession(sessionToken: string) {
  const { data, error } = await supabase
    .from('hit_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateHitSession(sessionToken: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('hit_sessions')
    .update(updates)
    .eq('session_token', sessionToken);
  if (error) throw error;
}

// ── 응답 ──

export async function upsertHitResponse(data: {
  sessionId: string;
  module: string;
  questionId: string;
  questionIndex: number;
  selectedOption: number;
  optionValue: string;
  responseTimeMs?: number;
}) {
  const { error } = await supabase
    .from('hit_responses')
    .upsert({
      session_id: data.sessionId,
      module: data.module,
      question_id: data.questionId,
      question_index: data.questionIndex,
      selected_option: data.selectedOption,
      option_value: data.optionValue,
      response_time_ms: data.responseTimeMs || null,
      answered_at: new Date().toISOString(),
    }, { onConflict: 'session_id,question_id' });
  if (error) console.error('upsertHitResponse:', error.message);
}

export async function getHitResponses(sessionId: string) {
  const { data, error } = await supabase
    .from('hit_responses')
    .select('*')
    .eq('session_id', sessionId)
    .order('question_index');
  if (error) throw error;
  return data || [];
}

// ── 결과 ──

export async function createHitAResult(result: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('hit_a_results')
    .insert(result)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHitAResult(resultId: string) {
  const { data, error } = await supabase
    .from('hit_a_results')
    .select('*')
    .eq('id', resultId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ── 유형별 보고서 ──

export async function getHeroType(typeCode: string) {
  const { data, error } = await supabase
    .from('hit_hero_types')
    .select('*')
    .eq('type_code', typeCode)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ── HIT B 결과 ──

export async function createHitBResult(result: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('hit_b_results')
    .insert(result)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHitBResult(resultId: string) {
  const { data, error } = await supabase
    .from('hit_b_results')
    .select('*')
    .eq('id', resultId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getHitAResultBySession(sessionToken: string) {
  // 해당 사용자의 완료된 HIT A 세션을 찾아서 결과를 반환
  const { data: session } = await supabase
    .from('hit_sessions')
    .select('id, member_id')
    .eq('session_token', sessionToken)
    .eq('test_type', 'A')
    .eq('status', 'completed')
    .maybeSingle();

  if (!session) return null;

  const { data, error } = await supabase
    .from('hit_a_results')
    .select('*')
    .eq('session_id', session.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getLatestHitAResult(memberId?: string) {
  // member_id 기반으로 가장 최근 완료된 HIT A 결과를 반환
  let query = supabase
    .from('hit_a_results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (memberId) {
    query = query.eq('member_id', memberId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

// ── Hero Profile ──

export async function upsertHeroProfile(data: Record<string, unknown>) {
  const { error } = await supabase
    .from('hero_profiles')
    .upsert(data, { onConflict: 'member_id' });
  if (error) throw error;
}
