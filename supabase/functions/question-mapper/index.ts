/**
 * question-mapper — Question Mapper 엔진
 *
 * 역할:
 *   bg_pain_points.extracted_question → Claude Sonnet 클러스터링
 *   → 상황 문장 패턴 30개 → bg_question_patterns upsert
 *
 * 호출:
 *   POST /functions/v1/question-mapper
 *   Body: { product_id: string, top_n?: number }
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

const CLUSTER_PROMPT = `다음은 소비자들이 AI에게 물어볼 법한 상황 문장 질문들이다.
이 질문들을 클러스터링하여 대표 패턴으로 정리해라.

질문 목록:
{QUESTIONS}

다음 JSON 형식으로만 응답해라 (코드 블록 없이):
{
  "patterns": [
    {
      "pattern_text": "대표 상황 문장 질문 (소비자 관점, 구체적으로)",
      "cluster_label": "클러스터 이름 (짧게, 예: 무릎 통증 완화, 사이즈 선택, 내구성 우려)",
      "source_questions": ["이 클러스터에 속한 원본 질문들"],
      "frequency": 유사_질문_개수,
      "pain_category": "연결된 페인 카테고리",
      "priority": 1
    }
  ]
}

규칙:
- patterns는 최대 {TOP_N}개. 빈도 높은 순으로 정렬.
- pattern_text는 실제 소비자가 AI 검색창에 입력할 법한 자연스러운 문장
- priority: 1(가장 중요)~5(덜 중요). frequency 기반으로 배정
- 비슷한 질문은 하나의 패턴으로 합쳐라
- source_questions는 실제 원본 질문만 포함 (없으면 빈 배열)`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  const { product_id, top_n = 30 } = await req.json().catch(() => ({}));

  if (!product_id) {
    return Response.json({ error: 'product_id 필수' }, { status: 400 });
  }

  // extracted_question 수집
  const { data: painPoints, error } = await supabase
    .from('bg_pain_points')
    .select('extracted_question, pain_category')
    .eq('product_id', product_id)
    .not('extracted_question', 'is', null);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!painPoints || painPoints.length === 0) {
    return Response.json({ ok: true, patterns: 0, message: '분류된 페인 포인트 없음' });
  }

  const questions = painPoints
    .map((p, i) => `${i + 1}. ${p.extracted_question}`)
    .join('\n');

  // Claude로 클러스터링
  let patterns: Array<{
    pattern_text: string;
    cluster_label: string;
    source_questions: string[];
    frequency: number;
    pain_category: string | null;
    priority: number;
  }> = [];

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: CLUSTER_PROMPT
          .replace('{QUESTIONS}', questions)
          .replace('{TOP_N}', String(top_n)),
      }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
    const parsed = JSON.parse(text);
    patterns = parsed.patterns ?? [];
  } catch (e) {
    console.error('[question-mapper] Claude error:', e);
    return Response.json({ error: 'Claude 분류 실패' }, { status: 500 });
  }

  // 기존 패턴 삭제 후 재삽입 (전체 갱신)
  await supabase.from('bg_question_patterns').delete().eq('product_id', product_id);

  const rows = patterns.map(p => ({
    product_id,
    pattern_text: p.pattern_text,
    cluster_label: p.cluster_label,
    source_questions: p.source_questions ?? [],
    frequency: p.frequency ?? 1,
    pain_category: p.pain_category ?? null,
    priority: p.priority ?? 3,
  }));

  const { error: insertErr } = await supabase.from('bg_question_patterns').insert(rows);

  if (insertErr) {
    console.error('[question-mapper] insert error:', insertErr);
    return Response.json({ error: insertErr.message }, { status: 500 });
  }

  return Response.json({ ok: true, patterns: rows.length, source_count: painPoints.length });
});
