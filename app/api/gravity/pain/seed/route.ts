import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

/**
 * POST /api/gravity/pain/seed
 * 수동으로 리뷰 원문을 bg_pain_sources에 투입 (크롤러 없이 테스트용)
 *
 * Body:
 * {
 *   product_id: string,
 *   reviews: Array<{
 *     raw_text: string,
 *     platform?: string,   // 기본값: "manual"
 *     url?: string,
 *     rating?: number,
 *     author?: string,
 *   }>
 * }
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { product_id, reviews } = body;

    if (!product_id) {
        return NextResponse.json({ error: "product_id 필수" }, { status: 400 });
    }
    if (!Array.isArray(reviews) || reviews.length === 0) {
        return NextResponse.json({ error: "reviews 배열 필수" }, { status: 400 });
    }

    const rows = reviews.map((r: {
        raw_text: string;
        platform?: string;
        url?: string;
        rating?: number;
        author?: string;
    }) => ({
        product_id,
        platform: r.platform ?? "manual",
        url: r.url ?? null,
        raw_text: r.raw_text,
        rating: r.rating ?? null,
        author: r.author ?? null,
        processed: false,
    }));

    const { data, error } = await supabase
        .from("bg_pain_sources")
        .insert(rows)
        .select("id");

    if (error) {
        console.error("[gravity/pain/seed] insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, inserted: data?.length ?? 0, ids: data?.map(r => r.id) });
}
