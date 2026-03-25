"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    Lightbulb,
    Target,
    Users,
    Clock,
    DollarSign,
    Brain,
    BarChart3,
    Sparkles,
    CheckCircle2,
    BookOpen,
    FileText,
    Calendar,
    ClipboardList,
    PenTool,
    Grid3X3,
    Award,
    Eye,
    Zap,
    Search,
    Compass,
} from "lucide-react";

// ===== Planners Tab: Data =====
const PLANNER_ROLES = [
    { field: "Business", ko: "사업 기획", desc: "비즈니스 모델을 설계하고 사업 전략을 수립한다" },
    { field: "Marketing", ko: "마케팅 기획", desc: "시장을 분석하고 고객과의 접점을 설계한다" },
    { field: "Service", ko: "서비스 기획", desc: "사용자 경험을 설계하고 서비스 흐름을 만든다" },
    { field: "Design", ko: "디자인 기획", desc: "시각적 커뮤니케이션을 전략적으로 설계한다" },
    { field: "Content", ko: "콘텐츠 기획", desc: "메시지를 기획하고 콘텐츠 전략을 수립한다" },
    { field: "Event", ko: "행사 기획", desc: "목적에 맞는 경험을 설계하고 실행한다" },
];

// ===== Planning Tab: Data =====
const PLANNING_SKILLS = [
    { icon: Brain, title: "논리", en: "Logic", desc: "구조적으로 생각하고 인과관계를 파악한다. 문제를 분해하고 체계적으로 접근한다." },
    { icon: BarChart3, title: "분석", en: "Analysis", desc: "데이터와 현상을 객관적으로 해석한다. 현실을 정확히 파악하는 것이 기획의 출발점이다." },
    { icon: Sparkles, title: "창의", en: "Creativity", desc: "새로운 관점으로 해결책을 찾는다. 기존의 틀을 벗어나 가능성을 발견한다." },
];

const PLANNING_PROCESS = [
    { num: "01", title: "문제 정의", desc: "이상과 현실의 차이를 명확히 한다", icon: Search },
    { num: "02", title: "원인 분석", desc: "문제의 근본 원인을 파악한다", icon: Eye },
    { num: "03", title: "전략 수립", desc: "해결 방향과 방법을 설계한다", icon: Compass },
    { num: "04", title: "실행 계획", desc: "구체적인 액션 플랜을 만든다", icon: ClipboardList },
    { num: "05", title: "실행", desc: "계획에 따라 빠르게 실행한다", icon: Zap },
    { num: "06", title: "점검 & 개선", desc: "결과를 검토하고 개선점을 찾는다", icon: CheckCircle2 },
];

// ===== Planner's Planner Tab: Data =====
const PLAN_DO_SEE = [
    {
        phase: "Plan",
        ko: "기획하다",
        color: "bg-teal-700",
        desc: "이상과 현실의 차이를 인식하고, 그 차이를 줄이기 위한 목표를 세운다.",
        details: ["비전과 미션 정의", "목표(Objective) 설정", "핵심 결과(Key Result) 수립"],
    },
    {
        phase: "Do",
        ko: "실행하다",
        color: "bg-teal-600",
        desc: "치밀하게 실행한다. 모든 활동을 목표 달성에 초점을 맞춘다.",
        details: ["실행 계획 수립", "일정별 관리", "자원(Time, Cost, People) 배분"],
    },
    {
        phase: "See",
        ko: "점검하다",
        color: "bg-teal-500",
        desc: "지속적으로 점검하고 반영한다. 창의적 점검으로 더 나은 방법을 찾는다.",
        details: ["진행 상황 모니터링", "성과 분석 및 피드백", "개선점 도출 및 적용"],
    },
];

const PROJECT_BOOK_STEPS = [
    { num: "①", title: "Question", desc: "프로젝트 성공을 위한 핵심 질문을 정리한다", icon: Search },
    { num: "②", title: "Objective Brief", desc: "목적과 지표를 명확하게 정리한다", icon: Target },
    { num: "③", title: "Process", desc: "단계별 실행 계획을 수립한다", icon: ClipboardList },
    { num: "④", title: "Daily", desc: "일별 일정과 핵심 키워드를 관리한다", icon: Calendar },
    { num: "⑤", title: "Note", desc: "미팅 기록과 프로젝트 일지를 작성한다", icon: PenTool },
    { num: "⑥", title: "Grid", desc: "그래프, 도표, 스케치를 활용한다", icon: Grid3X3 },
    { num: "⑦", title: "Result Brief", desc: "성과를 정리하고 개선점을 도출한다", icon: Award },
];

