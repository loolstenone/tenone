"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Rocket, Users, TrendingUp, GraduationCap, Lightbulb, Building2, ChevronRight, Sparkles, Target, HandCoins } from "lucide-react";

const programs = [
    {
        icon: GraduationCap,
        title: "고등학생 창업 캠프",
        desc: "AI 도구를 활용한 아이디어 발굴부터 비즈니스 모델 설계까지. 방학 집중 프로그램.",
        badge: "고등학생",
        color: "bg-emerald-50 text-emerald-700",
    },
    {
        icon: Rocket,
        title: "대학생 스타트업 부트캠프",
        desc: "실전 창업 12주 프로그램. 팀 빌딩, MVP 개발, 투자 유치 피칭까지.",
        badge: "대학생",
        color: "bg-blue-50 text-blue-700",
    },
    {
        icon: Lightbulb,
        title: "AI 비즈니스 워크숍",
        desc: "ChatGPT, AI 에이전트, 자동화 도구로 실제 수익 모델을 만드는 워크숍.",
        badge: "전체",
        color: "bg-purple-50 text-purple-700",
    },
];

const investModels = [
    {
        icon: Users,
        title: "부모 투자 (Family Fund)",
        desc: "자녀의 창업 아이디어에 소액 투자. 교육과 투자를 동시에.",
        amount: "50만원~",
    },
    {
        icon: Building2,
        title: "학교 지원 (School Grant)",
        desc: "학교 창업 동아리 지원금. 교내 창업 대회 연계.",
        amount: "100만원~",
    },
    {
        icon: Target,
        title: "지역사회 펀딩 (Community Fund)",
        desc: "지역 기업·단체가 청소년 스타트업에 투자하는 로컬 펀드.",
        amount: "300만원~",
    },
];

const stats = [
    { value: "1,200+", label: "참여 학생" },
    { value: "87", label: "탄생 스타트업" },
    { value: "23억", label: "누적 투자금" },
    { value: "95%", label: "만족도" },
];

const notices = [
    { id: 1, title: "2026 여름 고등학생 창업 캠프 모집 (7.14~7.25)", date: "2026.03.20", pinned: true },
    { id: 2, title: "AI 비즈니스 워크숍 4기 참가자 모집 중", date: "2026.03.18", pinned: true },
    { id: 3, title: "대학생 스타트업 부트캠프 5기 데모데이 결과 발표", date: "2026.03.15", pinned: false },
    { id: 4, title: "지역사회 커뮤니티 펀드 2차 모집 안내", date: "2026.03.10", pinned: false },
];

const successStories = [
    {
        name: "에코박스",
        founder: "김서연 (고2)",
        desc: "AI로 재활용 분류를 자동화하는 앱. 가족 투자 100만원으로 시작.",
        raised: "500만원",
    },
    {
        name: "스터디메이트",
        founder: "박준영 (대학교 2학년)",
        desc: "AI 튜터링 매칭 플랫폼. 지역 커뮤니티 펀드 1호 투자.",
        raised: "1,200만원",
    },
    {
        name: "로컬잇",
        founder: "이하나 (대학교 3학년)",
        desc: "동네 소상공인 AI 마케팅 도구. 학교 창업 지원금으로 MVP 개발.",
        raised: "800만원",
    },
];

