/**
 * gap-analyzer — Gap Analyzer 엔진
 *
 * 역할:
 *   bg_ai_probe_results → Gravity Score 계산 → 경쟁사 갭 분석 → bg_gravity_scores 저장
 *
 * Gravity Score (0~100):
 *   mention_score  = mention_rate × 40          (등장률, 40점 만점)
 *   rank_score     = (5 - avg_rank) / 4 × 30    (순위, 30점 만점 / 미언급 0점)
 *   coverage_score = models_mentioned / total × 30 (AI 커버리지, 30점 만점)
 *
 * 호출:
 *   POST /functions/v1/gap-analyzer
 *   Body: { product_id: string, brand_name: string, competitors?: string[] }
 */

import { createClient } from 'npm:@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

type ProbeRow = {
  ai_model: string;
  brand_mentioned: boolean;
  brand_rank: number | null;
  competitors_mentioned: string[];
};

function calcGravityScore(results: ProbeRow[]): {
  mention_rate: number;
  avg_rank: number | null;
  mention_score: number;
  rank_score: number;
  coverage_score: number;
  gravity_score: number;
  total_queries: number;
  brand_mentioned_count: number;
  model_breakdown: Record<string, { mention_rate: number; avg_rank: number | null; count: number }>;
} {
  const total = results.length;
  if (total === 0) {
    return {
      mention_rate: 0, avg_rank: null,
      mention_score: 0, rank_score: 0, coverage_score: 0, gravity_score: 0,
      total_queries: 0, brand_mentioned_count: 0, model_breakdown: {},
    };
  }

  const mentioned = results.filter(r => r.brand_mentioned);
  const mention_rate = mentioned.length / total;
  const mention_score = mention_rate * 40;

  // 평균 순위 (언급 + 순위 있는 것만)
  const ranked = mentioned.filter(r => r.brand_rank !== null);
  const avg_rank = ranked.length > 0
    ? ranked.reduce((sum, r) => sum + r.brand_rank!, 0) / ranked.length
    : null;
  const rank_score = avg_rank !== null ? Math.max(0, (5 - avg_rank) / 4 * 30) : 0;

  // AI 커버리지: 몇 종류의 AI에서 언급됐는지
  const allModels = [...new Set(results.map(r => r.ai_model))];
  const mentionedModels = new Set(mentioned.map(r => r.ai_model));
  const coverage_score = allModels.length > 0 ? (mentionedModels.size / allModels.length) * 30 : 0;

  const gravity_score = mention_score + rank_score + coverage_score;

  // AI별 세부
  const model_breakdown: Record<string, { mention_rate: number; avg_rank: number | null; count: number }> = {};
  for (const model of allModels) {
    const modelResults = results.filter(r => r.ai_model === model);
    const modelMentioned = modelResults.filter(r => r.brand_mentioned);
    const modelRanked = modelMentioned.filter(r => r.brand_rank !== null);
    model_breakdown[model] = {
      mention_rate: modelResults.length > 0 ? modelMentioned.length / modelResults.length : 0,
      avg_rank: modelRanked.length > 0
        ? modelRanked.reduce((s, r) => s + r.brand_rank!, 0) / modelRanked.length
        : null,
      count: modelResults.length,
    };
  }

  return {
    mention_rate,
    avg_rank,
    mention_score: parseFloat(mention_score.toFixed(2)),
    rank_score: parseFloat(rank_score.toFixed(2)),
    coverage_score: parseFloat(coverage_score.toFixed(2)),
    gravity_score: parseFloat(gravity_score.toFixed(2)),
    total_queries: total,
    brand_mentioned_count: mentioned.length,
    model_breakdown,
  };
}

function calcCompetitorScores(
  results: ProbeRow[],
  competitors: string[],
): Record<string, { mention_rate: number; count: number }> {
  const total = results.length;
  if (total === 0 || competitors.length === 0) return {};

  const scores: Record<string, { mention_rate: number; count: number }> = {};
  for (const comp of competitors) {
    const count = results.filter(r => r.competitors_mentioned.includes(comp)).length;
    scores[comp] = {
      mention_rate: parseFloat((count / total).toFixed(3)),
      count,
    };
  }
  return scores;
}

