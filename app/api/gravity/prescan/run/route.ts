import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { notifyPrescanComplete } from "@/lib/gravity/notify";

/**
 * POST /api/gravity/prescan/run
 * 시장 사전 진단 — Quick Probe + 시장 유형 판정
 *
 * Day 1: 킥오프 미팅 후 즉시 실행. 5분 내 결과.
 * 핵심 질문 5개 × AI 프로빙 → 브랜드 + 경쟁사 언급률 → 시장 유형(A/B/C/A') 판정
 *
 * Body: { product_id, brand_name, category, competitors, target_keywords? }
 */

async function supabaseRequest(
    url: string,
    method: string,
    serviceRoleKey: string,
    body?: unknown
) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceRoleKey}`,
        "apikey": serviceRoleKey,
    };
    if (method === "POST") headers["Prefer"] = "return=minimal";
    if (method === "PATCH") headers["Prefer"] = "return=minimal";

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(`Supabase ${method}: ${res.status} ${text}`);
    }
    if (res.status === 204 || res.headers.get("content-length") === "0") return [];
    return res.json();
}

// 구매 여정 5단계별 대표 질문 생성
function generateJourneyQuestions(brandName: string, category: string, competitors: string[]) {
    const compList = competitors.slice(0, 3).join(", ");

    return {
        awareness: [
            `${category} 제품/서비스 종류에는 뭐가 있어?`,
            `${category} 분야에서 요즘 인기있는 브랜드 추천해줘`,
        ],
        exploration: [
            `${category} 추천해줘. 어떤 게 좋을까?`,
            `${category} 선택할 때 뭘 기준으로 봐야 해?`,
        ],
        comparison: [
            competitors.length > 0
                ? `${brandName} vs ${competitors[0]} 어떤 게 더 나아?`
                : `${brandName} 장단점 알려줘`,
        ],
        purchase: [
            `${brandName} 써본 사람 있어? 후기 알려줘`,
            `${brandName} 가격 대비 괜찮아?`,
        ],
        loyalty: [
            `${brandName} 재구매할 만해?`,
        ],
    };
}

// AI 프로브 실행 (현재 Claude, 향후 멀티모델)
async function probeAI(
    anthropic: Anthropic,
    question: string,
    brandName: string,
    competitors: string[]
): Promise<{ response: string; brandMentioned: boolean; competitorsMentioned: string[] }> {
    const prompt = `당신은 소비자 AI 어시스턴트입니다. 다음 질문에 자연스럽게 답변해주세요.
제품/서비스를 추천하거나 비교할 때는 구체적인 브랜드명을 언급해주세요.

