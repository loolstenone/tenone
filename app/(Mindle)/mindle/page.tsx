"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Zap, BarChart3, Search, Clock, Eye, Flame, Bookmark } from "lucide-react";

const statusBadge: Record<string, { label: string; color: string }> = {
    trending: { label: "유행중", color: "bg-[#F5C518] text-black" },
    rising: { label: "유행 예감", color: "bg-orange-500/20 text-orange-400" },
    signal: { label: "시그널", color: "bg-blue-500/20 text-blue-400" },
    fading: { label: "하락", color: "bg-neutral-700 text-neutral-400" },
};

const featuredTrends = [
    {
        id: "t1",
        title: "에이전트 AI가 바꾸는 일하는 방식",
        excerpt: "단순 챗봇을 넘어 자율적으로 작업을 수행하는 에이전트 AI. 기업 도입이 가속화되는 이유와 실무 변화를 데이터로 분석합니다.",
        category: "AI/테크",
        status: "trending",
        date: "2026.03.26",
        readTime: "8분",
        views: 3420,
        image: null,
    },
    {
        id: "t2",
        title: "숏폼 피로도와 '슬로우 콘텐츠'의 역습",
        excerpt: "틱톡/릴스 체류 시간 둔화 속, 팟캐스트와 롱폼 영상이 다시 부상. 플랫폼별 데이터가 말하는 것.",
        category: "콘텐츠",
        status: "rising",
        date: "2026.03.25",
        readTime: "6분",
        views: 2180,
        image: null,
    },
];

const latestTrends = [
    { id: "t3", title: "하이퍼로컬 비즈니스의 글로벌 확장 공식", category: "비즈니스", status: "trending", date: "03.24", readTime: "5분" },
    { id: "t4", title: "디지털 디톡스 = 새로운 럭셔리?", category: "라이프스타일", status: "signal", date: "03.23", readTime: "4분" },
    { id: "t5", title: "Z세대 가치소비 심화, 브랜드가 대응하는 법", category: "소비자", status: "trending", date: "03.22", readTime: "7분" },
    { id: "t6", title: "공간 컴퓨팅, 대중화까지의 거리", category: "AI/테크", status: "signal", date: "03.21", readTime: "9분" },
    { id: "t7", title: "마이크로 SaaS 창업 붐 — 1인 개발자 시대", category: "비즈니스", status: "rising", date: "03.20", readTime: "6분" },
    { id: "t8", title: "AI 카피라이팅의 한계와 인간+AI 협업 모델", category: "마케팅", status: "fading", date: "03.19", readTime: "5분" },
];

const hotKeywords = [
    { rank: 1, keyword: "에이전트 AI", change: "+340%", up: true },
    { rank: 2, keyword: "슬로우 콘텐츠", change: "+180%", up: true },
    { rank: 3, keyword: "하이퍼로컬", change: "+120%", up: true },
    { rank: 4, keyword: "디지털 디톡스", change: "+95%", up: true },
    { rank: 5, keyword: "마이크로 SaaS", change: "+75%", up: true },
];

