// 플래너 주간 숫자 (완료율·Top 3·컨디션별 완료율) — 서버 전용, AI 없음
// 쓰는 곳: /api/myverse/weekly-review (주간 회고 화면) · /api/planners-mcp weekly_summary (연결한 AI) — 같은 숫자를 한 곳에서
import { createAdminClient } from "@/lib/supabase/admin";

const DOW = ["월", "화", "수", "목", "금", "토", "일"];

interface Task { id: string; text: string; status: string }
interface DayRow { date: string; tasks: Task[] | null; mood_level: number | null; energy_level: number | null; satisfaction_level: number | null; focus: { items?: { task_id: string; text: string }[] } | null; reflection: { questions?: { q: string; a: string }[] } | null }

export function mondayOf(d: string): string {
    const x = new Date(`${d}T00:00:00Z`);
    const dow = (x.getUTCDay() + 6) % 7;
    x.setUTCDate(x.getUTCDate() - dow);
    return x.toISOString().slice(0, 10);
}
export const addDays = (d: string, n: number) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
export const kstToday = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

export async function buildWeekStats(memberId: string, week: string) {
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


export function weekParam(v: string | null | undefined): string {
    return mondayOf(v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : kstToday());
}
