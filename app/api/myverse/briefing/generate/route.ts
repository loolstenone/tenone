import { NextResponse } from "next/server";
import { generateBriefing, inferBriefingType, type BriefingType } from "@/lib/myverse/briefing";
import { getMemberId } from "@/lib/myverse/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

// 하루 최대 AI 브리핑 생성 횟수 (morning · midday · evening 각 1회 = 3회)
const DAILY_AI_LIMIT = 3;

// KST(UTC+9) 기준 오늘 날짜
function todayKST(): string {
    const d = new Date(Date.now() + 9 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const rawType = body.type as BriefingType | "auto" | undefined;
    const type: BriefingType = rawType && rawType !== "auto" ? rawType : inferBriefingType();

    // 오늘 날짜만 허용 — 과거·미래 날짜로 반복 생성 차단
    const today = todayKST();

    if (type !== "morning" && type !== "midday" && type !== "evening") {
        return NextResponse.json({ error: "invalid_type" }, { status: 400 });
    }

    // 일일 AI 호출 횟수 확인
    const admin = createAdminClient();
    const { data: usage } = await admin
        .from("myverse_ai_usage")
        .select("morning_count, evening_count")
        .eq("member_id", memberId)
        .eq("usage_date", today)
        .maybeSingle();

    const usedToday = (usage?.morning_count ?? 0) + (usage?.evening_count ?? 0);
    if (usedToday >= DAILY_AI_LIMIT) {
        return NextResponse.json(
            { error: "rate_limited", message: "오늘 AI 브리핑 한도(3회)에 도달했습니다." },
            { status: 429 }
        );
    }

    try {
        const result = await generateBriefing(memberId, today, type);
        if (!result) return NextResponse.json({ error: "generation_failed" }, { status: 500 });
        return NextResponse.json({ content: result.content, id: result.briefingId, type });
    } catch (e) {
        console.error("briefing generation error", e);
        return NextResponse.json({ error: "generation_failed", message: (e as Error).message }, { status: 500 });
    }
}
