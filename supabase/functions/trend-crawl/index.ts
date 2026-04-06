/**
 * trend-crawl — 매시간 트렌드 크롤링 + 처리
 *
 * 스케줄: cron "0 * * * *" (매시간 정각)
 *
 * 흐름:
 *   1. /api/crawler { action: "crawl" }  → RSS 수집 → collected_data 저장
 *   2. /api/crawler { action: "process" } → Claude 필터링 → mindle_trends 저장
 *   3. 결과 agent_messages에 기록
 */

import { createClient } from 'npm:@supabase/supabase-js';

const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://tenone.biz';
const ADMIN_API_KEY = Deno.env.get('ADMIN_API_KEY')!;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function callCrawlerAPI(action: 'crawl' | 'process'): Promise<{
  ok: boolean;
  result: unknown;
  error?: string;
}> {
  try {
    const res = await fetch(`${SITE_URL}/api/crawler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_API_KEY}`,
      },
      body: JSON.stringify({ action }),
      signal: AbortSignal.timeout(120_000), // 2분 타임아웃
    });

    const json = await res.json();
    return { ok: res.ok, result: json };
  } catch (err) {
    return { ok: false, result: null, error: String(err) };
  }
}

Deno.serve(async (_req) => {
  const startAt = Date.now();

  try {
    // ── Step 1: RSS 수집 ─────────────────────────────────────────
    const crawlResult = await callCrawlerAPI('crawl');
    if (!crawlResult.ok) {
      throw new Error(`크롤링 실패: ${crawlResult.error ?? JSON.stringify(crawlResult.result)}`);
    }

    // ── Step 2: Claude 트렌드 카드 생성 ─────────────────────────
    const processResult = await callCrawlerAPI('process');
    if (!processResult.ok) {
      throw new Error(`처리 실패: ${processResult.error ?? JSON.stringify(processResult.result)}`);
    }

    const elapsed = Date.now() - startAt;

    // ── Step 3: 실행 기록 ────────────────────────────────────────
    await supabase.from('agent_messages').insert({
      from_agent: 'mindle',
      to_agent: '1001',
      message_type: 'vrief',
      payload: {
        type: 'trend_crawl',
        crawl: crawlResult.result,
        process: processResult.result,
        elapsedMs: elapsed,
        executedAt: new Date().toISOString(),
      },
      risk_level: 'green',
      correlation_id: crypto.randomUUID(),
    });

    return new Response(
      JSON.stringify({
        ok: true,
        elapsedMs: elapsed,
        crawl: crawlResult.result,
        process: processResult.result,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[trend-crawl] 오류:', err);

    // 오류도 기록
    await supabase.from('agent_messages').insert({
      from_agent: 'mindle',
      to_agent: '1001',
      message_type: 'error',
      payload: { type: 'trend_crawl_error', error: String(err) },
      risk_level: 'yellow',
      correlation_id: crypto.randomUUID(),
    });

    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
