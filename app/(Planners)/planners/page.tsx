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
    ChevronDown,
    ChevronRight,
    Star,
    GraduationCap,
    ArrowDown,
    Download,
    TrendingUp,
} from "lucide-react";

// ===== Planners Tab: Data =====
const PLANNER_ROLES = [
    {
        field: "Business",
        ko: "사업 기획",
        desc: "비즈니스 모델을 설계하고 사업 전략을 수립한다",
        recommend: "창업을 준비하거나, 신사업을 기획하는 분",
        skills: ["시장 분석 & 기회 포착", "비즈니스 모델 캔버스", "투자 유치 & 피칭"],
        frameworks: ["Vrief 시장분석", "린 캔버스", "SWOT"],
    },
    {
        field: "Marketing",
        ko: "마케팅 기획",
        desc: "시장을 분석하고 고객과의 접점을 설계한다",
        recommend: "브랜드를 키우거나, 고객을 이해하고 싶은 분",
        skills: ["고객 여정 맵핑", "캠페인 전략 수립", "데이터 기반 의사결정"],
        frameworks: ["STP 전략", "4P/4C 믹스", "퍼널 분석"],
    },
    {
        field: "Service",
        ko: "서비스 기획",
        desc: "사용자 경험을 설계하고 서비스 흐름을 만든다",
        recommend: "앱/웹 서비스를 만들거나, UX에 관심 있는 분",
        skills: ["유저 리서치 & 페르소나", "와이어프레임 설계", "서비스 블루프린트"],
        frameworks: ["더블 다이아몬드", "유저 스토리 맵", "Vrief UX"],
    },
    {
        field: "Design",
        ko: "디자인 기획",
        desc: "시각적 커뮤니케이션을 전략적으로 설계한다",
        recommend: "디자인에 전략적 사고를 더하고 싶은 분",
        skills: ["비주얼 전략 수립", "브랜드 아이덴티티 설계", "디자인 시스템 구축"],
        frameworks: ["무드보드 & 톤매너", "디자인 스프린트", "브랜드 가이드라인"],
    },
    {
        field: "Content",
        ko: "콘텐츠 기획",
        desc: "메시지를 기획하고 콘텐츠 전략을 수립한다",
        recommend: "글, 영상, SNS 콘텐츠를 전략적으로 만들고 싶은 분",
        skills: ["콘텐츠 캘린더 운영", "스토리텔링 구조 설계", "채널별 최적화"],
        frameworks: ["Vrief 콘텐츠 파이프라인", "에디토리얼 캘린더", "SEO 전략"],
    },
    {
        field: "Event",
        ko: "행사 기획",
        desc: "목적에 맞는 경험을 설계하고 실행한다",
        recommend: "행사, 세미나, 워크숍을 기획하는 분",
        skills: ["경험 디자인", "로지스틱스 관리", "스테이크홀더 조율"],
        frameworks: ["이벤트 타임라인", "체크리스트 관리", "사후 평가 프레임"],
    },
];

// ===== Planning Tab: Vrief Data =====
const VRIEF_STAGES = [
    {
        stage: "V",
        title: "Vision",
        ko: "비전 수립",
        desc: "어디로 가는지 방향을 잡는다",
        detail: "이상적인 미래상을 정의하고, 현재와의 차이를 인식한다.",
        example: {
            brand: "MADLeague",
            content: "대학생이 졸업 후에도 함께 성장하는 커뮤니티",
        },
    },
    {
        stage: "R",
        title: "Research",
        ko: "조사 분석",
        desc: "현실을 정확히 파악한다",
        detail: "시장, 경쟁사, 사용자를 분석하여 기회와 위협을 식별한다.",
        example: {
            brand: "Badak",
            content: "인재 매칭 시장 분석 -- 기존 플랫폼의 한계 도출",
        },
    },
    {
        stage: "I",
        title: "Insight",
        ko: "가설 검증",
        desc: "핵심 인사이트를 도출한다",
        detail: "데이터에서 패턴을 발견하고, 검증 가능한 가설을 세운다.",
        example: {
            brand: "SmarComm",
            content: "중소기업은 마케팅 '실행'보다 '전략'에서 막힌다",
        },
    },
    {
        stage: "E",
        title: "Execution",
        ko: "전략 수립",
        desc: "실행 가능한 전략을 만든다",
        detail: "인사이트를 기반으로 구체적인 전략과 액션플랜을 수립한다.",
        example: {
            brand: "Evolution School",
            content: "Vrief 기반 8주 커리큘럼 + 실전 프로젝트 설계",
        },
    },
    {
        stage: "F",
        title: "Feedback",
        ko: "피드백 순환",
        desc: "실행 결과를 점검하고 개선한다",
        detail: "실행 후 결과를 측정하고, 다음 사이클에 학습을 반영한다.",
        example: {
            brand: "Planner's",
            content: "수강생 피드백 → 커리큘럼 개선 → 재설계",
        },
    },
];

