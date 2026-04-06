/**
 * daily-gpr — 매일 PM 18:00 GPR 수합 브리핑 자동 생성
 *
 * 스케줄: cron "0 9 * * *" (UTC 09:00 = KST 18:00)
 *
 * 흐름:
 *   1. wio_gpr에서 진행중(in_progress) GPR 현황 조회
 *   2. gpr_goals에서 이번 분기 목표 달성률 조회
 *   3. Claude API(1001 시스템 프롬프트)로 PM 브리핑 생성
 *   4. agent_messages에 gpr 타입으로 저장
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

function todayKST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
}

function currentQuarter(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${q}`;
}

Deno.serve(async (_req) => {
  try {
    const today = todayKST();
    const quarter = currentQuarter();

    // ── 1. 진행중 GPR 현황 조회 ────────────────────────────────────
    const { data: gprs } = await supabase
      .from('wio_gpr')
      .select('level, goal, plan, result, score, status, period')
      .in('status', ['in_progress', 'pending', 'review'])
      .order('level', { ascending: true });

    const gprSummary = gprs?.length
      ? gprs.map((g) =>
          `[${g.level}] ${g.goal} — 상태: ${g.status}, 점수: ${g.score ?? '미평가'}${g.result ? `, 결과: ${g.result}` : ''}`
        ).join('\n')
      : '진행중인 GPR 없음';

    // ── 2. 이번 분기 목표 달성률 ────────────────────────────────────
    const { data: goals } = await supabase
      .from('gpr_goals')
      .select('title, target_value, current_value, weight, status, category')
      .eq('quarter', quarter)
      .order('weight', { ascending: false });

    let goalSummary = '이번 분기 목표 없음';
    let overallProgress = 0;

    if (goals?.length) {
      const totalWeight = goals.reduce((sum, g) => sum + (g.weight || 0), 0);
      const weightedProgress = goals.reduce((sum, g) => {
        const progress = g.target_value > 0
          ? Math.min((g.current_value / g.target_value) * 100, 100)
          : 0;
        return sum + progress * (g.weight || 0);
      }, 0);
      overallProgress = totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;

      goalSummary = goals.map((g) => {
        const pct = g.target_value > 0
          ? Math.round((g.current_value / g.target_value) * 100)
          : 0;
        return `${g.title} (${g.category || '일반'}): ${g.current_value}/${g.target_value} (${pct}%) [가중치 ${g.weight}%]`;
      }).join('\n');
    }

    // ── 3. 1001 시스템 프롬프트 로드 ────────────────────────────
    const { data: profile } = await supabase
      .from('agent_profiles')
      .select('system_prompt')
      .eq('name', '1001')
      .single();

    const systemPrompt = profile?.system_prompt ??
      '당신은 Ten:One Universe의 오케스트레이터 열시일분입니다.';

    // ── 4. PM 브리핑 생성 ───────────────────────────────────────────
    const gprPrompt =
      `[PM 18:00 Daily GPR 브리핑 — ${today}]\n\n` +
      `진행중 GPR (${gprs?.length ?? 0}건):\n${gprSummary}\n\n` +
      `${quarter} 분기 목표 달성률: ${overallProgress}%\n${goalSummary}\n\n` +
      `위 정보를 바탕으로 텐원(대표)에게 전달할 PM GPR 브리핑을 작성하라.\n` +
      `형식: 3-5줄 핵심 요약 → 주의 필요 항목 → 내일 우선순위 제안 1가지.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: gprPrompt }],
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
        message_type: 'gpr',
        payload: {
          date: today,
          quarter,
          briefing: briefingText,
          gprCount: gprs?.length ?? 0,
          goalCount: goals?.length ?? 0,
          overallProgress,
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
        quarter,
        messageId: saved?.id,
        overallProgress,
        preview: briefingText.slice(0, 100) + '...',
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[daily-gpr] 오류:', err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
