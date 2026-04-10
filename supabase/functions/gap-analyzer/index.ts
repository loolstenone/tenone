/**
 * gap-analyzer — Gap Analyzer 엔진
 *
 * 역할:
 *   bg_ai_probe_results + bg_source_traces → Gravity Score 계산
 *   → bg_gravity_scores 저장 (스코어)
 *   → bg_gaps 저장 (갭 유형별 레코드)
 *   → bg_actions 저장 (갭별 실행 액션)
 *
 * Gravity Score (0~100):
 *   mention_score  = mention_rate × 40          (등장률, 40점 만점)
 *   rank_score     = (5 - avg_rank) / 4 × 20    (순위, 20점 만점 / 미언급 0점)
 *   coverage_score = models_mentioned / total × 15 (AI 커버리지, 15점 만점)
 *   context_score  = 소스 품질 × 25             (맥락 자산, 25점 만점)
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
  id: string;
  ai_model: string;
  brand_mentioned: boolean;
  brand_rank: number | null;
  competitors_mentioned: string[];
  category_headwind: boolean;
  client_brand_context: string | null;
};

type SourceRow = {
  source_type: string;
  brand_beneficiary: string | null;
  is_own_brand: boolean;
};

/** 소스 유형별 품질 가중치 */
const SOURCE_QUALITY: Record<string, number> = {
  official_site: 1.0,
  review_site: 0.8,
  news: 0.7,
  blog: 0.5,
  forum: 0.4,
  wiki: 0.6,
  faq: 0.7,
  youtube: 0.5,
  other: 0.3,
};

/** Context Score: 브랜드를 인용한 소스의 품질 × 25 */
function calcContextScore(sources: SourceRow[], brandName: string): number {
  if (sources.length === 0) return 0;

  // 브랜드 수혜 소스만 (brand_beneficiary 매칭 or is_own_brand)
  const brandSources = sources.filter(
    s => s.is_own_brand || (s.brand_beneficiary && s.brand_beneficiary.toLowerCase().includes(brandName.toLowerCase()))
  );

  if (brandSources.length === 0) return 0;

  // 소스별 품질 점수 평균
  const qualitySum = brandSources.reduce((sum, s) => {
    return sum + (SOURCE_QUALITY[s.source_type] ?? 0.3);
  }, 0);
  const avgQuality = qualitySum / brandSources.length;

  // 소스 수 보너스: 5개 이상이면 만점
  const countBonus = Math.min(brandSources.length / 5, 1.0);

  return parseFloat(((avgQuality * 0.7 + countBonus * 0.3) * 25).toFixed(2));
}

