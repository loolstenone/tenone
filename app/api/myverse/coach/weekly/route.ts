// 주간 라이프 리포트 — 지난 주(또는 지정 주) 1개 캐시 + 생성
// GET  /api/myverse/coach/weekly?week=YYYY-MM-DD   주의 월요일 날짜
//        쿼리 없으면 가장 최근 완료된 주(지난 월요일~일요일)
// POST /api/myverse/coach/weekly { week?: "YYYY-MM-DD" }   생성(있으면 그대로)

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface MomentRow {
    date: string; domain: string | null; location: string | null;
    with_whom: string | null; activity: string | null; caption: string | null;
}
interface RoutineRow { date: string; activity: string; category: string | null; }
interface PlaceRow { date: string; place_name: string; category: string | null; }

const SYSTEM_PROMPT = `너는 사용자의 한 주를 함께 본 친구야.

원칙:
- 지난 7일 흔적·일과·장소를 보고, 한 주의 큰 흐름을 1~2문단으로 정리한다.
- 한국어 평어체. "~했네", "~였어", "~한 주였어" 같은 톤. 따뜻하고 가깝게.
- 사실에 근거. 추측·과장 금지. "이렇게 해봐" 같은 조언 금지.
- 출력은 JSON 한 객체. 머리말·해설 없음.

출력 형식:
{
  "summary": "이번 주는 ... 한 주였어. ...",
  "highlights": [
    { "title": "가장 자주 만난 사람", "body": "준이 (3번)" },
    { "title": "처음 가본 곳",      "body": "한남동 카페거리" }
  ]
}

highlights는 0~4개. 데이터가 있을 때만. 비어 있으면 빈 배열.`;

function kstNow(): Date {
    return new Date(Date.now() + 9 * 3600 * 1000);
}

// 주어진 날짜가 속한 주의 월요일을 리턴 (KST)
function mondayOf(d: Date): string {
    const dow = d.getUTCDay(); // 0=Sun
    const diff = (dow + 6) % 7; // 월요일까지 뒤로
    const m = new Date(d);
    m.setUTCDate(m.getUTCDate() - diff);
    return m.toISOString().slice(0, 10);
}

function lastCompletedMonday(): string {
    // KST 기준 오늘이 속한 주의 월요일에서 7일 전 = 지난 주 월요일
    const today = kstNow();
    const thisMon = new Date(mondayOf(today) + "T00:00:00Z");
    thisMon.setUTCDate(thisMon.getUTCDate() - 7);
    return thisMon.toISOString().slice(0, 10);
}

function addDays(d: string, n: number): string {
    const dt = new Date(d + "T00:00:00Z");
    dt.setUTCDate(dt.getUTCDate() + n);
    return dt.toISOString().slice(0, 10);
}

function topN<T extends string>(arr: T[], n: number): { key: T; count: number }[] {
    const map = new Map<T, number>();
    for (const x of arr) if (x) map.set(x, (map.get(x) ?? 0) + 1);
    return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([key, count]) => ({ key, count }));
}

