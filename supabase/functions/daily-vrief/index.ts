/**
 * daily-vrief — 매일 오전 10:01 Universe 브리핑 자동 생성
 *
 * 스케줄: cron "1 1 * * *" (UTC 01:01 = KST 10:01)
 *
 * 흐름:
 *   1. agent_profiles에서 활성 에이전트 현황 조회
 *   2. mindle_trends에서 오늘 트렌드 top 3 조회
 *   3. Claude API(1001 시스템 프롬프트)로 브리핑 생성
 *   4. agent_messages에 vrief 타입으로 저장
 *   5. (선택) 알림 채널 발송
 */

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
});

// KST 날짜 문자열
function todayKST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
}

Deno.serve(async (_req) => {
  try {
    const today = todayKST();

    // ── 1. 에이전트 현황 조회 ────────────────────────────────────
    const { data: agents } = await supabase
      .from('agent_profiles')
      .select('name, display_name, is_active, layer, risk_level')
      .order('layer', { ascending: true });

    const activeCount = agents?.filter((a) => a.is_active).length ?? 0;
    const agentSummary = agents
      ?.map((a) => `${a.display_name}(L${a.layer}): ${a.is_active ? 'ON' : 'OFF'}`)
      .join(', ') ?? '정보 없음';

    // ── 2. 오늘 트렌드 top 3 ────────────────────────────────────
    const { data: trends } = await supabase
      .from('mindle_trends')
      .select('title, summary, tags')
      .gte('published_at', today)
      .order('published_at', { ascending: false })
      .limit(3);

    const trendSummary = trends?.length
      ? trends.map((t, i) => `${i + 1}. ${t.title}${t.summary ? ` — ${t.summary}` : ''}`).join('\n')
      : '오늘 수집된 트렌드 없음';

    // ── 3. 1001 시스템 프롬프트 로드 ────────────────────────────
    const { data: profile } = await supabase
      .from('agent_profiles')
      .select('system_prompt')
      .eq('name', '1001')
      .single();

    const systemPrompt = profile?.system_prompt ??
      '당신은 Ten:One Universe의 오케스트레이터 열시일분입니다.';

    // ── 4. 브리핑 생성 ───────────────────────────────────────────
    const vriefPrompt =
      `[AM 10:01 Daily Vrief — ${today}]\n\n` +
      `에이전트 현황 (${activeCount}개 활성):\n${agentSummary}\n\n` +
      `오늘의 트렌드:\n${trendSummary}\n\n` +
      `위 정보를 바탕으로 텐원(대표)에게 전달할 간결한 AM 브리핑을 작성하라.\n` +
      `형식: 3-5줄 핵심 요약 → 오늘의 Universe 방향 제안 1가지.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: vriefPrompt }],
    });

    const briefingText = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n');

    // ── 5. agent_messages에 저장 ─────────────────────────────────
    const { data: saved, error: saveErr } = await supabase
      .from('agent_messages')
      .insert({
        from_agent: '1001',
        to_agent: 'user',
        message_type: 'vrief',
        payload: {
          date: today,
          briefing: briefingText,
          agentCount: activeCount,
          trendCount: trends?.length ?? 0,
          trends: trends ?? [],
        },
        risk_level: 'green',
        correlation_id: crypto.randomUUID(),
      })
      .select('id')
      .single();

    if (saveErr) throw saveErr;

    return new Response(
      JSON.stringify({
        ok: true,
        date: today,
        messageId: saved?.id,
        preview: briefingText.slice(0, 100) + '...',
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[daily-vrief] 오류:', err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