const PLANNING_SKILLS = [
    { icon: Brain, title: "논리", en: "Logic", desc: "구조적으로 생각하고 인과관계를 파악한다. 문제를 분해하고 체계적으로 접근한다." },
    { icon: BarChart3, title: "분석", en: "Analysis", desc: "데이터와 현상을 객관적으로 해석한다. 현실을 정확히 파악하는 것이 기획의 출발점이다." },
    { icon: Sparkles, title: "창의", en: "Creativity", desc: "새로운 관점으로 해결책을 찾는다. 기존의 틀을 벗어나 가능성을 발견한다." },
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
    { num: "\u2460", title: "Question", desc: "프로젝트 성공을 위한 핵심 질문을 정리한다", icon: Search },
    { num: "\u2461", title: "Objective Brief", desc: "목적과 지표를 명확하게 정리한다", icon: Target },
    { num: "\u2462", title: "Process", desc: "단계별 실행 계획을 수립한다", icon: ClipboardList },
    { num: "\u2463", title: "Daily", desc: "일별 일정과 핵심 키워드를 관리한다", icon: Calendar },
    { num: "\u2464", title: "Note", desc: "미팅 기록과 프로젝트 일지를 작성한다", icon: PenTool },
    { num: "\u2465", title: "Grid", desc: "그래프, 도표, 스케치를 활용한다", icon: Grid3X3 },
    { num: "\u2466", title: "Result Brief", desc: "성과를 정리하고 개선점을 도출한다", icon: Award },
];

const PROJECT_CASES = [
    {
        title: "MADLeague 시즌 3 운영",
        category: "커뮤니티",
        desc: "Plan-Do-See + Project Book으로 100명 규모 대학생 연합 동아리 시즌을 설계하고 운영한 사례",
        result: "참여율 87%, 만족도 4.6/5.0",
    },
    {
        title: "SmarComm 브랜드 런칭",
        category: "마케팅",
        desc: "Vrief 프레임워크로 시장 분석부터 런칭 캠페인까지 전 과정을 기획한 사례",
        result: "런칭 2주 만에 첫 클라이언트 확보",
    },
    {
        title: "Evolution School 커리큘럼 설계",
        category: "교육",
        desc: "GPR + Project Book으로 8주 교육 프로그램을 체계적으로 설계한 사례",
        result: "수강 완주율 92%",
    },
];

// ===== GPR Tab: Data =====
const GPR_CASCADE = [
    { level: "인생", period: "Lifetime", desc: "내 삶의 비전과 미션", color: "bg-teal-900", width: "w-full" },
    { level: "연간", period: "Yearly", desc: "올해의 핵심 목표 3가지", color: "bg-teal-800", width: "w-[90%]" },
    { level: "분기", period: "Quarterly", desc: "3개월 단위 마일스톤", color: "bg-teal-700", width: "w-[78%]" },
    { level: "월간", period: "Monthly", desc: "이번 달 집중 과제", color: "bg-teal-600", width: "w-[66%]" },
    { level: "주간", period: "Weekly", desc: "이번 주 실행 항목", color: "bg-teal-500", width: "w-[54%]" },
    { level: "오늘", period: "Daily", desc: "오늘의 핵심 액션", color: "bg-teal-400", width: "w-[42%]" },
];

// ===== Programs Tab: Data =====
const PROGRAMS = [
    {
        title: "Vrief 마스터 클래스",
        duration: "8주",
        format: "온라인",
        target: "기획 역량을 체계적으로 키우고 싶은 실무자",
        curriculum: ["Vrief 프레임워크 이해", "시장 조사 & 분석 실습", "가설 수립 & 검증", "전략 수립 & 피칭", "실전 프로젝트 (팀)"],
        price: "49만원",
        status: "모집중" as const,
    },
    {
        title: "기획자 부트캠프",
        duration: "4주",
        format: "오프라인",
        target: "기획 직무 전환 또는 입문을 준비하는 분",
        curriculum: ["기획의 본질 & 기획자 마인드셋", "문제 정의 → 전략 수립 워크숍", "프레젠테이션 & 스토리텔링", "포트폴리오 완성"],
        price: "89만원",
        status: "마감" as const,
    },
    {
        title: "GPR 인생설계 워크숍",
        duration: "1일 (8시간)",
        format: "오프라인",
        target: "목표 설정에 어려움을 느끼는 누구나",
        curriculum: ["인생 비전 & 미션 정의", "연간 목표 캐스케이드 설계", "분기/월/주/일 실행 계획", "나만의 GPR 시스템 완성"],
        price: "15만원",
        status: "모집중" as const,
    },
    {
        title: "MADLeague 멘토링",
        duration: "시즌제 (16주)",
        format: "온/오프라인 병행",
        target: "대학생 프로젝트 팀 리더 & 기획 담당자",
        curriculum: ["기획 멘토링 (월 2회)", "프로젝트 리뷰 & 피드백", "네트워킹 세션", "시즌 결과 발표회"],
        price: "무료 (MADLeague 멤버)",
        status: "모집중" as const,
    },
];

