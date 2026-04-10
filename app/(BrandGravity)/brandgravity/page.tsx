"use client";

import Link from "next/link";
import { ArrowRight, Brain, Search, Target, Database, Radar, PenTool, BarChart3, ChevronRight } from "lucide-react";
import NewsletterSubscribeForm from '@/components/newsletter/NewsletterSubscribeForm';
import '../gravity-hero.css';

// 최종 위치 근처에서 둥둥 떠다니는 두 위치 (작은 offset)
// ga: 첫 번째 떠다니는 위치, gb: 두 번째 떠다니는 위치 → 서서히 0,0으로 안착
const GRAVITY_LETTERS = [
    { char: "G", ga: "translate(-5px, -7px) rotate(-3deg)",  gb: "translate(3px, 5px) rotate(1.5deg)",  gl: "translate(-2px, -3px) rotate(-1deg)",  delay: "0s"    },
    { char: "R", ga: "translate(4px, -5px) rotate(2.5deg)",  gb: "translate(-5px, 6px) rotate(-2deg)",  gl: "translate(2px, -2px) rotate(1deg)",    delay: "0.1s"  },
    { char: "A", ga: "translate(-3px, 6px) rotate(-3.5deg)", gb: "translate(5px, -4px) rotate(2deg)",   gl: "translate(-1px, 2px) rotate(-1.5deg)", delay: "0.2s"  },
    { char: "V", ga: "translate(6px, 4px) rotate(3deg)",     gb: "translate(-4px, -5px) rotate(-2deg)", gl: "translate(2px, 1.5px) rotate(1deg)",   delay: "0.05s" },
    { char: "I", ga: "translate(-5px, -5px) rotate(-4deg)",  gb: "translate(3px, 6px) rotate(2.5deg)",  gl: "translate(-2px, -2px) rotate(-1.5deg)",delay: "0.15s" },
    { char: "T", ga: "translate(4px, -6px) rotate(2deg)",    gb: "translate(-5px, 4px) rotate(-1.5deg)",gl: "translate(1.5px, -2px) rotate(0.8deg)", delay: "0.25s" },
    { char: "Y", ga: "translate(-6px, 5px) rotate(-3deg)",   gb: "translate(4px, -4px) rotate(2deg)",   gl: "translate(-2px, 2px) rotate(-1deg)",   delay: "0.32s" },
];

const systems = [
    { icon: Database, name: "Pain Collector", desc: "리뷰·커뮤니티·Q&A 데이터에서 구매 동기와 불만 패턴을 수집·분류합니다" },
    { icon: Search, name: "Question Mapper", desc: "수집된 페인 포인트가 AI·검색 채널에서 어떤 질의 형태로 표현되는지 분석합니다" },
    { icon: Brain, name: "AI Prober", desc: "5대 AI 엔진에 실제 질의를 수행해 추천 결과와 인용 소스를 수집합니다" },
    { icon: Radar, name: "Source Tracer", desc: "AI 추천에 인용된 소스를 역추적하고 경쟁사의 노출 경로를 분석합니다" },
    { icon: Target, name: "Gap Analyzer", desc: "페인 포인트·질의 패턴·AI 소스를 교차 분석해 브랜드 부재 지점을 특정합니다" },
    { icon: PenTool, name: "Voice Designer", desc: "갭 분석 결과를 바탕으로 브랜드 보이스 가이드와 콘텐츠 브리프를 설계합니다" },
    { icon: BarChart3, name: "Score Tracker", desc: "Gravity Score를 산출하고 경쟁사 대비 추이를 정기적으로 추적합니다" },
];

const processSteps = [
    { n: "01", title: "신청 및 킥오프", desc: "브랜드 정보, 경쟁사, 목표 채널을 공유합니다. Pain Collector가 데이터 수집을 시작합니다." },
    { n: "02", title: "데이터 수집 및 분석", desc: "7개 시스템이 순서대로 실행됩니다. 리뷰 수집부터 AI 질의, 소스 역추적까지 자동으로 진행됩니다." },
    { n: "03", title: "진단 리포트 납품", desc: "Gravity Score, 경쟁사 비교, 갭 진단서, 우선순위 액션 아이템을 포함한 최종 보고서를 납품합니다." },
    { n: "04", title: "실행 연계 (Program 선택 시)", desc: "Scan 결과를 기반으로 브랜드 보이스 재설계, 콘텐츠 브리프, 리뷰 전략 실행까지 이어집니다." },
];

