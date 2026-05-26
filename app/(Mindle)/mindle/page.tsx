// Mindle 메인 (Server Component) — Phase 0 정직성 회복
// DB 1,410건 (published 532건)에서 직접 fetch. mock 0건.
// 카테고리 필터는 ?cat= query param (Link 기반).

import Link from "next/link";
import {
    ArrowRight,
    Clock,
    ChevronRight,
    Search,
    BarChart3,
    Globe,
    Brain,
    ShoppingCart,
    Palette,
    Cpu,
    Sparkles,
    TrendingUp,
    BookOpen,
    Users,
} from "lucide-react";
import NewsletterSubscribeForm from "@/components/newsletter/NewsletterSubscribeForm";
import TrustLabel from "@/features/mindle/TrustLabel";
import {
    fetchPublishedTrends,
    countPublishedTrends,
    getCategoryCounts,
    categoryLabel,
    getTrendStatus,
    type MindleTrend,
} from "@/lib/mindle/trend-data";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 300;

const CATEGORY_NAV: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "all", label: "전체", icon: Search },
    { id: "tech", label: "테크", icon: Cpu },
    { id: "marketing_branding", label: "마케팅", icon: BarChart3 },
    { id: "business_corporate", label: "비즈니스", icon: ShoppingCart },
    { id: "trend_market", label: "트렌드", icon: TrendingUp },
    { id: "creator_trend", label: "크리에이터", icon: Palette },
    { id: "talent_career", label: "커리어", icon: Brain },
];

const statusBadge: Record<string, { label: string; color: string }> = {
    trending: { label: "급상승", color: "bg-indigo-400/20 text-indigo-300" },
    rising: { label: "상승", color: "bg-amber-500/20 text-amber-400" },
    signal: { label: "시그널", color: "bg-cyan-500/20 text-cyan-400" },
};

const categoryColor: Record<string, string> = {
    tech: "text-blue-400",
    marketing_branding: "text-pink-400",
    business_corporate: "text-green-400",
    trend_market: "text-amber-400",
    creator_trend: "text-violet-400",
    talent_career: "text-cyan-400",
    industry_vertical: "text-orange-400",
    creative_reference: "text-rose-400",
    community_signal: "text-fuchsia-400",
    empathy_emotion: "text-pink-300",
};

async function fetchSubscriberCount(): Promise<number> {
    const admin = createAdminClient();
    const { count } = await admin
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true });
    return count ?? 0;
}

async function fetchLatestIssueCount(): Promise<number> {
    const admin = createAdminClient();
    const { count } = await admin
        .from("newsletter_issues")
        .select("id", { count: "exact", head: true });
    return count ?? 0;
}

