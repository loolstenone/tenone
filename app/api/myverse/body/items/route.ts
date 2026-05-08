// BODY 항목 목록 API — subtype별 (workout/meal/sleep)
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

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
        .from("myverse_daily_routines")
        .select("id, date, start_time, end_time, activity, body_subtype, body_data, visibility")
        .eq("member_id", memberId)
        .eq("body_subtype", subtype)
        .gte("date", sinceStr)
        .order("date", { ascending: false })
        .order("start_time", { ascending: false, nullsFirst: false })
        .limit(100);

    return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { subtype, date, start_time, end_time, activity, body_data } = body;
    if (!subtype || !ALLOWED.has(subtype)) return NextResponse.json({ error: "invalid_subtype" }, { status: 400 });
    if (!activity) return NextResponse.json({ error: "activity_required" }, { status: 400 });

    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_daily_routines")
        .insert({
            member_id: memberId,
            date: date || today,
            start_time: start_time || null,
            end_time: end_time || null,
            activity,
            body_subtype: subtype,
            body_data: body_data ?? {},
            domain: "body",
            visibility: "private",
        })
        .select("id, date, start_time, end_time, activity, body_subtype, body_data, visibility")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data }, { status: 201 });
}
