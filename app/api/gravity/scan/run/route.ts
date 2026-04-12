import { NextRequest, NextResponse } from "next/server";
import { notifyPipelineStep, notifyAnalysisComplete } from "@/lib/gravity/notify";

/**
 * POST /api/gravity/scan/run
 * Brand Gravity 전체 파이프라인 오케스트레이터
 *
 * 실행 순서:
 *   1. [선택] pain/seed  — 리뷰 투입 (seed_reviews 있을 때만)
 *   2. pain/run          — Claude Sonnet 분류
 *   3. question/run      — 질문 패턴 클러스터링
 *   4. probe/run         — AI 질의
 *   5. source/run        — AI 응답 소스 추적
 *   6. gap/run           — Gravity Score 계산
 *   7. voice/run         — AEO 콘텐츠 브리프 생성
 *   8. brand-value/run   — 브랜드 4대 가치 산출
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

    // ── 인코딩 안전: DB에서 실제 브랜드명 조회 ─────────────────────
    // HTTP body로 전달된 brand_name은 인코딩 이슈가 생길 수 있으므로
    // product_id로 bg_products에서 직접 조회한 name을 사용한다.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let safeBrandName = brand_name;
    if (supabaseUrl && serviceRoleKey) {
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
    }
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
        notifyPipelineStep(safeBrandName, "페인포인트 분류", 2, 8, res.ok).catch(() => {});
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
        notifyPipelineStep(safeBrandName, "질문 클러스터링", 3, 8, res.ok).catch(() => {});
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
            body: JSON.stringify({ product_id, brand_name: safeBrandName, competitors, models, pattern_limit }),
        });
        const data = await res.json().catch(() => ({}));
        steps.push({ step: "ai_prober", ok: res.ok, data });
        notifyPipelineStep(safeBrandName, "AI 프로빙", 4, 8, res.ok).catch(() => {});
        if (!res.ok) {
            return NextResponse.json({ ok: false, steps, error: "ai_prober 실패" }, { status: 500 });
        }
    } catch (e) {
        steps.push({ step: "ai_prober", ok: false, error: String(e) });
        return NextResponse.json({ ok: false, steps, error: "ai_prober 예외" }, { status: 500 });
    }

    // ── Step 5: 소스 추적 (gap 전에 실행 — Context Score에 필요) ──
    try {
        const res = await fetch(`${base}/api/gravity/source/run`, {
            method: "POST",
            headers,
            body: JSON.stringify({ product_id, brand_name: safeBrandName, competitors, limit: 10 }),
        });
        const data = await res.json().catch(() => ({}));
        steps.push({ step: "source_tracer", ok: res.ok, data });
    } catch (e) {
        steps.push({ step: "source_tracer", ok: false, error: String(e) });
        // source 실패해도 계속 진행
    }

    // ── Step 6: Gravity Score 계산 ────────────────────────────────
    let gravityResult: Record<string, unknown> = {};
    try {
        const res = await fetch(`${base}/api/gravity/gap/run`, {
            method: "POST",
            headers,
            body: JSON.stringify({ product_id, brand_name: safeBrandName, competitors }),
        });
        const data = await res.json().catch(() => ({}));
        steps.push({ step: "gap_analyzer", ok: res.ok, data });
        if (res.ok) gravityResult = data as Record<string, unknown>;
    } catch (e) {
        steps.push({ step: "gap_analyzer", ok: false, error: String(e) });
    }

    // ── Step 7: 콘텐츠 브리프 생성 ───────────────────────────────
    try {
        const res = await fetch(`${base}/api/gravity/voice/run`, {
            method: "POST",
            headers,
            body: JSON.stringify({ product_id, brand_name: safeBrandName, competitors, limit: 5 }),
        });
        const data = await res.json().catch(() => ({}));
        steps.push({ step: "voice_designer", ok: res.ok, data });
    } catch (e) {
        steps.push({ step: "voice_designer", ok: false, error: String(e) });
    }

    // ── Step 8: 브랜드 4대 가치 산출 ─────────────────────────────
    let brandValueResult: Record<string, unknown> = {};
    try {
        const res = await fetch(`${base}/api/gravity/brand-value/run`, {
            method: "POST",
            headers,
            body: JSON.stringify({ product_id, brand_name: safeBrandName, competitors }),
        });
        const data = await res.json().catch(() => ({}));
        steps.push({ step: "brand_value", ok: res.ok, data });
        if (res.ok) brandValueResult = data as Record<string, unknown>;
    } catch (e) {
        steps.push({ step: "brand_value", ok: false, error: String(e) });
    }

    // 전체 파이프라인 완료 알림
    const finalScore = typeof gravityResult.gravity_score === "number" ? gravityResult.gravity_score : 0;
    notifyAnalysisComplete(
        safeBrandName,
        finalScore as number,
        `/intra/gravity/${product_id}/report`
    ).catch(() => {});

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
            brand_values: (brandValueResult as { scores?: unknown }).scores ?? null,
        },
    });
}