async function callClaude(context: string): Promise<{ summary: string; highlights: { title: string; body: string }[] }> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { summary: "(AI 키 미설정)", highlights: [] };

    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 800,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: `한 주의 기록:\n${context}` }],
        }),
    });
    if (!res.ok) return { summary: "(AI 호출 실패)", highlights: [] };
    const data = await res.json();
    const text = (data?.content?.[0]?.text ?? "").trim();
    try {
        const m = text.match(/\{[\s\S]*\}/);
        if (!m) return { summary: text || "(빈 응답)", highlights: [] };
        const parsed = JSON.parse(m[0]);
        return {
            summary: typeof parsed.summary === "string" ? parsed.summary : "(요약 없음)",
            highlights: Array.isArray(parsed.highlights)
                ? parsed.highlights
                    .filter((x: unknown): x is { title: string; body: string } =>
                        !!x && typeof (x as { title?: unknown }).title === "string"
                            && typeof (x as { body?: unknown }).body === "string")
                    .slice(0, 4)
                : [],
        };
    } catch {
        return { summary: text || "(파싱 실패)", highlights: [] };
    }
}

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const weekParam = url.searchParams.get("week");
    const weekStart = weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam) ? weekParam : lastCompletedMonday();

    const admin = createAdminClient();
    const { data } = await admin
        .from("myverse_weekly_reports")
        .select("*")
        .eq("member_id", memberId)
        .eq("week_start", weekStart)
        .maybeSingle();

    return NextResponse.json({ week_start: weekStart, week_end: addDays(weekStart, 6), report: data ?? null });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const weekParam = typeof body?.week === "string" ? body.week : null;
    const weekStart = weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam) ? weekParam : lastCompletedMonday();
    const weekEnd = addDays(weekStart, 6);

    const admin = createAdminClient();

    // 캐시
    const existing = await admin
        .from("myverse_weekly_reports")
        .select("*")
        .eq("member_id", memberId)
        .eq("week_start", weekStart)
        .maybeSingle();
    if (existing.data) {
        return NextResponse.json({ week_start: weekStart, week_end: weekEnd, report: existing.data, cached: true });
    }

    const [momentsRes, routinesRes, placesRes] = await Promise.all([
        admin.from("myverse_daily_moments")
            .select("date, domain, location, with_whom, activity, caption")
            .eq("member_id", memberId).gte("date", weekStart).lte("date", weekEnd)
            .order("date", { ascending: true }).limit(80),
        admin.from("myverse_daily_routines")
            .select("date, activity, category")
            .eq("member_id", memberId).gte("date", weekStart).lte("date", weekEnd)
            .order("date", { ascending: true }).limit(120),
        admin.from("myverse_daily_places")
            .select("date, place_name, category")
            .eq("member_id", memberId).gte("date", weekStart).lte("date", weekEnd)
            .order("date", { ascending: true }).limit(60),
    ]);

    const moments = (momentsRes.data ?? []) as MomentRow[];
    const routines = (routinesRes.data ?? []) as RoutineRow[];
    const places = (placesRes.data ?? []) as PlaceRow[];

    if (moments.length + routines.length + places.length < 5) {
        return NextResponse.json({
            week_start: weekStart, week_end: weekEnd,
            report: null, empty: true,
        });
    }

    // stats
    const peopleArr = moments.flatMap(m => (m.with_whom ?? "").split(/[,，·、\s]+/).map(s => s.trim()).filter(Boolean));
    const placeArr = [
        ...moments.map(m => m.location ?? ""),
        ...places.map(p => p.place_name ?? ""),
    ].filter(Boolean);
    const domainArr = moments.map(m => m.domain ?? "").filter(Boolean);

    const stats = {
        moments: moments.length,
        routines: routines.length,
        places: places.length,
        top_people: topN(peopleArr, 3),
        top_places: topN(placeArr, 3),
        top_domain: topN(domainArr, 1)[0] ?? null,
    };

    // 컨텍스트
    const lines: string[] = [];
    if (moments.length > 0) {
        lines.push("[흔적]");
        for (const m of moments) {
            const meta = [m.date, m.domain, m.location, m.with_whom && `with ${m.with_whom}`, m.activity].filter(Boolean).join(" · ");
            lines.push(`- ${meta}${m.caption ? ` "${m.caption.slice(0, 50)}"` : ""}`);
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
    lines.push("");
    lines.push("[집계]");
    lines.push(`- 자주 만난 사람: ${stats.top_people.map(x => `${x.key}(${x.count})`).join(", ") || "—"}`);
    lines.push(`- 자주 간 장소: ${stats.top_places.map(x => `${x.key}(${x.count})`).join(", ") || "—"}`);
    lines.push(`- 주력 영역: ${stats.top_domain ? `${stats.top_domain.key}(${stats.top_domain.count})` : "—"}`);

    const ai = await callClaude(lines.join("\n"));

    const ins = await admin.from("myverse_weekly_reports").insert({
        member_id: memberId,
        week_start: weekStart,
        week_end: weekEnd,
        summary: ai.summary,
        highlights: ai.highlights,
        stats,
        sources: { moments: moments.length, routines: routines.length, places: places.length },
    }).select("*").maybeSingle();

    if (ins.error) return NextResponse.json({ error: "insert_failed", message: ins.error.message }, { status: 500 });

    return NextResponse.json({ week_start: weekStart, week_end: weekEnd, report: ins.data, generated: true });
}
