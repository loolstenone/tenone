import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data } = await admin
        .from('myverse_ai_briefings')
        .select('*')
        .eq('member_id', memberId)
        .order('briefing_date', { ascending: false })
        .order('briefing_type')
        .limit(30);

    return NextResponse.json({ briefings: data ?? [] });
}