function calcGravityScore(results: ProbeRow[], contextScore: number): {
  mention_rate: number;
  avg_rank: number | null;
  mention_score: number;
  rank_score: number;
  coverage_score: number;
  context_score: number;
  gravity_score: number;
  total_queries: number;
  brand_mentioned_count: number;
  model_breakdown: Record<string, { mention_rate: number; avg_rank: number | null; count: number }>;
} {
  const total = results.length;
  if (total === 0) {
    return {
      mention_rate: 0, avg_rank: null,
      mention_score: 0, rank_score: 0, coverage_score: 0, context_score: 0, gravity_score: 0,
      total_queries: 0, brand_mentioned_count: 0, model_breakdown: {},
    };
  }

  const mentioned = results.filter(r => r.brand_mentioned);
  const mention_rate = mentioned.length / total;
  const mention_score = parseFloat((mention_rate * 40).toFixed(2));

  // 평균 순위 (언급 + 순위 있는 것만)
  const ranked = mentioned.filter(r => r.brand_rank !== null);
  const avg_rank = ranked.length > 0
    ? ranked.reduce((sum, r) => sum + r.brand_rank!, 0) / ranked.length
    : null;
  const rank_score = avg_rank !== null ? parseFloat(Math.max(0, (5 - avg_rank) / 4 * 20).toFixed(2)) : 0;

  // AI 커버리지: 몇 종류의 AI에서 언급됐는지
  const allModels = [...new Set(results.map(r => r.ai_model))];
  const mentionedModels = new Set(mentioned.map(r => r.ai_model));
  const coverage_score = parseFloat((allModels.length > 0 ? (mentionedModels.size / allModels.length) * 15 : 0).toFixed(2));

  const gravity_score = parseFloat((mention_score + rank_score + coverage_score + contextScore).toFixed(2));

  // AI별 세부
  const model_breakdown: Record<string, { mention_rate: number; avg_rank: number | null; count: number }> = {};
  for (const model of allModels) {
    const modelResults = results.filter(r => r.ai_model === model);
    const modelMentioned = modelResults.filter(r => r.brand_mentioned);
    const modelRanked = modelMentioned.filter(r => r.brand_rank !== null);
    model_breakdown[model] = {
      mention_rate: modelResults.length > 0 ? parseFloat((modelMentioned.length / modelResults.length).toFixed(3)) : 0,
      avg_rank: modelRanked.length > 0
        ? parseFloat((modelRanked.reduce((s, r) => s + r.brand_rank!, 0) / modelRanked.length).toFixed(1))
        : null,
      count: modelResults.length,
    };
  }

  return {
    mention_rate,
    avg_rank,
    mention_score,
    rank_score,
    coverage_score,
    context_score: contextScore,
    gravity_score,
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

  for (const [comp, score] of Object.entries(competitorScores)) {
    if (score.mention_rate > mentionRate + 0.2) {
      top_gaps.push(`${comp} 언급률이 자사 대비 ${Math.round((score.mention_rate - mentionRate) * 100)}%p 높음`);
    }
  }

  for (const [model, data] of Object.entries(modelBreakdown)) {
    if (data.mention_rate === 0) {
      top_gaps.push(`${model}에서 브랜드 전혀 미등장`);
    } else if (data.mention_rate < 0.3) {
      quick_wins.push(`${model} 언급률 개선 여지 있음 (현재 ${Math.round(data.mention_rate * 100)}%)`);
    }
    if (data.avg_rank !== null && data.avg_rank > 3) {
      quick_wins.push(`${model}에서 순위 ${data.avg_rank}위 → 상위 진입 목표`);
    }
  }

  if (gravityScore < 30) top_gaps.push('Gravity Score 30 미만 — 즉각적인 AEO 전략 필요');
  else if (gravityScore >= 60) quick_wins.push('Gravity Score 60+ — 기존 언급 패턴 강화 전략 유효');

  return { top_gaps, quick_wins };
}

/** bg_gaps 레코드 생성 */
function buildGaps(
  productId: string,
  mentionRate: number,
  contextScore: number,
  competitorScores: Record<string, { mention_rate: number; count: number }>,
  modelBreakdown: Record<string, { mention_rate: number; avg_rank: number | null }>,
  gravityScore: number,
): Array<{ product_id: string; gap_type: string; severity: number; detail: string; auto_tagged: boolean; human_confirmed: boolean }> {
  const gaps = [];

  // 존재 부재: 언급률 0%
  if (mentionRate === 0) {
    gaps.push({
      product_id: productId,
      gap_type: '존재부재',
      severity: 9,
      detail: `AI 5대 엔진 전체에서 브랜드 언급 0건. 브랜드 인지도 자체가 없는 상태입니다.`,
      auto_tagged: true,
      human_confirmed: false,
    });
  } else if (mentionRate < 0.3) {
    gaps.push({
      product_id: productId,
      gap_type: '존재부재',
      severity: 7,
      detail: `AI 언급률 ${Math.round(mentionRate * 100)}% — 30% 미만. 브랜드 존재감이 매우 낮습니다.`,
      auto_tagged: true,
      human_confirmed: false,
    });
  }

  // 소스 빈약: 맥락 자산 점수 낮음
  if (contextScore < 5) {
    gaps.push({
      product_id: productId,
      gap_type: '소스빈약',
      severity: 8,
      detail: `AI가 인용할 브랜드 맥락 소스가 거의 없습니다. Context Score ${contextScore}점 (25점 만점). 전문 미디어·리뷰·케이스스터디 콘텐츠가 부족합니다.`,
      auto_tagged: true,
      human_confirmed: false,
    });
  } else if (contextScore < 12) {
    gaps.push({
      product_id: productId,
      gap_type: '소스빈약',
      severity: 5,
      detail: `맥락 소스 부족 — Context Score ${contextScore}점. 신뢰도 높은 제3자 소스 확보가 필요합니다.`,
      auto_tagged: true,
      human_confirmed: false,
    });
  }

  // 경쟁 열세: 경쟁사 대비 갭
  for (const [comp, score] of Object.entries(competitorScores)) {
    const gap = score.mention_rate - mentionRate;
    if (gap > 0.3) {
      gaps.push({
        product_id: productId,
        gap_type: '경쟁열세',
        severity: 7,
        detail: `${comp}의 AI 언급률(${Math.round(score.mention_rate * 100)}%)이 자사(${Math.round(mentionRate * 100)}%) 대비 ${Math.round(gap * 100)}%p 높습니다. 경쟁사의 AI 소스 전략 분석이 필요합니다.`,
        auto_tagged: true,
        human_confirmed: false,
      });
    } else if (gap > 0.15) {
      gaps.push({
        product_id: productId,
        gap_type: '경쟁열세',
        severity: 4,
        detail: `${comp} 대비 AI 언급률이 ${Math.round(gap * 100)}%p 낮습니다.`,
        auto_tagged: true,
        human_confirmed: false,
      });
    }
  }

  // AI별 미등장
  for (const [model, data] of Object.entries(modelBreakdown)) {
    if (data.mention_rate === 0) {
      gaps.push({
        product_id: productId,
        gap_type: '구조부재',
        severity: 6,
        detail: `${model.toUpperCase()} 응답에서 브랜드가 한 번도 언급되지 않았습니다. ${model} 학습 데이터에 브랜드 맥락이 없습니다.`,
        auto_tagged: true,
        human_confirmed: false,
      });
    }
  }

  // 전반적 Gravity Score 위험
  if (gravityScore < 10) {
    gaps.push({
      product_id: productId,
      gap_type: '맥락불일치',
      severity: 8,
      detail: `Gravity Score ${gravityScore}점 — 브랜드가 AI 추천 생태계 밖에 있습니다. 브랜드 메시지와 AI 학습 콘텐츠 간 정렬이 전혀 이루어지지 않은 상태입니다.`,
      auto_tagged: true,
      human_confirmed: false,
    });
  }

  return gaps;
}

/** bg_actions 레코드 생성 (gap_id 없이 product_id 기반) */
function buildActions(
  productId: string,
  gaps: Array<{ gap_type: string; severity: number }>,
  gravityScore: number,
): Array<{ product_id: string; action_type: string; priority: number; brief: string; status: string }> {
  const actions = [];
  let priority = 1;

  // 존재 부재 → 콘텐츠 긴급 제작
  if (gaps.some(g => g.gap_type === '존재부재')) {
    actions.push({
      product_id: productId,
      action_type: 'content_creation',
      priority: priority++,
      brief: '브랜드 정의·비교·수치가 명확한 FAQ 구조 콘텐츠 5개 즉시 제작. AI 엔진은 "정의-비교-수치" 구조를 인용 확률 최대 3배 높게 처리.',
      status: 'todo',
    });
    actions.push({
      product_id: productId,
      action_type: 'review_strategy',
      priority: priority++,
      brief: '실사용자 맥락 리뷰(사용 상황·문제 해결·결과 포함) 최소 10건 확보. 별점 리뷰보다 AI 인용률 최대 5배 높은 형식.',
      status: 'todo',
    });
  }

  // 소스 빈약 → 제3자 소스 확보
  if (gaps.some(g => g.gap_type === '소스빈약')) {
    actions.push({
      product_id: productId,
      action_type: 'pr_outreach',
      priority: priority++,
      brief: '전문 미디어(업계 뉴스레터, IT 매체) 기고 또는 인터뷰 2~3건 확보. AI는 독립 미디어 소스를 신뢰도 높게 인용.',
      status: 'todo',
    });
    actions.push({
      product_id: productId,
      action_type: 'structured_data',
      priority: priority++,
      brief: '공식 사이트에 Schema.org 마크업(Organization, Product, FAQ) 적용. 구조화 데이터는 AI 학습 데이터에 직접 포함 가능성이 높음.',
      status: 'todo',
    });
  }

  // 경쟁 열세 → 경쟁사 소스 분석 + 차별화
  if (gaps.some(g => g.gap_type === '경쟁열세')) {
    actions.push({
      product_id: productId,
      action_type: 'competitor_analysis',
      priority: priority++,
      brief: 'AI가 인용한 경쟁사 소스 역추적 → 동일 소스에 브랜드 맥락 삽입 전략 수립. Source Tracer 결과 참조.',
      status: 'todo',
    });
    actions.push({
      product_id: productId,
      action_type: 'content_creation',
      priority: priority++,
      brief: '경쟁사 비교 콘텐츠(vs 경쟁사 A/B/C) 제작. 브랜드를 카테고리 대안으로 명시적으로 포지셔닝.',
      status: 'todo',
    });
  }

  // 구조 부재(AI별 미등장) → AI별 최적화
  if (gaps.some(g => g.gap_type === '구조부재')) {
    actions.push({
      product_id: productId,
      action_type: 'aeo_optimization',
      priority: priority++,
      brief: 'Perplexity·ChatGPT 최적화: Wikipedia 연동, Reddit 자연 언급, Quora Q&A 작성. 각 AI 엔진별 주요 인용 소스에 브랜드 맥락 배치.',
      status: 'todo',
    });
  }

  // 전반 Gravity 낮음 → 긴급 전략
  if (gravityScore < 20) {
    actions.push({
      product_id: productId,
      action_type: 'strategy',
      priority: priority++,
      brief: 'AEO 90일 액션플랜 수립: ① 브랜드 정의 콘텐츠 → ② 제3자 소스 확보 → ③ 커뮤니티 자연 언급 → ④ Gravity Score 30pt 돌파 후 재측정.',
      status: 'todo',
    });
  }

  return actions;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  const body = await req.json().catch(() => ({})) as { product_id?: string; brand_name?: string; competitors?: string[] };
  const { product_id, brand_name, competitors = [] } = body;

  if (!product_id || !brand_name) {
    return Response.json({ error: 'product_id, brand_name 필수' }, { status: 400 });
  }

  // probe 결과 조회
  const { data: results, error: probeErr } = await supabase
    .from('bg_ai_probe_results')
    .select('id, ai_model, brand_mentioned, brand_rank, competitors_mentioned, category_headwind, client_brand_context')
    .eq('product_id', product_id)
    .order('probed_at', { ascending: false })
    .limit(200);

  if (probeErr) return Response.json({ error: probeErr.message }, { status: 500 });
  if (!results || results.length === 0) {
    return Response.json({ ok: true, message: 'probe 결과 없음. ai-prober를 먼저 실행하세요.' });
  }

  // 소스 트레이스 조회 (Context Score 계산용)
  const { data: sources } = await supabase
    .from('bg_source_traces')
    .select('source_type, brand_beneficiary, is_own_brand')
    .eq('product_id', product_id);

  // 점수 계산
  const contextScore = calcContextScore((sources ?? []) as SourceRow[], brand_name);
  const scores = calcGravityScore(results as ProbeRow[], contextScore);
  const competitor_scores = calcCompetitorScores(results as ProbeRow[], competitors);
  const gap_summary = buildGapSummary(
    scores.gravity_score,
    scores.mention_rate,
    competitor_scores,
    scores.model_breakdown,
  );

  // bg_gravity_scores 저장
  const { error: scoreErr } = await supabase.from('bg_gravity_scores').insert({
    product_id,
    scan_date: new Date().toISOString().split('T')[0],
    mention_rate: scores.mention_rate,
    avg_rank: scores.avg_rank,
    mention_score: scores.mention_score,
    rank_score: scores.rank_score,
    coverage_score: scores.coverage_score,
    context_score: scores.context_score,
    gravity_score: scores.gravity_score,
    total_queries: scores.total_queries,
    brand_mentioned_count: scores.brand_mentioned_count,
    competitor_scores,
    model_breakdown: scores.model_breakdown,
    gap_summary,
  });

  if (scoreErr) {
    console.error('[gap-analyzer] score insert error:', scoreErr);
    return Response.json({ error: scoreErr.message }, { status: 500 });
  }

  // 기존 bg_gaps / bg_actions 삭제 후 재생성
  await supabase.from('bg_actions').delete().eq('product_id', product_id);
  await supabase.from('bg_gaps').delete().eq('product_id', product_id);

  // bg_gaps 저장
  const gapRows = buildGaps(
    product_id,
    scores.mention_rate,
    contextScore,
    competitor_scores,
    scores.model_breakdown,
    scores.gravity_score,
  );

  let savedGapCount = 0;
  if (gapRows.length > 0) {
    const { error: gapErr } = await supabase.from('bg_gaps').insert(gapRows);
    if (gapErr) {
      console.error('[gap-analyzer] gap insert error:', gapErr);
    } else {
      savedGapCount = gapRows.length;
    }
  }

  // bg_actions 저장
  const actionRows = buildActions(product_id, gapRows, scores.gravity_score);
  let savedActionCount = 0;
  if (actionRows.length > 0) {
    const { error: actionErr } = await supabase.from('bg_actions').insert(actionRows);
    if (actionErr) {
      console.error('[gap-analyzer] action insert error:', actionErr);
    } else {
      savedActionCount = actionRows.length;
    }
  }

  return Response.json({
    ok: true,
    gravity_score: scores.gravity_score,
    mention_rate: scores.mention_rate,
    context_score: contextScore,
    avg_rank: scores.avg_rank,
    model_breakdown: scores.model_breakdown,
    competitor_scores,
    gap_summary,
    saved_gaps: savedGapCount,
    saved_actions: savedActionCount,
  });
});
