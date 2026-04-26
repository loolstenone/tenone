import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const year = parseInt(url.searchParams.get("year") || "0", 10);
    const month = parseInt(url.searchParams.get("month") || "0", 10);
    if (!year || !month) return NextResponse.json({ error: "year_month_required" }, { status: 400 });

    const admin = createAdminClient();
    const { data } = await admin
        .from('planners_monthly')
        .select('*')
        .eq('member_id', memberId)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

    return NextResponse.json({ monthly: data });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { year, month, ...patch } = body;
    if (!year || !month) return NextResponse.json({ error: "year_month_required" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('planners_monthly')
        .upsert(
            { member_id: memberId, year, month, ...patch, updated_at: new Date().toISOString() },
            { onConflict: 'member_id,year,month' }
        )
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ monthly: data });
}
