// Routine 카테고리 SSOT — TimeTracker · DailyRoutinesCard · WeeklyView 공용
// 동일 카테고리에 대해 hex (24h 바·차트), dot (목록 점), soft (스케줄 그리드 블록) 3가지 표현 제공.
// brand teal(#0F766E)은 action layer 전용. rest의 teal-400은 충분히 구분되는 밝은 톤.

export type RoutineCategoryKey =
    | "general" | "work" | "exercise" | "meal" | "study" | "leisure"
    | "rest" | "social" | "faith" | "health" | "transport";

export interface RoutineCategoryMeta {
    key: RoutineCategoryKey;
    label: string;
    /** 24h 타임라인 막대·도트 hex */
    hex: string;
    /** 목록 dot 배경 — bg-{hue}-{shade} */
    dot: string;
    /** 스케줄 그리드 블록 — bg/text/border */
    soft: { bg: string; text: string; border: string };
}

export const ROUTINE_CATEGORIES: RoutineCategoryMeta[] = [
    { key: "general",   label: "일반",  hex: "#a3a3a3",
      dot: "bg-neutral-400", soft: { bg: "bg-neutral-50", text: "text-neutral-700", border: "border-l-neutral-400" } },
    { key: "work",      label: "업무",  hex: "#3b82f6",
      dot: "bg-blue-500",    soft: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-l-blue-500" } },
    { key: "exercise",  label: "운동",  hex: "#22c55e",
      dot: "bg-green-500",   soft: { bg: "bg-green-50",   text: "text-green-700",   border: "border-l-green-500" } },
    { key: "meal",      label: "식사",  hex: "#fb923c",
      dot: "bg-orange-400",  soft: { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-l-orange-400" } },
    { key: "study",     label: "학습",  hex: "#6366f1",
      dot: "bg-indigo-500",  soft: { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-l-indigo-500" } },
    { key: "leisure",   label: "여가",  hex: "#a78bfa",
      dot: "bg-violet-400",  soft: { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-l-violet-400" } },
    { key: "rest",      label: "휴식",  hex: "#2dd4bf",
      dot: "bg-teal-400",    soft: { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-l-teal-400" } },
    { key: "social",    label: "모임",  hex: "#fbbf24",
      dot: "bg-amber-400",   soft: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-l-amber-400" } },
    { key: "faith",     label: "신앙",  hex: "#a855f7",
      dot: "bg-purple-500",  soft: { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-l-purple-500" } },
    { key: "health",    label: "건강",  hex: "#fb7185",
      dot: "bg-rose-400",    soft: { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-l-rose-400" } },
    { key: "transport", label: "이동",  hex: "#38bdf8",
      dot: "bg-sky-400",     soft: { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-l-sky-400" } },
];

export const ROUTINE_CATEGORY_KEYS: RoutineCategoryKey[] = ROUTINE_CATEGORIES.map(c => c.key);

export function categoryMeta(key: string): RoutineCategoryMeta {
    return ROUTINE_CATEGORIES.find(c => c.key === key) ?? ROUTINE_CATEGORIES[0];
}

/** 스케줄 그리드 블록용 — WeeklyView legacy 호환 */
export const CATEGORY_SOFT_COLORS: Record<string, { bg: string; text: string; border: string }> =
    Object.fromEntries(ROUTINE_CATEGORIES.map(c => [c.key, c.soft]));