질문: ${question}`;

    const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
    });

    const response = msg.content[0].type === "text" ? msg.content[0].text : "";
    const lowerResp = response.toLowerCase();
    const brandMentioned = lowerResp.includes(brandName.toLowerCase());
    const competitorsMentioned = competitors.filter(c =>
        lowerResp.includes(c.toLowerCase())
    );

    return { response, brandMentioned, competitorsMentioned };
}

// 시장 유형 판정
function classifyMarketType(
    brandRate: number,
    avgCompetitorRate: number
): { type: string; label: string; description: string } {
    if (brandRate === 0 && avgCompetitorRate < 20) {
        return {
            type: "A'",
            label: "카테고리 비가시",
            description: "AI가 이 카테고리 자체를 잘 모릅니다. 카테고리 교육 콘텐츠부터 필요합니다.",
        };
    }
    if (brandRate === 0 || brandRate < 10) {
        return {
            type: "A",
            label: "무명 브랜드",
            description: "AI가 브랜드를 모릅니다. 디지털 존재감 구축이 최우선입니다.",
        };
    }
    if (brandRate < 50) {
        return {
            type: "B",
            label: "인지되지만 비추천",
            description: "AI가 브랜드를 알지만 적극 추천하지 않습니다. 차별화 포인트 강화가 필요합니다.",
        };
    }
    return {
        type: "C",
        label: "선점 브랜드",
        description: "AI가 브랜드를 잘 추천하고 있습니다. 방어 + 모니터링 + 확장에 집중합니다.",
    };
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const {
        product_id,
        brand_name,
        category = "",
        competitors = [],
    } = body;

    if (!product_id || !brand_name) {
        return NextResponse.json({ error: "product_id, brand_name 필수" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anthropicKey = process.env.TENONE_ANTHROPIC_KEY;

    if (!supabaseUrl || !serviceRoleKey || !anthropicKey) {
        return NextResponse.json({ error: "환경 변수 누락" }, { status: 500 });
    }

    // ── 인코딩 안전: DB에서 실제 브랜드명 조회 ─────────────────────
    let safeBrandName = brand_name;
    try {
        const productRes = await fetch(
            `${supabaseUrl}/rest/v1/bg_products?id=eq.${product_id}&select=name&limit=1`,
            { headers: { "Authorization": `Bearer ${serviceRoleKey}`, "apikey": serviceRoleKey } }
        );
        const productRows = await productRes.json().catch(() => []);
        if (Array.isArray(productRows) && productRows[0]?.name) {
            safeBrandName = productRows[0].name;
        }
    } catch {
        // DB 조회 실패 시 원본 사용
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    // 1. 구매 여정 5단계 질문 생성
    const journeyQuestions = generateJourneyQuestions(safeBrandName, category, competitors);
    const allQuestions = Object.entries(journeyQuestions).flatMap(([stage, qs]) =>
        qs.map(q => ({ stage, question: q }))
    );

    // 2. 모든 질문에 대해 AI 프로빙
    const probeDetails: Array<{
        stage: string;
        question: string;
        ai_model: string;
        brand_mentioned: boolean;
        competitors_mentioned: string[];
        response_snippet: string;
    }> = [];

    let brandMentionTotal = 0;
    const competitorMentionCounts: Record<string, number> = {};
    competitors.forEach((c: string) => { competitorMentionCounts[c] = 0; });

    for (const { stage, question } of allQuestions) {
        try {
            const result = await probeAI(anthropic, question, safeBrandName, competitors);

            if (result.brandMentioned) brandMentionTotal++;
            result.competitorsMentioned.forEach(c => {
                competitorMentionCounts[c] = (competitorMentionCounts[c] || 0) + 1;
            });

            probeDetails.push({
                stage,
                question,
                ai_model: "claude",
                brand_mentioned: result.brandMentioned,
                competitors_mentioned: result.competitorsMentioned,
                response_snippet: result.response.slice(0, 200),
            });
        } catch (e) {
            console.error(`[prescan] probe error:`, e);
            probeDetails.push({
                stage,
                question,
                ai_model: "claude",
                brand_mentioned: false,
                competitors_mentioned: [],
                response_snippet: `[오류: ${e instanceof Error ? e.message : "unknown"}]`,
            });
        }
    }

    const totalQuestions = allQuestions.length;
    const brandRate = totalQuestions > 0 ? Math.round((brandMentionTotal / totalQuestions) * 100) : 0;

    // 3. 경쟁사 언급률 계산
    const competitorRates: Record<string, number> = {};
    for (const [comp, count] of Object.entries(competitorMentionCounts)) {
        competitorRates[comp] = totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0;
    }
    const avgCompetitorRate = Object.values(competitorRates).length > 0
        ? Math.round(Object.values(competitorRates).reduce((a, b) => a + b, 0) / Object.values(competitorRates).length)
        : 0;

    // 4. 구매 여정 히트맵 구성 (질문 텍스트 포함)
    const journeyHeatmap: Record<string, { brand: boolean; competitors: string[]; question: string }[]> = {};
    for (const detail of probeDetails) {
        if (!journeyHeatmap[detail.stage]) journeyHeatmap[detail.stage] = [];
        journeyHeatmap[detail.stage].push({
            brand: detail.brand_mentioned,
            competitors: detail.competitors_mentioned,
            question: detail.question,
        });
    }

    // 5. 시장 유형 판정
    const marketClassification = classifyMarketType(brandRate, avgCompetitorRate);

    // 6. 진단 문장 생성
    const diagnosisText = `${safeBrandName}의 AI 언급률은 ${brandRate}%이며, ` +
        `경쟁사 평균 ${avgCompetitorRate}%입니다. ` +
        `시장 유형: ${marketClassification.type} (${marketClassification.label}). ` +
        marketClassification.description;

    // 7. 결과 저장
    // 기존 prescan 결과 삭제
    await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_prescan_results?product_id=eq.${product_id}`,
        "DELETE",
        serviceRoleKey
    );

    // 새 결과 저장
    await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_prescan_results`,
        "POST",
        serviceRoleKey,
        {
            product_id,
            market_type: marketClassification.type,
            brand_mention_rate: brandRate,
            competitor_mention_rates: competitorRates,
            search_visibility: {}, // 향후 검색 가시성 체크 추가
            journey_heatmap: journeyHeatmap,
            probe_details: probeDetails,
            diagnosis_text: diagnosisText,
        }
    );

    // bg_products.market_type 업데이트
    await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_products?id=eq.${product_id}`,
        "PATCH",
        serviceRoleKey,
        { market_type: marketClassification.type }
    );

    // 메신저 알림 (에이전트 + Service Hook)
    notifyPrescanComplete(
        brand_name,
        marketClassification.type,
        brandRate,
        product_id
    ).catch(() => {});

    return NextResponse.json({
        ok: true,
        market_type: marketClassification.type,
        market_label: marketClassification.label,
        brand_mention_rate: brandRate,
        competitor_mention_rates: competitorRates,
        avg_competitor_rate: avgCompetitorRate,
        total_questions: totalQuestions,
        journey_stages: Object.keys(journeyHeatmap).length,
        diagnosis: diagnosisText,
    });
}
