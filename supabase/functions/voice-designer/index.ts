/**
 * voice-designer — Voice Designer 엔진
 *
 * 역할:
 *   gap_summary + source_traces + question_patterns → Claude 분석
 *   → AEO 콘텐츠 브리프 생성 → bg_voice_briefs 저장
 *
 * 호출:
 *   POST /functions/v1/voice-designer
 *   Body: {
 *     product_id: string,
 *     brand_name: string,
 *     top_n?: number,   // 생성할 브리프 수 (기본 5)
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

const VOICE_PROMPT = `당신은 AEO(AI Engine Optimization) 전문가다.
브랜드가 AI 추천 엔진(Claude, ChatGPT, Gemini 등)에 더 자주 등장하도록 콘텐츠 전략을 설계한다.

[브랜드 정보]
- 브랜드명: {BRAND_NAME}
- Gravity Score: {GRAVITY_SCORE}
- 주요 갭: {TOP_GAPS}

[소비자가 AI에게 묻는 질문 패턴]
{QUESTION_PATTERNS}

[경쟁사가 AI에 노출되는 소스 유형]
{SOURCE_TYPES}

위 데이터를 바탕으로 이 브랜드가 AI 추천에 등장하기 위해 만들어야 할 콘텐츠 브리프를 {TOP_N}개 생성해라.

다음 JSON 형식으로만 응답해라 (코드 블록 없이):
{
  "briefs": [
    {
      "content_type": "콘텐츠 유형 (blog/faq/comparison/case_study/reddit_post/youtube_script/landing_page)",
      "target_pattern": "공략하는 소비자 질문 패턴",
      "title_suggestion": "콘텐츠 제목 (구체적으로)",
      "key_messages": [
        "핵심 메시지 1 (AI가 인용할 수 있는 팩트/수치/주장)",
        "핵심 메시지 2",
        "핵심 메시지 3"
      ],
      "target_ai": ["이 콘텐츠로 공략할 AI 목록 (claude, chatgpt, gemini, perplexity)"],
      "priority": 1,
      "why": "이 콘텐츠가 AI 등장에 도움이 되는 이유 (1문장)"
    }
  ]
}

우선순위 기준:
- priority 1: 즉시 작성 가능하고 효과가 큰 것 (FAQ, 비교 글)
- priority 2: 중기 전략 (케이스 스터디, 유튜브)
- priority 3+: 장기 브랜드 구축

AEO 핵심 원칙:
- AI는 명확한 정의와 비교가 있는 콘텐츠를 인용하기 쉽다
- "A vs B" 비교 콘텐츠는 AI 추천에 매우 유리
- FAQ 형식은 AI 검색에 직접 매칭된다
- 소셜 증거(리뷰, 케이스 스터디)가 있는 콘텐츠가 더 자주 인용된다`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  const body = await req.json().catch(() => ({}));
  const { product_id, brand_name, top_n = 5 } = body;

  if (!product_id || !brand_name) {
    return Response.json({ error: 'product_id, brand_name 필수' }, { status: 400 });
  }

  // 최신 Gravity Score + gap_summary 조회
  const { data: scoreData } = await supabase
    .from('bg_gravity_scores')
    .select('gravity_score, gap_summary')
    .eq('product_id', product_id)
    .order('scan_date', { ascending: false })
    .limit(1)
    .single();

  // 질문 패턴 조회 (상위 10개)
  const { data: patterns } = await supabase
    .from('bg_question_patterns')
    .select('pattern_text, cluster_label, frequency, priority')
    .eq('product_id', product_id)
    .order('priority', { ascending: true })
    .limit(10);

  // 소스 유형 집계
  const { data: sources } = await supabase
    .from('bg_source_traces')
    .select('source_type, source_name, brand_beneficiary')
    .eq('product_id', product_id);

  const sourceTypeSummary: Record<string, number> = {};
  for (const s of sources ?? []) {
    if (s.source_type) sourceTypeSummary[s.source_type] = (sourceTypeSummary[s.source_type] ?? 0) + 1;
  }

  const gravityScore = scoreData?.gravity_score ?? 0;
  const gapSummary = scoreData?.gap_summary ?? { top_gaps: [], quick_wins: [] };
  const topGaps = (gapSummary as { top_gaps?: string[] }).top_gaps?.join('\n- ') ?? '없음';
  const questionPatterns = (patterns ?? [])
    .map((p, i) => `${i + 1}. [${p.cluster_label}] ${p.pattern_text}`)
    .join('\n');
  const sourceTypes = Object.entries(sourceTypeSummary)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => `${type}: ${count}건`)
    .join(', ') || '데이터 없음';

  // Claude로 콘텐츠 브리프 생성
  let briefs: Array<{
    content_type: string;
    target_pattern: string;
    title_suggestion: string;
    key_messages: string[];
    target_ai: string[];
    priority: number;
    why: string;
  }> = [];

  try {
    const prompt = VOICE_PROMPT
      .replace('{BRAND_NAME}', brand_name)
      .replace('{GRAVITY_SCORE}', String(gravityScore))
      .replace('{TOP_GAPS}', topGaps || '없음')
      .replace('{QUESTION_PATTERNS}', questionPatterns || '없음')
      .replace('{SOURCE_TYPES}', sourceTypes)
      .replace('{TOP_N}', String(top_n));

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const parsed = JSON.parse(text);
    briefs = parsed.briefs ?? [];
  } catch (e) {
    console.error('[voice-designer] Claude error:', e);
    return Response.json({ error: 'Claude 분석 실패' }, { status: 500 });
  }

  // 기존 draft 브리프 삭제 후 재삽입
  await supabase
    .from('bg_voice_briefs')
    .delete()
    .eq('product_id', product_id)
    .eq('status', 'draft');

  const rows = briefs.map(b => ({
    product_id,
    content_type: b.content_type,
    target_pattern: b.target_pattern ?? null,
    title_suggestion: b.title_suggestion ?? null,
    key_messages: b.key_messages ?? [],
    target_ai: b.target_ai ?? [],
    priority: b.priority ?? 3,
    status: 'draft',
  }));

  const { error: insertErr } = await supabase.from('bg_voice_briefs').insert(rows);

  if (insertErr) {
    console.error('[voice-designer] insert error:', insertErr);
    return Response.json({ error: insertErr.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    briefs_generated: rows.length,
    briefs: rows.map(r => ({
      content_type: r.content_type,
      title_suggestion: r.title_suggestion,
      priority: r.priority,
    })),
  });
});
