// 영혼의 단짝 — 관찰 기반 인사이트 카드
// GET  /api/myverse/coach/insights        오늘의 카드 조회 (캐시 hit 시 0 비용)
// POST /api/myverse/coach/insights        오늘의 카드 생성 (있으면 그대로 반환)
//
// 톤: ~야 / ~거든 / ~이야. 관찰만, 훈계 금지. 1-2문장, 60자 이내.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_PER_DAY = 2;

const SYSTEM_PROMPT = `너는 사용자의 일상을 옆에서 함께 봐 온 '영혼의 단짝'이야.

핵심 원칙:
- 톤: 평어체. "~야", "~거든", "~이야", "~네". 따뜻하지만 가깝게.
- 관찰만 한다. 훈계·조언·평가 금지. "이렇게 해봐" 같은 지시 금지.
- 사용자가 자기 패턴을 처음 보는 듯 알아차리게 만든다.
- 한 카드는 1~2문장, 총 60자 이내. 짧을수록 좋다.
- 데이터에 근거한 사실만 말한다. 추측·과장 금지.
- 출력은 JSON 배열만. 설명·머리말 없이.

출력 형식 (JSON 배열, 정확히 1~2개):
[
  { "kind": "pattern",   "body": "이번 주 화·목 저녁마다 한강이었네." },
  { "kind": "mood",      "body": "준이를 만난 다음 날엔 항상 운동했어." }
]

kind 종류:
- pattern    반복되는 행동 패턴
- mood       감정·기분의 흐름
- discovery  처음 발견한 것
- routine    루틴의 변화

데이터가 너무 부족하면 빈 배열 [] 반환.`;

interface MomentRow {
    date: string;
    domain: string | null;
    location: string | null;
    with_whom: string | null;
    activity: string | null;
    caption: string | null;
}
interface RoutineRow { date: string; activity: string; category: string | null; }
interface PlaceRow { date: string; place_name: string; category: string | null; }
interface InsightOut { kind: string; body: string; sources?: Record<string, unknown> }

function todayKST(): string {
    return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

async function callClaude(context: string): Promise<InsightOut[]> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return [];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 400,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: `최근 7일 기록:\n${context}\n\n위에서 관찰되는 인사이트를 1~2개 JSON 배열로 출력.` }],
        }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const text = (data?.content?.[0]?.text ?? "").trim();
    try {
        const m = text.match(/\[[\s\S]*\]/);
        if (!m) return [];
        const arr = JSON.parse(m[0]) as InsightOut[];
        return arr
            .filter(x => x && typeof x.body === "string" && typeof x.kind === "string")
            .slice(0, MAX_PER_DAY)
            .map(x => ({ kind: x.kind, body: x.body.slice(0, 200) }));
    } catch {
        return [];
    }
}

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const date = todayKST();
    const { data } = await admin
        .from("myverse_coach_insights")
        .select("id, kind, body, created_at, dismissed_at, reaction")
        .eq("member_id", memberId)
        .eq("date", date)
        .is("dismissed_at", null)
        .order("created_at", { ascending: true });

    return NextResponse.json({ date, insights: data ?? [] });
}

export async function POST() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const date = todayKST();

    // 캐시 확인 — 오늘 이미 발행된 카드가 있으면 그대로 반환 (비용 0)
    const existing = await admin
        .from("myverse_coach_insights")
        .select("id, kind, body, created_at, dismissed_at, reaction")
        .eq("member_id", memberId)
        .eq("date", date)
        .is("dismissed_at", null)
        .order("created_at", { ascending: true });

    if ((existing.data ?? []).length > 0) {
        return NextResponse.json({ date, insights: existing.data, cached: true });
    }

    // 최근 7일 컨텍스트 수집
    const since = new Date(Date.now() + 9 * 3600 * 1000 - 7 * 86400 * 1000).toISOString().slice(0, 10);

    const [momentsRes, routinesRes, placesRes] = await Promise.all([
        admin.from("myverse_daily_moments")
            .select("date, domain, location, with_whom, activity, caption")
            .eq("member_id", memberId).gte("date", since)
            .order("date", { ascending: true }).limit(60),
        admin.from("myverse_daily_routines")
            .select("date, activity, category")
            .eq("member_id", memberId).gte("date", since)
            .order("date", { ascending: true }).limit(80),
        admin.from("myverse_daily_places")
            .select("date, place_name, category")
            .eq("member_id", memberId).gte("date", since)
            .order("date", { ascending: true }).limit(40),
    ]);

    const moments = (momentsRes.data ?? []) as MomentRow[];
    const routines = (routinesRes.data ?? []) as RoutineRow[];
    const places = (placesRes.data ?? []) as PlaceRow[];

    if (moments.length + routines.length + places.length < 3) {
        return NextResponse.json({ date, insights: [], empty: true });
    }

    const lines: string[] = [];
    if (moments.length > 0) {
        lines.push("[흔적]");
        for (const m of moments) {
            const meta = [m.date, m.domain, m.location, m.with_whom && `with ${m.with_whom}`, m.activity].filter(Boolean).join(" · ");
            lines.push(`- ${meta}${m.caption ? ` "${m.caption.slice(0, 40)}"` : ""}`);
        }
    }
    if (routines.length > 0) {
        lines.push("[일과]");
        for (const r of routines) lines.push(`- ${r.date} ${r.activity}${r.category ? ` (${r.category})` : ""}`);
    }
    if (places.length > 0) {
        lines.push("[장소]");
        for (const p of places) lines.push(`- ${p.date} ${p.place_name}${p.category ? ` (${p.category})` : ""}`);
    }

    const generated = await callClaude(lines.join("\n"));
    if (generated.length === 0) {
        return NextResponse.json({ date, insights: [], generated: 0 });
    }

    const rows = generated.map(g => ({
        member_id: memberId,
        date,
        kind: g.kind,
        body: g.body,
        sources: { moments: moments.length, routines: routines.length, places: places.length },
    }));

    const ins = await admin.from("myverse_coach_insights").insert(rows).select("id, kind, body, created_at, dismissed_at, reaction");
    if (ins.error) return NextResponse.json({ error: "insert_failed", message: ins.error.message }, { status: 500 });

    return NextResponse.json({ date, insights: ins.data ?? [], generated: generated.length });
}
