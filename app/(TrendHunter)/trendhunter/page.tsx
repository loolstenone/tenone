"use client";

import Link from "next/link";
import { TrendingUp, ArrowRight, Zap, FileText, Lightbulb, Target, BarChart3, Database, Cpu, Users, Brain, Globe, Layers, Clock, Eye } from "lucide-react";

/* ── 최신 인사이트 (홈 미리보기) ── */
const latestInsights = [
    { id: "i1", title: "에이전트 AI가 바꾸는 일하는 방식", category: "AI", readTime: "8분", date: "2026.03.24" },
    { id: "i2", title: "이제 경험을 사는 시대 — 체험형 소비의 데이터 분석", category: "소비자", readTime: "6분", date: "2026.03.20" },
    { id: "i3", title: "숏폼 피로도와 '슬로우 콘텐츠'의 역습", category: "마케팅", readTime: "7분", date: "2026.03.15" },
];

/* ── 서비스 요약 ── */
const serviceSummary = [
    { icon: FileText, title: "트렌드 리포트", desc: "월간/분기별 AI 트렌드 분석 보고서" },
    { icon: Target, title: "브랜드 전략", desc: "데이터 기반 포지셔닝 & 마케팅 전략" },
    { icon: Lightbulb, title: "콘텐츠 제작", desc: "인사이트 기반 SNS·블로그·영상 기획" },
    { icon: BarChart3, title: "데이터 분석", desc: "자사+외부 데이터 통합 인사이트" },
];

/* ── AI 프로세스 ── */
const processSteps = [
    { icon: Database, step: "01", title: "Data Crawling", desc: "수백만 데이터 포인트 실시간 크롤링" },
    { icon: Cpu, step: "02", title: "AI Analysis", desc: "NLP·감성분석·패턴인식으로 시그널 탐지" },
    { icon: Users, step: "03", title: "Human Curation", desc: "전문가가 맥락을 부여하고 인사이트 도출" },
];

/* ── Universe 브랜드 ── */
const universeProjects = [
    { name: "SmarComm.", desc: "AI 마케팅" },
    { name: "Badak", desc: "네트워킹" },
    { name: "HeRo", desc: "인재 발굴" },
    { name: "MAD League", desc: "대학 연합" },
    { name: "domo", desc: "시니어 네트워크" },
    { name: "RooK", desc: "AI 크리에이터" },
    { name: "Seoul/360°", desc: "서울 투어" },
    { name: "FWN", desc: "패션 네트워크" },
    { name: "MyVerse", desc: "AI 에이전트" },
    { name: "MoNTZ", desc: "포토그래피" },
    { name: "문래지앙", desc: "로컬 프로젝트" },
    { name: "YouInOne", desc: "비즈니스 통합" },
];