const FOUR_STEPS = [
    {
        step: "Step 1",
        title: "Objective 작성",
        desc: "비전(지향점)과 미션(실현 수단)을 정의한다. 내가 어디로 가는지, 왜 가는지를 명확히 한다.",
        keyword: "Why",
    },
    {
        step: "Step 2",
        title: "Key Result 수립",
        desc: "구체적인 실행 항목과 성과 지표를 설정한다. 측정 가능한 결과로 목표를 구체화한다.",
        keyword: "What",
    },
    {
        step: "Step 3",
        title: "목표 중심 실행",
        desc: "모든 활동을 목표 달성에 초점을 맞춘다. 우선순위를 정하고 핵심에 집중한다.",
        keyword: "How",
    },
    {
        step: "Step 4",
        title: "창의적 점검",
        desc: "진행 과정을 지속적으로 모니터링하고 수정한다. 더 나은 방법을 끊임없이 찾는다.",
        keyword: "Check",
    },
];

function PlannersContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState("planners");

    useEffect(() => {
        if (tabParam && ["planners", "planning", "planner-tool"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const tabs = [
        { id: "planners", label: "Planner's" },
        { id: "planning", label: "Planning" },
        { id: "planner-tool", label: "Planner's Planner" },
    ];

    return (
        <div className="bg-white text-neutral-900">
            {/* Hero */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-teal-950 to-teal-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase text-teal-400 mb-4">
                        Planner&apos;s
                    </p>
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-light leading-tight">
                        우리는 모두 기획자다<br />
                        <span className="font-bold">자기 인생에서 만큼은</span>
                    </h1>
                    <p className="mt-6 text-lg text-teal-300/80 max-w-2xl">
                        기획은 꾀하는 것이고, 계획은 세우는 것이다.
                        Why를 찾고 What을 만드는 사람, 그것이 기획자다.
                    </p>
                    <div className="mt-10 flex items-center gap-6">
                        <div className="flex items-center gap-3 text-sm text-teal-400">
                            <span className="font-bold text-white text-lg">기획</span>
                            <span className="text-teal-500">(Why)</span>
                            <ArrowRight className="h-4 w-4 text-teal-500" />
                            <span className="font-bold text-white text-lg">계획</span>
                            <span className="text-teal-500">(What)</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tab Navigation */}
            <section className="border-b border-neutral-200 sticky top-16 bg-white z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 text-sm tracking-wide transition-colors border-b-2 ${
                                    activeTab === tab.id
                                        ? "border-teal-700 text-teal-800 font-medium"
                                        : "border-transparent text-neutral-400 hover:text-neutral-700"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Planner's Tab ===== */}
            {activeTab === "planners" && (
                <>
                    {/* 기획 vs 계획 */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">
                            <div>
                                <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                    Definition
                                </p>
                                <h2 className="text-xl md:text-3xl font-light leading-relaxed">
                                    기획하여<br />
                                    <span className="font-bold">계획하다</span>
                                </h2>
                                <p className="mt-8 text-neutral-500 leading-relaxed">
                                    기획(企劃)이란 &apos;일을 꾀하여 계획함&apos;이다.
                                    기획은 <strong className="text-neutral-900">Why</strong>에 해당하고,
                                    계획은 <strong className="text-neutral-900">How</strong>에 해당한다.
                                </p>
                                <p className="mt-4 text-neutral-500 leading-relaxed">
                                    기획이 방향을 잡는 것이라면, 계획은 그 방향으로 가기 위한 구체적인 수단이다.
                                    기획 없는 계획은 방향 없는 실행이고, 계획 없는 기획은 실현되지 못한 꿈이다.
                                </p>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-teal-50 border border-teal-100 p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Lightbulb className="h-5 w-5 text-teal-700" />
                                        <h3 className="text-lg font-bold text-teal-800">기획 (Planning)</h3>
                                    </div>
                                    <p className="text-sm text-teal-700">
                                        <strong>Why</strong> — 왜 하는가?<br />
                                        방향을 설정하고 목적을 정의한다.
                                    </p>
                                </div>
                                <div className="bg-neutral-50 border border-neutral-200 p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Target className="h-5 w-5 text-neutral-600" />
                                        <h3 className="text-lg font-bold text-neutral-700">계획 (Plan)</h3>
                                    </div>
                                    <p className="text-sm text-neutral-600">
                                        <strong>How</strong> — 어떻게 할 것인가?<br />
                                        실행 방법과 구체적인 수단을 만든다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 운영 요소 */}
                    <section className="bg-teal-900 text-white py-16 md:py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-teal-400 mb-4">
                                Operations
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                기획의 실행을 위한 <span className="font-bold">3가지 자원</span>
                            </h2>
                            <div className="grid md:grid-cols-3 gap-px bg-teal-800">
                                {[
                                    { icon: Clock, title: "Time", ko: "시간", desc: "주어진 시간 안에 최대의 효과를 만들어내는 것. 일정 관리와 우선순위가 핵심이다." },
                                    { icon: DollarSign, title: "Cost", ko: "비용", desc: "한정된 자원을 효율적으로 배분하는 것. 예산 관리와 ROI 측정이 필요하다." },
                                    { icon: Users, title: "People", ko: "사람", desc: "적재적소에 인재를 배치하는 것. 팀 구성과 역할 분담이 성패를 결정한다." },
                                ].map((item) => (
                                    <div key={item.title} className="bg-teal-900 p-10">
                                        <item.icon className="h-8 w-8 text-teal-400 mb-6" />
                                        <h3 className="text-2xl font-bold">{item.title}</h3>
                                        <p className="text-sm text-teal-400 mt-1">{item.ko}</p>
                                        <p className="text-sm text-teal-300/70 mt-4 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Planner = 일이 되게 하는 사람 */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Who is Planner?
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-4">
                                Planner = <span className="font-bold">일이 되게 하는 사람</span>
                            </h2>
                            <p className="text-neutral-500 mb-4 max-w-3xl">
                                한국에서 &apos;기획자&apos;라 불리는 사람을, 해외에서는 &apos;Manager&apos;라 부른다.
                                직군명은 다르지만 본질은 같다 — 일이 되게 만드는 사람.
                            </p>
                            <p className="text-neutral-500 mb-10 md:mb-16 max-w-3xl">
                                꼭 경영학과를 나올 필요 없다. 기획은 특정 전공의 영역이 아니라,
                                문제를 발견하고 해결하려는 모든 사람의 역량이다.
                            </p>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {PLANNER_ROLES.map((role) => (
                                    <div key={role.field} className="border border-neutral-200 p-8 hover:border-teal-300 transition-colors group">
                                        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-teal-800 transition-colors">
                                            {role.field}
                                        </h3>
                                        <p className="text-sm text-teal-700 mt-1">{role.ko}</p>
                                        <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{role.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 기획의 필수성 */}
                    <section className="bg-neutral-50 py-16 md:py-24 px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Essence
                            </p>
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-light leading-relaxed">
                                기획에는<br />
                                <span className="font-bold">시간이 걸린다</span>
                            </h2>
                            <p className="mt-8 text-neutral-500 leading-relaxed max-w-2xl mx-auto">
                                좋은 기획에는 시간이 필요하다. 충분히 고민하고, 조사하고, 검증하는 과정을 거쳐야 한다.
                                급하게 만든 기획은 실행 단계에서 더 많은 시간과 비용을 소모하게 된다.
                            </p>
                            <p className="mt-6 text-neutral-500 leading-relaxed max-w-2xl mx-auto">
                                기획의 품질이 실행의 품질을 결정한다.
                                처음에 시간을 들여 제대로 기획하는 것이, 결국 가장 빠른 길이다.
                            </p>
                        </div>
                    </section>
                </>
            )}

            {/* ===== Planning Tab ===== */}
            {activeTab === "planning" && (
                <>
                    {/* 기획이라는 말 */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                The Word
                            </p>
                            <h2 className="text-xl md:text-3xl font-light leading-relaxed max-w-3xl">
                                <span className="font-bold">기획자</span>,<br />
                                유독 우리나라에서 많이 사용하는 말이다
                            </h2>
                            <p className="mt-8 text-neutral-500 leading-relaxed max-w-3xl">
                                기획이라는 단어는 한국적 맥락에서 특별한 의미를 갖는다.
                                단순히 계획을 세우는 것이 아니라, 일의 방향을 잡고 실현 가능한 형태로 만드는 모든 과정을 포함한다.
                            </p>
                        </div>
                    </section>

                    {/* 우리는 모두가 기획자다 */}
                    <section className="bg-teal-900 text-white py-16 md:py-24 px-6">
                        <div className="max-w-7xl mx-auto text-center">
                            <p className="text-xs tracking-[0.3em] uppercase text-teal-400 mb-4">
                                Everyone is a Planner
                            </p>
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold leading-relaxed">
                                우리는 모두가 기획자다
                            </h2>
                            <p className="mt-6 text-teal-300/80 max-w-2xl mx-auto leading-relaxed">
                                매일 아침 오늘 뭘 먹을지, 주말에 뭘 할지, 커리어를 어떻게 만들어갈지 —
                                우리는 이미 매일 기획하고 있다. 적어도 자기 인생에서만큼은, 우리는 모두 기획자다.
                            </p>
                        </div>
                    </section>

                    {/* 문제 해결 */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Problem Solving
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-6">
                                이상과 현실의 차이 =<br />
                                <span className="font-bold">해결해야 할 문제</span>
                            </h2>
                            <p className="text-neutral-500 leading-relaxed max-w-3xl mb-10 md:mb-16">
                                기획의 출발점은 문제 인식이다. 현재 상태(As-Is)와 바람직한 상태(To-Be)의 차이를 발견하고,
                                그 차이를 줄이기 위한 방법을 설계하는 것이 기획의 본질이다.
                            </p>

                            {/* Process Flow */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {PLANNING_PROCESS.map((step) => (
                                    <div key={step.num} className="border-t-2 border-teal-200 pt-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-sm text-teal-600 font-mono font-bold">{step.num}</span>
                                            <step.icon className="h-4 w-4 text-teal-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900">{step.title}</h3>
                                        <p className="text-sm text-neutral-500 mt-2">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 필요한 것: 논리 + 분석 + 창의 */}
                    <section className="bg-neutral-50 py-16 md:py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Required Skills
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                기획자에게 필요한 것:<br />
                                <span className="font-bold">논리 + 분석 + 창의</span>
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {PLANNING_SKILLS.map((skill) => (
                                    <div key={skill.title} className="bg-white p-10 border border-neutral-200">
                                        <skill.icon className="h-10 w-10 text-teal-700 mb-6" />
                                        <h3 className="text-2xl font-bold text-neutral-900">{skill.title}</h3>
                                        <p className="text-sm text-teal-600 mt-1">{skill.en}</p>
                                        <p className="text-sm text-neutral-500 mt-4 leading-relaxed">{skill.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 기획의 완성 */}
                    <section className="py-24 px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Completion
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-8">
                                기획의 <span className="font-bold">완성</span>
                            </h2>
                            <div className="space-y-8">
                                {[
                                    { title: "실행 관리", desc: "기획은 문서로 끝나지 않는다. 실행 과정을 관리하고 조율하는 것까지가 기획자의 역할이다." },
                                    { title: "감리와 점검", desc: "진행 상황을 모니터링하고, 계획과 실행의 차이를 줄여나간다. 유연하게 대응하되 방향은 지킨다." },
                                    { title: "성과와 학습", desc: "결과를 측정하고 기록한다. 성공과 실패 모두에서 배우고, 다음 기획에 반영한다." },
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-6 py-6 border-b border-neutral-100">
                                        <CheckCircle2 className="h-5 w-5 text-teal-600 mt-1 shrink-0" />
                                        <div>
                                            <h3 className="font-bold text-neutral-900">{item.title}</h3>
                                            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* ===== Planner's Planner Tab ===== */}
            {activeTab === "planner-tool" && (
                <>
                    {/* Intro */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                About
                            </p>
                            <h2 className="text-xl md:text-3xl font-light leading-relaxed max-w-3xl">
                                플래너를<br />
                                <span className="font-bold">다시 만들다</span>
                            </h2>
                            <p className="mt-8 text-neutral-500 leading-relaxed max-w-3xl">
                                고등학교 시절부터 시스템 다이어리를 제작해왔다.
                                수많은 디지털 도구가 있지만, 기획자에게 맞는 도구는 없었다.
                                그래서 직접 만들기로 했다 — 기획자를 위한 플래너.
                            </p>
                        </div>
                    </section>

                    {/* Plan - Do - See */}
                    <section className="bg-teal-900 text-white py-16 md:py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-teal-400 mb-4">
                                Methodology
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                모든 업무의 기본 구조: <span className="font-bold">Plan — Do — See</span>
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {PLAN_DO_SEE.map((phase) => (
                                    <div key={phase.phase} className="border border-teal-700 p-8">
                                        <div className={`inline-block px-3 py-1 text-xs font-bold text-white ${phase.color} mb-4`}>
                                            {phase.phase}
                                        </div>
                                        <h3 className="text-xl font-bold">{phase.ko}</h3>
                                        <p className="text-sm text-teal-300/70 mt-3 leading-relaxed">{phase.desc}</p>
                                        <ul className="mt-4 space-y-2">
                                            {phase.details.map((d, i) => (
                                                <li key={i} className="text-sm text-teal-400 flex items-center gap-2">
                                                    <span className="w-1 h-1 bg-teal-500 rounded-full" />
                                                    {d}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Package 구성 */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Package
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                <span className="font-bold">Planner&apos;s Planner</span> 구성
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { icon: BookOpen, title: "Planner's Planner", desc: "연간 / 월간 / 일 단위 플래너", tag: "Core" },
                                    { icon: FileText, title: "Project Book", desc: "Frame + Work + Book", tag: "Project" },
                                    { icon: Calendar, title: "Daily", desc: "일정 및 할 일 목록", tag: "Daily" },
                                    { icon: Grid3X3, title: "Templates", desc: "130개 이상의 템플릿", tag: "130+" },
                                ].map((pkg) => (
                                    <div key={pkg.title} className="border border-neutral-200 p-8 hover:border-teal-300 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <pkg.icon className="h-6 w-6 text-teal-700" />
                                            <span className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-0.5">{pkg.tag}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900">{pkg.title}</h3>
                                        <p className="text-sm text-neutral-500 mt-2">{pkg.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Project Book 7단계 */}
                    <section className="bg-neutral-50 py-16 md:py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Project Book
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-4">
                                프로젝트 북 <span className="font-bold">7단계</span>
                            </h2>
                            <p className="text-neutral-500 mb-10 md:mb-16 max-w-3xl">
                                복잡한 문제를 구조적으로 해결하기 위한 프레임워크.
                                질문에서 시작해 결과 정리까지, 프로젝트의 전 과정을 담는다.
                            </p>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {PROJECT_BOOK_STEPS.map((step) => (
                                    <div key={step.num} className="bg-white p-6 border border-neutral-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-teal-700 font-bold">{step.num}</span>
                                            <step.icon className="h-4 w-4 text-teal-600" />
                                        </div>
                                        <h3 className="font-bold text-neutral-900">{step.title}</h3>
                                        <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 4 Steps */}
                    <section className="py-24 px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                How to Use
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                작성 방식 <span className="font-bold">4단계</span>
                            </h2>
                            <div className="space-y-8">
                                {FOUR_STEPS.map((item, i) => (
                                    <div key={item.step} className="flex gap-8 items-start py-8 border-b border-neutral-100">
                                        <div className="min-w-[4rem] text-center">
                                            <span className="text-xl md:text-3xl font-bold text-teal-200">{String(i + 1).padStart(2, "0")}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-0.5">
                                                    {item.keyword}
                                                </span>
                                                <span className="text-xs text-neutral-400">{item.step}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-neutral-900">{item.title}</h3>
                                            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Quote */}
                    <section className="bg-teal-950 text-white py-16 md:py-24 px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-2xl md:text-3xl font-light leading-relaxed">
                                &ldquo;생각한 대로 행동하라<br />
                                그렇지 않으면<br />
                                <span className="font-bold">행동한 대로 생각하게 된다&rdquo;</span>
                            </h2>
                            <p className="mt-8 text-teal-400 text-sm">
                                자신만의 방법을 찾아라. 그것이 기획이다.
                            </p>
                        </div>
                    </section>
                </>
            )}

            {/* CTA (공통) */}
            <section className="bg-neutral-900 text-white py-16 md:py-24 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-xl md:text-3xl font-light">
                        <span className="font-bold">기획자의 여정을 함께하세요</span>
                    </h2>
                    <p className="mt-4 text-neutral-500">
                        Ten:One™ Universe에서 당신만의 기획을 시작하세요.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-white text-neutral-900 text-sm tracking-wide hover:bg-neutral-100 transition-colors"
                    >
                        Contact Us <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default function PlannersPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <PlannersContent />
        </Suspense>
    );
}
