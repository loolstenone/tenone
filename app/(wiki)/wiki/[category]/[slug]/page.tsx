import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Globe, Home, Heart, BookOpen, Building2, Bot, Clock, Lightbulb,
    ArrowLeft, Tag, Calendar, Hash, Link2, GitBranch,
} from "lucide-react";
import { fetchWikiPage, fetchWikiPages } from "@/lib/supabase/wiki-public";
import { WIKI_CATEGORIES, type WikiCategory } from "@/types/wiki";
import { WikiContent } from "./WikiContent";

export const revalidate = 3600;

const CATEGORY_ICONS: Record<WikiCategory, React.ElementType> = {
    universe:       Globe,
    'vision-house': Home,
    'core-values':  Heart,
    protocols:      BookOpen,
    brands:         Building2,
    agents:         Bot,
    chronicle:      Clock,
    insights:       Lightbulb,
};

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }) {
    const { category, slug } = await params;
    const fullSlug = `${category}/${slug}`;
    const { page } = await fetchWikiPage(fullSlug);
    if (!page) return { title: "Not Found" };
    return { title: page.title, description: page.summary || undefined };
}

export default async function WikiPageView({ params }: { params: Promise<{ category: string; slug: string }> }) {
    const { category, slug } = await params;
    const fullSlug = `${category}/${slug}`;

    const { page, linkedPages } = await fetchWikiPage(fullSlug);

    if (!page) notFound();

    const cat = WIKI_CATEGORIES[page.category as WikiCategory];
    const CatIcon = CATEGORY_ICONS[page.category as WikiCategory] || BookOpen;

    // 슬러그맵 빌드 (wikilink 해석용)
    let allPages: Array<{ slug: string; title: string }> = [];
    try {
        allPages = await fetchWikiPages();
    } catch { /* ignore */ }
    const slugMap: Record<string, string> = {};
    for (const p of allPages) {
        slugMap[p.title] = p.slug;
    }

    // 연결된 페이지를 카테고리별 그룹핑
    const linkedByCategory: Record<string, Array<{ slug: string; title: string; linkType: string }>> = {};
    for (const lp of linkedPages) {
        const lpCat = WIKI_CATEGORIES[lp.category as WikiCategory]?.label || lp.category;
        if (!linkedByCategory[lpCat]) linkedByCategory[lpCat] = [];
        linkedByCategory[lpCat].push({ slug: lp.slug, title: lp.title, linkType: lp.linkType });
    }

    const LINK_TYPE_LABELS: Record<string, string> = {
        reference: "참조",
        parent: "상위",
        related: "관련",
    };

    return (
        <div>
            {/* 브레드크럼 */}
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-5">
                <Link href="/wiki" className="hover:text-neutral-600 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Wiki
                </Link>
                <span>/</span>
                <Link href={`/wiki/${category}`} className="hover:text-neutral-700 font-medium" style={{ color: cat?.color }}>
                    {cat?.label || category}
                </Link>
                <span>/</span>
                <span className="text-neutral-600">{page.title}</span>
            </div>

            <div className="flex gap-8">
                {/* 본문 */}
                <div className="flex-1 min-w-0">
                    {/* 페이지 헤더 */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: cat ? `${cat.color}20` : '#f5f5f5' }}>
                                <CatIcon className="w-3.5 h-3.5" style={{ color: cat?.color || '#737373' }} />
                            </div>
                            <span className="text-[11px] font-medium" style={{ color: cat?.color || '#737373' }}>{cat?.label || category}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900">{page.title}</h1>
                        {page.summary && (
                            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{page.summary}</p>
                        )}
                        {page.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                                <Tag className="w-3 h-3 text-neutral-300" />
                                {page.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 border border-neutral-200 rounded-full text-neutral-500">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 구분선 */}
                    <div className="border-t border-neutral-100 mb-6" />

                    {/* 본문 마크다운 */}
                    <WikiContent content={page.content} slugMap={slugMap} />

                    {/* 연결된 페이지 */}
                    {Object.keys(linkedByCategory).length > 0 && (
                        <div className="mt-10 pt-6 border-t border-neutral-200">
                            <div className="flex items-center gap-2 mb-4">
                                <Link2 className="w-4 h-4 text-neutral-400" />
                                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">연결된 페이지</h2>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(linkedByCategory).map(([catLabel, pages]) => (
                                    <div key={catLabel}>
                                        <p className="text-[10px] text-neutral-400 mb-1.5 font-medium uppercase tracking-wider">{catLabel}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {pages.map(p => (
                                                <Link
                                                    key={p.slug}
                                                    href={`/wiki/${p.slug}`}
                                                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-neutral-200 bg-white rounded hover:border-neutral-400 hover:shadow-sm transition-all"
                                                >
                                                    <GitBranch className="w-3 h-3 text-neutral-300" />
                                                    {p.title}
                                                    <span className="text-[9px] text-neutral-300">{LINK_TYPE_LABELS[p.linkType] || p.linkType}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 메타 정보 */}
                    <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center gap-4 text-[10px] text-neutral-400 flex-wrap">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>업데이트: {new Date(page.updated_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            <span>v{page.version}</span>
                        </div>
                        {page.source_refs.length > 0 && (
                            <span>출처: {page.source_refs.join(', ')}</span>
                        )}
                    </div>
                </div>

                {/* 사이드바 — 연결 수가 있을 때만 표시 */}
                {Object.keys(linkedByCategory).length > 0 && (
                    <aside className="w-48 shrink-0 hidden lg:block">
                        <div className="sticky top-24">
                            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">이 페이지에서</p>
                            <div className="space-y-1">
                                {Object.entries(linkedByCategory).flatMap(([, pages]) =>
                                    pages.slice(0, 3).map(p => (
                                        <Link
                                            key={p.slug}
                                            href={`/wiki/${p.slug}`}
                                            className="block text-[11px] text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 px-2 py-1.5 rounded transition-colors truncate"
                                        >
                                            {p.title}
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
