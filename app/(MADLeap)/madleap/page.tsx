"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Expand,
    Link2,
    Footprints,
    BarChart3,
    Lightbulb,
    Users,
    Trophy,
    Calendar,
    Instagram,
    ChevronRight,
    Star,
    Sparkles,
    Clock,
    MapPin,
} from "lucide-react";

/* ── Mock Data ── */

const stats = [
    { label: "누적 멤버", value: "200+", suffix: "명" },
    { label: "역대 수상", value: "15+", suffix: "건" },
    { label: "운영 기수", value: "5", suffix: "기째" },
    { label: "파트너 기업", value: "12+", suffix: "개" },
];

const highlights = [
    {
        date: "2025.11",
        title: "제4회 경쟁PT 대회 대상 수상",
        desc: "지평주조 마케팅 전략 PT에서 Team HOPS가 대상을 수상했습니다.",
        tag: "수상",
        tagColor: "bg-yellow-500/20 text-yellow-400",
    },
    {
        date: "2025.09",
        title: "DAM Party Vol.3 성료",
        desc: "150명 규모의 네트워킹 파티를 성공적으로 개최했습니다. 8개 동아리 연합.",
        tag: "행사",
        tagColor: "bg-purple-500/20 text-purple-400",
    },
    {
        date: "2025.07",
        title: "한국관광공사 프로젝트 완료",
        desc: "관광공사 MZ세대 관광 콘텐츠 캠페인을 4기 리퍼들이 수행했습니다.",
        tag: "프로젝트",
        tagColor: "bg-blue-500/20 text-blue-400",
    },
    {
        date: "2025.05",
        title: "4기 리퍼 32명 선발",
        desc: "120명 지원, 32명 최종 선발. 경쟁률 3.75:1을 기록했습니다.",
        tag: "모집",
        tagColor: "bg-green-500/20 text-green-400",
    },
];

const values = [
    {
        icon: Expand,
        title: "확장하다",
        desc: "매드립은 기존 광고 동아리의 '광고', '크리에이티브'에 집중하는 틀에서 벗어나, 마케팅, 커뮤니케이션, 데이터로 까지 확장합니다.",
    },
    {
        icon: Link2,
        title: "연결하다",
        desc: "매드립은 국내 여러 광고 동아리들과 지속적으로 관계를 구축하고 있으며 현업 선배님들과 소통하며 프로젝트를 진행합니다.",
    },
    {
        icon: Footprints,
        title: "발로 뛰다",
        desc: "매드립은 주어진 과제에 만족하지 않습니다. 직접 발로 뛰며 현장의 소리를 듣고, 실질적인 결과물을 만들어냅니다.",
    },
    {
        icon: BarChart3,
        title: "결과로 말하다",
        desc: "매드립은 큰 혁신을 불러올 잠재력을 개발하고 실전 프로젝트를 통해 증명합니다. 과정도 중요하지만, 결과로 말합니다.",
    },
    {
        icon: Lightbulb,
        title: "세상을 기획하는 기획자가 되다",
        desc: "우리가 말하는 기획은 AE, AP가 아닙니다. 기획은 일이 되게끔 하는 일입니다. 나의 생각을 세상에 꺼내 놓고 스스로 결과를 만드는 멋있는 일입니다.",
    },
];

const activities = [
    { icon: BarChart3, title: "스터디", desc: "AI 마케팅, 퍼포먼스, 브랜딩, 콘텐츠 등 분야별 스터디 그룹 운영", count: "6개 운영중" },
    { icon: Trophy, title: "프로젝트", desc: "실전 클라이언트 프로젝트 수행. 지평주조, 관광공사 등 실제 브랜드와 협업", count: "매 기수 3~4건" },
    { icon: Users, title: "네트워킹", desc: "DAM Party, 현업 멘토 세션, 8개 동아리 연합 교류", count: "연 4회+" },
    { icon: Star, title: "경쟁 PT", desc: "팀 단위 실전 기획·전략 프레젠테이션 대회. 역대 수상 15건 이상", count: "매 기수 1회" },
];

