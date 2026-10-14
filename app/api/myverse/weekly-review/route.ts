// 플래너'스 AI 2단계 ② — 주간 회고 리포트 (2026-10-14)
// GET  ?week=YYYY-MM-DD(월요일, 없으면 이번 주) → 숫자(무료, AI 없음) + 저장된 AI 해석
// POST { week, refresh? } → AI 해석 생성(유료 회원 전용) · myverse_weekly_reports 에 저장(sources.kind='planner_review')
//
// 숫자: 요일별 완료율 · 오늘의 Top 3 달성 · 기분/에너지와 완료율의 관계(높은 날 vs 낮은 날, 각 2일 이상일 때만) · 회고 답 수
// ⚠️ myverse_weekly_reports는 원래 MyVerse 생활 리포트(coach/weekly)용 — 동결·0건이라 Planner's가 쓴다. (member_id, week_start) 유일
// ❌ 수면·건강 수치를 분석에 넣지 않는다 (민감정보 — 별도 동의 전). 기분·에너지·만족은 사용자가 플래너에 직접 적은 값만

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { getApiUser } from "@/lib/api-guard";
import { requireAiAccess, isAiDenied, logAiUsage } from "@/lib/myverse/ai-access";
import type { NextRequest } from "next/server";

const MODEL = "claude-haiku-4-5-20251001";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DOW = ["월", "화", "수", "목", "금", "토", "일"];

interface Task { id: string; text: string; status: string }
interface DayRow { date: string; tasks: Task[] | null; mood_level: number | null; energy_level: number | null; satisfaction_level: number | null; focus: { items?: { task_id: string; text: string }[] } | null; reflection: { questions?: { q: string; a: string }[] } | null }

function mondayOf(d: string): string {
    const x = new Date(`${d}T00:00:00Z`);
    const dow = (x.getUTCDay() + 6) % 7;
    x.setUTCDate(x.getUTCDate() - dow);
    return x.toISOString().slice(0, 10);
}
const addDays = (d: string, n: number) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const kstToday = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

async function buildStats(memberId: string, week: string) {
    const end = addDays(week, 6);
    const { data } = await createAdminClient()
        .from("myverse_daily")
        .select("date, tasks, mood_level, energy_level, satisfaction_level, focus, reflection")
        .eq("member_id", memberId).gte("date", week).lte("date", end);
    const rows = new Map(((data ?? []) as DayRow[]).map((r) => [r.date, r]));
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(week, i);
        const r = rows.get(date);
        const tasks = (r?.tasks ?? []).filter((t) => t && t.status !== "carried"); // 옮긴 사본은 다음 날에서 센다
        const done = tasks.filter((t) => t.status === "done").length;
        const top = r?.focus?.items ?? [];
        const doneIds = new Set(tasks.filter((t) => t.status === "done").map((t) => t.id));
        return {
            date, dow: DOW[i],
            total: tasks.length, done,
            rate: tasks.length ? Math.round((done / tasks.length) * 100) : null,
            mood: r?.mood_level ?? null, energy: r?.energy_level ?? null, satisfaction: r?.satisfaction_level ?? null,
            top3: top.length, top3_done: top.filter((t) => doneIds.has(t.task_id)).length,
            reflected: (r?.reflection?.questions ?? []).filter((q) => q.a?.trim()).length > 0,
        };
    });
    const total = days.reduce((a, d) => a + d.total, 0);
    const done = days.reduce((a, d) => a + d.done, 0);
    const top3 = days.reduce((a, d) => a + d.top3, 0);
    const top3Done = days.reduce((a, d) => a + d.top3_done, 0);

    // 상태(에너지 우선, 없으면 기분)가 높은 날 vs 낮은 날의 평균 완료율 — 각 2일 이상일 때만
    const withState = days.filter((d) => d.rate !== null && (d.energy ?? d.mood) !== null);
    const hi = withState.filter((d) => (d.energy ?? d.mood)! >= 4);
    const lo = withState.filter((d) => (d.energy ?? d.mood)! <= 2);
    const avg = (xs: typeof days) => Math.round(xs.reduce((a, d) => a + (d.rate ?? 0), 0) / xs.length);
    const relation = hi.length >= 2 && lo.length >= 2 ? { high_days: hi.length, high_rate: avg(hi), low_days: lo.length, low_rate: avg(lo) } : null;

    const best = days.filter((d) => d.rate !== null && d.total >= 2).sort((a, b) => (b.rate! - a.rate!))[0] ?? null;
    return {
        week, end, days,
        total, done, rate: total ? Math.round((done / total) * 100) : null,
        top3, top3_done: top3Done,
        reflected_days: days.filter((d) => d.reflected).length,
        relation,
        best_day: best ? { dow: best.dow, rate: best.rate } : null,
        reflections: ((data ?? []) as DayRow[]).flatMap((r) => (r.reflection?.questions ?? []).filter((q) => q.a?.trim()).map((q) => ({ date: r.date, q: q.q, a: q.a.slice(0, 300) }))),
    };
}

async function readCached(memberId: string, week: string) {
    const { data } = await createAdminClient()
        .from("myverse_weekly_reports")
        .select("summary, highlights, created_at, sources")
        .eq("member_id", memberId).eq("week_start", week).maybeSingle();
    if (!data || (data.sources as { kind?: string } | null)?.kind !== "planner_review") return null;
    return { summary: data.summary as string, highlights: data.highlights, created_at: data.created_at };
}

function weekParam(v: string | null | undefined): string {
    return mondayOf(v && DATE_RE.test(v) ? v : kstToday());
}

