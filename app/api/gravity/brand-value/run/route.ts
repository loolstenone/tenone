import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/gravity/brand-value/run
 * 브랜드 4대 가치 산출 — 인지도·호감도·추천도·만족도
 *
 * social/run + prescan + 기존 파이프라인 데이터를 종합하여 4대 가치 점수를 산출한다.
 *
 * Body: { product_id, brand_name, competitors?, category? }
 *
 * 선행 조건: social/run + prescan/run + probe/run (또는 scan/run) 실행 완료
 */

async function supabaseGet(url: string, serviceRoleKey: string) {
    const res = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${serviceRoleKey}`,
            "apikey": serviceRoleKey,
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Supabase GET: ${res.status} ${text}`);
    }
    return res.json();
}

async function supabaseWrite(url: string, method: string, serviceRoleKey: string, body: unknown) {
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
            "apikey": serviceRoleKey,
            "Prefer": "return=minimal",
        },
        body: JSON.stringify(body),
    });
    if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(`Supabase ${method}: ${res.status} ${text}`);
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const {
        product_id,
        brand_name,
        competitors = [],
        category = "",
    } = body;

    if (!product_id || !brand_name) {
        return NextResponse.json({ error: "product_id, brand_name 필수" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: "환경 변수 누락" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // 1. social/run 호출하여 소셜 데이터 수집
    let socialData;
    try {
        const socialRes = await fetch(`${baseUrl}/api/gravity/social/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id, brand_name, competitors }),
        });
        socialData = await socialRes.json();
    } catch (e) {
        console.error("[brand-value] social/run error:", e);
        socialData = { ok: false };
    }

    // 2. prescan 결과 조회
    let prescanData;
    try {
        const prescanRows = await supabaseGet(
            `${supabaseUrl}/rest/v1/bg_prescan_results?product_id=eq.${product_id}&order=created_at.desc&limit=1`,
            serviceRoleKey
        );
        prescanData = prescanRows[0] || null;
    } catch {
        prescanData = null;
    }

    // 3. 기존 파이프라인 데이터 조회
    let probeData, painData, reviewData;
    try {
        [probeData, painData, reviewData] = await Promise.all([
            // AI 프로빙 결과
            supabaseGet(
                `${supabaseUrl}/rest/v1/bg_ai_probe_results?product_id=eq.${product_id}&select=brand_mentioned,ai_model`,
                serviceRoleKey
            ),
            // 페인포인트 데이터
            supabaseGet(
                `${supabaseUrl}/rest/v1/bg_pain_points?product_id=eq.${product_id}&select=pain_category,emotion,positive_points,negative_points,confidence`,
                serviceRoleKey
            ),
            // 리뷰 원본 데이터 (평점)
            supabaseGet(
                `${supabaseUrl}/rest/v1/bg_pain_sources?product_id=eq.${product_id}&select=rating&rating=not.is.null`,
                serviceRoleKey
            ),
        ]);
    } catch (e) {
        console.error("[brand-value] data fetch error:", e);
        probeData = [];
        painData = [];
        reviewData = [];
    }

    // === 인지도 (Awareness) ===
    // 소셜 SOV(30%) + 검색 SOV(30%) + AI 인지율(40%)
    const socialSOV = socialData?.sov?.brand || 0;
    const searchSOV = 0; // 향후 검색 가시성 데이터 연동
    const aiAwareness = prescanData?.brand_mention_rate || 0;
    const awarenessScore = Math.round(socialSOV * 0.3 + searchSOV * 0.3 + aiAwareness * 0.4);

    // === 호감도 (Favorability) ===
    // 소셜 긍정률(40%) + 연관어 긍정률(30%) + 리뷰 긍정률(30%)
    const socialPositive = socialData?.sentiment?.positive_ratio || 0;
    const assocPositiveRatio = socialData?.sentiment?.positive_ratio || 0; // 연관어는 소셜 감정과 동일 소스
    // 리뷰 긍정률: pain_points에서 positive_points가 있는 비율
    const totalPainPoints = painData?.length || 0;
    const positivePainPoints = (painData || []).filter(
        (p: { positive_points?: string[] }) => p.positive_points && p.positive_points.length > 0
    ).length;
    const reviewPositiveRatio = totalPainPoints > 0
        ? Math.round((positivePainPoints / totalPainPoints) * 100)
        : 0;
    const favorabilityScore = Math.round(
        socialPositive * 0.4 + assocPositiveRatio * 0.3 + reviewPositiveRatio * 0.3
    );

    // === 추천도 (Recommendation) ===
    // AI 추천률(40%) + 소셜 추천률(30%) + 리뷰 추천률(30%)
    const totalProbes = probeData?.length || 0;
    const brandMentionedProbes = (probeData || []).filter(
        (p: { brand_mentioned: boolean }) => p.brand_mentioned
    ).length;
    const aiRecommendationRate = totalProbes > 0
        ? Math.round((brandMentionedProbes / totalProbes) * 100)
        : 0;
    const socialRecommendationRate = socialData?.recommendation?.rate || 0;
    const reviewRecommendationRate = totalPainPoints > 0
        ? Math.round(((socialData?.recommendation_mentions_in_text || 0) / Math.max(totalPainPoints, 1)) * 100)
        : 0;
    const recommendationScore = Math.round(
        aiRecommendationRate * 0.4 + socialRecommendationRate * 0.3 + Math.min(reviewRecommendationRate, 100) * 0.3
    );

    // === 만족도 (Satisfaction) ===
    // 평점 정규화(30%) + 재구매율(30%) + (100-핵심불만률)(20%) + NPS(20%)
    const ratings = (reviewData || []).map((r: { rating: number }) => r.rating).filter((r: number) => r > 0);
    const avgRating = ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : 0;
    const ratingNormalized = Math.round((avgRating / 5) * 100);

    const repurchaseRate = totalPainPoints > 0
        ? Math.min(Math.round(((socialData?.repurchase_mentions || 0) / Math.max(totalPainPoints, 1)) * 100), 100)
        : 0;

    const negativePainPoints = (painData || []).filter(
        (p: { negative_points?: string[] }) => p.negative_points && p.negative_points.length > 0
    ).length;
    const coreComplaintRate = totalPainPoints > 0
        ? Math.round((negativePainPoints / totalPainPoints) * 100)
        : 0;

    // NPS 추정: 추천 비율 - 비추천(부정) 비율
    const npsEstimate = Math.max(0, Math.min(100,
        50 + (reviewPositiveRatio - coreComplaintRate) / 2
    ));

    const satisfactionScore = Math.round(
        ratingNormalized * 0.3 + repurchaseRate * 0.3 + (100 - coreComplaintRate) * 0.2 + npsEstimate * 0.2
    );

    // === 종합 점수 ===
    const overallScore = Math.round(
        (awarenessScore + favorabilityScore + recommendationScore + satisfactionScore) / 4
    );

    // === 진단 문장 생성 ===
    const scores = {
        awareness: awarenessScore,
        favorability: favorabilityScore,
        recommendation: recommendationScore,
        satisfaction: satisfactionScore,
    };
    const highest = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
    const lowest = Object.entries(scores).sort(([, a], [, b]) => a - b)[0];

    const labels: Record<string, string> = {
        awareness: "인지도",
        favorability: "호감도",
        recommendation: "추천도",
        satisfaction: "만족도",
    };

    let diagnosisText = `${brand_name}의 브랜드 가치 종합 점수는 ${overallScore}/100입니다. `;
    diagnosisText += `${labels[highest[0]]}(${highest[1]})이 가장 높고, ${labels[lowest[0]]}(${lowest[1]})이 가장 낮습니다. `;

    if (awarenessScore < 30 && favorabilityScore > 60) {
        diagnosisText += "제품은 좋으나 알려지지 않은 전형적인 패턴입니다. 콘텐츠 확산에 집중하세요.";
    } else if (awarenessScore > 60 && recommendationScore < 30) {
        diagnosisText += "인지도는 있지만 추천이 안 되고 있습니다. AI·소셜에서 추천 받을 수 있는 전략이 필요합니다.";
    } else if (overallScore < 30) {
        diagnosisText += "전반적으로 디지털 존재감이 미약합니다. 기초부터 구축이 필요합니다.";
    } else if (overallScore > 70) {
        diagnosisText += "브랜드 가치가 높은 편입니다. 유지·강화에 집중하세요.";
    }

    // === DB 저장 ===
    const today = new Date().toISOString().split("T")[0];

    // 기존 데이터 삭제
    await supabaseWrite(
        `${supabaseUrl}/rest/v1/bg_brand_values?product_id=eq.${product_id}&scan_date=eq.${today}`,
        "DELETE",
        serviceRoleKey,
        undefined
    ).catch(() => {});

    // 새 데이터 저장
    await supabaseWrite(
        `${supabaseUrl}/rest/v1/bg_brand_values`,
        "POST",
        serviceRoleKey,
        {
            product_id,
            awareness_score: awarenessScore,
            favorability_score: favorabilityScore,
            recommendation_score: recommendationScore,
            satisfaction_score: satisfactionScore,
            overall_score: overallScore,
            awareness_detail: { social_sov: socialSOV, search_sov: searchSOV, ai_awareness: aiAwareness },
            favorability_detail: { social_positive: socialPositive, assoc_positive: assocPositiveRatio, review_positive: reviewPositiveRatio },
            recommendation_detail: { ai_rate: aiRecommendationRate, social_rate: socialRecommendationRate, review_rate: reviewRecommendationRate },
            satisfaction_detail: { avg_rating: avgRating, repurchase_rate: repurchaseRate, core_complaint_rate: coreComplaintRate, nps: npsEstimate },
            diagnosis_text: diagnosisText,
            scan_date: today,
        }
    );

    return NextResponse.json({
        ok: true,
        brand_name,
        scores: {
            awareness: awarenessScore,
            favorability: favorabilityScore,
            recommendation: recommendationScore,
            satisfaction: satisfactionScore,
            overall: overallScore,
        },
        detail: {
            awareness: { social_sov: socialSOV, search_sov: searchSOV, ai_awareness: aiAwareness },
            favorability: { social_positive: socialPositive, review_positive: reviewPositiveRatio },
            recommendation: { ai_rate: aiRecommendationRate, social_rate: socialRecommendationRate },
            satisfaction: { avg_rating: avgRating, repurchase_rate: repurchaseRate, complaint_rate: coreComplaintRate },
        },
        diagnosis: diagnosisText,
    });
}
