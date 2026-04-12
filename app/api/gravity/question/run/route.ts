import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * POST /api/gravity/question/run
 * question-mapper 로직을 직접 실행 (edge function 우회)
 *
 * Body:
 * {
 *   product_id: string,
 *   top_n?: number,
 * }
 */

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

async function supabaseRequest(
    url: string,
    method: string,
    serviceRoleKey: string,
    body?: unknown
) {
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
            "apikey": serviceRoleKey,
            "Prefer": method === "POST" ? "return=minimal" : "",
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(`Supabase ${method} ${url}: ${res.status} ${text}`);
    }
    if (res.status === 204 || res.headers.get("content-length") === "0") return [];
    return res.json();
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { product_id, top_n = 30 } = body;

    if (!product_id) {
        return NextResponse.json({ error: "product_id 필수" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anthropicKey = process.env.TENONE_ANTHROPIC_KEY;

    if (!supabaseUrl || !serviceRoleKey || !anthropicKey) {
        return NextResponse.json({
            error: "환경 변수 누락",
            detail: {
                NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
                SUPABASE_SERVICE_ROLE_KEY: !!serviceRoleKey,
                TENONE_ANTHROPIC_KEY: !!anthropicKey,
            }
        }, { status: 500 });
    }

    // 1. extracted_question 수집
    const painPoints = await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_pain_points?product_id=eq.${product_id}&extracted_question=not.is.null&select=extracted_question,pain_category`,
        "GET",
        serviceRoleKey
    ) as Array<{ extracted_question: string; pain_category: string | null }>;

    if (!painPoints || painPoints.length === 0) {
        return NextResponse.json({ ok: true, patterns: 0, message: "분류된 페인 포인트 없음" });
    }

    // 입력이 너무 많으면 샘플링 (최대 200개)
    const sampled = painPoints.length > 200
        ? painPoints.slice(0, 200)
        : painPoints;

    const questions = sampled
        .map((p, i) => `${i + 1}. ${p.extracted_question}`)
        .join("\n");

    // 2. Claude로 클러스터링
    const anthropic = new Anthropic({ apiKey: anthropicKey });

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
            model: "claude-haiku-4-5-20251001",
            max_tokens: 8192,
            messages: [{
                role: "user",
                content: CLUSTER_PROMPT
                    .replace("{QUESTIONS}", questions)
                    .replace("{TOP_N}", String(top_n)),
            }],
        });

        const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
        const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
        const parsed = JSON.parse(text);
        patterns = parsed.patterns ?? [];
    } catch (e) {
        console.error("[gravity/question/run] Claude error:", e);
        return NextResponse.json({ error: "Claude 분류 실패", detail: String(e) }, { status: 500 });
    }

    // 3. 기존 패턴 삭제
    await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_question_patterns?product_id=eq.${product_id}`,
        "DELETE",
        serviceRoleKey
    );

    // 4. 새 패턴 삽입
    const rows = patterns.map(p => ({
        product_id,
        pattern_text: p.pattern_text,
        cluster_label: p.cluster_label,
        source_questions: p.source_questions ?? [],
        frequency: p.frequency ?? 1,
        pain_category: p.pain_category ?? null,
        priority: p.priority ?? 3,
    }));

    await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_question_patterns`,
        "POST",
        serviceRoleKey,
        rows
    );

    return NextResponse.json({ ok: true, patterns: rows.length, source_count: painPoints.length });
}
