// Planner's 자료실 — 서버·클라이언트 공용 (분류 SSOT · 표시 형식). 조회는 lib/planners/library.ts(서버)
export type PlannersFileKind = "planner" | "template";

export interface PlannersFile {
    id: string;
    kind: PlannersFileKind;
    category: string;
    title: string;
    description: string | null;
    year: number | null;
    file_name: string;
    file_size: number;
    thumbnail_url: string | null;
    download_count: number;
}

/** 분류 표시 순서 (scripts/planners-files-import.mjs CATEGORY와 같은 이름) */
export const PLANNER_CATEGORIES = ["연간 플래너", "프로젝트 북", "노트 북"] as const;
export const TEMPLATE_CATEGORIES = ["노트", "스케줄", "프레임워크", "스터디", "스타트업", "아이디어 샤워", "플레이"] as const;

export function groupByCategory(files: PlannersFile[], order: readonly string[]): [string, PlannersFile[]][] {
    const groups = new Map<string, PlannersFile[]>();
    for (const f of files) groups.set(f.category, [...(groups.get(f.category) ?? []), f]);
    const rank = (c: string) => (order.indexOf(c) === -1 ? order.length : order.indexOf(c));
    return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b));
}

export function formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
    return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export function fileExt(name: string): string {
    return (name.split(".").pop() ?? "").toUpperCase();
}
