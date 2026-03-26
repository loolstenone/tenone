"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Clock, Eye, Flame, ChevronRight } from "lucide-react";

/* ── 30개 랜덤 카피 ── */
const insightCopies = [
    "인사이트로 피워냅니다.",
    "트렌드는 데이터에서 시작된다.",
    "변화의 시그널을 가장 먼저.",
    "숫자 뒤에 숨은 이야기를 찾습니다.",
    "내일의 기회는 오늘의 시그널에 있다.",
    "보이지 않는 흐름을 읽는 눈.",
    "데이터가 말하는 것, 사람이 해석하는 것.",
    "트렌드를 추적하지 않는다, 만든다.",
    "시그널을 인사이트로, 인사이트를 행동으로.",
    "모든 변화에는 패턴이 있다.",
    "감이 아닌 근거로 판단하는 시대.",
    "트렌드의 반감기를 측정합니다.",
    "소비자의 말과 행동 사이의 간극.",
    "오늘의 마이크로가 내일의 메가가 된다.",
    "플랫폼이 바뀌어도 본질은 같다.",
    "빠르게 읽고, 깊이 해석합니다.",
    "AI가 찾고, 사람이 의미를 부여합니다.",
    "트렌드는 예측이 아닌 발견이다.",
    "현장의 온도를 데이터로 전합니다.",
    "연결되지 않은 점들을 잇는 일.",
    "노이즈 속에서 시그널을 분리합니다.",
    "한 발 앞서 보는 것이 전략이다.",
    "데이터 문해력이 경쟁력이 되는 시대.",
    "소비자는 말보다 행동으로 말한다.",
    "트렌드 감도가 비즈니스 감도다.",
    "변화를 두려워하면 변화에 먹힌다.",
    "좋은 질문이 좋은 인사이트를 만든다.",
    "흐름을 타는 자와 흐름을 만드는 자.",
    "모든 유행에는 이유가 있다.",
    "작은 움직임이 큰 파도가 된다.",
];

const statusBadge: Record<string, { label: string; color: string }> = {
    trending: { label: "유행중", color: "bg-[#F5C518] text-black" },
    rising: { label: "유행 예감", color: "bg-orange-500/20 text-orange-400" },
    signal: { label: "시그널", color: "bg-blue-500/20 text-blue-400" },
    fading: { label: "하락", color: "bg-neutral-700 text-neutral-400" },
};

/* ── 메인 기사 ── */
const headline = {
    title: "에이전트 AI가 바꾸는 일하는 방식 — 2026년의 새로운 생산성",
    excerpt: "단순 챗봇을 넘어 자율적으로 작업을 수행하는 에이전트 AI. 기업 도입이 가속화되는 이유와 실무 프로세스가 어떻게 변하고 있는지 데이터로 분석합니다.",
    category: "AI/테크",
    status: "trending",
    date: "2026.03.26",
    readTime: "8분",
    views: 3420,
};

const sideArticles = [
    { id: "s1", title: "숏폼 피로도와 '슬로우 콘텐츠'의 역습", category: "콘텐츠", status: "rising", date: "03.25" },
    { id: "s2", title: "하이퍼로컬 비즈니스의 글로벌 확장 공식", category: "비즈니스", status: "trending", date: "03.24" },
    { id: "s3", title: "디지털 디톡스 = 새로운 럭셔리?", category: "라이프스타일", status: "signal", date: "03.23" },
    { id: "s4", title: "Z세대 가치소비 심화, 브랜드가 대응하는 법", category: "소비자", status: "trending", date: "03.22" },
];

const latestArticles = [
    { id: "l1", title: "공간 컴퓨팅, 대중화까지의 거리", category: "AI/테크", status: "signal", date: "03.21", readTime: "9분" },
    { id: "l2", title: "마이크로 SaaS 창업 붐 — 1인 개발자의 시대", category: "비즈니스", status: "rising", date: "03.20", readTime: "6분" },
    { id: "l3", title: "AI 카피라이팅의 한계와 인간+AI 협업 모델", category: "마케팅", status: "fading", date: "03.19", readTime: "5분" },
    { id: "l4", title: "체험형 소비의 데이터 분석 — 이제 경험을 산다", category: "소비자", status: "rising", date: "03.18", readTime: "6분" },
    { id: "l5", title: "크리에이터 이코노미 × 로컬 = 새로운 공식", category: "콘텐츠", status: "signal", date: "03.17", readTime: "5분" },
    { id: "l6", title: "구독 피로 시대, 번들링 전략의 부활", category: "비즈니스", status: "rising", date: "03.16", readTime: "4분" },
];

const hotKeywords = [
    { rank: 1, keyword: "에이전트 AI", change: "+340%" },
    { rank: 2, keyword: "슬로우 콘텐츠", change: "+180%" },
    { rank: 3, keyword: "하이퍼로컬", change: "+120%" },
    { rank: 4, keyword: "디지털 디톡스", change: "+95%" },
    { rank: 5, keyword: "마이크로 SaaS", change: "+75%" },
];

