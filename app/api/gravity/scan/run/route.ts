import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/gravity/scan/run
 * Brand Gravity 전체 파이프라인 오케스트레이터
 *
 * 실행 순서:
 *   1. [선택] pain/seed  — 리뷰 투입 (seed_reviews 있을 때만)
 *   2. pain/run          — Claude Sonnet 분류
 *   3. question/run      — 질문 패턴 클러스터링
 *   4. probe/run         — 5대 AI 질의
 *   5. gap/run           — Gravity Score 계산
 *
 * Body:
 * {
 *   product_id: string,
 *   brand_name: string,
 *   competitors?: string[],
 *   models?: string[],
 *   pattern_limit?: number,
 *   pain_limit?: number,
 *   top_n?: number,
 *   seed_reviews?: Array<{ raw_text, platform?, rating?, author? }>
 * }
 */
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const {
        product_id,
        brand_name,
        competitors = [],
        models = ["claude", "chatgpt", "gemini", "perplexity"],
        pattern_limit = 10,
        pain_limit = 20,
        top_n = 30,
        seed_reviews,
    } = body;

    if (!product_id || !brand_name) {
        return NextResponse.json({ error: "product_id, brand_name 필수" }, { status: 400 });
    }

    const base = req.nextUrl.origin;
    const headers = { "Content-Type": "application/json" };
    const steps: Array<{ step: string; ok: boolean; data?: unknown; error?: string }> = [];

    // ── Step 1: 리뷰 투입 (선택) ──────────────────────────────────
    if (Array.isArray(seed_reviews) && seed_reviews.length > 0) {
        try {
            const res = await fetch(`${base}/api/gravity/pain/seed`, {
                method: "POST",
                headers,
                body: JSON.stringify({ product_id, reviews: seed_reviews }),
            });
            const data = await res.json().catch(() => ({}));
            steps.push({ step: "seed", ok: res.ok, data });
        } catch (e) {
            steps.push({ step: "seed", ok: false, error: String(e) });
        }
    }

    // ── Step 2: 페인 포인트 분류 ──────────────────────────────────
    try {
        const res = await fetch(`${base}/api/gravity/pain/run`, {
            method: "POST",
            headers,
            body: JSON.stringify({ product_id, limit: pain_limit }),
        });
        const data = await res.json().catch(() => ({}));
        steps.push({ step: "pain_classify", ok: res.ok, data });
        if (!res.ok) {
            return NextResponse.json({ ok: false, steps, error: "pain_classify 실패" }, { status: 500 });
        }
    } catch (e) {
        steps.push({ step: "pain_classify", ok: false, error: String(e) });
        return NextResponse.json({ ok: false, steps, error: "pain_classify 예외" }, { status: 500 });
    }

    // ── Step 3: 질문 패턴 클러스터링 ─────────────────────────────
    try {
        const res = await fetch(`${base}/api/gravity/question/run`, {
            method: "POST",
            headers,
            body: JSON.stringify({ product_id, top_n }),
        });
        const data = await res.json().catch(() => ({}));
        steps.push({ step: "question_mapper", ok: res.ok, data });
        if (!res.ok) {
            return NextResponse.json({ ok: false, steps, error: "question_mapper 실패" }, { status: 500 });
        }
    } catch (e) {
        steps.push({ step: "question_mapper", ok: false, error: String(e) });
        return NextResponse.json({ ok: false, steps, error: "question_mapper 예외" }, { status: 500 });
    }

    // ── Step 4: AI 질의 ───────────────────────────────────────────
    try {
        const res = await fetch(`${base}/api/gravity/probe/run`, {
            method: "POST",
            headers,
            body: JSON.stringify({ product_id, brand_name, competitors, models, pattern_limit }),
        });
        const data = await res.json().catch(() => ({}));
        steps.push({ step: "ai_prober", ok: res.ok, data });
        if (!res.ok) {
            return NextResponse.json({ ok: false, steps, error: "ai_prober 실패" }, { status: 500 });
        }
    } catch (e) {
        steps.push({ step: "ai_prober", ok: false, error: String(e) });
        return NextResponse.json({ ok: false, steps, error: "ai_prober 예외" }, { status: 500 });
    }

    // ── Step 5: Gravity Score 계산 ────────────────────────────────
    let gravityResult: Record<string, unknown> = {};
    try {
        const res = await fetch(`${base}/api/gravity/gap/run`, {
            method: "POST",
            headers,
            body: JSON.stringify({ product_id, brand_name, competitors }),
        });
        const data = await res.json().catch(() => ({}));
        steps.push({ step: "gap_analyzer", ok: res.ok, data });
        if (res.ok) gravityResult = data as Record<string, unknown>;
    } catch (e) {
        steps.push({ step: "gap_analyzer", ok: false, error: String(e) });
    }

    return NextResponse.json({
        ok: true,
        steps,
        result: {
            gravity_score: gravityResult.gravity_score ?? null,
            mention_rate: gravityResult.mention_rate ?? null,
            avg_rank: gravityResult.avg_rank ?? null,
            model_breakdown: gravityResult.model_breakdown ?? {},
            competitor_scores: gravityResult.competitor_scores ?? {},
            gap_summary: gravityResult.gap_summary ?? {},
        },
    });
}
