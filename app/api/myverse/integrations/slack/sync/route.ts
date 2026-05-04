import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendToSlack } from "@/lib/myverse/slack";
import { getMemberId } from "@/lib/myverse/auth";

export async function POST() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();

    // 최신 브리핑 조회
    const { data: latest } = await admin
        .from("myverse_ai_briefings")
        .select("content, briefing_type, briefing_date")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const text = latest?.content
        ? `*${latest.briefing_type === "morning" ? "아침 브리핑" : latest.briefing_type === "midday" ? "중간 점검" : "저녁 정리"} — ${latest.briefing_date}*\n\n${latest.content}`
        : "최근 브리핑 내용이 없습니다. Planner's AI에서 브리핑을 먼저 생성해 주세요.";

    const result = await sendToSlack(memberId, text);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

    return NextResponse.json({ ok: true });
}
