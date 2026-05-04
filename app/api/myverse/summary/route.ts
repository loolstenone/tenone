import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const scope = url.searchParams.get("scope"); // weekly | monthly | yearly
    const year = parseInt(url.searchParams.get("year") || "0", 10);
    const week = parseInt(url.searchParams.get("week") || "0", 10);
    const month = parseInt(url.searchParams.get("month") || "0", 10);

    const admin = createAdminClient();
    let rpcName = "";
    let args: Record<string, unknown> = {};

    if (scope === "weekly") {
        rpcName = "myverse_weekly_summary";
        args = { _member_id: memberId, _year: year, _week: week };
    } else if (scope === "monthly") {
        rpcName = "myverse_monthly_summary";
        args = { _member_id: memberId, _year: year, _month: month };
    } else if (scope === "yearly") {
        rpcName = "myverse_yearly_summary";
        args = { _member_id: memberId, _year: year };
    } else {
        return NextResponse.json({ error: "invalid_scope" }, { status: 400 });
    }

    const { data, error } = await admin.rpc(rpcName, args);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ summary: data });
}
