import Link from "next/link";
import { fetchWikiPages } from "@/lib/supabase/wiki-public";
import { WIKI_CATEGORIES, WIKI_STATIC_PAGES, type WikiCategory } from "@/types/wiki";

export const revalidate = 3600;

export const metadata = { title: "전체 색인" };

export default async function WikiIndexPage() {
    let pages: Array<{ slug: string; title: string; category: string; summary: string | null; tags: string[] }> = [];

    try {
        pages = await fetchWikiPages();
    } catch {
        // DB 연결 실패
    }

    // 카테고리별 그룹핑
    const grouped: Record<string, typeof pages> = {};
    for (const page of pages) {
        if (!grouped[page.category]) grouped[page.category] = [];
        grouped[page.category].push(page);
    }

    // 전체 태그 수집
    const tagCounts: Record<string, number> = {};
    for (const page of pages) {
        for (const tag of page.tags) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
    }
    const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);

    return (
        <div>
            <h1 className="text-lg font-bold mb-1">전체 색인</h1>
            <p className="text-xs text-neutral-400 mb-6">
                {pages.length + WIKI_STATIC_PAGES.length}개 페이지 — 카테고리별 정리
            </p>

            {/* 태그 클라우드 */}
            {topTags.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">태그</h2>
                    <div className="flex flex-wrap gap-1.5">
                        {topTags.map(([tag, count]) => (
                            <Link
                                key={tag}
                                href={`/wiki/search?q=${encodeURIComponent(tag)}`}
                                className="text-[10px] px-2 py-0.5 border border-neutral-200 rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
                            >
                                {tag} <span className="text-neutral-300">({count})</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* 정적 페이지 (운영·교육) */}
            <div className="mb-6">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">운영 · 교육</h2>
                <div className="space-y-0">
                    {WIKI_STATIC_PAGES.map(page => (
                        <Link
                            key={page.slug}
                            href={`/wiki/${page.slug}`}
                            className="flex items-center gap-3 py-1.5 border-b border-neutral-50 hover:bg-neutral-50 transition-colors px-2 -mx-2"
                        >
                            <span className="text-xs font-medium flex-1">{page.title}</span>
                            <span className="text-[10px] text-neutral-400">{page.description}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">{page.category}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* DB 카테고리별 목록 */}
            {Object.entries(WIKI_CATEGORIES).map(([key, cat]) => {
                const categoryPages = grouped[key] || [];
                if (categoryPages.length === 0) return (
                    <div key={key} className="mb-6">
                        <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: cat.color }}>
                            {cat.label} <span className="text-neutral-300 font-normal">· 0</span>
                        </h2>
                        <p className="text-[11px] text-neutral-300 italic">아직 페이지가 없습니다</p>
                    </div>
                );

                return (
                    <div key={key} className="mb-6">
                        <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: cat.color }}>
                            {cat.label} <span className="text-neutral-300 font-normal">· {categoryPages.length}</span>
                        </h2>
                        <div className="space-y-0">
                            {categoryPages
                                .sort((a, b) => a.title.localeCompare(b.title, 'ko'))
                                .map(page => (
                                    <Link
                                        key={page.slug}
                                        href={`/wiki/${page.slug}`}
                                        className="flex items-center gap-3 py-1.5 border-b border-neutral-50 hover:bg-neutral-50 transition-colors px-2 -mx-2"
                                    >
                                        <span className="text-xs font-medium flex-1">{page.title}</span>
                                        {page.summary && (
                                            <span className="text-[10px] text-neutral-400 truncate max-w-64">{page.summary}</span>
                                        )}
                                        {page.tags.length > 0 && (
                                            <div className="flex gap-1 shrink-0">
                                                {page.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="text-[9px] px-1 py-0.5 bg-neutral-100 text-neutral-400 rounded">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