function buildGapSummary(
  gravityScore: number,
  mentionRate: number,
  competitorScores: Record<string, { mention_rate: number; count: number }>,
  modelBreakdown: Record<string, { mention_rate: number; avg_rank: number | null }>,
): { top_gaps: string[]; quick_wins: string[] } {
  const top_gaps: string[] = [];
  const quick_wins: string[] = [];

  if (mentionRate < 0.3) top_gaps.push('전체 AI 언급률 30% 미만 — 브랜드 인지도 부재');
  if (mentionRate < 0.6 && mentionRate >= 0.3) top_gaps.push('AI 언급률 60% 미만 — 콘텐츠 강화 필요');

  // 경쟁사 대비 갭
  for (const [comp, score] of Object.entries(competitorScores)) {
    if (score.mention_rate > mentionRate + 0.2) {
      top_gaps.push(`${comp} 언급률이 자사 대비 ${Math.round((score.mention_rate - mentionRate) * 100)}%p 높음`);
    }
  }

  // AI별 갭
  for (const [model, data] of Object.entries(modelBreakdown)) {
    if (data.mention_rate === 0) {
      top_gaps.push(`${model}에서 브랜드 전혀 미등장`);
    } else if (data.mention_rate < 0.3) {
      quick_wins.push(`${model} 언급률 개선 여지 있음 (현재 ${Math.round(data.mention_rate * 100)}%)`);
    }
    if (data.avg_rank !== null && data.avg_rank > 3) {
      quick_wins.push(`${model}에서 순위 ${data.avg_rank.toFixed(1)}위 → 상위 진입 목표`);
    }
  }

  if (gravityScore < 30) top_gaps.push('Gravity Score 30 미만 — 즉각적인 AEO 전략 필요');
  else if (gravityScore >= 60) quick_wins.push('Gravity Score 60+ — 기존 언급 패턴 강화 전략 유효');

  return { top_gaps, quick_wins };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  const body = await req.json().catch(() => ({}));
  const { product_id, brand_name, competitors = [] } = body;

  if (!product_id || !brand_name) {
    return Response.json({ error: 'product_id, brand_name 필수' }, { status: 400 });
  }

  // 최근 probe 결과 조회
  const { data: results, error } = await supabase
    .from('bg_ai_probe_results')
    .select('ai_model, brand_mentioned, brand_rank, competitors_mentioned')
    .eq('product_id', product_id)
    .order('probed_at', { ascending: false })
    .limit(200);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!results || results.length === 0) {
    return Response.json({ ok: true, message: 'probe 결과 없음. ai-prober를 먼저 실행하세요.' });
  }

  const scores = calcGravityScore(results as ProbeRow[]);
  const competitor_scores = calcCompetitorScores(results as ProbeRow[], competitors);
  const gap_summary = buildGapSummary(
    scores.gravity_score,
    scores.mention_rate,
    competitor_scores,
    scores.model_breakdown,
  );

  const { error: insertErr } = await supabase.from('bg_gravity_scores').insert({
    product_id,
    scan_date: new Date().toISOString().split('T')[0],
    mention_rate: scores.mention_rate,
    avg_rank: scores.avg_rank,
    mention_score: scores.mention_score,
    rank_score: scores.rank_score,
    coverage_score: scores.coverage_score,
    gravity_score: scores.gravity_score,
    total_queries: scores.total_queries,
    brand_mentioned_count: scores.brand_mentioned_count,
    competitor_scores,
    model_breakdown: scores.model_breakdown,
    gap_summary,
  });

  if (insertErr) {
    console.error('[gap-analyzer] insert error:', insertErr);
    return Response.json({ error: insertErr.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    gravity_score: scores.gravity_score,
    mention_rate: scores.mention_rate,
    avg_rank: scores.avg_rank,
    model_breakdown: scores.model_breakdown,
    competitor_scores,
    gap_summary,
  });
});
