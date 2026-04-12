import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * POST /api/gravity/source/run
 * source-tracer 로직을 직접 실행 (edge function 우회)
 *
 * Body:
 * {
 *   product_id: string,
 *   brand_name: string,
 *   competitors?: string[],
 *   limit?: number,
 * }
 */

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

type SourceItem = {
    source_type: string | null;
    source_url: string | null;
    source_name: string | null;
    source_snippet: string | null;
    brand_beneficiary: string | null;
};

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

async function extractSources(
    responseText: string,
    brandName: string,
    competitors: string[],
    anthropic: Anthropic
): Promise<SourceItem[]> {
    try {
        const prompt = SOURCE_PROMPT
            .replace("{RESPONSE_TEXT}", responseText.slice(0, 2000))
            .replace("{BRAND_NAME}", brandName)
            .replace("{COMPETITORS}", competitors.join(", ") || "없음");

        const msg = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });

        const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
        const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
        const parsed = JSON.parse(text);
        return parsed.sources ?? [];
    } catch (e) {
        console.error("[gravity/source/run] Claude error:", e);
        return [];
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { product_id, brand_name, competitors = [], limit = 20 } = body;

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

    // 1. 최근 probe 결과 조회
    const probes = await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_ai_probe_results?product_id=eq.${product_id}&select=id,ai_model,response_text,brand_mentioned&order=probed_at.desc&limit=${limit}`,
        "GET",
        serviceRoleKey
    ) as Array<{ id: string; ai_model: string; response_text: string; brand_mentioned: boolean }>;

    if (!probes || probes.length === 0) {
        return NextResponse.json({ ok: true, traced: 0, message: "probe 결과 없음" });
    }

    // 2. 기존 source_traces 삭제
    await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_source_traces?product_id=eq.${product_id}`,
        "DELETE",
        serviceRoleKey
    );

    let traced = 0;
    let total_sources = 0;

    for (const probe of probes) {
        const sources = await extractSources(probe.response_text, brand_name, competitors, anthropic);
        if (sources.length === 0) continue;

        const rows = sources.map(s => ({
            product_id,
            probe_result_id: probe.id,
            ai_model: probe.ai_model,
            source_type: s.source_type ?? "other",
            source_url: s.source_url ?? null,
            source_name: s.source_name ?? null,
            source_snippet: s.source_snippet ?? null,
            brand_beneficiary: s.brand_beneficiary ?? null,
            is_own_brand: s.brand_beneficiary?.toLowerCase() === brand_name.toLowerCase(),
        }));

        try {
            await supabaseRequest(
                `${supabaseUrl}/rest/v1/bg_source_traces`,
                "POST",
                serviceRoleKey,
                rows
            );
            traced++;
            total_sources += rows.length;
        } catch (e) {
            console.error("[gravity/source/run] insert error:", e);
        }
    }

    // 3. 집계
    const summary = await supabaseRequest(
        `${supabaseUrl}/rest/v1/bg_source_traces?product_id=eq.${product_id}&select=source_type,brand_beneficiary,is_own_brand`,
        "GET",
        serviceRoleKey
    ) as Array<{ source_type: string; brand_beneficiary: string; is_own_brand: boolean }>;

    const sourceTypeCounts: Record<string, number> = {};
    const brandSourceCounts: Record<string, number> = {};
    for (const row of summary ?? []) {
        if (row.source_type) sourceTypeCounts[row.source_type] = (sourceTypeCounts[row.source_type] ?? 0) + 1;
        if (row.brand_beneficiary) brandSourceCounts[row.brand_beneficiary] = (brandSourceCounts[row.brand_beneficiary] ?? 0) + 1;
    }

    return NextResponse.json({
        ok: true,
        traced_probes: traced,
        total_sources,
        source_type_breakdown: sourceTypeCounts,
        brand_source_breakdown: brandSourceCounts,
    });
}
