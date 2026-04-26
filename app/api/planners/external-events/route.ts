// 특정 날짜 범위의 외부 이벤트 조회 (캘린더 뷰에서 사용)

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    if (!from || !to) return NextResponse.json({ events: [] });

    const admin = createAdminClient();
    const { data } = await admin
        .from("planners_external_events")
        .select("*")
        .eq("member_id", memberId)
        .gte("start_at", from)
        .lte("start_at", to)
        .order("start_at");

    return NextResponse.json({ events: data ?? [] });
}
