/**
 * GET  /api/hero/coaching/sessions?memberId=...&limit=20
 * POST /api/hero/coaching/sessions  { memberId, topic, summary?, actionItems?, sessionDate?, coachName?, sessionType? }
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

    if (!memberId) return NextResponse.json({ error: "memberId 필수" }, { status: 400 });

    const sb = createAdminClient();
    const { data, error } = await sb
        .from("hero_coaching_sessions")
        .select("id, session_date, coach_name, topic, summary, action_items, session_type, created_at")
        .eq("member_id", memberId)
        .order("session_date", { ascending: false })
        .limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
    const { memberId, topic, summary, actionItems, sessionDate, coachName, sessionType } =
        await req.json() as {
            memberId?: string;
            topic?: string;
            summary?: string;
            actionItems?: string[];
            sessionDate?: string;
            coachName?: string;
            sessionType?: string;
        };

    if (!memberId || !topic?.trim()) {
        return NextResponse.json({ error: "memberId, topic 필수" }, { status: 400 });
    }
    if (topic.length > 100) {
        return NextResponse.json({ error: "topic은 100자 이내로 작성해주세요" }, { status: 400 });
    }
    if (summary && summary.length > 500) {
        return NextResponse.json({ error: "summary는 500자 이내로 작성해주세요" }, { status: 400 });
    }

    const validTypes = ["self", "peer", "mentor", "pro"];
    const type = validTypes.includes(sessionType ?? "") ? sessionType : "self";

    const sb = createAdminClient();
    const { data, error } = await sb
        .from("hero_coaching_sessions")
        .insert({
            member_id: memberId,
            topic: topic.trim(),
            summary: summary?.trim() ?? null,
            action_items: actionItems ?? [],
            session_date: sessionDate ?? new Date().toISOString().slice(0, 10),
            coach_name: coachName?.trim() ?? null,
            session_type: type,
        })
        .select("id, session_date, coach_name, topic, summary, action_items, session_type, created_at")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data });
}
