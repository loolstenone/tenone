import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendToSlack } from "@/lib/planners/slack";

async function getMemberId(): Promise<string | null> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() {},
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: member } = await supabase.from("members").select("id").eq("email", user.email!).maybeSingle();
    return member?.id ?? null;
}

export async function POST() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();

    // 최신 브리핑 조회
    const { data: latest } = await admin
        .from("planners_ai_briefings")
        .select("content, briefing_type, briefing_date")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const text = latest?.content
        ? `*${latest.briefing_type === "morning" ? "아침 브리핑" : "저녁 정리"} — ${latest.briefing_date}*\n\n${latest.content}`
        : "최근 브리핑 내용이 없습니다. Planner's AI에서 브리핑을 먼저 생성해 주세요.";

    const result = await sendToSlack(memberId, text);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

    return NextResponse.json({ ok: true });
}
