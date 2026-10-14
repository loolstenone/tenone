// 플래너'스 AI 연결(MCP) — 사용자가 연결한 자기 AI(Claude·ChatGPT 등)가 쓰는 데이터 함수 (2026-10-14)
// 허용 범위 = 읽기 + 할 일 추가 (사용자 결정). 지우기·고치기·회고 쓰기는 없다
// 모두 본인(memberId) 기록만 — 연결 토큰의 사용자로만 호출된다 (app/api/planners-mcp/route.ts)
import { createAdminClient } from "@/lib/supabase/admin";
import { buildWeekStats, weekParam, kstToday, addDays } from "@/lib/planners/weekly-stats";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_RANGE = 62;

interface Task { id: string; text: string; status: string; time?: string | null; priority?: string | null; project_id?: string | null }

const validDate = (d: string | undefined, fallback: string) => (d && DATE_RE.test(d) ? d : fallback);

export async function getDay(memberId: string, date?: string) {
    const d = validDate(date, kstToday());
    const admin = createAdminClient();
    const [{ data: row }, { data: events }] = await Promise.all([
        admin.from("myverse_daily").select("tasks, focus, reflection, daily_result, mood_level, energy_level").eq("member_id", memberId).eq("date", d).maybeSingle(),
        admin.from("myverse_calendar_entries").select("title, start_time, end_time, location").eq("member_id", memberId).eq("start_date", d).order("start_time"),
    ]);
    const tasks = ((row?.tasks as Task[]) ?? []).filter((t) => t?.text && t.status !== "carried")
        .map((t) => ({ id: t.id, text: t.text, status: t.status, time: t.time ?? null, important: t.priority === "high" }));
    const reflection = ((row?.reflection as { questions?: { q: string; a: string }[] } | null)?.questions ?? []).filter((q) => q.a?.trim());
    return {
        date: d,
        tasks,
        events: (events ?? []).map((e) => ({ title: e.title, start: e.start_time?.slice(0, 5) ?? null, end: e.end_time?.slice(0, 5) ?? null, location: e.location ?? null })),
        top3: ((row?.focus as { items?: { text: string; reason: string }[] } | null)?.items ?? []).map((i) => ({ text: i.text, reason: i.reason })),
        day_result: row?.daily_result ?? null,
        evening_reflection: reflection.map((q) => ({ question: q.q, answer: q.a })),
    };
}

export async function listTasks(memberId: string, from?: string, to?: string, status?: "todo" | "done" | "all") {
    const t = validDate(to, kstToday());
    let f = validDate(from, addDays(t, -6));
    if (f > t) f = t;
    if (f < addDays(t, -MAX_RANGE)) f = addDays(t, -MAX_RANGE);
    const { data } = await createAdminClient().from("myverse_daily").select("date, tasks").eq("member_id", memberId).gte("date", f).lte("date", t).order("date");
    const out: { date: string; text: string; status: string; time: string | null; important: boolean }[] = [];
    for (const r of data ?? []) {
        for (const x of ((r.tasks as Task[]) ?? [])) {
            if (!x?.text || x.status === "carried") continue;
            if (status === "todo" && x.status === "done") continue;
            if (status === "done" && x.status !== "done") continue;
            out.push({ date: r.date as string, text: x.text, status: x.status, time: x.time ?? null, important: x.priority === "high" });
        }
    }
    return { from: f, to: t, count: out.length, tasks: out.slice(0, 300) };
}

