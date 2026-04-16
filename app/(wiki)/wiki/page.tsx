import Link from "next/link";
import {
    Globe, Home, Heart, BookOpen, Building2, Bot, Clock, Lightbulb,
    Search, ArrowRight, FileText, HelpCircle,
} from "lucide-react";
import { WIKI_CATEGORIES, WIKI_STATIC_PAGES, type WikiCategory } from "@/types/wiki";
import { fetchWikiStats, fetchWikiLog } from "@/lib/supabase/wiki-public";

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

const ACTION_LABELS: Record<string, string> = {
    create: "생성", update: "수정", link: "연결", lint: "감사",
};
const ACTION_COLORS: Record<string, string> = {
    create: "bg-green-50 text-green-600",
    update: "bg-blue-50 text-blue-600",
    link: "bg-purple-50 text-purple-600",
    lint: "bg-neutral-100 text-neutral-500",
};

export default async function WikiHomePage() {
    let stats = { totalPages: 0, totalLinks: 0, byCategory: {} as Record<string, number> };
    let recentLogs: Array<{ page_slug: string | null; action: string; diff_summary: string | null; created_at: string }> = [];

    try {
        [stats, recentLogs] = await Promise.all([
            fetchWikiStats(),
            fetchWikiLog(8),
        ]);
    } catch {
        // DB 연결 실패 시 빈 데이터로 표시
    }

    const totalWithStatic = stats.totalPages + WIKI_STATIC_PAGES.length;

    return (
        <div>
            {/* 타이틀 */}
            <div className="mb-8 pb-6 border-b border-neutral-100">
                <h1 className="text-xl font-bold mb-1.5">Ten:One™ Universe Wiki</h1>
                <p className="text-xs text-neutral-400">
                    {totalWithStatic}개 페이지 · {stats.totalLinks}개 연결 · 누구나 읽을 수 있는 지식 체계
                </p>
            </div>

            {/* 검색 */}
            <Link href="/wiki/search" className="block mb-8">
                <div className="flex items-center gap-3 border border-neutral-200 bg-white rounded px-4 py-3 hover:border-neutral-400 hover:shadow-sm transition-all">
                    <Search className="w-4 h-4 text-neutral-300 shrink-0" />
                    <span className="text-sm text-neutral-400">위키 검색...</span>
                    <span className="ml-auto text-[10px] text-neutral-300 border border-neutral-200 rounded px-1.5 py-0.5">⌘K</span>
                </div>
            </Link>

            {/* 세계관 그룹 */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">세계관</h2>
                    <Link href="/wiki/universe" className="text-[11px] text-neutral-400 hover:text-neutral-600 flex items-center gap-1">
                        전체 보기 <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {(["universe", "vision-house", "core-values", "protocols"] as WikiCategory[]).map(key => {
                        const cat = WIKI_CATEGORIES[key];
                        const Icon = CATEGORY_ICONS[key];
                        const count = stats.byCategory[key] || 0;
                        return (
                            <Link
                                key={key}
                                href={`/wiki/${key}`}
                                className="group border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition-all"
                            >
                                <div className="w-8 h-8 rounded flex items-center justify-center mb-3" style={{ backgroundColor: `${cat.color}15` }}>
                                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                                </div>
                                <h3 className="text-sm font-semibold mb-1 group-hover:text-neutral-600 transition-colors">{cat.label}</h3>
                                <p className="text-[11px] text-neutral-400 leading-relaxed">{cat.description}</p>
                                <p className="text-[10px] text-neutral-300 mt-2.5">{count}개 페이지</p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* 브랜드 · 에이전트 */}
            <div className="mb-8">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">브랜드 · 에이전트</h2>
                <div className="grid grid-cols-2 gap-3">
                    {(["brands", "agents"] as WikiCategory[]).map(key => {
                        const cat = WIKI_CATEGORIES[key];
                        const Icon = CATEGORY_ICONS[key];
                        const count = stats.byCategory[key] || 0;
                        return (
                            <Link
                                key={key}
                                href={`/wiki/${key}`}
                                className="group border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition-all flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15` }}>
                                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-0.5 group-hover:text-neutral-600 transition-colors">{cat.label}</h3>
                                    <p className="text-[11px] text-neutral-400">{cat.description}</p>
                                    <p className="text-[10px] text-neutral-300 mt-1">{count}개 페이지</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* 역사 · 인사이트 */}
            <div className="mb-8">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">역사 · 인사이트</h2>
                <div className="grid grid-cols-2 gap-3">
                    {(["chronicle", "insights"] as WikiCategory[]).map(key => {
                        const cat = WIKI_CATEGORIES[key];
                        const Icon = CATEGORY_ICONS[key];
                        const count = stats.byCategory[key] || 0;
                        return (
                            <Link
                                key={key}
                                href={`/wiki/${key}`}
                                className="group border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition-all flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15` }}>
                                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-0.5 group-hover:text-neutral-600 transition-colors">{cat.label}</h3>
                                    <p className="text-[11px] text-neutral-400">{cat.description}</p>
                                    <p className="text-[10px] text-neutral-300 mt-1">{count}개 페이지</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* 운영 · 교육 */}
            <div className="mb-8">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">운영 · 교육</h2>
                <div className="grid grid-cols-2 gap-3">
                    {WIKI_STATIC_PAGES.map(page => {
                        const Icon = page.slug === "onboarding" ? BookOpen : HelpCircle;
                        return (
                            <Link
                                key={page.slug}
                                href={`/wiki/${page.slug}`}
                                className="group border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition-all flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded bg-neutral-100 flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-neutral-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-0.5 group-hover:text-neutral-600 transition-colors">{page.title}</h3>
                                    <p className="text-[11px] text-neutral-400">{page.description}</p>
                                    <p className="text-[10px] text-neutral-300 mt-1">{page.category}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* 최근 업데이트 */}
            {recentLogs.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">최근 업데이트</h2>
                        <Link href="/wiki/changelog" className="text-[11px] text-neutral-400 hover:text-neutral-600 flex items-center gap-1">
                            전체 보기 <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="border border-neutral-200 bg-white divide-y divide-neutral-50">
                        {recentLogs.map((log, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                                <span className="text-[11px] text-neutral-300 w-14 shrink-0">
                                    {new Date(log.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${ACTION_COLORS[log.action] || "bg-neutral-100 text-neutral-500"}`}>
                                    {ACTION_LABELS[log.action] || log.action}
                                </span>
                                {log.page_slug && (
                                    <Link href={`/wiki/${log.page_slug}`} className="text-xs hover:underline flex-1 truncate text-neutral-700">
                                        {log.page_slug}
                                    </Link>
                                )}
                                {log.diff_summary && (
                                    <span className="text-[10px] text-neutral-400 truncate max-w-48 hidden sm:block">{log.diff_summary}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 바로가기 */}
            <div className="border-t border-neutral-100 pt-4 flex items-center gap-4 text-[11px] text-neutral-400">
                <Link href="/wiki/index" className="hover:text-neutral-600 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> 전체 색인
                </Link>
                <span>·</span>
                <Link href="/wiki/graph" className="hover:text-neutral-600">관계 그래프</Link>
                <span>·</span>
                <Link href="/wiki/changelog" className="hover:text-neutral-600">변경 이력</Link>
                <span>·</span>
                <Link href="/wiki/llms.txt" className="hover:text-neutral-600">llms.txt</Link>
            </div>
        </div>
    );
}
