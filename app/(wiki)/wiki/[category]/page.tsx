import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Globe, Home, Heart, BookOpen, Building2, Bot, Clock, Lightbulb,
    FileText, ArrowLeft, Tag, Calendar,
} from "lucide-react";
import { fetchWikiPages } from "@/lib/supabase/wiki-public";
import { WIKI_CATEGORIES, type WikiCategory } from "@/types/wiki";

export const revalidate = 3600;

const validCategories = Object.keys(WIKI_CATEGORIES);

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

export function generateStaticParams() {
    return validCategories.map(c => ({ category: c }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const cat = WIKI_CATEGORIES[category as WikiCategory];
    if (!cat) return { title: "Not Found" };
    return { title: cat.label };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;

    if (!validCategories.includes(category)) notFound();

    const cat = WIKI_CATEGORIES[category as WikiCategory];
    const Icon = CATEGORY_ICONS[category as WikiCategory] || FileText;

    let pages: Array<{ slug: string; title: string; summary: string | null; tags: string[]; updated_at: string }> = [];

    try {
        pages = await fetchWikiPages(category as WikiCategory);
    } catch {
        // DB 연결 실패
    }

    return (
        <div>
            {/* 브레드크럼 */}
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-5">
                <Link href="/wiki" className="hover:text-neutral-600 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Wiki
                </Link>
                <span>/</span>
                <span className="font-medium" style={{ color: cat.color }}>{cat.label}</span>
            </div>

            {/* 헤더 */}
            <div className="flex items-start gap-4 mb-6 pb-5 border-b border-neutral-100">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15` }}>
                    <Icon className="w-6 h-6" style={{ color: cat.color }} />
                </div>
                <div>
                    <h1 className="text-xl font-bold">{cat.label}</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">{cat.description}</p>
                    <p className="text-[11px] text-neutral-300 mt-1">{pages.length}개 페이지</p>
                </div>
            </div>

            {/* 페이지 목록 */}
            {pages.length === 0 ? (
                <div className="border border-neutral-200 bg-white p-10 text-center">
                    <FileText className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">아직 페이지가 없습니다</p>
                    <p className="text-[11px] text-neutral-300 mt-1">주간 업데이트 시 추가될 예정입니다</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {pages.map(page => {
                        const slugParts = page.slug.split("/");
                        const pageName = slugParts[slugParts.length - 1];
                        return (
                            <Link
                                key={page.slug}
                                href={`/wiki/${page.slug}`}
                                className="group block border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition-all"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold group-hover:text-neutral-600 transition-colors">{page.title}</h3>
                                        {page.summary && (
                                            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed line-clamp-2">{page.summary}</p>
                                        )}
                                        {page.tags.length > 0 && (
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <Tag className="w-3 h-3 text-neutral-300" />
                                                {page.tags.slice(0, 4).map(tag => (
                                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className="flex items-center gap-1 text-[10px] text-neutral-300">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(page.updated_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                                        </div>
                                        <span className="text-[10px] text-neutral-300 font-mono">{pageName}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* 하단 */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <Link href="/wiki" className="text-[11px] text-neutral-400 hover:text-neutral-600 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> 위키 홈
                </Link>
                <Link href="/wiki/index" className="text-[11px] text-neutral-400 hover:text-neutral-600">
                    전체 색인 →
                </Link>
            </div>
        </div>
    );
}
