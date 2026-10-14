// Planner's 자료실(플래너스 PAD) — 서버·클라이언트 공용 (분류 SSOT · 배지 · 표시 형식). 조회는 lib/planners/library.ts(서버)
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
    images: string[];
    detail_images: string[];
    download_count: number;
    legacy_badak_no: number | null;
    sort_order: number;
}

/** 분류 표시 순서 (scripts/planners-files-import.mjs CATEGORY와 같은 이름) */
export const PLANNER_CATEGORIES = ["연간 플래너", "프로젝트 북", "노트 북"] as const;
export const TEMPLATE_CATEGORIES = ["노트", "스케줄", "프레임워크", "스터디", "스타트업", "아이디어 샤워", "플레이"] as const;
/** 플래너스 PAD 몰 분류 탭 순서 */
export const PAD_CATEGORIES = [...PLANNER_CATEGORIES, ...TEMPLATE_CATEGORIES] as const;

export const PAD_CATEGORY_DESC: Record<string, string> = {
    "연간 플래너": "연간·월간·주간·일간을 한 권에 — 하이퍼링크로 오가는 기획자의 플래너",
    "프로젝트 북": "프로젝트 하나를 Question부터 Result Brief까지 한 권으로",
    "노트 북": "코넬 노트·콘티북·리갈 패드 — 여러 쪽짜리 노트",
    "노트": "무지·라인·그리드·점·스토리보드 속지",
    "스케줄": "연간·월간·주간·일간 일정과 습관 기록",
    "프레임워크": "SWOT·3C·STP·OKR·만다라트·비즈니스 캔버스 — 생각을 구조화하는 틀",
    "스터디": "원고지·외국어 쓰기·단어장·지도·시간표",
    "스타트업": "시작하는 스타트업이 스스로 해 보는 질문 (Word 문서)",
    "아이디어 샤워": "발상을 돕는 아이디어 모음",
    "플레이": "경기장·보드게임·사다리 타기 — 함께 노는 양식",
};

/** 옛 바닥상회에서 BEST로 표시하던 상품 (상품 번호) — 다운로드 수가 쌓이면 인기순이 대신한다 */
const LEGACY_BEST = new Set([182, 183, 184, 169, 170, 171, 6, 7]);
const NEW_YEAR = 2026;

export function fileBadges(f: Pick<PlannersFile, "year" | "legacy_badak_no">): ("NEW" | "BEST")[] {
    const out: ("NEW" | "BEST")[] = [];
    if (f.year === NEW_YEAR) out.push("NEW");
    if (f.legacy_badak_no && LEGACY_BEST.has(f.legacy_badak_no)) out.push("BEST");
    return out;
}

export type PadSort = "popular" | "new" | "name";

export function sortFiles(files: PlannersFile[], sort: PadSort): PlannersFile[] {
    const copy = [...files];
    if (sort === "name") return copy.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    if (sort === "new") return copy.sort((a, b) => b.sort_order - a.sort_order);
    const best = (f: PlannersFile) => (fileBadges(f).includes("BEST") ? 1 : 0);
    return copy.sort((a, b) => b.download_count - a.download_count || best(b) - best(a) || b.sort_order - a.sort_order);
}

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

export const padPath = (id: string) => `/planners/pad/${id}`;
