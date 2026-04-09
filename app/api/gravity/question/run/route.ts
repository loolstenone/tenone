import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/gravity/question/run
 * question-mapper Edge Function을 트리거해 질문 패턴 클러스터링 실행
 *
 * Body:
 * {
 *   product_id: string,  // 필수
 *   top_n?: number,      // 패턴 최대 개수 (기본 30)
 * }
 */
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { product_id, top_n = 30 } = body;

    if (!product_id) {
        return NextResponse.json({ error: "product_id 필수" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: "환경 변수 누락" }, { status: 500 });
    }

    const res = await fetch(`${supabaseUrl}/functions/v1/question-mapper`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ product_id, top_n }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        console.error("[gravity/question/run] edge function error:", data);
        return NextResponse.json({ error: "Edge Function 오류", detail: data }, { status: 500 });
    }

    return NextResponse.json(data);
}
