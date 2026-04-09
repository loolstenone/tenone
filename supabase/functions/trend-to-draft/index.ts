/**
 * trend-to-draft — 최근 트렌드 → content_drafts 자동 변환
 *
 * 스케줄: cron "30 * * * *" (매시간 30분, trend-crawl 30분 후)
 *
 * 흐름:
 *   1. mindle_trends(published, 최근 24시간) 조회
 *   2. 이미 content_drafts에 있는 trend_id 제외 (중복 방지)
 *   3. 신규 트렌드 → content_drafts insert (stage='draft', ai_generated=true)
 *   4. 결과 agent_messages에 기록
 */

import { createClient } from 'npm:@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (_req) => {
  const startAt = Date.now();

  try {
    // ── 1. 최근 24시간 발행된 트렌드 ────────────────────────────
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: trends, error: trendErr } = await supabase
      .from('mindle_trends')
      .select('id, title, summary, full_content, category, relevance_score, source_urls')
      .eq('status', 'published')
      .gte('published_at', since)
      .order('relevance_score', { ascending: false });

    if (trendErr) throw new Error(`mindle_trends 조회 실패: ${trendErr.message}`);
    if (!trends || trends.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, message: '최근 24시간 신규 트렌드 없음', drafted: 0 }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    // ── 2. 이미 초안화된 trend_id 조회 ──────────────────────────
    const { data: existing } = await supabase
      .from('content_drafts')
      .select('source_data')
      .eq('target_brand', 'mindle')
      .not('source_data', 'is', null);

    const existingTrendIds = new Set<string>(
      (existing || [])
        .map((d: { source_data: Record<string, unknown> | null }) => d.source_data?.trend_id as string)
        .filter(Boolean),
    );

    // ── 3. 신규 트렌드만 초안 생성 ──────────────────────────────
    const newTrends = trends.filter((t) => !existingTrendIds.has(t.id));
    let drafted = 0;
    const errors: string[] = [];

    for (const trend of newTrends) {
      const { error: insertErr } = await supabase.from('content_drafts').insert({
        title: trend.title,
        body: trend.full_content || trend.summary || '',
        target_brand: 'mindle',
        target_format: 'trend_card',
        status: 'draft',
        source_data: {
          trend_id: trend.id,
          category: trend.category,
          summary: trend.summary,
          relevance_score: trend.relevance_score,
          source_urls: trend.source_urls,
        },
        tenant_id: 'tenone',
      });

      if (insertErr) {
        errors.push(`${trend.title.slice(0, 30)}: ${insertErr.message}`);
      } else {
        drafted++;
      }
    }

    const elapsed = Date.now() - startAt;

    // ── 4. 결과 기록 ─────────────────────────────────────────────
    await supabase.from('agent_messages').insert({
      from_agent: 'mindle',
      to_agent: '1001',
      message_type: 'vrief',
      payload: {
        type: 'trend_to_draft',
        trendsFound: trends.length,
        alreadyDrafted: existingTrendIds.size,
        newDrafted: drafted,
        errors,
        elapsedMs: elapsed,
        executedAt: new Date().toISOString(),
      },
      risk_level: errors.length > 0 ? 'yellow' : 'green',
      correlation_id: crypto.randomUUID(),
    });

    return new Response(
      JSON.stringify({ ok: true, trendsFound: trends.length, drafted, skipped: newTrends.length - drafted, errors }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[trend-to-draft] 오류:', err);

    await supabase.from('agent_messages').insert({
      from_agent: 'mindle',
      to_agent: '1001',
      message_type: 'error',
      payload: { type: 'trend_to_draft_error', error: String(err) },
      risk_level: 'yellow',
      correlation_id: crypto.randomUUID(),
    });

    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
