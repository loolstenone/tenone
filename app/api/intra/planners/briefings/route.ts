import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data, error } = await supabaseAdmin
        .from("myverse_ai_briefings")
        .select("id, member_id, briefing_date, briefing_type, created_at, content")
        .order("created_at", { ascending: false })
        .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Join member emails
    const memberIds = [...new Set((data || []).map((b) => b.member_id))];
    const { data: members } = await supabaseAdmin
        .from("myverse_users")
        .select("member_id, email")
        .in("member_id", memberIds);

    const emailMap: Record<string, string> = {};
    (members || []).forEach((m) => { emailMap[m.member_id] = m.email; });

    const enriched = (data || []).map((b) => ({
        ...b,
        email: emailMap[b.member_id] ?? "—",
        content_preview: (b.content || "").slice(0, 120),
    }));

    return NextResponse.json({ briefings: enriched });
}
