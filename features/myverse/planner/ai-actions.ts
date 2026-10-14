// 생각 쏟아내기(브레인 덤프) 결과 등록 — /api/myverse/ai/parse-input 응답을 플래너에 넣는다
// 명령 팔레트(CommandPalette)와 오늘 화면 '생각 쏟아내기'(BrainDump)가 같이 쓴다 (2026-10-14)
//   할 일 → 그날 daily.tasks에 추가 (읽고-더하고-저장) · 일정 → 캘린더(/api/myverse/calendar)

export interface ParsedAction {
    tool: "create_task" | "create_event" | "create_note";
    input: Record<string, unknown>;
}

const TOOLS = new Set(["create_task", "create_event", "create_note"]);

/** AI 응답 정리 — tool·input 모양이 어긋난 항목은 버린다 (input 없는 항목 하나로 화면 전체가 멈추지 않게, 2026-10-15 QA) */
export function sanitizeActions(raw: unknown): ParsedAction[] {
    if (!Array.isArray(raw)) return [];
    return raw.filter((a): a is ParsedAction =>
        !!a && typeof a === "object"
        && TOOLS.has((a as { tool?: unknown }).tool as string)
        && !!(a as { input?: unknown }).input && typeof (a as { input?: unknown }).input === "object");
}

/** 제목·시각 — 미리보기와 저장이 같은 규칙을 쓴다 (미리보기에만 보이고 저장은 빈 제목이 되던 차이 제거) */
export function pickTitle(i: Record<string, unknown>): string {
    return String(i.text ?? i.title ?? i.content ?? "").trim();
}
export function pickTime(i: Record<string, unknown>): string | null {
    const v = i.time ?? i.start_time;
    return typeof v === "string" && v ? v : null;
}

export function todayKst(): string {
    return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** 화면 표시용 한 줄 */
export function describeAction(a: ParsedAction): { kind: string; title: string; when: string } {
    const i = a.input;
    const date = String(i.date ?? "");
    const time = pickTime(i) ?? "";
    const md = date ? `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}` : "";
    return {
        kind: a.tool === "create_event" ? "일정" : a.tool === "create_task" ? "할 일" : "메모",
        title: pickTitle(i),
        when: [md, time, i.location ? `@${i.location}` : ""].filter(Boolean).join(" "),
    };
}

/** 고른 항목을 등록 — 같은 날 할 일은 한 번에 모아 저장(덮어쓰기 경합 방지)
 *  skipped = 여기서 넣지 않는 종류(메모) — 화면이 '넣었다'고 세지 않게 따로 돌려준다 */
export async function commitParsedActions(actions: ParsedAction[]): Promise<{ ok: number; failed: number; skipped: number }> {
    let ok = 0, failed = 0, skipped = 0;
    const tasksByDate = new Map<string, Record<string, unknown>[]>();
    for (const a of actions) {
        if (a.tool === "create_note") { skipped++; continue; }
        if (a.tool !== "create_task") continue;
        const title = pickTitle(a.input);
        if (!title) { failed++; continue; }
        const date = (typeof a.input.date === "string" && a.input.date) || todayKst();
        const list = tasksByDate.get(date) ?? [];
        list.push({
            id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            text: title,
            // 손글씨에서 × 표시로 끝낸 일은 끝냄으로 (생각 쏟아내기는 항상 todo)
            status: a.input.status === "done" ? "done" : "todo",
            time: pickTime(a.input),
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
        const title = pickTitle(a.input);
        // 날짜·제목 없는 일정은 보내지 않는다 (start_date: undefined로 POST돼 실패하던 것)
        if (typeof a.input.date !== "string" || !a.input.date || !title) { failed++; continue; }
        try {
            const res = await fetch(`/api/myverse/calendar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    start_date: a.input.date,  // 캘린더 API 필드명 (예전 entry_date라 일정이 저장되지 않았음 — 2026-10-14 수정)
                    kind: a.input.kind === "anniversary" ? "anniversary" : "meeting", // 캘린더 종류는 anniversary·meeting만 받는다
                    title,
                    start_time: pickTime(a.input),
                    end_time: a.input.end_time ?? null,
                    location: a.input.location ?? null,
                }),
            });
            if (res.ok) ok++; else failed++;
        } catch { failed++; }
    }
    // 화면들이 새로 읽도록 알림 (오늘·주간 등)
    if (ok > 0 && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("planner-data-changed"));
    return { ok, failed, skipped };
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

/** 사진 올리기 전 검사 — 너무 큰 파일은 브라우저가 풀다가 멈춘다 (46MB 사진 그대로 디코딩, 2026-10-15 QA) */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export function validateUpload(file: Blob): string | null {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return "사진 파일만 올릴 수 있어요.";
    if (file.size > MAX_UPLOAD_BYTES) return "사진이 너무 커요 (20MB까지). 다시 찍거나 줄여서 올려 주세요.";
    return null;
}

/** 브라우저에서 사진을 긴 변 maxSide로 줄여 JPEG data URL로 (원본은 서버로 보내지 않는다) */
export function shrinkImage(file: Blob, maxSide = 1600, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
        const invalid = validateUpload(file);
        if (invalid) { reject(new Error(invalid)); return; }
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            if (!img.width || !img.height) { URL.revokeObjectURL(url); reject(new Error("image")); return; }
            const k = Math.min(1, maxSide / Math.max(img.width, img.height));
            const c = document.createElement("canvas");
            // 아주 긴 사진(1×16000)도 폭이 0이 되지 않게 — 0이면 빈 이미지("data:,")가 AI로 갔다
            c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
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

/** 앱 안 펜슬 손글씨(획 좌표) → 흰 바탕 JPEG data URL (3단계 '글자로 바꾸기') */
export function renderStrokes(data: { strokes: { points: number[][]; color: string; size: number; penType?: string }[]; width: number; height: number }, maxSide = 1600): string | null {
    if (!data?.strokes?.length) return null;
    const k = Math.min(2, maxSide / Math.max(data.width || 600, data.height || 320));
    const c = document.createElement("canvas");
    c.width = Math.round((data.width || 600) * k); c.height = Math.round((data.height || 320) * k);
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const st of data.strokes) {
        if (!st.points?.length) continue;
        ctx.strokeStyle = st.penType === "highlighter" ? "rgba(250,204,21,0.35)" : (st.color || "#111");
        ctx.lineWidth = Math.max(1.5, (st.size || 3) * k);
        ctx.beginPath();
        st.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x * k, y * k) : ctx.lineTo(x * k, y * k)));
        if (st.points.length === 1) ctx.lineTo(st.points[0][0] * k + 0.1, st.points[0][1] * k);
        ctx.stroke();
    }
    return c.toDataURL("image/jpeg", 0.9);
}

/** 손글씨 노트 → 생각 쏟아내기(BrainDump)로 보내 읽게 한다 */
export const READ_IMAGE_EVENT = "planner-read-image";