const instaPosts = [
    { id: 1, caption: "4기 경쟁PT 대회 현장", likes: 127, color: "from-[#4361ee]/40 to-[#1a1a2e]/60" },
    { id: 2, caption: "DAM Party Vol.3 후기", likes: 203, color: "from-purple-500/40 to-[#1a1a2e]/60" },
    { id: 3, caption: "지평주조 PT 비하인드", likes: 89, color: "from-amber-500/40 to-[#1a1a2e]/60" },
    { id: 4, caption: "4기 OT 현장 스케치", likes: 156, color: "from-green-500/40 to-[#1a1a2e]/60" },
    { id: 5, caption: "AI 마케팅 스터디 후기", likes: 74, color: "from-cyan-500/40 to-[#1a1a2e]/60" },
    { id: 6, caption: "3기 수료식 스냅", likes: 312, color: "from-rose-500/40 to-[#1a1a2e]/60" },
];

const partners = [
    { name: "MAD League", role: "본부" },
    { name: "Badak", role: "네트워크" },
    { name: "Ten:One", role: "인큐베이팅" },
    { name: "SmarComm", role: "마케팅 솔루션" },
    { name: "지평주조", role: "프로젝트 파트너" },
    { name: "한국관광공사", role: "프로젝트 파트너" },
];

const recruitmentInfo = {
    gen: 5,
    period: "2026.03.17 ~ 04.06",
    target: "수도권 대학 재학생 / 휴학생",
    count: "30명 내외",
    process: "서류 → 면접 → 최종 발표",
    applyUrl: "/madleap/apply",
};