export async function GET(req: Request) {
    const u = await getApiUser(req as NextRequest);
    if (!u?.memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const week = weekParam(new URL(req.url).searchParams.get("week"));
    const [stats, insight] = await Promise.all([buildStats(u.memberId, week), readCached(u.memberId, week)]);
    const { reflections: _r, ...publicStats } = stats; // 답 원문은 화면에 다시 보내지 않는다 (이미 하루 화면에 있음)
    void _r;
    return NextResponse.json({ stats: publicStats, insight });
}

const TOOL: Anthropic.Tool = {
    name: "weekly_review",
    description: "한 주의 플래너 기록을 읽고 코치처럼 돌려준다.",
    input_schema: {
        type: "object",
        properties: {
            summary: { type: "string", description: "이번 주를 한두 문장으로 (존댓말, 80자 이내)" },
            well: { type: "string", description: "잘한 점 하나 — 숫자나 기록에 근거 (존댓말)" },
            pattern: { type: "string", description: "보이는 패턴 하나 — 요일·상태·밀린 일 등 근거 있게 (존댓말). 근거가 약하면 '아직 기록이 적어 패턴을 단정하기 어렵다'고" },
            next: { type: "string", description: "다음 주에 해 볼 작은 실험 하나 (존댓말, 구체적으로)" },
        },
        required: ["summary", "well", "pattern", "next"],
    },
};

export async function POST(req: Request) {
    const aiAccess = await requireAiAccess(req);
    if (isAiDenied(aiAccess)) return aiAccess;
    if (aiAccess.kind !== "member") return NextResponse.json({ error: "member_only" }, { status: 400 });
    const memberId = aiAccess.memberId;
    const body = await req.json().catch(() => ({})) as { week?: string; refresh?: boolean };
    const week = weekParam(body.week);

    if (!body.refresh) {
        const cached = await readCached(memberId, week);
        if (cached) return NextResponse.json({ insight: cached, cached: true });
    }
    const stats = await buildStats(memberId, week);
    if (stats.total === 0) return NextResponse.json({ insight: null, empty: true, message: "이번 주 기록이 아직 없어요. 할 일을 적고 지워 가면 주말에 돌아볼 거리가 생겨요." });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
    await logAiUsage(aiAccess, "weekly_review");

    const dayLines = stats.days.map((d) => `${d.dow} ${d.date.slice(5)}: 할 일 ${d.done}/${d.total}${d.rate !== null ? ` (${d.rate}%)` : ""}${d.top3 ? ` · Top3 ${d.top3_done}/${d.top3}` : ""}${d.energy !== null ? ` · 에너지 ${d.energy}` : ""}${d.mood !== null ? ` · 기분 ${d.mood}` : ""}${d.satisfaction !== null ? ` · 만족 ${d.satisfaction}` : ""}`).join("\n");
    const refl = stats.reflections.slice(0, 12).map((r) => `- (${r.date.slice(5)}) ${r.q} → ${r.a}`).join("\n") || "- 없음";
    const rel = stats.relation ? `상태 높은 날 ${stats.relation.high_days}일 평균 ${stats.relation.high_rate}% · 낮은 날 ${stats.relation.low_days}일 평균 ${stats.relation.low_rate}%` : "상태와 완료율 비교: 기록 부족";

    let resp: Anthropic.Message;
    try {
        resp = await new Anthropic({ apiKey }).messages.create({
            model: MODEL, max_tokens: 900,
            system: `당신은 기획자의 따뜻한 코치입니다. 한 주의 플래너 기록을 읽고 돌려줍니다.
- 반드시 기록·숫자에 근거한다. 없는 사실을 지어내지 않는다. 기록이 적으면 솔직하게 말한다.
- 요일·일수·퍼센트는 아래 표를 그대로 옮긴다 ("처음 며칠" 같은 어림말 대신 요일 이름으로).
- 다그치거나 평가하지 않는다. 부드러운 존댓말.
- 건강·수면은 기록에 없으니 언급하지 않는다.`,
            tools: [TOOL], tool_choice: { type: "tool", name: TOOL.name },
            messages: [{ role: "user", content: `주간 ${stats.week} ~ ${stats.end}\n전체 완료 ${stats.done}/${stats.total}${stats.rate !== null ? ` (${stats.rate}%)` : ""} · Top3 달성 ${stats.top3_done}/${stats.top3}\n${rel}\n\n요일별\n${dayLines}\n\n저녁 회고 답\n${refl}` }],
        });
    } catch (e) {
        console.error("[weekly-review] AI 실패", e);
        return NextResponse.json({ error: "ai_error" }, { status: 500 });
    }
    const block = resp.content.find((b) => b.type === "tool_use");
    const out = (block?.type === "tool_use" ? block.input : {}) as { summary?: string; well?: string; pattern?: string; next?: string };
    const highlights = { well: String(out.well ?? "").slice(0, 300), pattern: String(out.pattern ?? "").slice(0, 300), next: String(out.next ?? "").slice(0, 300) };
    const summary = String(out.summary ?? "").slice(0, 300);
    const { reflections: _x, ...savedStats } = stats;
    void _x;
    await createAdminClient().from("myverse_weekly_reports").upsert({
        member_id: memberId, week_start: week, week_end: stats.end,
        summary, highlights, stats: savedStats, sources: { kind: "planner_review" },
    }, { onConflict: "member_id,week_start" });
    return NextResponse.json({ insight: { summary, highlights, created_at: new Date().toISOString() } });
}