export default function ChangeUpHomePage() {
    const [activeTab, setActiveTab] = useState<"student" | "investor">("student");

    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#0F1F2E] via-[#1a3a52] to-[#0F1F2E] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-[#1AAD64] rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#256EFF] rounded-full blur-3xl" />
                </div>
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-16 md:py-24 lg:py-36">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
                            <Sparkles className="w-4 h-4 text-[#1AAD64]" />
                            <span>AI 시대, 창업은 누구나 할 수 있다</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                            미래를 만드는 일,<br />
                            <span className="text-[#1AAD64]">창업</span>
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-neutral-300 leading-relaxed max-w-2xl">
                            고등학생부터 대학생까지. AI 도구로 아이디어를 현실로 바꾸고,
                            부모·학교·지역사회가 함께 투자하는 청소년 창업 생태계.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link
                                href="/cu/programs"
                                className="inline-flex items-center gap-2 bg-[#1AAD64] hover:bg-[#148F52] text-white px-8 py-3.5 rounded-full text-base font-semibold transition-colors"
                            >
                                프로그램 보기
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/cu/invest"
                                className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white px-8 py-3.5 rounded-full text-base font-semibold transition-colors"
                            >
                                투자 참여하기
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-[#1AAD64]">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <div className="text-xl sm:text-3xl lg:text-4xl font-black">{stat.value}</div>
                                <div className="text-sm mt-1 text-white/80">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tab: 학생 vs 투자자 */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-xl md:text-3xl font-bold">당신은 누구인가요?</h2>
                        <p className="mt-3 text-neutral-500">ChangeUp에서의 여정이 시작됩니다</p>
                        <div className="mt-6 inline-flex bg-neutral-100 rounded-full p-1">
                            <button
                                onClick={() => setActiveTab("student")}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === "student" ? "bg-[#1AAD64] text-white" : "text-neutral-600 hover:text-neutral-900"}`}
                            >
                                창업하고 싶어요
                            </button>
                            <button
                                onClick={() => setActiveTab("investor")}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === "investor" ? "bg-[#256EFF] text-white" : "text-neutral-600 hover:text-neutral-900"}`}
                            >
                                투자하고 싶어요
                            </button>
                        </div>
                    </div>

                    {activeTab === "student" ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {programs.map((prog) => (
                                <div key={prog.title} className="border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-shadow group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#1AAD64]/10 flex items-center justify-center">
                                            <prog.icon className="w-5 h-5 text-[#1AAD64]" />
                                        </div>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${prog.color}`}>
                                            {prog.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-[#1AAD64] transition-colors">{prog.title}</h3>
                                    <p className="text-sm text-neutral-500 leading-relaxed">{prog.desc}</p>
                                    <Link href="/cu/programs" className="inline-flex items-center gap-1 text-sm text-[#1AAD64] font-medium mt-4 hover:gap-2 transition-all">
                                        자세히 보기 <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6">
                            {investModels.map((model) => (
                                <div key={model.title} className="border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-shadow group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#256EFF]/10 flex items-center justify-center">
                                            <model.icon className="w-5 h-5 text-[#256EFF]" />
                                        </div>
                                        <span className="text-sm font-bold text-[#256EFF]">{model.amount}</span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-[#256EFF] transition-colors">{model.title}</h3>
                                    <p className="text-sm text-neutral-500 leading-relaxed">{model.desc}</p>
                                    <Link href="/cu/invest" className="inline-flex items-center gap-1 text-sm text-[#256EFF] font-medium mt-4 hover:gap-2 transition-all">
                                        자세히 보기 <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Success Stories */}
            <section className="py-20 bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold">성공 사례</h2>
                            <p className="mt-2 text-neutral-500">ChangeUp에서 시작한 스타트업들</p>
                        </div>
                        <Link href="/cu/startups" className="hidden sm:inline-flex items-center gap-1 text-sm text-[#1AAD64] font-medium hover:gap-2 transition-all">
                            전체 보기 <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {successStories.map((story) => (
                            <div key={story.name} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1AAD64] to-[#256EFF] flex items-center justify-center text-white font-bold text-lg">
                                        {story.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{story.name}</h3>
                                        <p className="text-xs text-neutral-500">{story.founder}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-600 leading-relaxed mb-4">{story.desc}</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <HandCoins className="w-4 h-4 text-[#1AAD64]" />
                                    <span className="font-semibold text-[#1AAD64]">누적 투자: {story.raised}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Notices */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">공지사항</h2>
                        <Link href="/cu/community" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                            전체 보기 &rarr;
                        </Link>
                    </div>
                    <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
                        {notices.map((notice) => (
                            <Link key={notice.id} href="/cu/community" className="flex items-center gap-4 py-4 hover:bg-neutral-50 px-2 -mx-2 rounded transition-colors">
                                {notice.pinned && (
                                    <span className="shrink-0 text-xs font-bold text-white bg-[#1AAD64] px-2 py-0.5 rounded">필독</span>
                                )}
                                <span className="text-sm flex-1">{notice.title}</span>
                                <span className="text-xs text-neutral-400 shrink-0">{notice.date}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-[#1AAD64] to-[#256EFF] text-white py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-black">지금 시작하세요</h2>
                    <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                        아이디어만 있으면 충분합니다. AI 도구와 함께라면 누구나 창업할 수 있습니다.
                        부모님, 선생님, 이웃이 당신의 첫 투자자가 됩니다.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 bg-white text-[#1AAD64] px-8 py-3.5 rounded-full text-base font-bold hover:bg-neutral-100 transition-colors"
                        >
                            무료로 시작하기
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/cu/about"
                            className="inline-flex items-center gap-2 border border-white/50 text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-white/10 transition-colors"
                        >
                            자세히 알아보기
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
