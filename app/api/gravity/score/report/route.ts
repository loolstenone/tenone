import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gravity/score/report?product_id=xxx
 * 최신 스캔 기반 전체 리포트
 *
 * 반환:
 * - 최신 Gravity Score + 구성 요소
 * - AI별 세부 breakdown
 * - 경쟁사 비교
 * - Gap Summary (top_gaps, quick_wins)
 * - 상위 질문 패턴 (최대 10개)
 * - 상위 페인 카테고리 집계
 * - 최근 AI probe 샘플 (브랜드 언급된 것)
 */
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const product_id = searchParams.get("product_id");

    if (!product_id) {
        return NextResponse.json({ error: "product_id 필수" }, { status: 400 });
    }

    // 병렬 조회
    const [scoreRes, patternsRes, painRes, probeRes] = await Promise.all([
        // 최신 Gravity Score
        supabase
            .from("bg_gravity_scores")
            .select("*")
            .eq("product_id", product_id)
            .order("scan_date", { ascending: false })
            .limit(1)
            .single(),

        // 상위 질문 패턴
        supabase
            .from("bg_question_patterns")
            .select("cluster_label, pattern_text, frequency, pain_category, priority")
            .eq("product_id", product_id)
            .order("priority", { ascending: true })
            .limit(10),

        // 페인 카테고리 집계 (상위 10개)
        supabase
            .from("bg_pain_points")
            .select("pain_category, confidence")
            .eq("product_id", product_id)
            .not("pain_category", "is", null),

        // 브랜드 언급된 probe 샘플
        supabase
            .from("bg_ai_probe_results")
            .select("ai_model, question, response_text, brand_rank, competitors_mentioned")
            .eq("product_id", product_id)
            .eq("brand_mentioned", true)
            .order("probed_at", { ascending: false })
            .limit(5),
    ]);

    if (scoreRes.error && scoreRes.error.code !== "PGRST116") {
        return NextResponse.json({ error: scoreRes.error.message }, { status: 500 });
    }

    // 페인 카테고리 집계
    const painCategories: Record<string, number> = {};
    for (const p of painRes.data ?? []) {
        if (p.pain_category) {
            painCategories[p.pain_category] = (painCategories[p.pain_category] ?? 0) + 1;
        }
    }
    const topPainCategories = Object.entries(painCategories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([category, count]) => ({ category, count }));

    const score = scoreRes.data;

    return NextResponse.json({
        ok: true,
        report: {
            // Gravity Score
            gravity_score: score?.gravity_score ?? null,
            mention_score: score?.mention_score ?? null,
            rank_score: score?.rank_score ?? null,
            coverage_score: score?.coverage_score ?? null,
            mention_rate: score?.mention_rate ?? null,
            avg_rank: score?.avg_rank ?? null,
            total_queries: score?.total_queries ?? null,
            brand_mentioned_count: score?.brand_mentioned_count ?? null,
            scan_date: score?.scan_date ?? null,
            // 세부 분석
            model_breakdown: score?.model_breakdown ?? {},
            competitor_scores: score?.competitor_scores ?? {},
            gap_summary: score?.gap_summary ?? { top_gaps: [], quick_wins: [] },
            // 질문 패턴
            top_patterns: patternsRes.data ?? [],
            // 페인 카테고리
            top_pain_categories: topPainCategories,
            // 브랜드 언급 샘플
            brand_mention_samples: probeRes.data ?? [],
        },
    });
}