export default function MindleHomePage() {
    const [copy, setCopy] = useState(insightCopies[0]);

    useEffect(() => {
        setCopy(insightCopies[Math.floor(Math.random() * insightCopies.length)]);
        const interval = setInterval(() => {
            setCopy(insightCopies[Math.floor(Math.random() * insightCopies.length)]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#0A0A0A]">
            {/* ══ HERO — 신문 헤드라인 스타일 ══ */}
            <section className="pt-10 pb-8 px-6 border-b border-neutral-800/50">
                <div className="mx-auto max-w-5xl text-center">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-3">
                        <span className="text-[#F5C518]">Mindle</span> <span className="text-white">Whole See</span>
                    </h1>
                    <p className="text-neutral-400 text-sm sm:text-base transition-opacity duration-1000">
                        {copy}
                    </p>
                </div>
            </section>

            {/* ══ 핫 키워드 바 ══ */}
            <section className="px-6 py-3 border-b border-neutral-800/30 bg-neutral-900/30">
                <div className="mx-auto max-w-5xl flex items-center gap-4 overflow-x-auto scrollbar-hide">
                    <Flame className="w-3.5 h-3.5 text-[#F5C518] shrink-0" />
                    {hotKeywords.map((kw) => (
                        <Link key={kw.rank} href="/mindle/data" className="shrink-0 flex items-center gap-1.5 text-sm hover:text-[#F5C518] transition-colors">
                            <span className={`font-bold ${kw.rank <= 3 ? "text-[#F5C518]" : "text-neutral-500"}`}>{kw.rank}</span>
                            <span className="text-white">{kw.keyword}</span>
                            <span className="text-[10px] text-green-400 font-mono">{kw.change}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ══ 메인 — 신문 레이아웃 ══ */}
            <section className="px-6 py-8">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 1면 톱기사 (2칸) */}
                        <article className="lg:col-span-2 group">
                            <div className="h-64 sm:h-80 rounded-xl bg-gradient-to-br from-neutral-800/50 to-neutral-900 flex items-center justify-center mb-4">
                                <TrendingUp className="w-16 h-16 text-neutral-700/30" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[headline.status].color}`}>
                                    {statusBadge[headline.status].label}
                                </span>
                                <span className="text-[11px] text-neutral-500">{headline.category}</span>
                                <span className="text-[11px] text-neutral-600">{headline.date}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-[#F5C518] transition-colors cursor-pointer">
                                {headline.title}
                            </h2>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-3">{headline.excerpt}</p>
                            <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{headline.readTime}</span>
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{headline.views.toLocaleString()}</span>
                            </div>
                        </article>

                        {/* 사이드 기사들 (1칸) */}
                        <div className="space-y-4 lg:border-l lg:border-neutral-800/50 lg:pl-6">
                            <h3 className="text-xs font-semibold text-neutral-500 tracking-wider">TODAY&apos;S PICKS</h3>
                            {sideArticles.map((a, i) => (
                                <article key={a.id} className="group pb-4 border-b border-neutral-800/30 last:border-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${statusBadge[a.status].color}`}>
                                            {statusBadge[a.status].label}
                                        </span>
                                        <span className="text-[10px] text-neutral-600">{a.category}</span>
                                    </div>
                                    <h4 className="text-white text-sm font-semibold leading-snug group-hover:text-[#F5C518] transition-colors cursor-pointer">
                                        {a.title}
                                    </h4>
                                    <span className="text-[10px] text-neutral-600 mt-1 block">{a.date}</span>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ 최신 기사 — 신문 리스트 ══ */}
            <section className="px-6 py-8 border-t border-neutral-800/50">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-white">최신</h3>
                        <Link href="/mindle/trends" className="text-sm text-neutral-400 hover:text-[#F5C518] transition-colors flex items-center gap-1">
                            전체 보기 <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {latestArticles.map((a) => (
                            <article key={a.id} className="group flex items-start gap-3 py-3 border-b border-neutral-800/30">
                                <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded mt-0.5 ${statusBadge[a.status].color}`}>
                                    {statusBadge[a.status].label}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-white text-sm font-medium group-hover:text-[#F5C518] transition-colors cursor-pointer leading-snug">
                                        {a.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-600">
                                        <span>{a.category}</span>
                                        <span>{a.date}</span>
                                        <span>{a.readTime}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ 뉴스레터 CTA ══ */}
            <section className="px-6 py-12 border-t border-neutral-800/50">
                <div className="mx-auto max-w-2xl text-center">
                    <h3 className="text-xl font-bold text-white mb-2">매주 화요일, 트렌드 브리핑</h3>
                    <p className="text-neutral-500 text-sm mb-5">AI가 분석한 주간 트렌드를 이메일로 받아보세요.</p>
                    <div className="flex gap-2 max-w-sm mx-auto">
                        <input type="email" placeholder="email@example.com" className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#F5C518]/50" />
                        <button className="px-5 py-2 bg-[#F5C518] text-black font-semibold rounded-full text-sm hover:bg-[#E5B616] transition-colors">구독</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
