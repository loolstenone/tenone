import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * POST /api/gravity/social/run
 * 소셜 미디어 언급량·감정·연관어 분석
 *
 * 네이버 Blog/Cafe 검색 API로 브랜드 언급 데이터를 수집하고,
 * Claude로 감정 분석·연관어 추출을 수행한다.
 *
 * Body: { product_id, brand_name, competitors?, keywords? }
 */

interface NaverSearchItem {
    title: string;
    description: string;
    link: string;
    bloggername?: string;
    cafename?: string;
    postdate?: string;
}

// 네이버 검색 API 호출
async function naverSearch(
    query: string,
    type: "blog" | "cafearticle",
    display: number = 100
): Promise<{ total: number; items: NaverSearchItem[] }> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return { total: 0, items: [] };
    }

    const url = `https://openapi.naver.com/v1/search/${type}.json?query=${encodeURIComponent(query)}&display=${display}&sort=date`;

    const res = await fetch(url, {
        headers: {
            "X-Naver-Client-Id": clientId,
            "X-Naver-Client-Secret": clientSecret,
        },
    });

    if (!res.ok) {
        console.error(`[social/run] Naver search error: ${res.status}`);
        return { total: 0, items: [] };
    }

    const data = await res.json();
    return { total: data.total || 0, items: data.items || [] };
}

// HTML 태그 제거
function stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

// Claude 감정 분석
async function analyzeSentiment(
    anthropic: Anthropic,
    brandName: string,
    texts: string[]
): Promise<{
    positive_ratio: number;
    negative_ratio: number;
    neutral_ratio: number;
    positive_keywords: string[];
    negative_keywords: string[];
    associated_words: string[];
    recommendation_mentions: number;
    repurchase_mentions: number;
}> {
    const sampleTexts = texts.slice(0, 30).join("\n---\n");

    const prompt = `다음은 "${brandName}" 브랜드에 대한 소셜 미디어 텍스트 모음이다.
각 텍스트의 감정을 분석하고 요약해라.

텍스트:
${sampleTexts}

다음 JSON 형식으로만 응답해라 (설명 없이):
{
  "positive_count": 긍정 텍스트 수,
  "negative_count": 부정 텍스트 수,
  "neutral_count": 중립 텍스트 수,
  "positive_keywords": ["긍정 키워드 최대 10개"],
  "negative_keywords": ["부정 키워드 최대 10개"],
  "associated_words": ["브랜드와 자주 함께 언급되는 단어/형용사 최대 15개"],
  "recommendation_count": "추천", "강추", "최고", "인생템" 등 추천 표현이 포함된 텍스트 수,
  "repurchase_count": "재구매", "또 살", "계속 쓰", "n년째" 등 재구매 표현이 포함된 텍스트 수
}`;

    try {
        const msg = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });

        const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return defaultSentiment();

        const parsed = JSON.parse(jsonMatch[0]);
        const total = (parsed.positive_count || 0) + (parsed.negative_count || 0) + (parsed.neutral_count || 0);

        return {
            positive_ratio: total > 0 ? Math.round((parsed.positive_count / total) * 100) : 0,
            negative_ratio: total > 0 ? Math.round((parsed.negative_count / total) * 100) : 0,
            neutral_ratio: total > 0 ? Math.round((parsed.neutral_count / total) * 100) : 0,
            positive_keywords: parsed.positive_keywords || [],
            negative_keywords: parsed.negative_keywords || [],
            associated_words: parsed.associated_words || [],
            recommendation_mentions: parsed.recommendation_count || 0,
            repurchase_mentions: parsed.repurchase_count || 0,
        };
    } catch (e) {
        console.error("[social/run] sentiment analysis error:", e);
        return defaultSentiment();
    }
}

function defaultSentiment() {
    return {
        positive_ratio: 0,
        negative_ratio: 0,
        neutral_ratio: 0,
        positive_keywords: [],
        negative_keywords: [],
        associated_words: [],
        recommendation_mentions: 0,
        repurchase_mentions: 0,
    };
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const {
        product_id,
        brand_name,
        competitors = [],
    } = body;

    if (!product_id || !brand_name) {
        return NextResponse.json({ error: "product_id, brand_name 필수" }, { status: 400 });
    }

    const anthropicKey = process.env.TENONE_ANTHROPIC_KEY;
    if (!anthropicKey) {
        return NextResponse.json({ error: "TENONE_ANTHROPIC_KEY 누락" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    // 1. 브랜드 소셜 언급량 측정
    const [blogResult, cafeResult] = await Promise.all([
        naverSearch(brand_name, "blog"),
        naverSearch(brand_name, "cafearticle"),
    ]);

    const brandMentionTotal = blogResult.total + cafeResult.total;
    const brandTexts = [
        ...blogResult.items.map(i => stripHtml(`${i.title} ${i.description}`)),
        ...cafeResult.items.map(i => stripHtml(`${i.title} ${i.description}`)),
    ];

    // 2. 추천 동반 검색
    const [recBlog, recCafe] = await Promise.all([
        naverSearch(`${brand_name} 추천`, "blog", 10),
        naverSearch(`${brand_name} 추천`, "cafearticle", 10),
    ]);
    const recommendationMentionTotal = recBlog.total + recCafe.total;

    // 3. 경쟁사 언급량 측정
    const competitorMentions: Record<string, number> = {};
    for (const comp of competitors.slice(0, 5)) {
        const [cBlog, cCafe] = await Promise.all([
            naverSearch(comp, "blog"),
            naverSearch(comp, "cafearticle"),
        ]);
        competitorMentions[comp] = cBlog.total + cCafe.total;
    }

    // 4. SOV (Share of Voice) 계산
    const allMentions = [brandMentionTotal, ...Object.values(competitorMentions)];
    const totalMentions = allMentions.reduce((a, b) => a + b, 0);
    const brandSOV = totalMentions > 0 ? Math.round((brandMentionTotal / totalMentions) * 100) : 0;

    const competitorSOVs: Record<string, number> = {};
    for (const [comp, count] of Object.entries(competitorMentions)) {
        competitorSOVs[comp] = totalMentions > 0 ? Math.round((count / totalMentions) * 100) : 0;
    }

    // 5. 감정 분석 (Claude)
    const sentiment = brandTexts.length > 0
        ? await analyzeSentiment(anthropic, brand_name, brandTexts)
        : defaultSentiment();

    // 6. 추천 동반 비율
    const recommendationRate = brandMentionTotal > 0
        ? Math.round((recommendationMentionTotal / brandMentionTotal) * 100)
        : 0;

    return NextResponse.json({
        ok: true,
        brand_name,
        mention_count: {
            brand: brandMentionTotal,
            competitors: competitorMentions,
            total: totalMentions,
        },
        sov: {
            brand: brandSOV,
            competitors: competitorSOVs,
        },
        sentiment: {
            positive_ratio: sentiment.positive_ratio,
            negative_ratio: sentiment.negative_ratio,
            neutral_ratio: sentiment.neutral_ratio,
            positive_keywords: sentiment.positive_keywords,
            negative_keywords: sentiment.negative_keywords,
            associated_words: sentiment.associated_words,
        },
        recommendation: {
            mention_count: recommendationMentionTotal,
            rate: recommendationRate,
        },
        repurchase_mentions: sentiment.repurchase_mentions,
        recommendation_mentions_in_text: sentiment.recommendation_mentions,
        data_sources: {
            blog_count: blogResult.items.length,
            cafe_count: cafeResult.items.length,
            texts_analyzed: brandTexts.length,
        },
    });
}
