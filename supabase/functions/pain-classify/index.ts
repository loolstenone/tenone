/**
 * pain-classify — Pain Collector 분류 엔진
 *
 * 역할:
 *   bg_pain_sources (processed=false) → Claude Sonnet 분류 → bg_pain_points insert
 *
 * 호출:
 *   POST /functions/v1/pain-classify
 *   Body: { product_id?: string, limit?: number }
 *
 * 스케줄:
 *   GCP Cloud Scheduler 또는 수동 트리거 (배치)
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

const CLASSIFY_PROMPT = `다음 소비자 리뷰/커뮤니티 글을 분석하여 JSON으로 구조화해라.

리뷰 원문:
{RAW_TEXT}

다음 JSON 형식으로만 응답해라 (코드 블록 없이):
{
  "purchase_motive": "구매 동기 (무엇 때문에 샀는가, 없으면 null)",
  "positive_points": ["긍정 포인트 배열", "없으면 빈 배열"],
  "negative_points": ["부정 포인트 배열", "없으면 빈 배열"],
  "situation": "소비자의 구체적 상황 (없으면 null)",
  "emotion": "주된 감정 (불안/만족/답답/놀람/실망/기대 등, 없으면 null)",
  "purchase_route": "구매 경로 추정 (의사추천/검색/AI/지인/SNS/광고/직접방문, 없으면 null)",
  "extracted_question": "이 소비자가 AI에게 물을 법한 상황 문장형 질문 (없으면 null)",
  "pain_category": "핵심 페인 포인트 카테고리 1개 (예: 무릎통증, 사이즈불일치, 내구성, 가격대비성능 등)",
  "confidence": 0.0
}

confidence는 0.0~1.0 사이 숫자. 리뷰가 충분히 구체적이면 0.8+, 너무 짧거나 모호하면 0.5 이하.`;

async function classifyReview(rawText: string): Promise<Record<string, unknown> | null> {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: CLASSIFY_PROMPT.replace('{RAW_TEXT}', rawText),
      }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
    return JSON.parse(text);
  } catch (e) {
    console.error('[pain-classify] Claude error:', e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  const { product_id, limit = 20 } = await req.json().catch(() => ({}));

  // 미처리 소스 조회
  let query = supabase
    .from('bg_pain_sources')
    .select('id, product_id, raw_text')
    .eq('processed', false)
    .limit(limit);

  if (product_id) query = query.eq('product_id', product_id);

  const { data: sources, error } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!sources || sources.length === 0) {
    return Response.json({ ok: true, processed: 0, message: '처리할 소스 없음' });
  }

  let ok = 0, fail = 0;

  for (const source of sources) {
    const result = await classifyReview(source.raw_text);

    if (!result) {
      fail++;
      continue;
    }

    // pain_points insert
    const { error: insertErr } = await supabase.from('bg_pain_points').insert({
      source_id: source.id,
      product_id: source.product_id,
      purchase_motive: result.purchase_motive ?? null,
      positive_points: result.positive_points ?? [],
      negative_points: result.negative_points ?? [],
      situation: result.situation ?? null,
      emotion: result.emotion ?? null,
      purchase_route: result.purchase_route ?? null,
      extracted_question: result.extracted_question ?? null,
      pain_category: result.pain_category ?? null,
      confidence: result.confidence ?? null,
    });

    if (insertErr) {
      console.error(`[pain-classify] insert error for source ${source.id}:`, insertErr);
      fail++;
      continue;
    }

    // processed 마킹
    await supabase.from('bg_pain_sources').update({ processed: true }).eq('id', source.id);
    ok++;
  }

  return Response.json({ ok: true, processed: ok, failed: fail, total: sources.length });
});
