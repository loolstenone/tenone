// Planner's Planner AI — 캘린더 엔트리 노출/표시 규칙 SSOT
// 모든 View(Daily/Weekly/Monthly/Yearly)는 이 룰만 참조해 렌더링한다.

export type CalendarKind =
    | "anniversary"
    | "meeting"
    | "public_holiday"
    | "solar_term";

export type ViewScope = "daily" | "weekly" | "monthly" | "yearly";

/** Monthly 셀에서의 표시 모드 */
export type MonthlyDisplay = "full" | "title" | "none";

export interface VisibilityRule {
    daily: boolean;
    weekly: boolean;
    monthly: MonthlyDisplay;
    yearly: boolean;
    /** Yearly 캘린더에서 다른 카테고리보다 위에 그려야 하면 true */
    yearly_priority?: boolean;
}

/** 종류별 노출 규칙 — 사용자 합의 사항 (협의 후 확정) */
export const VISIBILITY: Record<CalendarKind, VisibilityRule> = {
    anniversary:    { daily: true, weekly: true, monthly: "full",  yearly: true,  yearly_priority: true },
    public_holiday: { daily: true, weekly: true, monthly: "full",  yearly: true },
    solar_term:     { daily: true, weekly: true, monthly: "full",  yearly: true },
    meeting:        { daily: true, weekly: true, monthly: "title", yearly: false },
};

/** 종류별 기본 색상 (Tailwind 클래스 또는 hex) */
export const KIND_COLORS: Record<CalendarKind, { dot: string; bg: string; text: string; ring: string }> = {
    anniversary:    { dot: "bg-rose-500",    bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-200" },
    public_holiday: { dot: "bg-red-500",     bg: "bg-red-50",     text: "text-red-700",     ring: "ring-red-200" },
    solar_term:     { dot: "bg-neutral-400", bg: "bg-neutral-50", text: "text-neutral-600", ring: "ring-neutral-200" },
    meeting:        { dot: "bg-sky-500",     bg: "bg-sky-50",     text: "text-sky-700",     ring: "ring-sky-200" },
};

/** 한국어 라벨 */
export const KIND_LABELS: Record<CalendarKind, string> = {
    anniversary:    "기념일",
    public_holiday: "공휴일",
    solar_term:     "절기",
    meeting:        "미팅",
};

/** 어떤 kind 가 어떤 view 에 노출되는지 boolean 반환 */
export function isVisible(kind: CalendarKind, view: ViewScope): boolean {
    const rule = VISIBILITY[kind];
    if (view === "monthly") return rule.monthly !== "none";
    return rule[view];
}

/** Monthly 에서 풀 텍스트 vs 타이틀만 vs 숨김 */
export function monthlyDisplayMode(kind: CalendarKind): MonthlyDisplay {
    return VISIBILITY[kind].monthly;
}

export type RecurrenceUnit = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface CalendarEntry {
    id: string;
    member_id: string;
    kind: CalendarKind;
    title: string;
    description: string | null;
    start_date: string;     // YYYY-MM-DD
    start_time: string | null;
    end_time: string | null;
    recurrence: RecurrenceUnit;
    recurrence_until: string | null;
    status: "todo" | "done" | "carried" | "canceled" | null;
    color: string | null;
    country: string | null;
    is_system: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * 반복 엔트리를 [from, to] 범위 안의 발생일들로 펼침.
 * 단순 구현 — DST/타임존 고려 없이 ISO 날짜 기반 산술.
 */
export function expandOccurrences(
    entry: CalendarEntry,
    from: string,
    to: string
): Array<{ date: string; entry: CalendarEntry }> {
    const out: Array<{ date: string; entry: CalendarEntry }> = [];
    const fromD = new Date(from + "T00:00:00Z");
    const toD = new Date(to + "T00:00:00Z");
    const startD = new Date(entry.start_date + "T00:00:00Z");
    const untilD = entry.recurrence_until
        ? new Date(entry.recurrence_until + "T00:00:00Z")
        : toD;

    if (entry.recurrence === "none") {
        if (startD >= fromD && startD <= toD) {
            out.push({ date: entry.start_date, entry });
        }
        return out;
    }

    const cursor = new Date(startD);
    const limit = toD < untilD ? toD : untilD;

    while (cursor <= limit) {
        if (cursor >= fromD) {
            out.push({ date: cursor.toISOString().slice(0, 10), entry });
        }
        switch (entry.recurrence) {
            case "daily":   cursor.setUTCDate(cursor.getUTCDate() + 1); break;
            case "weekly":  cursor.setUTCDate(cursor.getUTCDate() + 7); break;
            case "monthly": cursor.setUTCMonth(cursor.getUTCMonth() + 1); break;
            case "yearly":  cursor.setUTCFullYear(cursor.getUTCFullYear() + 1); break;
        }
    }
    return out;
}

/** 한 view 에 보여줄 엔트리만 필터 + 발생일 펼치기 */
export function entriesForView(
    entries: CalendarEntry[],
    view: ViewScope,
    from: string,
    to: string
): Array<{ date: string; entry: CalendarEntry }> {
    return entries
        .filter((e) => isVisible(e.kind, view))
        .flatMap((e) => expandOccurrences(e, from, to));
}
