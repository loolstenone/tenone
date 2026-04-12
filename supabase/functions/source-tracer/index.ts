/**
 * source-tracer — Source Tracer 엔진
 *
 * 역할:
 *   bg_ai_probe_results (응답 텍스트) → Claude 분석
 *   → 소스 유형/URL/수혜 브랜드 추출 → bg_source_traces 저장
 *
 * 호출:
 *   POST /functions/v1/source-tracer
 *   Body: {
 *     product_id: string,
 *     brand_name: string,
 *     competitors?: string[],
 *     limit?: number,      // 분석할 probe 결과 수 (기본 20)
 *   }
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

const SOURCE_PROMPT = `다음은 AI가 소비자 질문에 답한 응답이다.
이 응답에서 특정 브랜드/제품을 추천하거나 정보를 제공할 때 참조했을 것으로 보이는 소스를 분석해라.

[AI 응답]
{RESPONSE_TEXT}

[브랜드 정보]
- 자사 브랜드: {BRAND_NAME}
- 경쟁사: {COMPETITORS}

다음 JSON 형식으로만 응답해라 (코드 블록 없이):
{
  "sources": [
    {
      "source_type": "소스 유형 (official_site/wikipedia/review_site/news/blog/reddit/forum/youtube/other)",
      "source_url": "언급된 URL (없으면 null)",
      "source_name": "소스 이름 (예: Reddit, 네이버 블로그, G2, Capterra)",
      "source_snippet": "응답에서 소스와 관련된 문장 (30자 이내)",
      "brand_beneficiary": "이 소스로 이득 보는 브랜드명 (없으면 null)"
    }
  ]
}

규칙:
- 응답에서 명시적으로 언급된 소스만 추출 (추측 금지)
- URL이 없어도 소스 유형은 추론 가능하면 기입
- 소스가 없으면 sources 배열을 비워라 []
- 최대 5개`;

type ProbeRow = {
  id: string;
  ai_model: string;
  response_text: string;
  brand_mentioned: boolean;
};

type SourceItem = {
  source_type: string | null;
  source_url: string | null;
  source_name: string | null;
  source_snippet: string | null;
  brand_beneficiary: string | null;
};

async function extractSources(
  responseText: string,
  brandName: string,
  competitors: string[],
): Promise<SourceItem[]> {
  try {
    const prompt = SOURCE_PROMPT
      .replace('{RESPONSE_TEXT}', responseText.slice(0, 2000)) // 토큰 절약
      .replace('{BRAND_NAME}', brandName)
      .replace('{COMPETITORS}', competitors.join(', ') || '없음');

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const parsed = JSON.parse(text);
    return parsed.sources ?? [];
  } catch (e) {
    console.error('[source-tracer] Claude error:', e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  const body = await req.json().catch(() => ({}));
  const { product_id, brand_name, competitors = [], limit = 20 } = body;

  if (!product_id || !brand_name) {
    return Response.json({ error: 'product_id, brand_name 필수' }, { status: 400 });
  }

  // 최근 probe 결과 조회 (소스 분석 대상)
  const { data: probes, error } = await supabase
    .from('bg_ai_probe_results')
    .select('id, ai_model, response_text, brand_mentioned')
    .eq('product_id', product_id)
    .order('probed_at', { ascending: false })
    .limit(limit);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!probes || probes.length === 0) {
    return Response.json({ ok: true, traced: 0, message: 'probe 결과 없음' });
  }

  // 기존 source_traces 삭제 (전체 갱신)
  await supabase.from('bg_source_traces').delete().eq('product_id', product_id);

  let traced = 0;
  let total_sources = 0;

  for (const probe of probes as ProbeRow[]) {
    const sources = await extractSources(probe.response_text, brand_name, competitors);

    if (sources.length === 0) continue;

    const rows = sources.map((s) => ({
      product_id,
      probe_result_id: probe.id,
      ai_model: probe.ai_model,
      source_type: s.source_type ?? 'other',
      source_url: s.source_url ?? null,
      source_name: s.source_name ?? null,
      source_snippet: s.source_snippet ?? null,
      brand_beneficiary: s.brand_beneficiary ?? null,
      is_own_brand: s.brand_beneficiary?.toLowerCase() === brand_name.toLowerCase(),
    }));

    const { error: insertErr } = await supabase.from('bg_source_traces').insert(rows);
    if (!insertErr) {
      traced++;
      total_sources += rows.length;
    } else {
      console.error('[source-tracer] insert error:', insertErr);
    }
  }

  // 소스 유형별 집계
  const { data: summary } = await supabase
    .from('bg_source_traces')
    .select('source_type, brand_beneficiary, is_own_brand')
    .eq('product_id', product_id);

  const sourceTypeCounts: Record<string, number> = {};
  const brandSourceCounts: Record<string, number> = {};

  for (const row of summary ?? []) {
    if (row.source_type) sourceTypeCounts[row.source_type] = (sourceTypeCounts[row.source_type] ?? 0) + 1;
    if (row.brand_beneficiary) brandSourceCounts[row.brand_beneficiary] = (brandSourceCounts[row.brand_beneficiary] ?? 0) + 1;
  }

  return Response.json({
    ok: true,
    traced_probes: traced,
    total_sources,
    source_type_breakdown: sourceTypeCounts,
    brand_source_breakdown: brandSourceCounts,
  });
});