// ===== Testimonials Data =====
const TESTIMONIALS = [
    {
        name: "김서연",
        org: "MADLeague 4기",
        text: "Vrief 프레임워크를 배우고 나서 기획서 쓰는 속도가 2배 빨라졌어요. 구조가 머릿속에 잡히니까 글이 술술 나옵니다.",
        rating: 5,
    },
    {
        name: "박준혁",
        org: "스타트업 대표",
        text: "GPR 워크숍이 인생을 바꿨다고 하면 과장일까요. 매일 아침 '오늘의 목표'가 명확해지니 실행력이 완전히 달라졌습니다.",
        rating: 5,
    },
    {
        name: "이하은",
        org: "대기업 마케팅팀",
        text: "기획자 부트캠프에서 배운 Plan-Do-See가 실무에 바로 적용됐습니다. 팀장님도 기획서 퀄리티가 올라갔다고 하시네요.",
        rating: 5,
    },
];


function PlannersContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState("planners");
    const [expandedRole, setExpandedRole] = useState<string | null>(null);
    const [workshopStep, setWorkshopStep] = useState(0);
    const [workshopBrand, setWorkshopBrand] = useState("");
    const [gprGoal, setGprGoal] = useState("");
    const [gprStep, setGprStep] = useState(0);

    useEffect(() => {
        if (tabParam && ["planners", "planning", "planner-tool", "gpr", "programs"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const tabs = [
        { id: "planners", label: "Planner's" },
        { id: "planning", label: "Planning" },
        { id: "planner-tool", label: "Planner's Planner" },
        { id: "gpr", label: "GPR" },
        { id: "programs", label: "Programs" },
    ];

    return (
        <div className="bg-white text-neutral-900">
            {/* ===== Hero Section ===== */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden" style={{ background: "linear-gradient(135deg, #134E4A 0%, #0F766E 40%, #115E59 100%)" }}>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-64 h-64 border border-teal-300 rounded-full" />
                    <div className="absolute bottom-10 right-20 w-96 h-96 border border-teal-400 rounded-full" />
                    <div className="absolute top-40 right-40 w-32 h-32 border border-teal-200 rounded-full" />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <p className="text-xs tracking-[0.3em] uppercase text-teal-400 mb-6">
                        Planner&apos;s by Evolution School
                    </p>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-light leading-tight text-white">
                        우리는 모두<br />
                        <span className="font-bold">기획자다</span>
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-teal-300/80 max-w-2xl">
                        기획은 재능이 아닙니다. <strong className="text-white">훈련</strong>입니다.<br />
                        적어도 자기 인생에서만큼은, 누구나 기획자가 될 수 있습니다.
                    </p>
                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setActiveTab("planning")}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-teal-900 text-sm font-medium tracking-wide hover:bg-teal-50 transition-colors"
                        >
                            프레임워크 둘러보기 <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setActiveTab("programs")}
                            className="inline-flex items-center gap-2 px-8 py-3.5 border border-teal-400 text-teal-300 text-sm tracking-wide hover:bg-teal-800/50 transition-colors"
                        >
                            프로그램 신청 <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="mt-14 flex items-center gap-8 text-sm">
                        <div className="flex items-center gap-3 text-teal-400">
                            <span className="font-bold text-white text-lg">Vrief</span>
                            <span className="text-teal-500">Framework</span>
                        </div>
                        <div className="w-px h-6 bg-teal-700" />
                        <div className="flex items-center gap-3 text-teal-400">
                            <span className="font-bold text-white text-lg">GPR</span>
                            <span className="text-teal-500">Goal System</span>
                        </div>
                        <div className="w-px h-6 bg-teal-700" />
                        <div className="flex items-center gap-3 text-teal-400">
                            <span className="font-bold text-white text-lg">Plan-Do-See</span>
                            <span className="text-teal-500">Methodology</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tab Navigation */}
            <section className="border-b border-neutral-200 sticky top-16 bg-white z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-0 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 md:px-6 py-4 text-sm tracking-wide transition-colors border-b-2 whitespace-nowrap ${
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
                                        <strong>Why</strong> -- 왜 하는가?<br />
                                        방향을 설정하고 목적을 정의한다.
                                    </p>
                                </div>
                                <div className="bg-neutral-50 border border-neutral-200 p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Target className="h-5 w-5 text-neutral-600" />
                                        <h3 className="text-lg font-bold text-neutral-700">계획 (Plan)</h3>
                                    </div>
                                    <p className="text-sm text-neutral-600">
                                        <strong>How</strong> -- 어떻게 할 것인가?<br />
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

                    {/* 기획자 유형 - 아코디언 */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Who is Planner?
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-4">
                                Planner = <span className="font-bold">일이 되게 하는 사람</span>
                            </h2>
                            <p className="text-neutral-500 mb-10 md:mb-16 max-w-3xl">
                                기획은 특정 전공의 영역이 아니라, 문제를 발견하고 해결하려는 모든 사람의 역량이다.
                                당신은 어떤 유형의 기획자인가?
                            </p>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {PLANNER_ROLES.map((role) => (
                                    <div key={role.field} className="border border-neutral-200 hover:border-teal-300 transition-all group">
                                        <button
                                            onClick={() => setExpandedRole(expandedRole === role.field ? null : role.field)}
                                            className="w-full text-left p-8"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-teal-800 transition-colors">
                                                    {role.field}
                                                </h3>
                                                {expandedRole === role.field ? (
                                                    <ChevronDown className="h-4 w-4 text-teal-600" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                                                )}
                                            </div>
                                            <p className="text-sm text-teal-700">{role.ko}</p>
                                            <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{role.desc}</p>
                                        </button>

                                        {expandedRole === role.field && (
                                            <div className="px-8 pb-8 border-t border-neutral-100 pt-6 space-y-5">
                                                <div>
                                                    <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">이런 분에게 추천</p>
                                                    <p className="text-sm text-neutral-600">{role.recommend}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">핵심 역량 3가지</p>
                                                    <div className="space-y-1.5">
                                                        {role.skills.map((skill, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                                                                {skill}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">관련 프레임워크</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {role.frameworks.map((fw, i) => (
                                                            <span key={i} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 border border-teal-100">
                                                                {fw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* AI 추천 CTA */}
                    <section className="bg-gradient-to-r from-teal-900 to-teal-800 py-16 px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-700/50 border border-teal-600 text-teal-300 text-xs tracking-wider mb-6">
                                <Sparkles className="h-3.5 w-3.5" />
                                COMING SOON -- Myverse WORK 연동
                            </div>
                            <h2 className="text-xl md:text-3xl font-light text-white leading-relaxed">
                                &ldquo;나는 어떤 <span className="font-bold">기획자</span>일까?&rdquo;
                            </h2>
                            <p className="mt-4 text-teal-300/80 max-w-xl mx-auto">
                                AI가 당신의 성향, 경험, 관심사를 분석하여
                                가장 적합한 기획자 유형과 성장 로드맵을 추천합니다.
                            </p>
                            <button className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 border border-white/20 text-white text-sm tracking-wide hover:bg-white/20 transition-colors cursor-not-allowed opacity-70">
                                <Brain className="h-4 w-4" />
                                AI 유형 진단 (준비중)
                            </button>
                        </div>
                    </section>
                </>
            )}

            {/* ===== Planning Tab ===== */}
            {activeTab === "planning" && (
                <>
                    {/* Vrief 프레임워크 소개 */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Core Framework
                            </p>
                            <h2 className="text-xl md:text-3xl font-light leading-relaxed max-w-3xl">
                                Planner&apos;s의 핵심 프레임워크:<br />
                                <span className="font-bold text-teal-800">Vrief</span>
                            </h2>
                            <p className="mt-8 text-neutral-500 leading-relaxed max-w-3xl">
                                Vrief는 Vision - Research - Insight - Execution - Feedback의 순환 구조다.
                                모든 기획은 이 다섯 단계를 거치며, 각 단계는 다음 사이클의 출발점이 된다.
                            </p>
                        </div>
                    </section>

                    {/* Vrief 5단계 */}
                    <section className="bg-teal-900 text-white py-16 md:py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-teal-400 mb-4">
                                V - R - I - E - F
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                조사분석 <ArrowRight className="inline h-5 w-5 text-teal-500" /> 가설검증 <ArrowRight className="inline h-5 w-5 text-teal-500" /> <span className="font-bold">전략수립</span>
                            </h2>
                            <div className="space-y-4">
                                {VRIEF_STAGES.map((item, idx) => (
                                    <div key={item.stage} className="border border-teal-700 p-6 md:p-8 flex flex-col md:flex-row md:items-start gap-6">
                                        <div className="flex items-center gap-4 md:min-w-[200px]">
                                            <span className="text-3xl md:text-4xl font-bold text-teal-400">{item.stage}</span>
                                            <div>
                                                <h3 className="text-lg font-bold">{item.title}</h3>
                                                <p className="text-sm text-teal-400">{item.ko}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-teal-300/80 leading-relaxed">{item.detail}</p>
                                            <div className="mt-4 bg-teal-800/50 border border-teal-700 p-4">
                                                <p className="text-xs text-teal-500 mb-1">실제 사례 -- {item.example.brand}</p>
                                                <p className="text-sm text-teal-200">{item.example.content}</p>
                                            </div>
                                        </div>
                                        {idx < VRIEF_STAGES.length - 1 && (
                                            <ArrowDown className="h-4 w-4 text-teal-600 mx-auto md:hidden" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Vrief 미니 워크숍 */}
                    <section className="py-24 px-6">
                        <div className="max-w-3xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Interactive Workshop
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-4">
                                Vrief로 <span className="font-bold">기획해보기</span>
                            </h2>
                            <p className="text-neutral-500 mb-10">
                                3단계 미니 워크숍으로 Vrief 프레임워크를 직접 경험해보세요.
                            </p>

                            <div className="border border-neutral-200 bg-neutral-50">
                                {/* Steps indicator */}
                                <div className="flex border-b border-neutral-200">
                                    {["브랜드명 입력", "조사분석 질문", "가설 도출"].map((label, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 py-3 text-center text-xs font-medium border-b-2 transition-colors ${
                                                workshopStep === i
                                                    ? "border-teal-700 text-teal-800 bg-white"
                                                    : workshopStep > i
                                                    ? "border-teal-300 text-teal-600 bg-teal-50"
                                                    : "border-transparent text-neutral-400"
                                            }`}
                                        >
                                            Step {i + 1}: {label}
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8">
                                    {workshopStep === 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-3">
                                                기획할 브랜드 또는 프로젝트명을 입력하세요
                                            </label>
                                            <input
                                                type="text"
                                                value={workshopBrand}
                                                onChange={(e) => setWorkshopBrand(e.target.value)}
                                                placeholder="예: 나만의 카페, 새로운 앱 서비스..."
                                                className="w-full px-4 py-3 border border-neutral-300 text-sm focus:outline-none focus:border-teal-500 bg-white"
                                            />
                                            <button
                                                onClick={() => workshopBrand.trim() && setWorkshopStep(1)}
                                                disabled={!workshopBrand.trim()}
                                                className="mt-6 px-6 py-2.5 bg-teal-700 text-white text-sm hover:bg-teal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                다음 단계 <ArrowRight className="inline h-4 w-4 ml-1" />
                                            </button>
                                        </div>
                                    )}

                                    {workshopStep === 1 && (
                                        <div>
                                            <p className="text-sm text-teal-700 font-medium mb-4">
                                                &ldquo;{workshopBrand}&rdquo;에 대한 조사분석 질문 (AI 생성 예시)
                                            </p>
                                            <div className="space-y-4">
                                                {[
                                                    `"${workshopBrand}"의 핵심 타겟 고객은 누구인가? 그들의 가장 큰 불편함은?`,
                                                    `이 시장에서 기존 경쟁자들이 해결하지 못한 문제는 무엇인가?`,
                                                    `"${workshopBrand}"만이 제공할 수 있는 고유한 가치는 무엇인가?`,
                                                ].map((q, i) => (
                                                    <div key={i} className="flex items-start gap-3 bg-white p-4 border border-neutral-200">
                                                        <span className="text-teal-600 font-bold text-sm mt-0.5">Q{i + 1}</span>
                                                        <p className="text-sm text-neutral-700 leading-relaxed">{q}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-6 flex gap-3">
                                                <button
                                                    onClick={() => setWorkshopStep(0)}
                                                    className="px-6 py-2.5 border border-neutral-300 text-neutral-600 text-sm hover:bg-neutral-100 transition-colors"
                                                >
                                                    이전
                                                </button>
                                                <button
                                                    onClick={() => setWorkshopStep(2)}
                                                    className="px-6 py-2.5 bg-teal-700 text-white text-sm hover:bg-teal-800 transition-colors"
                                                >
                                                    가설 도출하기 <ArrowRight className="inline h-4 w-4 ml-1" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {workshopStep === 2 && (
                                        <div>
                                            <p className="text-sm text-teal-700 font-medium mb-4">
                                                도출된 가설 (Mock)
                                            </p>
                                            <div className="bg-white border-l-4 border-teal-600 p-6 mb-6">
                                                <p className="text-sm text-neutral-400 mb-2">핵심 가설</p>
                                                <p className="text-neutral-800 font-medium leading-relaxed">
                                                    &ldquo;{workshopBrand}&rdquo;의 타겟 고객은 기존 솔루션의 복잡성에 불만을 가지고 있으며,
                                                    더 직관적이고 간결한 접근 방식을 원한다.
                                                </p>
                                            </div>
                                            <div className="bg-teal-50 border border-teal-100 p-4 mb-6">
                                                <p className="text-xs text-teal-600 mb-1">다음 단계 (Vrief E - Execution)</p>
                                                <p className="text-sm text-teal-800">이 가설을 기반으로 구체적인 전략과 실행 계획을 수립합니다.</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setWorkshopStep(1)}
                                                    className="px-6 py-2.5 border border-neutral-300 text-neutral-600 text-sm hover:bg-neutral-100 transition-colors"
                                                >
                                                    이전
                                                </button>
                                                <button
                                                    onClick={() => { setWorkshopStep(0); setWorkshopBrand(""); }}
                                                    className="px-6 py-2.5 bg-teal-700 text-white text-sm hover:bg-teal-800 transition-colors"
                                                >
                                                    처음부터 다시하기
                                                </button>
                                            </div>
                                            <p className="mt-6 text-xs text-neutral-400">
                                                * 실제 AI 연동은 추후 업데이트됩니다. 현재는 UX 데모입니다.
                                            </p>
                                        </div>
                                    )}
                                </div>
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
                                그래서 직접 만들기로 했다 -- 기획자를 위한 플래너.
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
                                모든 업무의 기본 구조: <span className="font-bold">Plan -- Do -- See</span>
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
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-16 gap-4">
                                <div>
                                    <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                        Project Book
                                    </p>
                                    <h2 className="text-xl md:text-3xl font-light mb-4">
                                        프로젝트 북 <span className="font-bold">7단계</span>
                                    </h2>
                                    <p className="text-neutral-500 max-w-3xl">
                                        복잡한 문제를 구조적으로 해결하기 위한 프레임워크.
                                        질문에서 시작해 결과 정리까지, 프로젝트의 전 과정을 담는다.
                                    </p>
                                </div>
                                <button className="inline-flex items-center gap-2 px-5 py-2.5 border border-teal-300 text-teal-700 text-sm hover:bg-teal-50 transition-colors shrink-0">
                                    <Download className="h-4 w-4" />
                                    템플릿 다운로드 (Mock)
                                </button>
                            </div>
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

                    {/* 사례 카드 */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Case Studies
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                이 프레임워크로 진행한 <span className="font-bold">프로젝트</span>
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {PROJECT_CASES.map((c) => (
                                    <div key={c.title} className="border border-neutral-200 p-8 hover:border-teal-300 transition-colors">
                                        <span className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-0.5">{c.category}</span>
                                        <h3 className="text-lg font-bold text-neutral-900 mt-4">{c.title}</h3>
                                        <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{c.desc}</p>
                                        <div className="mt-5 pt-4 border-t border-neutral-100">
                                            <div className="flex items-center gap-2 text-sm text-teal-700">
                                                <TrendingUp className="h-4 w-4" />
                                                <span className="font-medium">{c.result}</span>
                                            </div>
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

            {/* ===== GPR Tab ===== */}
            {activeTab === "gpr" && (
                <>
                    {/* GPR 소개 */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Goal Framework
                            </p>
                            <h2 className="text-xl md:text-3xl font-light leading-relaxed max-w-3xl">
                                <span className="font-bold text-teal-800">GPR</span> -- Goal, Plan, Result
                            </h2>
                            <p className="mt-8 text-neutral-500 leading-relaxed max-w-3xl">
                                목표를 세우고(Goal), 계획을 만들고(Plan), 결과를 측정한다(Result).
                                GPR은 인생의 비전부터 오늘의 할 일까지를 하나의 체계로 연결하는 프레임워크다.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 px-5 py-3">
                                    <Target className="h-5 w-5 text-teal-700" />
                                    <div>
                                        <p className="text-sm font-bold text-teal-800">Goal</p>
                                        <p className="text-xs text-teal-600">목표를 세운다</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-teal-300">
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                                <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 px-5 py-3">
                                    <ClipboardList className="h-5 w-5 text-teal-700" />
                                    <div>
                                        <p className="text-sm font-bold text-teal-800">Plan</p>
                                        <p className="text-xs text-teal-600">계획을 만든다</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-teal-300">
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                                <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 px-5 py-3">
                                    <Award className="h-5 w-5 text-teal-700" />
                                    <div>
                                        <p className="text-sm font-bold text-teal-800">Result</p>
                                        <p className="text-xs text-teal-600">결과를 측정한다</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 캐스케이드 시각화 */}
                    <section className="bg-teal-900 text-white py-16 md:py-24 px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-teal-400 mb-4">
                                Cascade System
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-4">
                                인생에서 오늘까지, <span className="font-bold">하나의 흐름</span>
                            </h2>
                            <p className="text-teal-300/80 mb-10 md:mb-16">
                                큰 목표는 작은 목표로, 작은 목표는 오늘의 실행으로 이어진다.
                            </p>
                            <div className="space-y-3">
                                {GPR_CASCADE.map((item, idx) => (
                                    <div key={item.level} className={`${item.width} mx-auto`}>
                                        <div className={`${item.color} p-4 md:p-5 flex items-center justify-between`}>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg md:text-xl font-bold">{item.level}</span>
                                                <span className="text-xs text-teal-300 font-mono">{item.period}</span>
                                            </div>
                                            <p className="text-sm text-teal-200/80 hidden md:block">{item.desc}</p>
                                        </div>
                                        {idx < GPR_CASCADE.length - 1 && (
                                            <div className="flex justify-center py-1">
                                                <ArrowDown className="h-4 w-4 text-teal-600" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* GPR 인터랙티브 UI */}
                    <section className="py-24 px-6">
                        <div className="max-w-3xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Try GPR
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-4">
                                GPR로 <span className="font-bold">올해 목표 세우기</span>
                            </h2>
                            <p className="text-neutral-500 mb-10">
                                간단한 3단계로 나만의 GPR을 만들어보세요.
                            </p>

                            <div className="border border-neutral-200 bg-neutral-50">
                                <div className="flex border-b border-neutral-200">
                                    {["Goal 설정", "Plan 수립", "Result 정의"].map((label, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 py-3 text-center text-xs font-medium border-b-2 transition-colors ${
                                                gprStep === i
                                                    ? "border-teal-700 text-teal-800 bg-white"
                                                    : gprStep > i
                                                    ? "border-teal-300 text-teal-600 bg-teal-50"
                                                    : "border-transparent text-neutral-400"
                                            }`}
                                        >
                                            {label}
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8">
                                    {gprStep === 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-3">
                                                올해 이루고 싶은 가장 큰 목표는?
                                            </label>
                                            <input
                                                type="text"
                                                value={gprGoal}
                                                onChange={(e) => setGprGoal(e.target.value)}
                                                placeholder="예: 사이드 프로젝트 런칭, 기획 역량 레벨업..."
                                                className="w-full px-4 py-3 border border-neutral-300 text-sm focus:outline-none focus:border-teal-500 bg-white"
                                            />
                                            <button
                                                onClick={() => gprGoal.trim() && setGprStep(1)}
                                                disabled={!gprGoal.trim()}
                                                className="mt-6 px-6 py-2.5 bg-teal-700 text-white text-sm hover:bg-teal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Plan 수립하기 <ArrowRight className="inline h-4 w-4 ml-1" />
                                            </button>
                                        </div>
                                    )}

                                    {gprStep === 1 && (
                                        <div>
                                            <p className="text-sm text-teal-700 font-medium mb-4">
                                                &ldquo;{gprGoal}&rdquo;을 위한 분기별 계획 (AI 생성 예시)
                                            </p>
                                            <div className="space-y-3">
                                                {[
                                                    { q: "Q1 (1-3월)", plan: "기초 역량 학습 & 벤치마킹 (주 10시간)" },
                                                    { q: "Q2 (4-6월)", plan: "MVP 설계 & 프로토타입 완성" },
                                                    { q: "Q3 (7-9월)", plan: "베타 테스트 & 피드백 반영" },
                                                    { q: "Q4 (10-12월)", plan: "정식 런칭 & 성과 정리" },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-start gap-3 bg-white p-4 border border-neutral-200">
                                                        <span className="text-xs font-mono font-bold text-teal-600 mt-0.5 min-w-[80px]">{item.q}</span>
                                                        <p className="text-sm text-neutral-700">{item.plan}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-6 flex gap-3">
                                                <button
                                                    onClick={() => setGprStep(0)}
                                                    className="px-6 py-2.5 border border-neutral-300 text-neutral-600 text-sm hover:bg-neutral-100 transition-colors"
                                                >
                                                    이전
                                                </button>
                                                <button
                                                    onClick={() => setGprStep(2)}
                                                    className="px-6 py-2.5 bg-teal-700 text-white text-sm hover:bg-teal-800 transition-colors"
                                                >
                                                    Result 정의하기 <ArrowRight className="inline h-4 w-4 ml-1" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {gprStep === 2 && (
                                        <div>
                                            <p className="text-sm text-teal-700 font-medium mb-4">
                                                측정 가능한 핵심 결과 (Mock)
                                            </p>
                                            <div className="space-y-3 mb-6">
                                                {[
                                                    { kr: "KR1", text: "프로젝트 기획서 3편 이상 완성" },
                                                    { kr: "KR2", text: "사용자 테스트 50명 이상 진행" },
                                                    { kr: "KR3", text: "분기별 회고 & 개선 보고서 작성" },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3 bg-white p-4 border border-neutral-200">
                                                        <span className="text-xs font-bold text-white bg-teal-700 px-2 py-0.5">{item.kr}</span>
                                                        <p className="text-sm text-neutral-700">{item.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-teal-50 border border-teal-100 p-4 mb-6 flex items-center gap-3">
                                                <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-teal-600 font-medium">Myverse DREAM 연동 예정</p>
                                                    <p className="text-xs text-teal-500">GPR을 Myverse에서 실시간 추적하고 AI 코칭을 받을 수 있습니다.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setGprStep(1)}
                                                    className="px-6 py-2.5 border border-neutral-300 text-neutral-600 text-sm hover:bg-neutral-100 transition-colors"
                                                >
                                                    이전
                                                </button>
                                                <button
                                                    onClick={() => { setGprStep(0); setGprGoal(""); }}
                                                    className="px-6 py-2.5 bg-teal-700 text-white text-sm hover:bg-teal-800 transition-colors"
                                                >
                                                    처음부터 다시하기
                                                </button>
                                            </div>
                                            <p className="mt-6 text-xs text-neutral-400">
                                                * 실제 AI 연동은 추후 업데이트됩니다. 현재는 UX 데모입니다.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* GPR 핵심 원칙 */}
                    <section className="bg-neutral-50 py-16 md:py-24 px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Principles
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                GPR의 <span className="font-bold">3가지 원칙</span>
                            </h2>
                            <div className="space-y-8">
                                {[
                                    { title: "캐스케이드 연결", desc: "인생 목표와 오늘의 할 일이 하나의 선으로 연결되어야 한다. 작은 실행이 큰 비전으로 이어지는 구조." },
                                    { title: "측정 가능한 결과", desc: "감이 아니라 숫자로 말한다. 모든 목표에는 측정 가능한 Key Result가 있어야 한다." },
                                    { title: "주기적 점검", desc: "주간 리뷰 → 월간 정리 → 분기 회고. 점검 없는 목표는 희망사항일 뿐이다." },
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-6 py-6 border-b border-neutral-200">
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

            {/* ===== Programs Tab ===== */}
            {activeTab === "programs" && (
                <>
                    {/* 프로그램 목록 */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Programs
                            </p>
                            <h2 className="text-xl md:text-3xl font-light mb-4">
                                현재 운영 중인 <span className="font-bold">프로그램</span>
                            </h2>
                            <p className="text-neutral-500 mb-10 md:mb-16 max-w-3xl">
                                기획은 훈련입니다. Planner&apos;s의 체계적인 프로그램으로 기획 역량을 키우세요.
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                {PROGRAMS.map((prog) => (
                                    <div key={prog.title} className="border border-neutral-200 hover:border-teal-300 transition-colors">
                                        <div className="p-8">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-bold px-2.5 py-1 ${
                                                        prog.status === "모집중"
                                                            ? "bg-teal-100 text-teal-800"
                                                            : "bg-neutral-100 text-neutral-500"
                                                    }`}>
                                                        {prog.status}
                                                    </span>
                                                    <span className="text-xs text-neutral-400 font-mono">{prog.format}</span>
                                                </div>
                                                <span className="text-lg font-bold text-teal-800">{prog.price}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-neutral-900">{prog.title}</h3>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" /> {prog.duration}
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-500 mt-4">{prog.target}</p>

                                            {/* Curriculum */}
                                            <div className="mt-6 pt-5 border-t border-neutral-100">
                                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">커리큘럼</p>
                                                <div className="space-y-2">
                                                    {prog.curriculum.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                                                            <span className="text-xs text-teal-600 font-mono font-bold min-w-[20px]">{String(i + 1).padStart(2, "0")}</span>
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                className={`mt-6 w-full py-3 text-sm font-medium transition-colors ${
                                                    prog.status === "모집중"
                                                        ? "bg-teal-700 text-white hover:bg-teal-800"
                                                        : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                                }`}
                                                disabled={prog.status !== "모집중"}
                                            >
                                                {prog.status === "모집중" ? "프로그램 신청하기" : "모집 마감"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 맞춤 프로그램 */}
                    <section className="bg-teal-900 text-white py-16 md:py-24 px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <GraduationCap className="h-10 w-10 text-teal-400 mx-auto mb-6" />
                            <h2 className="text-xl md:text-3xl font-light">
                                기업/단체 <span className="font-bold">맞춤 프로그램</span>
                            </h2>
                            <p className="mt-4 text-teal-300/80 max-w-xl mx-auto">
                                조직의 니즈에 맞는 기획 교육 프로그램을 설계해드립니다.
                                Vrief, GPR, Plan-Do-See를 조직에 도입하세요.
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-white text-teal-900 text-sm font-medium tracking-wide hover:bg-teal-50 transition-colors"
                            >
                                문의하기 <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </section>
                </>
            )}

            {/* ===== Testimonials (모든 탭 공통, 탭 컨텐츠 아래) ===== */}
            <section className="py-16 md:py-24 px-6 bg-neutral-50">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4 text-center">
                        Testimonials
                    </p>
                    <h2 className="text-xl md:text-3xl font-light text-center mb-10 md:mb-16">
                        수강생 <span className="font-bold">후기</span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t) => (
                            <div key={t.name} className="bg-white border border-neutral-200 p-8">
                                <div className="flex items-center gap-1 mb-4">
                                    {Array.from({ length: t.rating }).map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-teal-500 text-teal-500" />
                                    ))}
                                </div>
                                <p className="text-sm text-neutral-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                                <div className="mt-6 pt-4 border-t border-neutral-100">
                                    <p className="text-sm font-bold text-neutral-900">{t.name}</p>
                                    <p className="text-xs text-neutral-400 mt-0.5">{t.org}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 flex items-center justify-center gap-3">
                        <span className="text-xs text-teal-600 font-medium bg-teal-50 border border-teal-100 px-3 py-1">Powered by Vrief</span>
                        <span className="text-xs text-teal-600 font-medium bg-teal-50 border border-teal-100 px-3 py-1">Powered by GPR</span>
                    </div>
                </div>
            </section>

            {/* CTA (공통) */}
            <section className="bg-neutral-900 text-white py-16 md:py-24 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-xl md:text-3xl font-light">
                        <span className="font-bold">기획자의 여정을 함께하세요</span>
                    </h2>
                    <p className="mt-4 text-neutral-500">
                        Planner&apos;s에서 당신만의 기획을 시작하세요.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <button
                            onClick={() => setActiveTab("programs")}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-700 text-white text-sm tracking-wide hover:bg-teal-800 transition-colors"
                        >
                            프로그램 보기 <ArrowRight className="h-4 w-4" />
                        </button>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-8 py-3.5 border border-neutral-600 text-neutral-300 text-sm tracking-wide hover:border-neutral-400 hover:text-white transition-colors"
                        >
                            Contact Us <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
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