/** 낱말 검색 (AI 없음 — 연결한 AI가 질문을 낱말로 바꿔 부른다) */
export async function searchRecords(memberId: string, words: string[], from?: string, to?: string) {
    const t = validDate(to, kstToday());
    let f = validDate(from, addDays(t, -365));
    if (f > t) f = t;
    if (f < addDays(t, -730)) f = addDays(t, -730);
    const ws = [...new Set(words.flatMap((w) => String(w).split(/\s+/)).map((w) => w.trim().toLowerCase()).filter(Boolean))].slice(0, 12);
    if (!ws.length) return { from: f, to: t, results: [] };
    const admin = createAdminClient();
    const [{ data: days }, { data: events }] = await Promise.all([
        admin.from("myverse_daily").select("date, tasks, daily_result, reflection").eq("member_id", memberId).gte("date", f).lte("date", t).limit(800),
        admin.from("myverse_calendar_entries").select("start_date, title, description, location").eq("member_id", memberId).gte("start_date", f).lte("start_date", t).limit(800),
    ]);
    const hits: { date: string; type: string; text: string; score: number }[] = [];
    const score = (s: string) => { const h = s.toLowerCase(); return ws.reduce((a, w) => a + (h.includes(w) ? 1 : 0), 0); };
    for (const d of days ?? []) {
        for (const x of ((d.tasks as Task[]) ?? [])) if (x?.text) { const sc = score(x.text); if (sc) hits.push({ date: d.date as string, type: "할 일", text: x.text, score: sc }); }
        if (d.daily_result) { const sc = score(d.daily_result as string); if (sc) hits.push({ date: d.date as string, type: "하루 결과", text: String(d.daily_result).slice(0, 300), score: sc }); }
        for (const q of ((d.reflection as { questions?: { q: string; a: string }[] } | null)?.questions ?? [])) {
            if (!q.a?.trim()) continue;
            const s2 = `${q.q} ${q.a}`; const sc = score(s2); if (sc) hits.push({ date: d.date as string, type: "저녁 회고", text: s2.slice(0, 300), score: sc });
        }
    }
    for (const e of events ?? []) {
        const s2 = [e.title, e.description, e.location].filter(Boolean).join(" ");
        const sc = score(s2); if (sc) hits.push({ date: e.start_date as string, type: "일정", text: s2.slice(0, 300), score: sc });
    }
    hits.sort((a, b) => b.score - a.score || (a.date < b.date ? 1 : -1));
    return { from: f, to: t, words: ws, results: hits.slice(0, 30).map(({ score: _s, ...r }) => { void _s; return r; }) };
}

export async function weeklySummary(memberId: string, week?: string) {
    const stats = await buildWeekStats(memberId, weekParam(week));
    const { reflections: _r, ...rest } = stats; // 회고 원문은 get_day로만
    void _r;
    return rest;
}

export async function listProjects(memberId: string) {
    const { data } = await createAdminClient().from("myverse_projects").select("id, title, status, start_date, end_date").eq("member_id", memberId).neq("status", "archived").order("order_index").limit(100);
    return { projects: data ?? [] };
}

/** 할 일 추가 — 연결한 AI가 쓸 수 있는 유일한 쓰기 */
export async function addTask(memberId: string, input: { date?: string; text: string; time?: string; important?: boolean; project_id?: string }) {
    const text = String(input.text ?? "").trim().slice(0, 200);
    if (!text) throw new Error("text required");
    const date = validDate(input.date, kstToday());
    const time = input.time && TIME_RE.test(input.time) ? input.time : null;
    const admin = createAdminClient();
    let projectId: string | null = null;
    if (input.project_id) {
        const { data: p } = await admin.from("myverse_projects").select("id").eq("id", input.project_id).eq("member_id", memberId).maybeSingle();
        if (!p) throw new Error("project not found");
        projectId = p.id as string;
    }
    const task = {
        id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        text, status: "todo", time,
        priority: input.important ? "high" : null,
        ...(projectId ? { project_id: projectId } : {}),
        source: "connected_ai",
    };
    const { data: row } = await admin.from("myverse_daily").select("id, tasks").eq("member_id", memberId).eq("date", date).maybeSingle();
    if (row) {
        const tasks = [...((row.tasks as Task[]) ?? []), task];
        if (tasks.length > 200) throw new Error("too many tasks on this day");
        const { error } = await admin.from("myverse_daily").update({ tasks, updated_at: new Date().toISOString() }).eq("id", row.id);
        if (error) throw new Error(error.message);
    } else {
        const { error } = await admin.from("myverse_daily").insert({ member_id: memberId, date, tasks: [task] });
        if (error) throw new Error(error.message);
    }
    return { added: { date, text, time, important: !!input.important, project_id: projectId } };
}
