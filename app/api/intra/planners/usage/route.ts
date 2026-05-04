import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: usage, error } = await supabaseAdmin
        .from("myverse_ai_usage")
        .select("member_id, year_month, morning_count, evening_count, total_count")
        .order("year_month", { ascending: false })
        .limit(500);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const memberIds = [...new Set((usage || []).map((u) => u.member_id))];
    const { data: members } = await supabaseAdmin
        .from("myverse_users")
        .select("member_id, email")
        .in("member_id", memberIds);

    const emailMap: Record<string, string> = {};
    (members || []).forEach((m) => { emailMap[m.member_id] = m.email; });

    // Aggregate totals
    const totalBriefings = (usage || []).reduce((s, u) => s + (u.total_count || 0), 0);
    const totalMorning = (usage || []).reduce((s, u) => s + (u.morning_count || 0), 0);
    const totalEvening = (usage || []).reduce((s, u) => s + (u.evening_count || 0), 0);

    const enriched = (usage || []).map((u) => ({
        ...u,
        email: emailMap[u.member_id] ?? "—",
    }));

    return NextResponse.json({ usage: enriched, stats: { totalBriefings, totalMorning, totalEvening } });
}
