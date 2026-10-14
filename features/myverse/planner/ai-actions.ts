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
            // 손글씨에서 × 표시로 끝낸 일은 끝냄으로 (생각 쏟아내기는 항상 todo)
            status: a.input.status === "done" ? "done" : "todo",
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
                    start_date: a.input.date,  // 캘린더 API 필드명 (예전 entry_date라 일정이 저장되지 않았음 — 2026-10-14 수정)
                    kind: a.input.kind === "anniversary" ? "anniversary" : "meeting", // 캘린더 종류는 anniversary·meeting만 받는다
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

/** 손글씨에서 읽은 메모 → 그날 노트 하나로 추가 (오늘 화면 노트와 같은 Cornell 형식, DailyView serializeNotes와 맞춤) */
export async function saveMemoNote(date: string, title: string, text: string): Promise<boolean> {
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return false;
    try {
        const r = await fetch(`/api/myverse/daily?date=${date}`, { cache: "no-store" });
        const cur = r.ok ? await r.json() : null;
        let list: unknown[] = [];
        try { const p = JSON.parse(cur?.daily?.notes || "[]"); if (Array.isArray(p)) list = p; } catch { /* 옛 글 형식이면 새 목록으로 시작하지 않고 보존 */
            if (cur?.daily?.notes) list = [{ id: `n_legacy_${Date.now()}`, type: "cornell", title: "노트", cue: "", content: JSON.stringify({ _cornell: true, rows: [{ id: "r1", cue: "", note: String(cur.daily.notes) }], summary: "" }), summary: "" }];
        }
        const rows = lines.map((note, i) => ({ id: `r${i + 1}`, cue: "", note }));
        list.push({ id: `n_hw_${Date.now()}`, type: "cornell", title, cue: "", content: JSON.stringify({ _cornell: true, rows, summary: "" }), summary: "" });
        const res = await fetch(`/api/myverse/daily`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, notes: JSON.stringify(list) }),
        });
        return res.ok;
    } catch { return false; }
}

/** 브라우저에서 사진을 긴 변 maxSide로 줄여 JPEG data URL로 (원본은 서버로 보내지 않는다) */
export function shrinkImage(file: Blob, maxSide = 1600, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const k = Math.min(1, maxSide / Math.max(img.width, img.height));
            const c = document.createElement("canvas");
            c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
            const ctx = c.getContext("2d");
            if (!ctx) { URL.revokeObjectURL(url); reject(new Error("canvas")); return; }
            ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            resolve(c.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image")); };
        img.src = url;
    });
}
