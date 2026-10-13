"use client";

import Link from "next/link";
import { ArrowRight, Search, Lightbulb, Shield, Eye, Users } from "lucide-react";

const HERO_RED = "#E53935";

const matchFlow = [
    {
        step: "1단계 · 기업",
        name: "기업 고민 설문",
        desc: "조직의 상황과 필요한 사람을 22문항으로 정리합니다. 채용 공고가 '무슨 일을 하는가'라면, 이 설문은 '왜 사람이 필요한가'를 담습니다.",
        icon: Lightbulb,
        color: "from-amber-500 to-orange-500",
    },
    {
        step: "2단계 · 기업",
        name: "채용 공고",
        desc: "자격 요건 목록이 아니라, 이 일이 왜 필요한지, 어떤 문제를 푸는지, 어떤 사람이 맞는지를 적습니다.",
        icon: Search,
        color: "from-sky-500 to-blue-600",
    },
    {
        step: "3단계 · HeRo",
        name: "함께 살펴보기",
        desc: "기업 고민 설문·채용 공고와 인재의 HIT 결과·희망 직무를 AI와 전문가가 함께 살펴보고 분석해 드립니다.",
        icon: Eye,
        color: "from-violet-500 to-purple-600",
    },
];

const principles = [
    { icon: Shield, title: "개인 검사는 기업에 가지 않습니다", desc: "기업은 조건에 맞는 인재 전체의 비율만 봅니다. 이름·연락처는 인재가 제안에 응할 때만 이력서와 함께 전달됩니다." },
    { icon: Users, title: "필요한 사람을 세 가지로", desc: "지키는 사람·새로 여는 사람·잇는 사람이 각각 얼마나 필요한지 나눠 적어, 원하는 사람을 분명히 합니다." },
    { icon: Eye, title: "조직 상태도 함께", desc: "설문 답에서 조직이 지금 어떤 상태인지도 함께 보입니다. 좋은 조직이 좋은 사람을 만납니다." },
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
                    <p className="text-sm font-bold text-red-400 mb-4">써치 라이트</p>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight break-keep">
                        기업은 좋은 사람을 찾고,<br />사람은 좋은 기업을 찾는다
                    </h1>
                    <p className="text-sm md:text-base text-neutral-400 max-w-md mb-10 leading-relaxed break-keep">
                        양쪽에서 비춘 빛이 겹치는 곳에서 만납니다.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="#talent"
                            className="flex items-center gap-2 px-7 py-3.5 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: HERO_RED }}
                        >
                            좋은 기업 찾기 <ArrowRight className="h-4 w-4" />
                        </a>
                        <a
                            href="#company"
                            className="flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg backdrop-blur-sm border border-white/20 transition-colors"
                        >
                            좋은 사람 찾기 · 기업 <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ── 두 방향 — 왼쪽 인재 · 오른쪽 기업, 가운데서 만난다 (2026-10-13) ── */}
            <section className="py-20 bg-white border-b border-neutral-100">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
                        <div id="talent" className="scroll-mt-24 border border-neutral-200 rounded-2xl p-7 flex flex-col">
                            <p className="text-xs font-bold text-neutral-500 mb-2">인재</p>
                            <h2 className="text-xl font-extrabold mb-2">사람은 좋은 기업을 찾는다</h2>
                            <p className="text-sm text-neutral-600 leading-relaxed break-keep mb-6 flex-1">
                                희망 직무 설문에 하고 싶은 일과 조건을 쓰면, 내 검사 결과와 함께 맞는 기업을 찾아 성장 기록의 채용 피드에 보여 드립니다.
                                제안 받기를 켜 두면 조건에 맞는 기업이 먼저 면접을 제안합니다.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Link href="/hero/jh/write" className="flex items-center justify-between px-4 py-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-sm font-semibold transition-colors">
                                    희망 직무 설문 쓰기 <ArrowRight className="h-4 w-4 text-neutral-400" />
                                </Link>
                                <Link href="/hero/offers/settings" className="flex items-center justify-between px-4 py-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-sm font-semibold transition-colors">
                                    제안 받기 켜기 <ArrowRight className="h-4 w-4 text-neutral-400" />
                                </Link>
                            </div>
                        </div>
                        <div className="hidden md:flex flex-col items-center justify-center text-neutral-300">
                            <span className="h-16 w-px bg-gradient-to-b from-transparent to-neutral-300" />
                            <span className="my-3 text-xs font-bold text-neutral-400 [writing-mode:vertical-rl]">만나는 곳</span>
                            <span className="h-16 w-px bg-gradient-to-t from-transparent to-neutral-300" />
                        </div>
                        <div id="company" className="scroll-mt-24 border border-neutral-200 rounded-2xl p-7 flex flex-col">
                            <p className="text-xs font-bold text-neutral-500 mb-2">기업</p>
                            <h2 className="text-xl font-extrabold mb-2">기업은 좋은 사람을 찾는다</h2>
                            <p className="text-sm text-neutral-600 leading-relaxed break-keep mb-6 flex-1">
                                인재상을 고르면 조건에 맞는 HeRo 인재가 몇 명인지, 원하는 성향의 사람이 어느 정도 있는지 인재 풀 리포트로 바로 보이고, 면접·인터뷰를 제안할 수 있습니다.
                                개인의 검사 결과는 본인만 봅니다.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Link href="/hero/search-light/people" className="flex items-center justify-between px-4 py-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-sm font-semibold transition-colors">
                                    좋은 사람 찾기 <ArrowRight className="h-4 w-4 text-neutral-400" />
                                </Link>
                                <Link href="/hero/search-light/tih" className="flex items-center justify-between px-4 py-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-sm font-semibold transition-colors">
                                    기업 고민 설문 쓰기 <ArrowRight className="h-4 w-4 text-neutral-400" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 매칭 구조 ── */}
            <section className="py-20 bg-neutral-50">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">4방향 매칭</h2>
                        <p className="text-neutral-500">기업 쪽 두 가지, 인재 쪽 두 가지 정보를 함께 봅니다</p>
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
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">써치 라이트 원칙</h2>
                        <p className="text-neutral-500">솔직하게 적을수록 잘 맞는 만남이 됩니다</p>
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
                        <h2 className="text-2xl font-bold mb-3">기업 고민 설문이란?</h2>
                        <p className="text-neutral-500 text-sm max-w-xl mx-auto">
                            기업의 고민을 22문항으로 정리합니다. 7~8분 걸립니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        {[
                            { section: "0", label: "어떤 직무인가", q: "3문항", time: "30초" },
                            { section: "1", label: "지금의 고민", q: "4문항", time: "1분 30초" },
                            { section: "2", label: "필요한 사람 비중", q: "1문항", time: "1분" },
                            { section: "3", label: "맡을 일", q: "6문항", time: "2분" },
                            { section: "4", label: "일하는 방식", q: "6문항", time: "2분" },
                            { section: "5", label: "피하고 싶은 유형", q: "1문항", time: "20초" },
                            { section: "6", label: "한 줄로 설명", q: "선택", time: "1분" },
                            { section: "합계", label: "필수 22 + 선택 1", q: "", time: "7~8분" },
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
                            기업 고민 설문 작성 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/hero/jh/write"
                            className="inline-flex items-center gap-2 px-7 py-3 border border-neutral-300 text-neutral-800 font-bold rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                            희망 직무 설문 작성 · 개인 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
