"use client";

import Link from "next/link";
import { ArrowRight, Search, Lightbulb, Shield, Eye, Users } from "lucide-react";

const HERO_RED = "#E53935";

const matchFlow = [
    {
        step: "TIH",
        name: "Trust · Intent · Hiring",
        desc: "조직의 상황과 필요한 사람의 결을 22문항으로 정리합니다. JD가 '어떤 자리인가'라면, TIH는 '왜 사람이 필요한가'를 담습니다.",
        icon: Lightbulb,
        color: "from-amber-500 to-orange-500",
    },
    {
        step: "JD",
        name: "Job Description",
        desc: "스펙 나열이 아닌 서사입니다. 이 자리가 왜 존재하는지, 어떤 문제를 푸는지, 어떤 사람이 와야 하는지를 담습니다.",
        icon: Search,
        color: "from-sky-500 to-blue-600",
    },
    {
        step: "매칭",
        name: "HeRo 큐레이션",
        desc: "TIH × HIT 매칭. 기업의 고민과 인재의 본질이 맞닿는 지점을 AI와 전문가가 함께 큐레이션합니다.",
        icon: Eye,
        color: "from-violet-500 to-purple-600",
    },
];

const principles = [
    { icon: Shield, title: "완전 비공개 매칭", desc: "매칭 점수·순위·로직은 양쪽에 공개되지 않습니다. 진정성을 보호하는 방어막입니다." },
    { icon: Users, title: "3축 인재 매핑", desc: "수호자·개척자·결속자 세 축의 배분으로 조직이 필요한 사람의 본질을 정의합니다." },
    { icon: Eye, title: "조직 건강성 진단", desc: "TIH는 동시에 조직의 건강성을 간접 측정합니다. 좋은 기업만이 좋은 인재를 만납니다." },
];

