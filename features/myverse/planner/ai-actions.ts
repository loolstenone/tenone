// 생각 쏟아내기(브레인 덤프) 결과 등록 — /api/myverse/ai/parse-input 응답을 플래너에 넣는다
// 명령 팔레트(CommandPalette)와 오늘 화면 '생각 쏟아내기'(BrainDump)가 같이 쓴다 (2026-10-14)
//   할 일 → 그날 daily.tasks에 추가 (읽고-더하고-저장) · 일정 → 캘린더(/api/myverse/calendar)

export interface ParsedAction {
    tool: "create_task" | "create_event" | "create_note";
    input: Record<string, unknown>;
}

export function todayKst(): string {
    return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** 화면 표시용 한 줄 */
export function describeAction(a: ParsedAction): { kind: string; title: string; when: string } {
    const i = a.input;
    const date = String(i.date ?? "");
    const time = (i.time ?? i.start_time ?? "") as string;
    const md = date ? `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}` : "";
    return {
        kind: a.tool === "create_event" ? "일정" : a.tool === "create_task" ? "할 일" : "메모",
        title: String(i.text ?? i.title ?? i.content ?? ""),
        when: [md, time, i.location ? `@${i.location}` : ""].filter(Boolean).join(" "),
    };
}

/** 고른 항목을 등록 — 같은 날 할 일은 한 번에 모아 저장(덮어쓰기 경합 방지) */
export async function commitParsedActions(actions: ParsedAction[]): Promise<{ ok: number; failed: number }> {
    let ok = 0, failed = 0;
    const tasksByDate = new Map<string, Record<string, unknown>[]>();
    for (const a of actions) {
        if (a.tool !== "create_task") continue;
        const date = (a.input.date as string) || todayKst();
        const list = tasksByDate.get(date) ?? [];
        list.push({
            id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            text: a.input.text as string,
            status: "todo",
            time: (a.input.time as string | null) ?? null,
            priority: (a.input.priority as string | null) ?? null,
        });
        tasksByDate.set(date, list);
    }
    for (const [date, add] of tasksByDate) {
        try {
            const r = await fetch(`/api/myverse/daily?date=${date}`, { cache: "no-store" });
            const cur = r.ok ? await r.json() : null;
            const tasks = Array.isArray(cur?.daily?.tasks) ? cur.daily.tasks : [];
            const res = await fetch(`/api/myverse/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, tasks: [...tasks, ...add] }),
            });
            if (res.ok) ok += add.length; else failed += add.length;
        } catch { failed += add.length; }
    }
    for (const a of actions) {
        if (a.tool !== "create_event") continue;
        try {
            const res = await fetch(`/api/myverse/calendar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entry_date: a.input.date,
                    kind: a.input.kind || "meeting",
                    title: a.input.title,
                    start_time: a.input.start_time ?? null,
                    end_time: a.input.end_time ?? null,
                    location: a.input.location ?? null,
                }),
            });
            if (res.ok) ok++; else failed++;
        } catch { failed++; }
    }
    // 화면들이 새로 읽도록 알림 (오늘·주간 등)
    if (ok > 0 && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("planner-data-changed"));
    return { ok, failed };
}
