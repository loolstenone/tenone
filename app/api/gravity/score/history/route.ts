import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/gravity/score/history?product_id=xxx&days=90
 * Gravity Score 시간 추이 조회
 */
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const product_id = searchParams.get("product_id");
    const days = parseInt(searchParams.get("days") ?? "90", 10);

    if (!product_id) {
        return NextResponse.json({ error: "product_id 필수" }, { status: 400 });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
        .from("bg_gravity_scores")
        .select("scan_date, gravity_score, mention_score, rank_score, coverage_score, mention_rate, avg_rank, total_queries, brand_mentioned_count")
        .eq("product_id", product_id)
        .gte("scan_date", since.toISOString().split("T")[0])
        .order("scan_date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, history: data ?? [] });
}
