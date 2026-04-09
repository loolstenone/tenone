import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/gravity/gap/run
 * gap-analyzer Edge Function을 트리거해 Gravity Score 계산 실행
 *
 * Body:
 * {
 *   product_id: string,     // 필수
 *   brand_name: string,     // 필수
 *   competitors?: string[], // 경쟁사 목록
 * }
 */
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { product_id, brand_name, competitors } = body;

    if (!product_id || !brand_name) {
        return NextResponse.json({ error: "product_id, brand_name 필수" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: "환경 변수 누락" }, { status: 500 });
    }

    const res = await fetch(`${supabaseUrl}/functions/v1/gap-analyzer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ product_id, brand_name, competitors }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        console.error("[gravity/gap/run] edge function error:", data);
        return NextResponse.json({ error: "Edge Function 오류", detail: data }, { status: 500 });
    }

    return NextResponse.json(data);
}