export default function MadLeapHome() {
    const [activeHighlight, setActiveHighlight] = useState(0);

    return (
        <>
            {/* ── Hero: 5기 모집 ── */}
            <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#1a1a2e]">
                {/* Background layers */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/30 via-[#1a1a2e]/60 to-[#1a1a2e]" />
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[url('/brands/madleap/hero-bg.jpg')] bg-cover bg-center" />
                </div>
                {/* Animated particles */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-[#4361ee]/60 rounded-full animate-pulse"
                            style={{
                                top: `${15 + i * 15}%`,
                                left: `${10 + i * 16}%`,
                                animationDelay: `${i * 0.4}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
                    {/* Recruitment badge */}
                    <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 bg-[#4361ee]/20 border border-[#4361ee]/40 rounded-full mb-8 animate-pulse">
                        <Sparkles className="h-4 w-4 text-[#4361ee]" />
                        <span className="text-sm font-medium text-[#4361ee]">5기 리퍼 모집중</span>
                        <span className="text-xs text-white/50 hidden sm:inline">|</span>
                        <span className="text-xs text-white/60">{recruitmentInfo.period}</span>
                    </div>

                    {/* Logo */}
                    <div className="mb-6">
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight">
                            M<span className="text-[#4361ee]">A</span>D
                        </h1>
                        <div className="flex items-center justify-center gap-4 -mt-2">
                            <div className="h-px w-16 bg-white/60" />
                            <span className="text-xl md:text-3xl font-light text-white tracking-[0.3em]">
                                L E A P
                            </span>
                            <div className="h-px w-16 bg-white/60" />
                        </div>
                    </div>

                    <p className="text-xl md:text-2xl text-white/90 font-bold mt-8">
                        미치지 않으면, 미치지 못한다.
                    </p>
                    <p className="text-sm md:text-base text-white/50 mt-3">
                        수도권 대학생 마케팅 · 광고 · 실전 프로젝트 연합동아리
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href={recruitmentInfo.applyUrl}
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#4361ee] text-white text-sm font-bold hover:bg-[#3451de] transition-all rounded-lg flex items-center justify-center gap-2"
                        >
                            5기 지원하기
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/madleap/about"
                            className="w-full sm:w-auto px-8 py-3.5 border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all rounded-lg text-center"
                        >
                            매드립 알아보기
                        </Link>
                    </div>

                    {/* Mini stats */}
                    <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-md mx-auto">
                        {stats.map((s) => (
                            <div key={s.label} className="text-center">
                                <div className="text-xl md:text-2xl font-black text-white">{s.value}</div>
                                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                    </div>
                </div>
            </section>

            {/* ── About Preview ── */}
            <section className="bg-[#1a1a2e] text-white py-16 md:py-24">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-10">About.</h2>
                    <div className="space-y-6 text-base md:text-lg leading-relaxed text-neutral-300">
                        <p className="text-[#4361ee] font-semibold text-lg md:text-xl">
                            우리의 시작은 기웃거림이었습니다.
                        </p>
                        <p>
                            &ldquo;마케팅을 더 잘하고 싶다&rdquo;는 마음 하나로 모인 대학생들.
                            교실 안에서는 배울 수 없는 것들을 찾아<br />
                            현업의 선배님들에게 닿았습니다.
                        </p>
                        <p>
                            선배님들은 우리의 손을 잡아 주었고,<br />
                            함께 마케팅&광고 동아리계의 새로운 패러다임을 만들었습니다.
                        </p>
                        <p className="text-[#4361ee] font-semibold text-lg md:text-xl">
                            그래서 매드립은 한 번 더 도약을 했습니다.<br />
                            누구 보다 인공지능을 잘 활용하고,<br />
                            실전 프로젝트를 하는 조직이 되기로
                        </p>
                    </div>
                    <Link
                        href="/madleap/about"
                        className="inline-flex items-center gap-2 mt-10 px-6 py-3 border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all rounded-lg"
                    >
                        더 알아보기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* ── Recent Highlights ── */}
            <section className="bg-white py-16 md:py-24">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold">최근 활동</h2>
                            <p className="text-neutral-500 text-sm mt-1">매드립의 최근 소식을 확인하세요</p>
                        </div>
                        <Link href="/madleap/portfolio" className="text-sm text-[#4361ee] font-medium flex items-center gap-1 hover:underline">
                            전체보기 <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {highlights.map((h, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveHighlight(i)}
                                className={`text-left p-5 rounded-xl border transition-all ${
                                    activeHighlight === i
                                        ? "border-[#4361ee] bg-[#4361ee]/5 shadow-sm"
                                        : "border-neutral-200 hover:border-neutral-300"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${h.tagColor}`}>
                                        {h.tag}
                                    </span>
                                    <span className="text-xs text-neutral-400">{h.date}</span>
                                </div>
                                <h3 className="font-bold text-[15px] mb-1">{h.title}</h3>
                                <p className="text-neutral-500 text-sm line-clamp-2">{h.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Activities ── */}
            <section className="relative bg-[#1a1a2e] text-white py-16 md:py-24 overflow-hidden">
                {/* Particle-style bg */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#1a1a2e]/90 to-[#1a1a2e]" />
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#4361ee] rounded-full animate-pulse" />
                    <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-[#4361ee] rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
                    <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-[#4361ee] rounded-full animate-pulse" style={{ animationDelay: "0.7s" }} />
                    <div className="absolute top-2/3 right-1/4 w-0.5 h-0.5 bg-[#4361ee] rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                </div>

                <div className="relative z-10 mx-auto max-w-5xl px-6">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            우리들의 미친 도약
                        </h2>
                        <p className="text-xl md:text-2xl font-bold text-[#4361ee]">
                            미치지 않으면, 미치지 못한다.
                        </p>
                    </div>

                    <div className="text-center mb-10 md:mb-16">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">Activities.</h3>
                        <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto">
                            매드립은 역량강화와 조직 운영을 위한 체계적인 구성을 갖추었습니다.<br />
                            매드립은 대학생들과 현업 선배님들이 멘토가 되어 함께 만들어 갑니다.<br />
                            매드립은 디지털과 AI시대의 앞이 되게끔 하는 기획자를 지향합니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {activities.map((act) => (
                            <div
                                key={act.title}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-[#4361ee]/30 transition-all group"
                            >
                                <act.icon className="h-8 w-8 text-[#4361ee] mb-3 group-hover:scale-110 transition-transform" />
                                <h4 className="text-white font-bold text-lg mb-2">{act.title}</h4>
                                <p className="text-neutral-400 text-sm mb-3">{act.desc}</p>
                                <span className="text-xs text-[#4361ee] font-medium">{act.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 5대 운영 가치 ── */}
            <section className="bg-white py-16 md:py-24">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="mb-10 md:mb-16">
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold">MADLeap</h2>
                        <p className="text-xl md:text-2xl font-semibold text-neutral-600 mt-1">5대 운영 가치</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {values.map((v) => (
                            <div key={v.title} className="flex gap-4">
                                <div className="shrink-0 mt-1">
                                    <v.icon className="h-6 w-6 text-[#4361ee]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                                    <p className="text-neutral-600 text-sm leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 5기 모집 배너 ── */}
            <section className="bg-[#1a1a2e] py-16 md:py-20">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="bg-gradient-to-r from-[#4361ee]/20 to-transparent border border-[#4361ee]/30 rounded-2xl p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4361ee]/20 rounded-full mb-4">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-xs font-medium text-[#4361ee]">모집중</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                    MADLeap {recruitmentInfo.gen}기 리퍼 모집
                                </h2>
                                <p className="text-neutral-400 text-sm mb-6">
                                    마케팅이 궁금한, 실전이 하고 싶은, 함께 성장하고 싶은 대학생이라면.
                                </p>

                                <div className="space-y-2 mb-8">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="h-4 w-4 text-[#4361ee]" />
                                        <span className="text-neutral-300">모집 기간: {recruitmentInfo.period}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Users className="h-4 w-4 text-[#4361ee]" />
                                        <span className="text-neutral-300">모집 인원: {recruitmentInfo.count}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <MapPin className="h-4 w-4 text-[#4361ee]" />
                                        <span className="text-neutral-300">대상: {recruitmentInfo.target}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="h-4 w-4 text-[#4361ee]" />
                                        <span className="text-neutral-300">전형: {recruitmentInfo.process}</span>
                                    </div>
                                </div>

                                <Link
                                    href={recruitmentInfo.applyUrl}
                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#4361ee] text-white font-bold hover:bg-[#3451de] transition-all rounded-lg"
                                >
                                    지원하기
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {/* Process steps */}
                            <div className="space-y-4">
                                {["서류 접수", "1차 서류 심사", "면접 (온라인)", "최종 합격 발표"].map((step, i) => (
                                    <div key={step} className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                            i === 0
                                                ? "bg-[#4361ee] text-white"
                                                : "bg-white/10 text-white/40"
                                        }`}>
                                            {String(i + 1).padStart(2, "0")}
                                        </div>
                                        <div className={`text-sm font-medium ${i === 0 ? "text-white" : "text-white/40"}`}>
                                            {step}
                                            {i === 0 && (
                                                <span className="ml-2 text-xs text-[#4361ee]">진행중</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Instagram Feed ── */}
            <section className="bg-white py-16 md:py-20">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Instagram className="h-6 w-6 text-neutral-800" />
                            <div>
                                <h2 className="font-bold text-lg">@madleap_official</h2>
                                <p className="text-xs text-neutral-400">Instagram</p>
                            </div>
                        </div>
                        <a
                            href="https://instagram.com/madleap_official"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#4361ee] font-medium hover:underline flex items-center gap-1"
                        >
                            팔로우 <ChevronRight className="h-4 w-4" />
                        </a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {instaPosts.map((post) => (
                            <a
                                key={post.id}
                                href="https://instagram.com/madleap_official"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative aspect-square rounded-lg overflow-hidden bg-neutral-100"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${post.color}`} />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                                    <div className="text-center text-white">
                                        <p className="text-xs font-medium mb-1">{post.caption}</p>
                                        <p className="text-[10px] text-white/60">{post.likes} likes</p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Partners ── */}
            <section className="bg-neutral-50 py-12 md:py-16">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-sm font-semibold text-neutral-400 text-center mb-8 uppercase tracking-wider">Partners & Sponsors</h2>
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                        {partners.map((p) => (
                            <div
                                key={p.name}
                                className="px-5 py-3 bg-white border border-neutral-200 rounded-lg hover:border-[#4361ee]/30 hover:shadow-sm transition-all"
                            >
                                <span className="font-semibold text-sm text-neutral-700">{p.name}</span>
                                <span className="text-xs text-neutral-400 ml-2">{p.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Bottom CTA ── */}
            <section className="bg-[#4361ee] py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        매드립과 함께 도약하세요
                    </h2>
                    <p className="text-white/80 mb-2">
                        수도권 대학생이라면 누구나 지원할 수 있습니다
                    </p>
                    <p className="text-white/60 text-sm mb-8">
                        5기 모집 마감: 2026년 4월 6일
                    </p>
                    <Link
                        href={recruitmentInfo.applyUrl}
                        className="inline-block px-8 py-3.5 bg-white text-[#4361ee] font-bold hover:bg-neutral-100 transition-colors rounded-lg"
                    >
                        5기 지원하기
                    </Link>
                </div>
            </section>
        </>
    );
}
