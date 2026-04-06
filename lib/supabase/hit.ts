/**
 * HIT 검사 Supabase CRUD
 */
import { createClient } from './client';

const supabase = createClient();

// ── 세션 ──

export async function createHitSession(testType: 'A' | 'B' | 'C' | 'D' | 'E' | 'F', memberId?: string) {
  const sessionToken = crypto.randomUUID();
  const firstModule: Record<string, string> = {
    A: 'base',
    B: 'personality',
    C: 'capital',
    D: 'expertise',
    E: 'satisfaction',
    F: 'break_context',
  };
  const { data, error } = await supabase
    .from('hit_sessions')
    .insert({
      session_token: sessionToken,
      test_type: testType,
      member_id: memberId || null,
      status: 'in_progress',
      current_module: firstModule[testType] || 'base',
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

// ── HIT B 모듈 ──

export async function getReportModules(moduleIds: string[]) {
  const { data, error } = await supabase
    .from('hit_report_modules')
    .select('*')
    .in('id', moduleIds);
  if (error) throw error;
  return data || [];
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
  // 클라이언트용: dark_triad, alert 필드 제외된 safe 뷰
  const { data, error } = await supabase
    .from('hit_b_results_safe')
    .select('*')
    .eq('id', resultId)
    .maybeSingle();
  // safe 뷰가 없으면 원본 테이블 fallback
  if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
    const { data: fallback, error: fbErr } = await supabase
      .from('hit_b_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
    if (fbErr) throw fbErr;
    return fallback;
  }
  if (error) throw error;
  return data;
}

/** 서버사이드 전용 — 원본 테이블 (alert/dark_triad 포함) */
export async function getHitBResultFull(resultId: string) {
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

// ── HIT C 결과 ──

export async function createHitCResult(result: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('hit_c_results')
    .insert(result)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHitCResult(resultId: string) {
  const { data, error } = await supabase
    .from('hit_c_results')
    .select('*')
    .eq('id', resultId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ── HIT D 결과 ──

export async function createHitDResult(result: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('hit_d_results')
    .insert(result)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHitDResult(resultId: string) {
  const { data, error } = await supabase
    .from('hit_d_results')
    .select('*')
    .eq('id', resultId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ── HIT E 결과 ──

export async function createHitEResult(result: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('hit_e_results')
    .insert(result)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHitEResult(resultId: string) {
  const { data, error } = await supabase
    .from('hit_e_results')
    .select('*')
    .eq('id', resultId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ── HIT F 결과 ──

export async function createHitFResult(result: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('hit_f_results')
    .insert(result)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHitFResult(resultId: string) {
  const { data, error } = await supabase
    .from('hit_f_results')
    .select('*')
    .eq('id', resultId)
    .maybeSingle();
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
