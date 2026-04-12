import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * POST /api/gravity/voice/run
 * voice-designer 로직을 직접 실행 (edge function 우회)
 *
 * Body:
 * {
 *   product_id: string,
 *   brand_name: string,
 *   top_n?: number,
 * }
 */

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
        throw new Error(`Supabase ${method}: ${res.status} ${text}`);
    }
    if (res.status === 204 || res.headers.get("content-length") === "0") return [];
    return res.json();
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { product_id, brand_name, top_n = 5 } = body;

    if (!product_id || !brand_name) {
        return NextResponse.json({ error: "product_id, brand_name 필수" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anthropicKey = process.env.TENONE_ANTHROPIC_KEY;

    if (!supabaseUrl || !serviceRoleKey || !anthropicKey) {
        return NextResponse.json({ error: "환경 변수 누락" }, { status: 500 });
    }

    // 1. 최신 Gravity Score + gap_summary 조회
    const scoreRows = await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_gravity_scores?product_id=eq.${product_id}&select=gravity_score,gap_summary&order=scan_date.desc&limit=1`,
        "GET",
        serviceRoleKey
    ) as Array<{ gravity_score: number; gap_summary: { top_gaps?: string[]; quick_wins?: string[] } }>;

    const scoreData = scoreRows?.[0] ?? null;

    // 2. 질문 패턴 조회 (상위 10개)
    const patterns = await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_question_patterns?product_id=eq.${product_id}&select=pattern_text,cluster_label,frequency,priority&order=priority.asc&limit=10`,
        "GET",
        serviceRoleKey
    ) as Array<{ pattern_text: string; cluster_label: string; frequency: number; priority: number }>;

    // 3. 소스 유형 집계
    const sources = await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_source_traces?product_id=eq.${product_id}&select=source_type,source_name,brand_beneficiary`,
        "GET",
        serviceRoleKey
    ) as Array<{ source_type: string; source_name: string; brand_beneficiary: string }>;

    const sourceTypeSummary: Record<string, number> = {};
    for (const s of sources ?? []) {
        if (s.source_type) sourceTypeSummary[s.source_type] = (sourceTypeSummary[s.source_type] ?? 0) + 1;
    }

    const gravityScore = scoreData?.gravity_score ?? 0;
    const gapSummary = scoreData?.gap_summary ?? { top_gaps: [], quick_wins: [] };
    const topGaps = gapSummary.top_gaps?.join("\n- ") ?? "없음";
    const questionPatterns = (patterns ?? [])
        .map((p, i) => `${i + 1}. [${p.cluster_label}] ${p.pattern_text}`)
        .join("\n");
    const sourceTypes = Object.entries(sourceTypeSummary)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => `${type}: ${count}건`)
        .join(", ") || "데이터 없음";

    // 4. Claude로 콘텐츠 브리프 생성
    const anthropic = new Anthropic({ apiKey: anthropicKey });

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
            .replace("{BRAND_NAME}", brand_name)
            .replace("{GRAVITY_SCORE}", String(gravityScore))
            .replace("{TOP_GAPS}", topGaps || "없음")
            .replace("{QUESTION_PATTERNS}", questionPatterns || "없음")
            .replace("{SOURCE_TYPES}", sourceTypes)
            .replace("{TOP_N}", String(top_n));

        const msg = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }],
        });

        const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
        const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
        const parsed = JSON.parse(text);
        briefs = parsed.briefs ?? [];
    } catch (e) {
        console.error("[gravity/voice/run] Claude error:", e);
        return NextResponse.json({ error: "Claude 분석 실패", detail: String(e) }, { status: 500 });
    }

    // 5. 기존 draft 삭제 후 재삽입
    await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_voice_briefs?product_id=eq.${product_id}&status=eq.draft`,
        "DELETE",
        serviceRoleKey
    );

    const rows = briefs.map(b => ({
        product_id,
        content_type: b.content_type,
        target_pattern: b.target_pattern ?? null,
        title_suggestion: b.title_suggestion ?? null,
        key_messages: b.key_messages ?? [],
        target_ai: b.target_ai ?? [],
        priority: b.priority ?? 3,
        status: "draft",
    }));

    await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_voice_briefs`,
        "POST",
        serviceRoleKey,
        rows
    );

    return NextResponse.json({
        ok: true,
        briefs_generated: rows.length,
        briefs: rows.map(r => ({
            content_type: r.content_type,
            title_suggestion: r.title_suggestion,
            priority: r.priority,
        })),
    });
}