export default function BrandGravityPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">

            {/* ── 풀스크린 히어로 ── */}
            <section style={{
                position: "relative",
                minHeight: "100vh",
                overflow: "hidden",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>

                {/* 행성 배경 */}
                <div style={{
                    position: "absolute",
                    right: "-10%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "65vw",
                    height: "65vw",
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 30% 38%, #4a4a4a 0%, #2a2a2a 20%, #181818 45%, #090909 75%, #000 100%)",
                    boxShadow: "inset -40px -15px 100px rgba(0,0,0,0.9), inset 30px 20px 80px rgba(80,80,80,0.12), 0 0 120px rgba(60,60,60,0.08)",
                    pointerEvents: "none",
                }} />
                {/* 행성 크레이터 — 각각 다른 속도로 부유 */}
                <div className="crater-a" style={{
                    position: "absolute",
                    right: "8%",
                    top: "28%",
                    width: "8vw",
                    height: "8vw",
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 35%, #252525 0%, #111 60%, #060606 100%)",
                    boxShadow: "inset 3px 3px 12px rgba(0,0,0,0.8)",
                    opacity: 0.9,
                    pointerEvents: "none",
                }} />
                <div className="crater-b" style={{
                    position: "absolute",
                    right: "22%",
                    top: "58%",
                    width: "5vw",
                    height: "5vw",
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 30% 30%, #202020 0%, #0d0d0d 70%, #050505 100%)",
                    boxShadow: "inset 2px 2px 8px rgba(0,0,0,0.8)",
                    opacity: 0.85,
                    pointerEvents: "none",
                }} />
                <div className="crater-c" style={{
                    position: "absolute",
                    right: "15%",
                    top: "42%",
                    width: "3vw",
                    height: "3vw",
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 40% 40%, #1e1e1e 0%, #0a0a0a 100%)",
                    boxShadow: "inset 1px 1px 6px rgba(0,0,0,0.7)",
                    opacity: 0.8,
                    pointerEvents: "none",
                }} />

                {/* 텍스트 중앙 컨테이너 — BRAND 폭 기준으로 GRAVITY 폭 맞춤 */}
                <div style={{
                    position: "relative",
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    width: "100%",
                    padding: "0 24px",
                    boxSizing: "border-box",
                }}>
                    {/* BRAND / GRAVITY 폭 통일 컨테이너 */}
                    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "stretch", maxWidth: "calc(100vw - 48px)" }}>
                        {/* BRAND 텍스트 — D를 좌우 반전해 B↔D 마주보게 */}
                        <div
                            className="gravity-brand"
                            style={{
                                fontSize: "clamp(2rem, 10vw, 9rem)",
                                fontWeight: 900,
                                letterSpacing: "0.08em",
                                color: "#fff",
                                lineHeight: 1,
                                textAlign: "center",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "baseline",
                                gap: "0.08em",
                            }}
                        >
                            {"BRAND".split("").map((ch, i) => (
                                <span key={i} style={ch === "D" ? { display: "inline-block", transform: "scaleX(-1)" } : undefined}>
                                    {ch}
                                </span>
                            ))}
                        </div>

                        {/* 구분선 */}
                        <div style={{
                            height: "1px",
                            background: "rgba(255,255,255,0.3)",
                            margin: "clamp(6px, 1vw, 14px) 0",
                        }} />

                        {/* GRAVITY 글자들 — BRAND 폭에 맞춰 space-between */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                            {GRAVITY_LETTERS.map((l) => (
                                <span
                                    key={l.char}
                                    className="gravity-letter"
                                    style={{
                                        "--g-a": l.ga,
                                        "--g-b": l.gb,
                                        "--g-a-light": l.gl,
                                        animationDelay: l.delay,
                                        fontSize: "clamp(1rem, 6vw, 5.8rem)",
                                        fontWeight: 100,
                                        color: "#fff",
                                        lineHeight: 1,
                                        letterSpacing: 0,
                                    } as React.CSSProperties}
                                >
                                    {l.char}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 서브타이틀 */}
                    <p className="gravity-subtitle" style={{
                        marginTop: "clamp(24px, 4vw, 48px)",
                        color: "#888",
                        fontSize: "clamp(0.8rem, 1.5vw, 1rem)",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                    }}>
                        AI Era Branding
                    </p>

                    {/* CTA 버튼 */}
                    <div className="gravity-cta flex flex-col sm:flex-row items-center gap-3" style={{
                        marginTop: "clamp(20px, 3vw, 40px)",
                    }}>
                        <Link href="/brandgravity/apply" className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition">
                            Gravity Scan 신청 <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/brandgravity/services" className="inline-flex items-center gap-2 px-6 py-2.5 border border-neutral-700 text-sm rounded-lg hover:border-neutral-500 transition">
                            서비스 소개
                        </Link>
                    </div>
                </div>

                {/* 스크롤 힌트 */}
                <div className="gravity-subtitle" style={{
                    position: "absolute",
                    bottom: "32px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    zIndex: 10,
                }}>
                    <span style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase" }}>Scroll</span>
                    <div className="gravity-scroll-line" style={{
                        width: "1px",
                        height: "40px",
                        background: "linear-gradient(to bottom, #555, transparent)",
                    }} />
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">

                {/* 시대 전환 */}
                <section className="mb-24">
                    <div className="grid sm:grid-cols-2 gap-px bg-white/5 rounded-xl overflow-hidden">
                        <div className="bg-[#0A0A0A] p-8">
                            <p className="text-[10px] tracking-[0.2em] text-neutral-600 uppercase mb-4">기존 — 광고·검색 중심</p>
                            <p className="text-sm text-neutral-400 leading-relaxed">
                                브랜드는 키워드를 구매하고 광고를 집행했습니다.<br /><br />
                                소비자는 검색 결과를 직접 비교·선택했습니다.
                            </p>
                        </div>
                        <div className="bg-[#111] p-8 border-l border-amber-500/20">
                            <p className="text-[10px] tracking-[0.2em] text-amber-500 uppercase mb-4">현재 — AI 추천 채널</p>
                            <p className="text-sm text-neutral-300 leading-relaxed">
                                소비자는 상황을 AI에게 설명하고, AI가 대안을 제시합니다.<br /><br />
                                브랜드는 <span className="text-amber-500 font-medium">AI의 추천 결과 안에 존재해야</span> 합니다.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3가지 핵심 진단 축 */}
                <section className="mb-24">
                    <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">Diagnostic Framework</p>
                    <h2 className="text-2xl font-bold mb-10">3가지 진단 축</h2>
                    <div className="space-y-4">
                        <div className="p-6 border border-neutral-800 rounded-xl hover:border-amber-500/20 transition">
                            <div className="flex items-start gap-4">
                                <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-mono flex-shrink-0 mt-0.5">01</span>
                                <div>
                                    <h3 className="text-base font-bold mb-2">실구매자 기반 페인 포인트 분석</h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        내부 마케팅 가정이 아닌 실구매자의 언어에서 출발합니다.
                                        리뷰·커뮤니티 데이터에서 구매 동기, 전환 장벽, 비교 맥락을 추출해 카테고리 페인 포인트 맵을 구성합니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border border-neutral-800 rounded-xl hover:border-amber-500/20 transition">
                            <div className="flex items-start gap-4">
                                <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-mono flex-shrink-0 mt-0.5">02</span>
                                <div>
                                    <h3 className="text-base font-bold mb-2">AI 질의 패턴 및 추천 결과 수집</h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        동일한 페인 포인트도 검색 키워드와 AI 질의 표현이 다릅니다.
                                        ChatGPT, Gemini, Perplexity, Claude, Copilot에 실제 질의를 수행해 추천 결과와 인용 소스를 수집합니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border border-neutral-800 rounded-xl hover:border-amber-500/20 transition">
                            <div className="flex items-start gap-4">
                                <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-mono flex-shrink-0 mt-0.5">03</span>
                                <div>
                                    <h3 className="text-base font-bold mb-2">AI 추천 부재 원인 진단</h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        AI가 참조하는 소스를 역추적해 경쟁사의 노출 경로를 분석합니다.
                                        페인 포인트·질의 패턴·AI 소스를 교차 분석해 브랜드가 추천에서 배제되는 원인을 특정합니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gap 다이어그램 */}
                <section className="mb-24">
                    <div className="p-8 border border-amber-500/20 rounded-xl bg-amber-500/5 text-center">
                        <p className="text-xs tracking-[0.2em] text-amber-500 uppercase mb-6">The Gap</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm mb-6">
                            <div className="px-4 py-2 border border-neutral-700 rounded-lg text-neutral-300">소비자의 페인 포인트</div>
                            <ChevronRight className="w-4 h-4 text-neutral-600 rotate-90 sm:rotate-0" />
                            <div className="px-4 py-2 border border-neutral-700 rounded-lg text-neutral-300">AI 질의 및 추천 결과</div>
                            <ChevronRight className="w-4 h-4 text-neutral-600 rotate-90 sm:rotate-0" />
                            <div className="px-4 py-2 border border-amber-500/30 rounded-lg text-amber-400 font-medium">브랜드 부재</div>
                        </div>
                        <p className="text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
                            Brand Gravity는 이 갭을 정량화하고, 브랜드 메시지를 소비자 언어로 재설계하며,<br />
                            AI 참조 소스 내 브랜드 맥락 자산을 구축합니다.
                        </p>
                    </div>
                </section>

                {/* 7개 시스템 */}
                <section className="mb-24">
                    <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">Systems</p>
                    <h2 className="text-2xl font-bold mb-8">7개 분석 시스템</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {systems.map((s) => (
                            <div key={s.name} className="flex gap-4 p-4 border border-neutral-800 rounded-xl hover:border-amber-500/20 transition">
                                <s.icon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-bold mb-1">{s.name}</h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 진행 절차 */}
                <section className="mb-24">
                    <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">Process</p>
                    <h2 className="text-2xl font-bold mb-2">진행 절차</h2>
                    <p className="text-sm text-neutral-500 mb-10">Gravity Scan은 계약 후 4주 이내 결과물을 납품합니다.</p>
                    <div className="relative">
                        <div className="absolute left-[22px] top-4 bottom-4 w-px bg-neutral-800" />
                        <div className="space-y-4">
                            {processSteps.map((s) => (
                                <div key={s.n} className="flex gap-5">
                                    <div className="flex-shrink-0 w-11 h-11 rounded-full border border-neutral-700 flex items-center justify-center text-xs font-bold text-amber-500 bg-[#0A0A0A] relative z-10">
                                        {s.n}
                                    </div>
                                    <div className="flex-1 pt-2 pb-4">
                                        <h3 className="text-sm font-bold mb-1">{s.title}</h3>
                                        <p className="text-xs text-neutral-400 leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* AI 소스 신뢰도 */}
                <section className="mb-24">
                    <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-6">AI Source Trust Hierarchy</p>
                    <div className="space-y-2">
                        {[
                            { level: "신뢰도 높음", items: ["전문가 기고 및 업계 전문 미디어", "독립 리뷰 매체 (Runners World, Wirecutter 등)"], color: "text-green-400 border-green-400/20 bg-green-400/5" },
                            { level: "신뢰도 중간", items: ["구조화 데이터 (schema.org)", "커뮤니티 다수 동의 기반 콘텐츠", "맥락이 포함된 실사용자 리뷰"], color: "text-amber-400 border-amber-400/20 bg-amber-400/5" },
                            { level: "신뢰도 낮음", items: ["단문 일반 리뷰", "자사 브랜드 발행 광고성 콘텐츠"], color: "text-red-400 border-red-400/20 bg-red-400/5" },
                        ].map(g => (
                            <div key={g.level} className={`p-4 border rounded-xl ${g.color}`}>
                                <span className="text-[10px] font-bold uppercase mr-3">{g.level}</span>
                                <span className="text-xs text-neutral-400">{g.items.join(" / ")}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-600 mt-3">AI는 다수의 독립 소스가 일관된 맥락을 제공할 때 해당 브랜드를 신뢰도 있는 추천 대상으로 분류합니다.</p>
                </section>

                {/* 뉴스레터 */}
                <section className="py-16 px-6 border-t border-neutral-800 mb-16">
                    <NewsletterSubscribeForm
                        source="brandgravity"
                        dark
                        accentColor="#F59E0B"
                        subtitle="Brand Gravity 인사이트를 구독하세요."
                    />
                </section>

                {/* CTA */}
                <section className="text-center">
                    <p className="text-xs tracking-[0.2em] text-amber-500 uppercase mb-4">Gravity Scan</p>
                    <h2 className="text-2xl font-bold mb-3">AI 추천 채널에서의<br />브랜드 현황을 진단합니다</h2>
                    <p className="text-sm text-neutral-400 mb-8 max-w-md mx-auto">계약 후 4주 이내 Gravity Score, 경쟁사 비교, 갭 진단서를 납품합니다.</p>
                    <Link href="/brandgravity/apply" className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition">
                        Gravity Scan 신청 <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </div>

            <footer className="border-t border-neutral-800 py-8 text-center text-xs text-neutral-600">
                &copy; Brand Gravity. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
            </footer>
        </div>
    );
}
