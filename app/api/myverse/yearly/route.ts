import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const year = parseInt(url.searchParams.get("year") || "0", 10);
    if (!year) return NextResponse.json({ error: "year_required" }, { status: 400 });

    const admin = createAdminClient();
    const { data } = await admin
        .from('myverse_yearly')
        .select('*')
        .eq('member_id', memberId)
        .eq('year', year)
        .maybeSingle();

    return NextResponse.json({ yearly: data });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { year, ...patch } = body;
    if (!year) return NextResponse.json({ error: "year_required" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('myverse_yearly')
        .upsert(
            { member_id: memberId, year, ...patch, updated_at: new Date().toISOString() },
            { onConflict: 'member_id,year' }
        )
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ yearly: data });
}
