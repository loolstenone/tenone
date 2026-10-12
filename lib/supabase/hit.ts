/**
 * HIT 검사 Supabase CRUD — 서버 전용 (app/api/hit/* 에서만 사용)
 * 검사 테이블은 본인·직원만 읽을 수 있으므로(RLS) 비회원 검사 흐름은 서버가 서비스 롤로 처리한다.
 */
import type { NextRequest } from 'next/server';
import { createAdminClient } from './admin';
import { getApiUser, requireMember } from '@/lib/api-guard';
import { errorResponse } from './api-utils';

const supabase = createAdminClient();

// ── 세션 ──

export async function createHitSession(testType: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'GAP', memberId?: string) {
  const sessionToken = crypto.randomUUID();
  const firstModule: Record<string, string> = {
    A: 'base',
    B: 'competency_core',
    C: 'readiness',
    D: 'careerCapital',
    E: 'expertise',
    F: 'satisfaction',
    GAP: 'latent_capability',
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

type HitTestType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'GAP';

/** 이어하기 대상 기간 — 이보다 오래된 진행 중 세션은 새로 시작 (2026-10-12) */
const RESUME_WINDOW_DAYS = 30;

/** 회원의 가장 최근 진행 중 세션 — 검사 중단 후 다른 기기에서도 이어하기 (2026-10-12) */
export async function getLatestInProgressHitSession(testType: HitTestType, memberId: string) {
  const since = new Date(Date.now() - RESUME_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('hit_sessions')
    .select('id, session_token, status, created_at')
    .eq('test_type', testType)
    .eq('member_id', memberId)
    .eq('status', 'in_progress')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

/**
 * 세션 시작 — 진행 중 세션이 있으면 그것을 돌려주고(이어하기), restart면 옛 세션을 abandoned로 닫고 새로 만든다 (2026-10-12)
 * 닫는 것은 본인의 같은 검사 진행 중 세션뿐. 응답 row는 보존한다.
 */
export async function startOrResumeHitSession(testType: HitTestType, memberId: string, restart = false) {
  if (!restart) {
    const existing = await getLatestInProgressHitSession(testType, memberId);
    if (existing) return { sessionId: existing.id as string, sessionToken: existing.session_token as string, resumed: true };
  } else {
    await supabase
      .from('hit_sessions')
      .update({ status: 'abandoned' })
      .eq('test_type', testType)
      .eq('member_id', memberId)
      .eq('status', 'in_progress');
  }
  const created = await createHitSession(testType, memberId);
  return { sessionId: created.id as string, sessionToken: created.session_token as string, resumed: false };
}

/** GET /session 공용 — 로그인 회원의 진행 중 세션 토큰 + 답변 수 (이어서 하기 제안용, 비회원은 null) */
export async function getResumeInfo(request: NextRequest, testType: HitTestType) {
  const memberId = (await getApiUser(request))?.memberId;
  if (!memberId) return { sessionToken: null, answered: 0 };
  const s = await getLatestInProgressHitSession(testType, memberId);
  if (!s) return { sessionToken: null, answered: 0 };
  const { count } = await supabase.from('hit_responses').select('id', { count: 'exact', head: true }).eq('session_id', s.id);
  return { sessionToken: s.session_token as string, answered: count ?? 0 };
}

/** GET /session/[token] 공용 — 세션 소유 회원만 조회. member_id는 응답에서 뺀다 (2026-10-12) */
export async function getOwnedHitSessionPayload(request: NextRequest, token: string) {
  const auth = await requireMember(request);
  if (auth instanceof Response) return { error: auth };
  const session = await getHitSession(token);
  // 남의 세션도 '없음'과 같은 응답 — 토큰 존재 여부를 알려주지 않는다
  if (!session || session.member_id !== auth.memberId) return { error: errorResponse('세션을 찾을 수 없습니다.', 404) };
  const responses = await getHitResponses(session.id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { member_id: _omit, ...safeSession } = session;
  return { payload: { session: safeSession, responses } };
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

// ── HIT C 결과 (진입 — 2026-10-12 신설) ──

export async function createHitCResult(result: Record<string, unknown>) {
  const { data, error } = await supabase.from('hit_c_results').insert(result).select().single();
  if (error) throw error;
  return data;
}

export async function getHitCResult(resultId: string) {
  const { data, error } = await supabase.from('hit_c_results').select('*').eq('id', resultId).maybeSingle();
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

// ── HIT GAP 결과 ──

export async function createHitGapResult(result: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('hit_gap_results')
    .insert(result)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHitGapResult(resultId: string) {
  const { data, error } = await supabase
    .from('hit_gap_results')
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
