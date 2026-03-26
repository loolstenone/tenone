"use client";

import { Brain, Target, Globe, Users, Zap, TrendingUp, Eye, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";

const trendLevels = [
    { level: "Meta Trend", desc: "문명 전환 수준의 거대 흐름", span: "50년+", color: "#00FF88", width: "100%" },
    { level: "Mega Trend", desc: "사회 전체를 관통하는 장기 트렌드", span: "10~30년", color: "#00DD77", width: "85%" },
    { level: "Macro Trend", desc: "산업·시장 단위 확산", span: "5~10년", color: "#00BB66", width: "70%" },
    { level: "Trend", desc: "가치와 방향성이 수반되는 현상", span: "3~5년", color: "#009955", width: "55%" },
    { level: "Micro Trend", desc: "소수 오피니언 리더 중심", span: "1~2년", color: "#007744", width: "40%" },
    { level: "Fad", desc: "일시적 유행 (FAD)", span: "수개월", color: "#555555", width: "25%" },
];

const values = [
    {
        icon: Eye,
        title: "Observe",
        subtitle: "관찰",
        desc: "수백만 데이터 포인트에서 미세한 시그널을 포착합니다. SNS, 뉴스, 검색 트렌드, 소비자 리뷰, 특허 데이터까지.",
    },
    {
        icon: Brain,
        title: "Analyze",
        subtitle: "분석",
        desc: "AI가 패턴을 찾고, 전문가가 맥락을 부여합니다. 기술과 직관의 결합이 진짜 인사이트를 만듭니다.",
    },
    {
        icon: Lightbulb,
        title: "Create",
        subtitle: "창조",
        desc: "발견한 트렌드를 전략과 콘텐츠로 전환합니다. 추적이 아닌 실행. 그것이 Trend Hunter의 차별점입니다.",
    },
];

const team = [
    { role: "AI Engineer", name: "데이터 수집·분석 파이프라인", desc: "크롤링, NLP, 감성 분석, 클러스터링 알고리즘 설계" },
    { role: "Trend Analyst", name: "트렌드 해석·큐레이션", desc: "AI 시그널을 산업 맥락에서 해석하고 리포트로 정제" },
    { role: "Strategist", name: "브랜드 전략·컨설팅", desc: "트렌드 데이터를 실행 가능한 비즈니스 전략으로 전환" },
    { role: "Content Creator", name: "콘텐츠 기획·제작", desc: "인사이트 기반 SNS, 블로그, 영상 콘텐츠 기획" },
];

export default function TrendHunterAboutPage() {
    return (
        <div className="bg-[#0A0A0A]">
            {/* Hero */}
            <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: "linear-gradient(#00FF88 1px, transparent 1px), linear-gradient(90deg, #00FF88 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }} />
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <span className="text-[#00FF88] text-xs font-mono tracking-widest">ABOUT TREND HUNTER</span>
                    <h1 className="text-3xl sm:text-5xl font-bold text-white mt-4 mb-6">
                        트렌드를 읽는 것에서<br />
                        <span className="text-[#00FF88]">실행하는 것으로</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Trend Hunter는 AI 기반 트렌드 분석 플랫폼입니다.
                        데이터 크롤링부터 인사이트 큐레이션까지,
                        트렌드의 발견과 실행을 한 곳에서 수행합니다.
                    </p>
                </div>
            </section>

            {/* 트렌드 피라미드 */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center mb-12">
                        <span className="text-[#00FF88] text-xs font-mono tracking-widest">TREND TAXONOMY</span>
                        <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3">유행과 트렌드는 다릅니다</h2>
                        <p className="text-neutral-400 mt-4 max-w-xl mx-auto">
                            일시적 유행(Fad)은 금방 사라지지만, 진정한 트렌드는 장기적으로 사회를 변화시킵니다.
                        </p>
                    </div>

                    <div className="space-y-3 max-w-2xl mx-auto">
                        {trendLevels.map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div
                                    className="h-14 rounded-lg flex items-center justify-between px-4 transition-all duration-300 hover:scale-[1.02]"
                                    style={{ width: item.width, backgroundColor: item.color + "15", borderLeft: `3px solid ${item.color}` }}
                                >
                                    <span className="text-sm font-mono font-bold" style={{ color: item.color }}>
                                        {item.level}
                                    </span>
                                    <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline">{item.span}</span>
                                </div>
                                <div className="flex-1 min-w-0 hidden md:block">
                                    <p className="text-xs text-neutral-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 핵심 가치: Observe → Analyze → Create */}
            <section className="py-20 px-6 bg-gradient-to-b from-[#0A0A0A] via-[#0d1a12] to-[#0A0A0A]">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <span className="text-[#00FF88] text-xs font-mono tracking-widest">OUR APPROACH</span>
                        <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3">관찰 → 분석 → 창조</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((v, i) => (
                            <div key={i} className="relative group">
                                {i < values.length - 1 && (
                                    <div className="hidden md:block absolute top-12 right-0 translate-x-1/2 w-8 h-px bg-[#00FF88]/20" />
                                )}
                                <div className="p-8 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/30 transition-colors h-full">
                                    <div className="w-12 h-12 rounded-lg bg-[#00FF88]/10 flex items-center justify-center mb-5">
                                        <v.icon className="w-6 h-6 text-[#00FF88]" />
                                    </div>
                                    <h3 className="text-white font-bold text-xl mb-1">{v.title}</h3>
                                    <p className="text-[#00FF88]/60 text-xs font-mono mb-3">{v.subtitle}</p>
                                    <p className="text-neutral-400 text-sm leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 팀 구성 */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <span className="text-[#00FF88] text-xs font-mono tracking-widest">TEAM</span>
                        <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3">AI + 전문가 하이브리드 팀</h2>
                        <p className="text-neutral-400 mt-4">기술로 찾고, 사람이 의미를 만듭니다.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {team.map((t, i) => (
                            <div key={i} className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/20 transition-colors">
                                <span className="text-[#00FF88] text-xs font-mono tracking-wider">{t.role}</span>
                                <h3 className="text-white font-semibold text-lg mt-2 mb-2">{t.name}</h3>
                                <p className="text-neutral-400 text-sm">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ten:One Universe 연결 */}
            <section className="py-20 px-6 border-t border-neutral-800/50">
                <div className="mx-auto max-w-4xl text-center">
                    <span className="text-[#00FF88] text-xs font-mono tracking-widest">TEN:ONE™ UNIVERSE</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 mb-4">브랜드 생태계의 트렌드 엔진</h2>
                    <p className="text-neutral-400 max-w-xl mx-auto mb-8">
                        Trend Hunter가 발견한 트렌드는 Ten:One Universe의 12개 브랜드를 통해 실현됩니다.
                        SmarComm의 마케팅, Badak의 네트워킹, HeRo의 인재 발굴까지 — 트렌드가 생태계 전체를 움직입니다.
                    </p>
                    <Link
                        href="/about?tab=universe"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-700 rounded-lg text-white hover:border-[#00FF88]/50 hover:text-[#00FF88] transition-colors"
                    >
                        Universe 둘러보기 <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
