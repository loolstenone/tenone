import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * POST /api/gravity/probe/run
 * ai-prober 로직을 직접 실행 (edge function 우회)
 *
 * Body:
 * {
 *   product_id: string,
 *   brand_name: string,
 *   competitors?: string[],
 *   models?: string[],
 *   pattern_limit?: number,
 * }
 */

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
    const {
        product_id,
        brand_name,
        competitors = [],
        pattern_limit = 10,
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

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    // 1. 질문 패턴 조회
    const patterns = await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_question_patterns?product_id=eq.${product_id}&select=id,pattern_text,cluster_label,priority&order=priority.asc&limit=${pattern_limit}`,
        "GET",
        serviceRoleKey
    ) as Array<{ id: string; pattern_text: string; cluster_label: string; priority: number }>;

    if (!patterns || patterns.length === 0) {
        return NextResponse.json({ ok: true, probed: 0, message: "질문 패턴 없음" });
    }

    // 2. 기존 probe 결과 삭제
    await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_ai_probe_results?product_id=eq.${product_id}`,
        "DELETE",
        serviceRoleKey
    );

    const competitorList = competitors.length > 0
        ? competitors.join(", ")
        : "경쟁사 미지정";

    let probed = 0;
    const results = [];

    for (const pattern of patterns) {
        try {
            const prompt = `당신은 소비자 AI 어시스턴트다. 다음 질문에 대해 제품/서비스를 추천해라.

질문: ${pattern.pattern_text}

관련 브랜드 정보:
- 주요 브랜드: ${brand_name}
- 경쟁사: ${competitorList}

소비자 관점에서 자연스럽고 구체적으로 답변해라. 제품 특징, 장단점, 추천 이유를 포함해라.`;

            const msg = await anthropic.messages.create({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 512,
                messages: [{ role: "user", content: prompt }],
            });

            const responseText = msg.content[0].type === "text" ? msg.content[0].text : "";
            const brandMentioned = responseText.toLowerCase().includes(brand_name.toLowerCase());

            results.push({
                product_id,
                question_pattern_id: pattern.id,
                ai_model: "claude",
                question: pattern.pattern_text,
                response_text: responseText,
                brand_mentioned: brandMentioned,
                brand_rank: null,
                competitors_mentioned: [],
                recommended_brands: null,
                client_brand_context: brand_name,
                competitor_brands: competitors.length > 0 ? competitors : null,
                source_urls: [],
                category_headwind: false,
                headwind_detail: null,
                probed_at: new Date().toISOString(),
            });

            probed++;
        } catch (e) {
            console.error(`[gravity/probe/run] pattern ${pattern.id} error:`, e);
        }
    }

    if (results.length > 0) {
        await supabaseRequest(
            `${supabaseUrl}/rest/v1/bg_ai_probe_results`,
            "POST",
            serviceRoleKey,
            results
        );
    }

    const brandMentionCount = results.filter(r => r.brand_mentioned).length;

    return NextResponse.json({
        ok: true,
        probed,
        brand_mentioned: brandMentionCount,
        brand_mention_rate: probed > 0 ? Math.round((brandMentionCount / probed) * 100) : 0,
    });
}
