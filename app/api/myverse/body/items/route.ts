// BODY 항목 목록 API — subtype별 (workout/meal/sleep)
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["workout", "meal", "sleep"]);

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const subtype = new URL(req.url).searchParams.get("subtype");
    if (!subtype || !ALLOWED.has(subtype)) return NextResponse.json({ error: "invalid_subtype" }, { status: 400 });

    const days = parseInt(new URL(req.url).searchParams.get("days") ?? "60", 10);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);

    const admin = createAdminClient();
    const { data } = await admin
        .from("planners_daily_routines")
        .select("id, date, start_time, end_time, activity, body_subtype, body_data, visibility")
        .eq("member_id", memberId)
        .eq("body_subtype", subtype)
        .gte("date", sinceStr)
        .order("date", { ascending: false })
        .order("start_time", { ascending: false, nullsFirst: false })
        .limit(100);

    return NextResponse.json({ items: data ?? [] });
}
