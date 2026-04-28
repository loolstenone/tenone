// 일자 범위로 planners_daily 조회 — 향후 일정·업무 패널 등에서 사용
// 응답: { rows: [{ date, tasks }] }
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    if (!from || !to) return NextResponse.json({ error: "from_to_required" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_daily")
        .select("date, tasks")
        .eq("member_id", memberId)
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rows: data ?? [] });
}
