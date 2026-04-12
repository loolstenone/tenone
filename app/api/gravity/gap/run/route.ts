import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * POST /api/gravity/gap/run
 * gap-analyzer 로직을 직접 실행 (edge function 우회)
 *
 * Body:
 * {
 *   product_id: string,
 *   brand_name: string,
 *   competitors?: string[],
 * }
 */

const GAP_PROMPT = `당신은 AEO(AI Engine Optimization) 전문가다.

[브랜드]: {BRAND_NAME}
[AI Probe 결과 요약]
- 총 질의: {TOTAL_QUERIES}건
- 브랜드 언급: {BRAND_MENTIONED}건 ({MENTION_RATE}%)
- 사용 AI 모델: {AI_MODELS}

[소비자 질문 패턴 (AI가 답한 질문들)]
{QUESTION_PATTERNS}

[브랜드가 언급된 응답 샘플]
{MENTION_SAMPLES}

[브랜드가 언급되지 않은 응답 샘플]
{NO_MENTION_SAMPLES}

위 데이터를 분석하여 다음 JSON 형식으로만 응답해라 (코드 블록 없이):
{
  "top_gaps": [
    "AI에서 이 브랜드가 누락되는 핵심 이유 1",
    "핵심 이유 2",
    "핵심 이유 3"
  ],
  "quick_wins": [
    "즉시 실행 가능한 AEO 개선 방법 1",
    "빠른 개선 방법 2",
    "빠른 개선 방법 3"
  ]
}

분석 기준:
- top_gaps: AI가 브랜드를 추천 못 하는 실질적 원인 (콘텐츠 부족, 비교 데이터 없음 등)
- quick_wins: 1-2주 안에 실행 가능하고 효과가 큰 것 우선`;

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
    if (res.status === 204) return [];
    const text = await res.text();
    if (!text || text.trim() === "") return [];
    return JSON.parse(text);
}

