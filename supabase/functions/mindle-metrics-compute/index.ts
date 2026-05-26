/**
 * mindle-metrics-compute — Phase 2 메트릭 자동 생성
 *
 * 스케줄: cron "25 * * * *" (매시간 25분 — trend-crawl·trend-to-draft와 겹치지 않게)
 *
 * 흐름:
 *   1. mindle_trends WHERE status='published' AND id NOT IN mindle_trend_metrics → 신규
 *   2. 최근 N건만 처리 (cron당 5건 limit — Anthropic 토큰 비용 + race condition 방지)
 *   3. 각 카드별:
 *      - mention_trend: 같은 카테고리 일별 시계열 (SQL, 비용 0)
 *      - related_keywords: Haiku LLM 추출
 *      - sentiment: Haiku LLM 분류
 *      - comparison · community: Phase 3+ (외부 데이터 필요 — 자동 skip)
 *   4. mindle_trend_metrics UPSERT (UNIQUE 복합키)
 *   5. agent_messages 보고
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

interface TrendRow {
  id: string;
  title: string;
  summary: string;
  full_content: string | null;
  category: string;
  tags: string[];
  published_at: string | null;
}

// ── 1. mention_trend (SQL, LLM 비용 0) ────────────────────────────
async function computeMentionTrend(trend: TrendRow): Promise<{ payload: unknown; source: string; confidence: number } | null> {
  // 같은 카테고리 최근 30일 일별 카드 수
  const { data, error } = await supabase
    .from('mindle_trends')
    .select('published_at')
    .eq('category', trend.category)
    .eq('status', 'published')
    .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('published_at', { ascending: true });

  if (error || !data || data.length === 0) return null;

  // 일별 집계
  const dayMap: Record<string, number> = {};
  for (const row of data as Array<{ published_at: string }>) {
    const day = row.published_at.slice(0, 10);
    dayMap[day] = (dayMap[day] ?? 0) + 1;
  }
  const points = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return {
    payload: {
      points,
      window: '30d',
      total: data.length,
    },
    source: 'sql:category-timeseries',
    confidence: 70,
  };
}

// ── 2. related_keywords (Haiku LLM) ───────────────────────────────
async function computeRelatedKeywords(trend: TrendRow): Promise<{ payload: unknown; source: string; confidence: number } | null> {
  if (!trend.full_content && !trend.summary) return null;

  const prompt =
    `다음 트렌드 카드에서 핵심 연관어 8~15개 추출.\n` +
    `제목: ${trend.title}\n요약: ${trend.summary}\n본문: ${(trend.full_content ?? '').slice(0, 1500)}\n\n` +
    `JSON만:\n{"keywords":[{"word":"...","weight":1~10,"sentiment":"pos|neu|neg"}, ...]}`;

  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = res.content[0].type === 'text' ? res.content[0].text : '';
    const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());
    if (!parsed.keywords || parsed.keywords.length === 0) return null;
    return { payload: parsed, source: 'llm:claude-haiku', confidence: 75 };
  } catch {
    return null;
  }
}

// ── 3. sentiment (Haiku LLM) ──────────────────────────────────────
async function computeSentiment(trend: TrendRow): Promise<{ payload: unknown; source: string; confidence: number } | null> {
  if (!trend.full_content) return null;

  const prompt =
    `다음 본문을 문장 단위로 분해해 긍정/중립/부정 비율 추정.\n` +
    `본문: ${trend.full_content.slice(0, 2000)}\n\n` +
    `JSON만:\n{"positive":0~1,"neutral":0~1,"negative":0~1,"sample_size":문장수}`;

  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = res.content[0].type === 'text' ? res.content[0].text : '';
    const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());
    const sum = (parsed.positive ?? 0) + (parsed.neutral ?? 0) + (parsed.negative ?? 0);
    if (sum < 0.5) return null;
    return { payload: parsed, source: 'llm:claude-haiku', confidence: 60 };
  } catch {
    return null;
  }
}

// ── 4. signal_score — 카테고리 ±7일 출처 다양성 (SQL, 비용 0) ──────
async function computeSignalScore(trend: TrendRow): Promise<number> {
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const ref = trend.published_at ? new Date(trend.published_at) : new Date();
  const from = new Date(ref.getTime() - sevenDays).toISOString();
  const to   = new Date(ref.getTime() + sevenDays).toISOString();

  const { data } = await supabase
    .from('collected_data')
    .select('source_name')
    .eq('category', trend.category)
    .gte('published_at', from)
    .lte('published_at', to);

  const distinct = new Set(
    (data ?? []).map((r: { source_name: string | null }) => r.source_name).filter(Boolean),
  );
  return distinct.size;
}

// ── 5. mention_growth_pct — 카테고리 주간 증감 (SQL, 비용 0) ─────────
async function computeMentionGrowth(trend: TrendRow): Promise<number | null> {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const ref = trend.published_at ? new Date(trend.published_at) : new Date();

  const thisFrom = new Date(ref.getTime() - weekMs).toISOString();
  const thisTo   = ref.toISOString();
  const lastFrom = new Date(ref.getTime() - 2 * weekMs).toISOString();
  const lastTo   = thisFrom;

  const [thisWeek, lastWeek] = await Promise.all([
    supabase.from('collected_data').select('*', { count: 'exact', head: true })
      .eq('category', trend.category)
      .gte('published_at', thisFrom).lte('published_at', thisTo),
    supabase.from('collected_data').select('*', { count: 'exact', head: true })
      .eq('category', trend.category)
      .gte('published_at', lastFrom).lte('published_at', lastTo),
  ]);

  const thisCount = thisWeek.count ?? 0;
  const lastCount = lastWeek.count ?? 0;
  if (lastCount === 0) return thisCount > 0 ? 100 : null;
  return Math.round(((thisCount - lastCount) / lastCount) * 100);
}

// ── 6. percentile_rank — 전체 published 배치 재계산 (SQL, 비용 0) ─
async function updatePercentileRanks(): Promise<number> {
  const { data } = await supabase
    .from('mindle_trends')
    .select('id, signal_score')
    .eq('status', 'published')
    .not('signal_score', 'is', null)
    .order('signal_score', { ascending: true });

  if (!data || data.length === 0) return 0;

  const total = data.length;
  for (let i = 0; i < total; i++) {
    const row = data[i] as { id: string; signal_score: number };
    const rank = Math.round(((i + 1) / total) * 100);
    await supabase.from('mindle_trends').update({ percentile_rank: rank }).eq('id', row.id);
  }
  return total;
}

// ── 메인 ─────────────────────────────────────────────────────────
Deno.serve(async (_req) => {
  const startAt = Date.now();
  const BATCH_SIZE = 5;

  try {
    // 메트릭 미생성 published 카드 N건 — mindle_trend_metrics에 없는 trend
    const { data: missing } = await supabase
      .from('mindle_trends')
      .select(`
        id, title, summary, full_content, category, tags, published_at,
        mindle_trend_metrics(trend_id)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50);

    const unprocessed = (missing ?? [])
      .filter((row: { id: string; mindle_trend_metrics: unknown[] }) => !row.mindle_trend_metrics || row.mindle_trend_metrics.length === 0)
      .slice(0, BATCH_SIZE) as TrendRow[];

    if (unprocessed.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, message: '신규 메트릭 대상 없음', processed: 0 }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    let processed = 0;
    let inserted = 0;
    const errors: string[] = [];

    for (const trend of unprocessed) {
      try {
        const metrics = await Promise.all([
          computeMentionTrend(trend).then(r => r ? { ...r, metric_type: 'mention_trend' } : null),
          computeRelatedKeywords(trend).then(r => r ? { ...r, metric_type: 'related_keywords' } : null),
          computeSentiment(trend).then(r => r ? { ...r, metric_type: 'sentiment' } : null),
        ]);

        const rows = metrics
          .filter(m => m !== null)
          .map(m => ({
            trend_id: trend.id,
            metric_type: m!.metric_type,
            payload: m!.payload,
            source: m!.source,
            confidence: m!.confidence,
          }));

        if (rows.length > 0) {
          const { error: insErr } = await supabase
            .from('mindle_trend_metrics')
            .upsert(rows, { onConflict: 'trend_id,metric_type' });
          if (insErr) errors.push(`${trend.title.slice(0, 30)}: ${insErr.message}`);
          else inserted += rows.length;
        }

        // signal_score + mention_growth_pct → mindle_trends 직접 업데이트
        const [signalScore, mentionGrowth] = await Promise.all([
          computeSignalScore(trend),
          computeMentionGrowth(trend),
        ]);
        const signalUpdate: Record<string, number | null> = { signal_score: signalScore };
        if (mentionGrowth !== null) signalUpdate.mention_growth_pct = mentionGrowth;
        await supabase.from('mindle_trends').update(signalUpdate).eq('id', trend.id);

        processed++;
      } catch (err) {
        errors.push(`${trend.title.slice(0, 30)}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // percentile_rank 배치 재계산 — signal_score 기준 전체 published 순위
    await updatePercentileRanks();

    const elapsed = Date.now() - startAt;
    await supabase.from('agent_messages').insert({
      from_agent: 'mindle',
      to_agent: '1001',
      message_type: 'vrief',
      payload: {
        type: 'mindle_metrics_compute',
        processed, inserted, errors,
        elapsedMs: elapsed,
        executedAt: new Date().toISOString(),
      },
      risk_level: errors.length > 0 ? 'yellow' : 'green',
      correlation_id: crypto.randomUUID(),
    });

    return new Response(
      JSON.stringify({ ok: true, processed, inserted, errors, elapsedMs: elapsed }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[mindle-metrics-compute] 오류:', err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
