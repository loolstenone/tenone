// AI 일기 초안 — 그 날의 흔적·일과·장소·건강을 합성해 1-2 문장 일기 생성
// POST /api/myverse/daily/ai-diary  body: { date: "YYYY-MM-DD" }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface MomentRow { caption: string | null; with_whom: string | null; location: string | null; activity: string | null; domain: string | null; sub_tags: string[] | null; }
interface RoutineRow { activity: string; category: string | null; start_time: string | null; end_time: string | null; }
interface PlaceRow { place_name: string; category: string | null; visited_at: string | null; }

const SYSTEM_PROMPT = `너는 사용자의 하루를 한 문장으로 정리해 주는 친구다.

원칙:
- 한국어, 1-2문장 (총 60자 이내). 더 짧을수록 좋다.
- 그 날의 흔적·일과·장소를 보고 가장 인상적인 한 장면을 골라 적는다.
- 시적이거나 과장하지 말고, 일기처럼 사실적이고 따뜻하게.
- "당신"이 아니라 1인칭 ("...했다", "...였다") 또는 평어체.
- 데이터가 너무 부족하면 "조용한 하루였다" 처럼 솔직하게.
- 출력은 일기 본문만. 따옴표·해설·머리말 없음.`;

async function callClaude(context: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return "(AI 키 미설정)";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 200,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: `오늘의 기록:\n${context}` }],
        }),
    });

    if (!res.ok) return "(AI 호출 실패)";
    const data = await res.json();
    return (data?.content?.[0]?.text ?? "").trim() || "(빈 응답)";
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const date = String(body?.date || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "invalid_date" }, { status: 400 });

    const admin = createAdminClient();
    const [momentsRes, routinesRes, placesRes] = await Promise.all([
        admin.from("myverse_daily_moments")
            .select("caption, with_whom, location, activity, domain, sub_tags")
            .eq("member_id", memberId)
            .eq("date", date),
        admin.from("myverse_daily_routines")
            .select("activity, category, start_time, end_time")
            .eq("member_id", memberId)
            .eq("date", date)
            .order("start_time", { ascending: true }),
        admin.from("myverse_daily_places")
            .select("place_name, category, visited_at")
            .eq("member_id", memberId)
            .eq("date", date)
            .order("visited_at", { ascending: true }),
    ]);

    const moments = (momentsRes.data ?? []) as MomentRow[];
    const routines = (routinesRes.data ?? []) as RoutineRow[];
    const places = (placesRes.data ?? []) as PlaceRow[];

    if (moments.length === 0 && routines.length === 0 && places.length === 0) {
        return NextResponse.json({
            draft: "오늘은 아직 기록이 없어 — 짧게라도 한 줄을 남겨보면 어떨까.",
            empty: true,
        });
    }

    // 컨텍스트 구성
    const lines: string[] = [];
    if (moments.length > 0) {
        lines.push("[흔적]");
        for (const m of moments.slice(0, 10)) {
            const meta = [m.location, m.with_whom && `with ${m.with_whom}`, m.activity, m.domain, (m.sub_tags ?? []).join(",")].filter(Boolean).join(" · ");
            lines.push(`- ${meta}${m.caption ? ` — "${m.caption}"` : ""}`);
        }
    }
    if (routines.length > 0) {
        lines.push("[일과]");
        for (const r of routines.slice(0, 15)) {
            const time = [r.start_time?.slice(0, 5), r.end_time?.slice(0, 5)].filter(Boolean).join("-");
            lines.push(`- ${time ? time + " " : ""}${r.activity}${r.category ? ` (${r.category})` : ""}`);
        }
    }
    if (places.length > 0) {
        lines.push("[장소]");
        for (const p of places.slice(0, 10)) {
            lines.push(`- ${p.visited_at?.slice(0, 5) ?? ""} ${p.place_name}${p.category ? ` (${p.category})` : ""}`);
        }
    }

    const draft = await callClaude(lines.join("\n"));
    return NextResponse.json({
        draft,
        sources: { moments: moments.length, routines: routines.length, places: places.length },
    });
}