export default function SearchLightPage() {

    return (
        <div className="bg-white min-h-screen">
            {/* ── Hero: 배트시그널 — 좌하단 → 우상단 ── */}
            <section className="relative bg-[#04040a] overflow-hidden" style={{ minHeight: "100vh" }}>

                {/* 별 레이어 */}
                <div className="pointer-events-none absolute inset-0" style={{
                    backgroundImage: `
                        radial-gradient(1px 1px at 18% 12%, rgba(255,255,255,0.7) 0%, transparent 100%),
                        radial-gradient(1.5px 1.5px at 35% 6%, rgba(255,255,255,0.5) 0%, transparent 100%),
                        radial-gradient(1px 1px at 55% 9%, rgba(255,255,255,0.6) 0%, transparent 100%),
                        radial-gradient(1px 1px at 72% 4%, rgba(255,255,255,0.4) 0%, transparent 100%),
                        radial-gradient(1px 1px at 88% 14%, rgba(255,255,255,0.5) 0%, transparent 100%),
                        radial-gradient(1px 1px at 28% 22%, rgba(255,255,255,0.3) 0%, transparent 100%),
                        radial-gradient(1px 1px at 64% 18%, rgba(255,255,255,0.4) 0%, transparent 100%),
                        radial-gradient(1px 1px at 92% 28%, rgba(255,255,255,0.3) 0%, transparent 100%),
                        radial-gradient(1px 1px at 10% 38%, rgba(255,255,255,0.2) 0%, transparent 100%),
                        radial-gradient(1px 1px at 48% 32%, rgba(255,255,255,0.3) 0%, transparent 100%)
                    `,
                }} />

                {/* 써치라이트 빔 — 좌하단 한 점에서 우상단으로 */}
                {/* HeRo 로고 위치(top:28%, left:58%)에서 빔 폭 = HeRo 텍스트 너비 ~22% 기준 역산 */}
                {/* 넓은 외곽 확산광 */}
                <div className="pointer-events-none absolute inset-0" style={{
                    background: "linear-gradient(to top right, rgba(229,57,53,0.07) 0%, rgba(229,57,53,0.03) 55%, transparent 100%)",
                    clipPath: "polygon(0% 100%, 2% 100%, 100% 6%, 51% 0%)",
                }} />
                {/* 중간 빔 */}
                <div className="pointer-events-none absolute inset-0" style={{
                    background: "linear-gradient(to top right, rgba(255,255,255,0.13) 0%, rgba(255,160,120,0.07) 45%, rgba(229,57,53,0.03) 70%, transparent 100%)",
                    clipPath: "polygon(0.2% 100%, 1.5% 100%, 99% 3%, 58% 0%)",
                }} />
                {/* 핵심 빔 (밝은 중심선) — HeRo 로고와 정확히 일치 */}
                <div className="pointer-events-none absolute inset-0" style={{
                    background: "linear-gradient(to top right, rgba(255,255,255,0.28) 0%, rgba(255,230,210,0.13) 30%, rgba(229,57,53,0.05) 62%, transparent 100%)",
                    clipPath: "polygon(0.5% 99.5%, 1% 100%, 95% 2%, 65% 0%)",
                }} />

                {/* 지면 광원 (좌하단 램프 — 아주 작은 점) */}
                <div className="pointer-events-none absolute bottom-0 left-0" style={{
                    width: "60px", height: "30px",
                    background: "radial-gradient(ellipse at 10% 100%, rgba(255,255,255,0.8) 0%, rgba(229,57,53,0.5) 40%, transparent 70%)",
                    filter: "blur(6px)",
                }} />
                {/* 광원 코어 스팟 */}
                <div className="pointer-events-none absolute bottom-0 left-0" style={{
                    width: "16px", height: "10px",
                    background: "radial-gradient(ellipse at 20% 100%, rgba(255,255,255,1) 0%, transparent 80%)",
                    filter: "blur(2px)",
                }} />

                {/* HeRo 로고 — 우상단 30% 지점, 빔 안에 투영 */}
                <div className="pointer-events-none absolute" style={{ top: "28%", left: "58%", zIndex: 10, transform: "translate(-50%, -50%)" }}>
                    {/* 원형 후광 */}
                    <div style={{
                        position: "absolute",
                        top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "260px", height: "200px",
                        borderRadius: "50%",
                        background: "radial-gradient(ellipse, rgba(229,57,53,0.20) 0%, rgba(229,57,53,0.06) 55%, transparent 100%)",
                        filter: "blur(8px)",
                    }} />
                    {/* 로고 — SVG 텍스트 아웃라인 + glow (모바일 완전 호환) */}
                    <svg
                        viewBox="0 0 420 130"
                        style={{ width: "clamp(200px, 38vw, 480px)", overflow: "visible", display: "block" }}
                        aria-label="HeRo"
                    >
                        <defs>
                            <filter id="hero-glow" x="-30%" y="-60%" width="160%" height="220%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
                                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
                                <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur3" />
                                <feMerge>
                                    <feMergeNode in="blur3" />
                                    <feMergeNode in="blur2" />
                                    <feMergeNode in="blur1" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <text
                            x="50%" y="88%"
                            textAnchor="middle"
                            fontFamily="system-ui, -apple-system, sans-serif"
                            fontWeight="900"
                            fontSize="110"
                            letterSpacing="-4"
                            fill="none"
                            stroke="rgba(229,57,53,0.7)"
                            strokeWidth="2.5"
                            filter="url(#hero-glow)"
                        >
                            HeRo
                        </text>
                    </svg>
                </div>

                {/* 텍스트 콘텐츠 — 좌하단 */}
                <div className="relative flex flex-col justify-end h-screen pb-20 px-10 md:px-16" style={{ zIndex: 20, maxWidth: "640px" }}>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-red-400/70 mb-5 font-medium">
                        Search Light
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
                        어두운 밤,<br />영웅을 기다리는 마음
                    </h1>
                    <p className="text-sm text-neutral-400 max-w-sm mb-10 leading-relaxed">
                        단순 JD 등록이 아닙니다.<br />
                        기업의 진짜 고민과 원하는 인재상을 연결합니다.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/hero/search-light/tih"
                            className="flex items-center gap-2 px-7 py-3.5 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: HERO_RED }}
                        >
                            인재 찾기 의뢰 · 기업 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/hero/jh/write"
                            className="flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg backdrop-blur-sm border border-white/20 transition-colors"
                        >
                            희망 직무 작성 · 구직자 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── 매칭 구조 ── */}
            <section className="py-20 bg-neutral-50">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">Matching Tetrad</h2>
                        <p className="text-neutral-500">기업 × 인재, 네 요소가 교차하는 매칭 구조</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {matchFlow.map((item) => (
                            <div key={item.step} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                                    <item.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-xs font-bold tracking-wider text-neutral-400 uppercase mb-1">{item.step}</div>
                                <h3 className="font-bold text-base mb-2">{item.name}</h3>
                                <p className="text-sm text-neutral-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* ── 원칙 ── */}
            <section className="py-20">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">Search Light 원칙</h2>
                        <p className="text-neutral-500">좋은 만남은 진정성에서 시작합니다</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {principles.map((p) => (
                            <div key={p.title} className="text-center">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-neutral-100">
                                    <p.icon className="h-7 w-7 text-neutral-500" />
                                </div>
                                <h3 className="font-bold mb-2">{p.title}</h3>
                                <p className="text-sm text-neutral-500">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TIH 소개 ── */}
            <section className="py-20 bg-neutral-50">
                <div className="mx-auto max-w-4xl px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold mb-3">TIH 작성이란?</h2>
                        <p className="text-neutral-500 text-sm max-w-xl mx-auto">
                            Trust · Intent · Hiring — 기업의 고민을 22문항으로 구조화합니다. 7~8분 소요.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        {[
                            { section: "Section 0", label: "포지션 분류", q: "3문항", time: "30초" },
                            { section: "Section 1", label: "고민의 지형", q: "4문항", time: "1분 30초" },
                            { section: "Section 2", label: "3축 배분", q: "1문항", time: "1분" },
                            { section: "Section 3", label: "자리의 구체", q: "6문항", time: "2분" },
                            { section: "Section 4", label: "일하는 결", q: "6문항", time: "2분" },
                            { section: "Section 5", label: "피하고 싶은 유형", q: "1문항", time: "20초" },
                            { section: "Section 6", label: "한 줄 묘사", q: "선택", time: "1분" },
                            { section: "총계", label: "22 필수 + 1 선택", q: "", time: "7~8분" },
                        ].map((item, i) => (
                            <div key={i} className={`bg-white rounded-lg border p-3 ${i === 7 ? "border-red-300 bg-red-50" : "border-neutral-200"}`}>
                                <p className="text-[10px] text-neutral-400 font-mono mb-1">{item.section}</p>
                                <p className="text-xs font-bold text-neutral-800">{item.label}</p>
                                {item.q && <p className="text-xs text-neutral-500 mt-0.5">{item.q}</p>}
                                <p className="text-xs font-semibold mt-1 text-neutral-500">{item.time}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/hero/search-light/tih"
                            className="inline-flex items-center gap-2 px-7 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: HERO_RED }}
                        >
                            인재 찾기 의뢰 · 기업 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/hero/jh/write"
                            className="inline-flex items-center gap-2 px-7 py-3 border border-neutral-300 text-neutral-800 font-bold rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                            희망 직무 작성 · 구직자 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
