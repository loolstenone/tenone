/**
 * ai-prober — AI Prober 엔진
 *
 * 역할:
 *   bg_question_patterns → 5대 AI에 질의 → 브랜드 언급 분석 → bg_ai_probe_results 저장
 *
 * 호출:
 *   POST /functions/v1/ai-prober
 *   Body: {
 *     product_id: string,
 *     brand_name: string,           // 클라이언트 브랜드명
 *     competitors?: string[],       // 경쟁사 목록
 *     models?: string[],            // 질의할 AI 목록 (기본: 가능한 전체)
 *     pattern_limit?: number,       // 질의할 패턴 수 (기본 10)
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

// ── AI 질의 함수들 ──────────────────────────────────────────────

async function queryClaude(question: string): Promise<string | null> {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: '당신은 소비자 질문에 제품/서비스를 추천해주는 AI 어시스턴트입니다. 구체적인 브랜드와 제품을 추천하세요.',
      messages: [{ role: 'user', content: question }],
    });
    return msg.content[0].type === 'text' ? msg.content[0].text : null;
  } catch (e) {
    console.error('[ai-prober] Claude error:', e);
    return null;
  }
}

async function queryOpenAI(question: string): Promise<string | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '당신은 소비자 질문에 제품/서비스를 추천해주는 AI 어시스턴트입니다. 구체적인 브랜드와 제품을 추천하세요.' },
          { role: 'user', content: question },
        ],
        max_tokens: 1024,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.error('[ai-prober] OpenAI error:', e);
    return null;
  }
}

async function queryPerplexity(question: string): Promise<string | null> {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'system', content: '당신은 소비자 질문에 제품/서비스를 추천해주는 AI 어시스턴트입니다. 구체적인 브랜드와 제품을 추천하세요.' },
          { role: 'user', content: question },
        ],
        max_tokens: 1024,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.error('[ai-prober] Perplexity error:', e);
    return null;
  }
}

async function queryGemini(question: string): Promise<string | null> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `당신은 소비자 질문에 제품/서비스를 추천해주는 AI 어시스턴트입니다.\n\n${question}` }],
          }],
          generationConfig: { maxOutputTokens: 1024 },
        }),
      },
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (e) {
    console.error('[ai-prober] Gemini error:', e);
    return null;
  }
}

// ── 브랜드 언급 분석 ──────────────────────────────────────────────

function analyzeBrandMention(
  responseText: string,
  brandName: string,
  competitors: string[],
): { brand_mentioned: boolean; brand_rank: number | null; competitors_mentioned: string[] } {
  const lower = responseText.toLowerCase();
  const brandLower = brandName.toLowerCase();

  // 브랜드 언급 여부
  const brand_mentioned = lower.includes(brandLower);

  // 브랜드 순위: 번호 리스트(1. 2. 3.)에서 브랜드가 몇 번째에 등장하는지
  let brand_rank: number | null = null;
  if (brand_mentioned) {
    const lines = responseText.split('\n');
    let rank = 0;
    for (const line of lines) {
      const numbered = /^\s*(\d+)[.)\s]/.exec(line);
      if (numbered) {
        rank++;
        if (line.toLowerCase().includes(brandLower)) {
          brand_rank = rank;
          break;
        }
      }
    }
    // 번호 리스트 없이 언급만 된 경우 순위 추정 불가 → null 유지
  }

  // 경쟁사 언급 목록
  const competitors_mentioned = competitors.filter(c =>
    lower.includes(c.toLowerCase())
  );

  return { brand_mentioned, brand_rank, competitors_mentioned };
}

// ── 메인 ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  const body = await req.json().catch(() => ({}));
  const {
    product_id,
    brand_name,
    competitors = [],
    models = ['claude', 'chatgpt', 'gemini', 'perplexity'],
    pattern_limit = 10,
  } = body;

  if (!product_id || !brand_name) {
    return Response.json({ error: 'product_id, brand_name 필수' }, { status: 400 });
  }

  // 질문 패턴 조회 (우선순위 높은 것부터)
  const { data: patterns, error: patternErr } = await supabase
    .from('bg_question_patterns')
    .select('id, pattern_text')
    .eq('product_id', product_id)
    .order('priority', { ascending: true })
    .limit(pattern_limit);

  if (patternErr) return Response.json({ error: patternErr.message }, { status: 500 });
  if (!patterns || patterns.length === 0) {
    return Response.json({ ok: true, probed: 0, message: '질문 패턴 없음' });
  }

  const MODEL_FNS: Record<string, (q: string) => Promise<string | null>> = {
    claude: queryClaude,
    chatgpt: queryOpenAI,
    perplexity: queryPerplexity,
    gemini: queryGemini,
  };

  const rows: Array<Record<string, unknown>> = [];
  let probed = 0;
  let skipped = 0;

  for (const pattern of patterns) {
    for (const model of models) {
      const fn = MODEL_FNS[model];
      if (!fn) continue;

      const responseText = await fn(pattern.pattern_text);

      if (!responseText) {
        skipped++;
        continue;
      }

      const { brand_mentioned, brand_rank, competitors_mentioned } =
        analyzeBrandMention(responseText, brand_name, competitors);

      rows.push({
        product_id,
        question_pattern_id: pattern.id,
        ai_model: model,
        question: pattern.pattern_text,
        response_text: responseText,
        brand_mentioned,
        brand_rank,
        competitors_mentioned,
      });

      probed++;
    }
  }

  if (rows.length > 0) {
    const { error: insertErr } = await supabase.from('bg_ai_probe_results').insert(rows);
    if (insertErr) {
      console.error('[ai-prober] insert error:', insertErr);
      return Response.json({ error: insertErr.message }, { status: 500 });
    }
  }

  return Response.json({
    ok: true,
    probed,
    skipped,
    patterns: patterns.length,
    models_tried: models,
  });
});
