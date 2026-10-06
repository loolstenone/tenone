/**
 * MADzine 카테고리 SSOT — DB 제약 mad_articles_category_check와 같아야 한다 (sql/madzine-categories-and-import.sql)
 * 순서·이름은 기존 madleague.net MADzine과 동일 (2026-10-06 이전 결정)
 */
export const MADZINE_CATEGORIES = [
    { slug: "cover", label: "커버" },
    { slug: "interview", label: "인터뷰" },
    { slug: "case", label: "케이스" },
    { slug: "report", label: "리포트" },
    { slug: "story", label: "스토리" },
    { slug: "hero", label: "HeRo" },
    { slug: "series", label: "시리즈" },
    { slug: "news", label: "동아리" },
] as const;

export type MadzineCategory = (typeof MADZINE_CATEGORIES)[number]["slug"];

const SLUGS = new Set<string>(MADZINE_CATEGORIES.map(c => c.slug));

export function isMadzineCategory(v: unknown): v is MadzineCategory {
    return typeof v === "string" && SLUGS.has(v);
}

export function madzineCategoryLabel(slug: string): string {
    return MADZINE_CATEGORIES.find(c => c.slug === slug)?.label ?? slug;
}