export default function TrendHunterPage() {
    return (
        <div className="bg-[#0A0A0A]">
            {/* ════════════════════════ HERO ════════════════════════ */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "linear-gradient(#00FF88 1px, transparent 1px), linear-gradient(90deg, #00FF88 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]" />

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00FF88]/20 bg-[#00FF88]/5 mb-8">
                        <Zap className="w-3.5 h-3.5 text-[#00FF88]" />
                        <span className="text-[#00FF88] text-xs font-mono tracking-wider">AI-POWERED TREND ANALYSIS</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
                        <span className="text-white">AI가 데이터를 읽고,</span>
                        <br />
                        <span className="text-[#00FF88]">우리가 트렌드를 만든다.</span>
                    </h1>

                    <p className="text-neutral-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        수백만 데이터 포인트에서 트렌드 시그널을 탐지하고,
                        전문가의 해석으로 실행 가능한 인사이트를 만듭니다.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/trendhunter/services"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00FF88] text-black font-semibold rounded-lg hover:bg-[#00DD77] transition-colors"
                        >
                            서비스 알아보기
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/trendhunter/reports"
                            className="inline-flex items-center gap-2 px-8 py-3.5 border border-neutral-700 text-white rounded-lg hover:border-[#00FF88]/50 hover:text-[#00FF88] transition-colors"
                        >
                            리포트 보기
                        </Link>
                    </div>
                </div>
            </section>

            {/* ════════════════════════ AI 프로세스 ════════════════════════ */}
            <section className="py-24 px-6 bg-gradient-to-b from-[#0A0A0A] via-[#0d1a12] to-[#0A0A0A]">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-14">
                        <span className="text-[#00FF88] text-xs font-mono tracking-widest">HOW WE WORK</span>
                        <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3">데이터에서 인사이트까지</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {processSteps.map((step, i) => (
                            <div key={i} className="relative group">
                                {i < processSteps.length - 1 && (
                                    <div className="hidden md:block absolute top-12 right-0 translate-x-1/2 w-8 h-px bg-[#00FF88]/20" />
                                )}
                                <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/30 transition-colors h-full">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[#00FF88] text-2xl font-mono font-bold">{step.step}</span>
                                        <step.icon className="w-6 h-6 text-[#00FF88]/60" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                                    <p className="text-neutral-400 text-sm">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link href="/trendhunter/about" className="text-sm text-neutral-400 hover:text-[#00FF88] transition-colors font-mono">
                            자세히 알아보기 →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ════════════════════════ 서비스 요약 ════════════════════════ */}
            <section className="py-24 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-14">
                        <span className="text-[#00FF88] text-xs font-mono tracking-widest">SERVICES</span>
                        <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3">트렌드를 실행으로</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {serviceSummary.map((svc, i) => (
                            <Link
                                key={i}
                                href="/trendhunter/services"
                                className="group p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/30 transition-all duration-300 text-center"
                            >
                                <svc.icon className="w-8 h-8 text-[#00FF88] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-white font-bold mb-2">{svc.title}</h3>
                                <p className="text-neutral-400 text-sm">{svc.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════ 최신 인사이트 ════════════════════════ */}
            <section className="py-24 px-6 border-t border-neutral-800/50">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <span className="text-[#00FF88] text-xs font-mono tracking-widest">LATEST INSIGHTS</span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">최신 인사이트</h2>
                        </div>
                        <Link href="/trendhunter/insights" className="text-sm text-neutral-400 hover:text-[#00FF88] transition-colors font-mono hidden sm:block">
                            전체 보기 →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestInsights.map((item) => (
                            <Link
                                key={item.id}
                                href="/trendhunter/insights"
                                className="group p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/30 transition-colors"
                            >
                                <span className="text-[#00FF88] text-[10px] font-mono tracking-wider bg-[#00FF88]/10 px-2 py-0.5 rounded">{item.category}</span>
                                <h3 className="text-white font-semibold mt-3 mb-3 leading-snug group-hover:text-[#00FF88] transition-colors">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-neutral-500">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.readTime}</span>
                                    <span>{item.date}</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center mt-8 sm:hidden">
                        <Link href="/trendhunter/insights" className="text-sm text-neutral-400 hover:text-[#00FF88] transition-colors font-mono">
                            전체 보기 →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ════════════════════════ UNIVERSE ════════════════════════ */}
            <section className="py-24 px-6 border-t border-neutral-800/50">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <span className="text-[#00FF88] text-xs font-mono tracking-widest">TEN:ONE™ UNIVERSE</span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3">연결된 브랜드 생태계</h2>
                        <p className="text-neutral-400 mt-3 text-sm max-w-lg mx-auto">
                            Trend Hunter가 발견한 트렌드는 Ten:One Universe의 브랜드들을 통해 실현됩니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {universeProjects.map((p, i) => (
                            <div key={i} className="p-4 rounded-lg border border-neutral-800/50 bg-neutral-900/20 hover:border-[#00FF88]/20 transition-colors text-center">
                                <p className="text-white text-sm font-medium">{p.name}</p>
                                <p className="text-neutral-500 text-[10px] mt-1">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════ CONTACT CTA ════════════════════════ */}
            <section className="py-24 px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <Layers className="w-10 h-10 text-[#00FF88] mx-auto mb-6" />
                    <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                        트렌드가 궁금하신가요?
                    </h2>
                    <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
                        귀사의 산업에 맞는 트렌드 리포트와 컨설팅을 제안합니다.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a
                            href="https://tenone.biz/contact"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00FF88] text-black font-semibold rounded-lg hover:bg-[#00DD77] transition-colors"
                        >
                            상담 신청 <ArrowRight className="w-4 h-4" />
                        </a>
                        <div className="text-neutral-500 text-sm font-mono">
                            lools@tenone.biz
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