export default function MindleHomePage() {
    return (
        <div className="bg-[#0A0A0A]">
            {/* ══ HERO ══ */}
            <section className="relative py-20 sm:py-28 px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, #F5C518 1px, transparent 0)",
                    backgroundSize: "40px 40px",
                }} />
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F5C518]/20 bg-[#F5C518]/5 mb-6">
                        <span className="text-[#F5C518] text-[10px] font-mono tracking-widest">AI-POWERED TREND PLATFORM</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                        트렌드의 <span className="text-[#F5C518]">홀씨</span>를 찾아,<br />
                        인사이트로 피워냅니다.
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-8">
                        수백만 데이터에서 트렌드 시그널을 포착하고,
                        AI와 전문가가 함께 만든 인사이트를 매일 전합니다.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/mindle/trends" className="inline-flex items-center gap-2 px-7 py-3 bg-[#F5C518] text-black font-semibold rounded-full hover:bg-[#E5B616] transition-colors">
                            트렌드 보기 <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/mindle/newsletter" className="inline-flex items-center gap-2 px-7 py-3 border border-neutral-700 text-white rounded-full hover:border-[#F5C518]/50 transition-colors">
                            뉴스레터 구독
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══ HOT KEYWORDS (Sometrend 스타일) ══ */}
            <section className="px-6 pb-12">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Flame className="w-4 h-4 text-[#F5C518]" />
                        <span className="text-sm font-medium text-white">실시간 핫 키워드</span>
                        <span className="text-[10px] text-neutral-500 font-mono">오늘 기준</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {hotKeywords.map((kw) => (
                            <Link key={kw.rank} href="/mindle/data" className="group flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/50 hover:border-[#F5C518]/30 transition-colors">
                                <span className={`text-xs font-bold ${kw.rank <= 3 ? "text-[#F5C518]" : "text-neutral-500"}`}>{kw.rank}</span>
                                <span className="text-sm text-white group-hover:text-[#F5C518] transition-colors">{kw.keyword}</span>
                                <span className="text-[10px] text-green-400 font-mono">{kw.change}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FEATURED (Careet 스타일 카드) ══ */}
            <section className="px-6 pb-16">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Featured</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {featuredTrends.map((t) => (
                            <article key={t.id} className="group relative rounded-2xl border border-neutral-800 bg-neutral-900/30 overflow-hidden hover:border-[#F5C518]/30 transition-all duration-300">
                                {/* 이미지 placeholder */}
                                <div className="h-48 bg-gradient-to-br from-neutral-800/50 to-neutral-900 flex items-center justify-center">
                                    <TrendingUp className="w-12 h-12 text-neutral-700" />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[t.status].color}`}>
                                            {statusBadge[t.status].label}
                                        </span>
                                        <span className="text-[10px] text-neutral-500 font-mono">{t.category}</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#F5C518] transition-colors leading-snug">
                                        {t.title}
                                    </h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2 mb-3">{t.excerpt}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                                        <span>{t.date}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.readTime}</span>
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{t.views.toLocaleString()}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ LATEST (리스트) ══ */}
            <section className="px-6 pb-16">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">최신 트렌드</h2>
                        <Link href="/mindle/trends" className="text-sm text-neutral-400 hover:text-[#F5C518] transition-colors">전체 보기 →</Link>
                    </div>
                    <div className="space-y-3">
                        {latestTrends.map((t) => (
                            <article key={t.id} className="group flex items-center justify-between p-4 rounded-xl border border-neutral-800/50 bg-neutral-900/20 hover:border-[#F5C518]/20 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[t.status].color}`}>
                                        {statusBadge[t.status].label}
                                    </span>
                                    <h3 className="text-white text-sm font-medium group-hover:text-[#F5C518] transition-colors truncate">
                                        {t.title}
                                    </h3>
                                </div>
                                <div className="hidden sm:flex items-center gap-3 text-[11px] text-neutral-500 shrink-0 ml-4">
                                    <span className="text-neutral-600">{t.category}</span>
                                    <span>{t.date}</span>
                                    <span>{t.readTime}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ CTA: 뉴스레터 ══ */}
            <section className="px-6 pb-20">
                <div className="mx-auto max-w-3xl text-center py-12 px-8 rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/5">
                    <h2 className="text-2xl font-bold text-white mb-3">매주 화요일, 트렌드 홀씨가 도착합니다</h2>
                    <p className="text-neutral-400 mb-6">AI가 분석한 주간 트렌드 리포트를 이메일로 받아보세요.</p>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                        <input type="email" placeholder="email@example.com" className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-full text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F5C518]/50" />
                        <button className="px-6 py-2.5 bg-[#F5C518] text-black font-semibold rounded-full hover:bg-[#E5B616] transition-colors text-sm">구독하기</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
