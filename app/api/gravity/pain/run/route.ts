import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/gravity/pain/run
 * pain-classify Edge Function을 트리거해 미처리 소스를 분류
 *
 * Body:
 * {
 *   product_id?: string,   // 특정 제품만 처리 (없으면 전체)
 *   limit?: number,        // 한 번에 처리할 개수 (기본 20)
 * }
 */
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { product_id, limit = 20 } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: "환경 변수 누락" }, { status: 500 });
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/pain-classify`;

    const res = await fetch(edgeFunctionUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ product_id, limit }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        console.error("[gravity/pain/run] edge function error:", data);
        return NextResponse.json({ error: "Edge Function 오류", detail: data }, { status: 500 });
    }

    return NextResponse.json(data);
}