export default async function MindleHomePage({
    searchParams,
}: {
    searchParams: Promise<{ cat?: string }>;
}) {
    const { cat } = await searchParams;
    const activeCat = cat ?? "all";

    const [trends, totalPublished, categoryCounts, subscribers, issueCount] = await Promise.all([
        fetchPublishedTrends({ category: activeCat, limit: 12 }),
        countPublishedTrends(),
        getCategoryCounts(),
        fetchSubscriberCount(),
        fetchLatestIssueCount(),
    ]);

    const featuredTrends = await fetchPublishedTrends({ featuredOnly: true, limit: 1 });
    const featured = featuredTrends[0] ?? null;

    return (
        <div className="bg-[#0C0A1D] min-h-screen">
            {/* ── HERO ── */}
            <section className="relative pt-20 pb-16 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-transparent to-transparent" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="relative mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
                        <Sparkles className="w-3 h-3" />
                        AI 트렌드 인텔리전스
                    </div>
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-4">
                        <span className="text-indigo-400">보이기 전에,</span>
                        <br />
                        <span className="text-white">먼저 본다</span>
                    </h1>
                    <p className="text-indigo-300/70 text-lg sm:text-xl mb-3 font-medium">
                        한국에서 시작해 세계로
                    </p>
                    <p className="text-indigo-400/60 text-sm max-w-lg mx-auto">
                        AI가 찾고, 사람이 의미를 부여합니다.
                    </p>

                    {/* 실측 통계 — 정직성 SSOT */}
                    <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        <Stat icon={TrendingUp} label="발행된 트렌드" value={totalPublished.toLocaleString()} />
                        <Stat icon={BookOpen} label="뉴스레터 발행" value={issueCount.toLocaleString()} />
                        <Stat icon={Users} label="구독자" value={subscribers.toLocaleString()} />
                        <Stat icon={BarChart3} label="카테고리" value={String(categoryCounts.length)} />
                    </div>
                    <p className="mt-4 text-[10px] text-indigo-400/40">
                        🔬 출처: mindle_trends·newsletter_subscribers DB 실측 (5분 캐시)
                    </p>
                </div>
            </section>

            {/* ── 피처드 트렌드 ── */}
            {featured && (
                <section className="px-6 pb-8">
                    <div className="mx-auto max-w-5xl">
                        <FeaturedCard trend={featured} />
                    </div>
                </section>
            )}

            {/* ── 트렌드 카드 피드 ── */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-white">
                                {activeCat === "all" ? "최근 트렌드" : `${categoryLabel(activeCat)} 트렌드`}
                            </h2>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase tracking-wide">
                                실측 DB
                            </span>
                        </div>
                        <Link
                            href="/mindle/trends"
                            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                        >
                            전체 보기 <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* 카테고리 필터 (query param 기반) */}
                    <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
                        {CATEGORY_NAV.map((cat) => {
                            const isActive = activeCat === cat.id;
                            const count = cat.id === "all"
                                ? totalPublished
                                : categoryCounts.find(c => c.category === cat.id)?.count ?? 0;
                            return (
                                <Link
                                    key={cat.id}
                                    href={cat.id === "all" ? "/mindle" : `/mindle?cat=${cat.id}`}
                                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        isActive
                                            ? "bg-indigo-500 text-white"
                                            : "bg-white/5 text-indigo-300/60 hover:bg-white/10 hover:text-indigo-300"
                                    }`}
                                >
                                    <cat.icon className="w-3 h-3" />
                                    {cat.label}
                                    <span className={`text-[10px] ${isActive ? "text-white/70" : "text-indigo-300/40"}`}>
                                        {count}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* 카드 리스트 */}
                    {trends.length === 0 ? (
                        <div className="text-center py-16 text-indigo-400/40 text-sm">
                            해당 카테고리에 발행된 트렌드가 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trends.map((trend) => (
                                <TrendCard key={trend.id} trend={trend} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── 뉴스레터 구독 CTA ── */}
            <section className="px-6 py-16 border-t border-indigo-500/10">
                <NewsletterSubscribeForm source="mindle" brandName="Mindle" dark accentColor="#6366f1" />
            </section>

            {/* ── Ten:One Universe 연결 ── */}
            <section className="px-6 py-12 border-t border-indigo-500/10">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Globe className="w-4 h-4 text-indigo-500/50" />
                        <span className="text-xs font-semibold text-indigo-500/50 uppercase tracking-wider">
                            Ten:One Universe
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { name: "SmarComm", desc: "Mindle 트렌드를 마케팅 캠페인에 활용", href: "/smarcomm", color: "from-rose-500/10 to-transparent" },
                            { name: "MAD League", desc: "대학생 트렌드 리서처 네트워크", href: "/madleague", color: "from-amber-500/10 to-transparent" },
                            { name: "RooK", desc: "AI 크리에이터의 콘텐츠 인사이트", href: "/rook", color: "from-violet-500/10 to-transparent" },
                        ].map((brand) => (
                            <Link
                                key={brand.name}
                                href={brand.href}
                                className={`group p-5 rounded-xl bg-gradient-to-br ${brand.color} border border-white/5 hover:border-indigo-500/20 transition-all`}
                            >
                                <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                                    {brand.name}
                                </h4>
                                <p className="text-xs text-indigo-400/40 mt-1">{brand.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function Stat({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
            <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-indigo-300/50 mt-1">{label}</p>
        </div>
    );
}

function FeaturedCard({ trend }: { trend: MindleTrend }) {
    const status = getTrendStatus(trend.relevance_score);
    const sb = statusBadge[status];
    return (
        <Link
            href={`/mindle/trends/${trend.id}`}
            className="group block bg-gradient-to-br from-indigo-950/80 to-indigo-900/30 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 hover:border-indigo-400/40 transition-all"
        >
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                    Featured
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sb.color}`}>
                    {sb.label}
                </span>
                <span className={`text-[10px] font-medium ${categoryColor[trend.category] ?? "text-neutral-400"}`}>
                    {categoryLabel(trend.category)}
                </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-200 transition-colors mb-3 leading-snug">
                {trend.title}
            </h3>
            <p className="text-sm text-indigo-200/60 leading-relaxed mb-5">
                {trend.summary}
            </p>
            <TrustLabel
                sources={trend.source_names}
                sourceUrls={trend.source_urls}
                analyzedAt={trend.created_at}
                relevance={trend.relevance_score}
                agentName={trend.agent_name}
            />
            <div className="flex items-center gap-1 mt-4 text-sm text-indigo-400 group-hover:text-indigo-300 transition-colors">
                전체 분석 보기 <ArrowRight className="w-3.5 h-3.5" />
            </div>
        </Link>
    );
}

function TrendCard({ trend }: { trend: MindleTrend }) {
    const status = getTrendStatus(trend.relevance_score);
    const sb = statusBadge[status];
    const date = trend.created_at.slice(0, 10);
    const relevancePct = Math.round(trend.relevance_score * 100);

    return (
        <Link
            href={`/mindle/trends/${trend.id}`}
            className="group block bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all"
        >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sb.color}`}>
                            {sb.label}
                        </span>
                        <span className={`text-[10px] font-medium ${categoryColor[trend.category] ?? "text-neutral-400"}`}>
                            {categoryLabel(trend.category)}
                        </span>
                        <span className="text-[10px] text-indigo-500/50">{date}</span>
                    </div>
                    <h3 className="text-white font-semibold leading-snug group-hover:text-indigo-300 transition-colors">
                        {trend.title}
                    </h3>
                    <p className="text-xs text-indigo-300/40 mt-1.5 line-clamp-2 leading-relaxed">
                        {trend.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-indigo-400/40">
                        {trend.view_count > 0 && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                조회 {trend.view_count.toLocaleString()}
                            </span>
                        )}
                    </div>
                    <div className="mt-3">
                        <TrustLabel
                            sources={trend.source_names}
                            sourceUrls={trend.source_urls}
                            analyzedAt={trend.created_at}
                            relevance={trend.relevance_score}
                            agentName={trend.agent_name}
                            compact
                        />
                    </div>
                </div>
                <div className="shrink-0 flex items-center gap-2 sm:flex-col sm:items-end">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-indigo-400">
                            {relevancePct}
                        </span>
                    </div>
                    <span className="text-[9px] text-indigo-400/40 uppercase tracking-wider">
                        관련성
                    </span>
                </div>
            </div>
        </Link>
    );
}

