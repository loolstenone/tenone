import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/gravity/pain/collect
 * pain-collect Edge Function 트리거
 *
 * Body:
 * {
 *   product_id: string,
 *   brand_name: string,
 *   category?: string,
 *   keywords?: string[],
 *   competitors?: string[],
 *   limit?: number,
 * }
 */
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { product_id, brand_name, category, keywords, competitors, limit } = body;

    if (!product_id || !brand_name) {
        return NextResponse.json({ error: "product_id, brand_name 필수" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: "환경 변수 누락" }, { status: 500 });
    }

    const res = await fetch(`${supabaseUrl}/functions/v1/pain-collect`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ product_id, brand_name, category, keywords, competitors, limit }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        console.error("[gravity/pain/collect] edge function error:", data);
        return NextResponse.json({ error: "Edge Function 오류", detail: data }, { status: 500 });
    }

    return NextResponse.json(data);
}