export async function POST(req: NextRequest) {
    try {
    const body = await req.json().catch(() => ({}));
    const { product_id, brand_name, competitors = [] } = body;

    if (!product_id || !brand_name) {
        return NextResponse.json({ error: "product_id, brand_name 필수" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anthropicKey = process.env.TENONE_ANTHROPIC_KEY;

    if (!supabaseUrl || !serviceRoleKey || !anthropicKey) {
        return NextResponse.json({ error: "환경 변수 누락" }, { status: 500 });
    }

    // 1. probe 결과 조회
    const probes = await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_ai_probe_results?product_id=eq.${product_id}&select=id,ai_model,question,response_text,brand_mentioned&order=probed_at.desc`,
        "GET",
        serviceRoleKey
    ) as Array<{
        id: string;
        ai_model: string;
        question: string;
        response_text: string;
        brand_mentioned: boolean;
    }>;

    if (!probes || probes.length === 0) {
        return NextResponse.json({ ok: false, message: "probe 결과 없음. 먼저 Step 4 실행 필요" });
    }

    // 2. 지표 계산
    const totalQueries = probes.length;
    const brandMentionedCount = probes.filter(p => p.brand_mentioned).length;
    const mentionRate = totalQueries > 0 ? (brandMentionedCount / totalQueries) * 100 : 0;

    // AI 모델별 breakdown
    const modelBreakdown: Record<string, { total: number; mentioned: number; rate: number }> = {};
    for (const p of probes) {
        if (!modelBreakdown[p.ai_model]) {
            modelBreakdown[p.ai_model] = { total: 0, mentioned: 0, rate: 0 };
        }
        modelBreakdown[p.ai_model].total++;
        if (p.brand_mentioned) modelBreakdown[p.ai_model].mentioned++;
    }
    for (const model of Object.keys(modelBreakdown)) {
        const mb = modelBreakdown[model];
        mb.rate = mb.total > 0 ? Math.round((mb.mentioned / mb.total) * 100) : 0;
    }

    // 2-1. Source Trace 기반 Context Score 계산
    let contextScore = 0;
    try {
        const sources = await supabaseRequest(
            `${supabaseUrl}/rest/v1/bg_source_traces?product_id=eq.${product_id}&select=source_type,is_own_brand,brand_beneficiary`,
            "GET",
            serviceRoleKey
        ) as Array<{ source_type: string; is_own_brand: boolean; brand_beneficiary: string }>;

        if (sources.length > 0) {
            // 자사 소스 비율 (자사 소스가 많을수록 높은 점수)
            const ownSources = sources.filter(s => s.is_own_brand).length;
            const ownSourceRatio = ownSources / sources.length;

            // 소스 다양성 (official_site, review_site, blog 등 다양할수록 높은 점수)
            const sourceTypes = new Set(sources.map(s => s.source_type));
            const diversityRatio = Math.min(sourceTypes.size / 5, 1); // 5가지 이상이면 만점

            // Context Score = 자사 소스 비율(60%) + 소스 다양성(40%) × 25점
            contextScore = Math.round((ownSourceRatio * 0.6 + diversityRatio * 0.4) * 25);
        }
    } catch (e) {
        console.error("[gravity/gap/run] context score calc error:", e);
    }

    // 점수 계산 — 완전한 Gravity Score 공식 (100점 만점)
    // Mention (40점) + Rank (20점) + Coverage (15점) + Context (25점)
    const mentionScore = Math.round((mentionRate / 100) * 40);
    const modelCount = Object.keys(modelBreakdown).length;
    const modelsWithMention = Object.values(modelBreakdown).filter(m => m.mentioned > 0).length;
    const coverageScore = modelCount > 0 ? Math.round((modelsWithMention / Math.max(modelCount, 5)) * 15) : 0;
    const rankScore = brandMentionedCount > 0 ? 10 : 0; // 향후 brand_rank 기반으로 정교화
    const gravityScore = mentionScore + coverageScore + rankScore + contextScore;

    // 3. 질문 패턴 조회
    const patterns = await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_question_patterns?product_id=eq.${product_id}&select=pattern_text,cluster_label,priority&order=priority.asc&limit=10`,
        "GET",
        serviceRoleKey
    ) as Array<{ pattern_text: string; cluster_label: string; priority: number }>;

    // 4. Claude로 gap_summary 생성
    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const mentionSamples = probes
        .filter(p => p.brand_mentioned)
        .slice(0, 2)
        .map(p => `Q: ${p.question}\nA: ${p.response_text.slice(0, 300)}...`)
        .join("\n\n");

    const noMentionSamples = probes
        .filter(p => !p.brand_mentioned)
        .slice(0, 2)
        .map(p => `Q: ${p.question}\nA: ${p.response_text.slice(0, 300)}...`)
        .join("\n\n");

    const questionPatterns = patterns
        .map((p, i) => `${i + 1}. [${p.cluster_label}] ${p.pattern_text}`)
        .join("\n");

    const aiModels = [...new Set(probes.map(p => p.ai_model))].join(", ");

    let gapSummary = { top_gaps: [] as string[], quick_wins: [] as string[] };

    try {
        const prompt = GAP_PROMPT
            .replace("{BRAND_NAME}", brand_name)
            .replace("{TOTAL_QUERIES}", String(totalQueries))
            .replace("{BRAND_MENTIONED}", String(brandMentionedCount))
            .replace("{MENTION_RATE}", mentionRate.toFixed(1))
            .replace("{AI_MODELS}", aiModels)
            .replace("{QUESTION_PATTERNS}", questionPatterns || "없음")
            .replace("{MENTION_SAMPLES}", mentionSamples || "없음")
            .replace("{NO_MENTION_SAMPLES}", noMentionSamples || "없음");

        const msg = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 2048,
            messages: [{ role: "user", content: prompt }],
        });

        const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
        const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
        const parsed = JSON.parse(text);
        gapSummary = {
            top_gaps: parsed.top_gaps ?? [],
            quick_wins: parsed.quick_wins ?? [],
        };
    } catch (e) {
        console.error("[gravity/gap/run] Claude error:", e);
        // gap_summary 없이 진행
    }

    // 5. 기존 오늘 스코어 삭제 후 새 스코어 삽입
    const today = new Date().toISOString().split("T")[0];
    await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_gravity_scores?product_id=eq.${product_id}&scan_date=eq.${today}`,
        "DELETE",
        serviceRoleKey
    );

    await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_gravity_scores`,
        "POST",
        serviceRoleKey,
        [{
            product_id,
            gravity_score: gravityScore,
            mention_score: mentionScore,
            rank_score: rankScore,
            coverage_score: coverageScore,
            context_score: contextScore,
            mention_rate: parseFloat(mentionRate.toFixed(1)),
            avg_rank: null,
            total_queries: totalQueries,
            brand_mentioned_count: brandMentionedCount,
            scan_date: today,
            model_breakdown: modelBreakdown,
            competitor_scores: {},
            gap_summary: gapSummary,
        }]
    );

    return NextResponse.json({
        ok: true,
        gravity_score: gravityScore,
        mention_rate: parseFloat(mentionRate.toFixed(1)),
        brand_mentioned: brandMentionedCount,
        total_queries: totalQueries,
        gap_summary: gapSummary,
    });
    } catch (e) {
        console.error("[gravity/gap/run] unhandled error:", e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
