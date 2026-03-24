"use client";

import {
    Orbit,
    User,
    Shield,
    Zap,
    Link2,
    Bot,
    Sparkles,
    Globe,
    ChevronRight,
    ArrowRight,
    Brain,
    Database,
    Lock,
    Plug,
} from "lucide-react";

/* ── Hero Section ── */
function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[80px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-32 lg:py-44">
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300 mb-8">
                        <Orbit className="h-4 w-4 text-indigo-400" />
                        Ten:One™ Universe
                    </div>

                    <h1 className="text-2xl sm:text-4xl lg:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                        나를 중심으로 한
                        <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            나만의 우주
                        </span>
                    </h1>

                    <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                        당신의 능력, 관계, 기록이 만들어가는 개인화된 세계관.
                        <br className="hidden sm:block" />
                        AI 에이전트가 당신만의 우주를 운영합니다.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="#waitlist"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors"
                        >
                            Early Access 신청
                            <ArrowRight className="h-4 w-4" />
                        </a>
                        <a
                            href="#about"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-neutral-300 font-medium hover:bg-white/5 transition-colors"
                        >
                            자세히 알아보기
                        </a>
                    </div>
                </div>

                {/* Floating orbs */}
                <div className="mt-20 relative h-40 flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                        <Bot className="h-8 w-8 text-indigo-300" />
                    </div>
                    <div className="absolute -left-8 top-4 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20 flex items-center justify-center sm:left-[calc(50%-160px)]">
                        <User className="h-5 w-5 text-pink-300" />
                    </div>
                    <div className="absolute -right-4 top-0 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center sm:right-[calc(50%-170px)]">
                        <Database className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div className="absolute left-4 bottom-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center sm:left-[calc(50%-120px)]">
                        <Lock className="h-4 w-4 text-amber-300" />
                    </div>
                    <div className="absolute right-8 bottom-4 w-11 h-11 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center sm:right-[calc(50%-130px)]">
                        <Plug className="h-4 w-4 text-green-300" />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── About Section ── */
function AboutSection() {
    return (
        <section id="about" className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
                    <div>
                        <p className="text-indigo-400 font-medium text-sm mb-3">ABOUT MY UNIVERSE</p>
                        <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                            정보 생산 권력의 이동
                        </h2>
                        <div className="mt-6 space-y-4 text-neutral-400 leading-relaxed">
                            <p>
                                정보 생산의 권력은 <strong className="text-white">국가 → 기업 → 개인</strong>으로 이동하고 있습니다.
                                이제 내 로그, 내 데이터, 내 역사, 내 우주의 시대입니다.
                            </p>
                            <p>
                                My Universe는 사용자가 자신을 중심으로 보유한 능력과 연결된 요소들이
                                함께 만들어가는 <strong className="text-white">개인화된 세계관</strong>입니다.
                            </p>
                            <p>
                                인공 지능 시대, My Universe는 단순한 앱이 아닌
                                당신만을 위한 <strong className="text-white">AI 에이전트</strong>가 됩니다.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-white/10 p-8 flex flex-col justify-center items-center gap-6">
                            {/* Concentric rings */}
                            <div className="relative w-48 h-48">
                                <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_30s_linear_infinite]" />
                                <div className="absolute inset-4 rounded-full border border-indigo-500/20 animate-[spin_20s_linear_infinite_reverse]" />
                                <div className="absolute inset-8 rounded-full border border-purple-500/20 animate-[spin_15s_linear_infinite]" />
                                <div className="absolute inset-[4.5rem] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">나</span>
                                </div>
                                {/* Dots on orbits */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400" />
                                <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-purple-400" />
                                <div className="absolute top-8 left-2 w-2 h-2 rounded-full bg-pink-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-neutral-400">나의 능력 · 관계 · 기록 · 관심사</p>
                                <p className="text-xs text-neutral-500 mt-1">모두가 연결된 나만의 우주</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Core Values Section ── */
const coreValues = [
    {
        icon: User,
        title: "개인화",
        en: "Personalize",
        description: "세상에 하나뿐인 나만의 맞춤형 경험. AI가 당신의 패턴, 선호, 역량을 학습하여 최적의 정보와 서비스를 제공합니다.",
        color: "from-indigo-500 to-blue-500",
        borderColor: "border-indigo-500/20",
    },
    {
        icon: Zap,
        title: "사용자 주도권",
        en: "Initiative of User",
        description: "당신이 중심입니다. 무엇을 공유하고, 어떤 데이터를 활용할지 모든 결정은 사용자의 손에 있습니다.",
        color: "from-amber-500 to-orange-500",
        borderColor: "border-amber-500/20",
    },
    {
        icon: Shield,
        title: "완벽한 보안",
        en: "Perfect Security",
        description: "당신의 데이터는 오직 당신의 것. 엔드투엔드 암호화, 제로 지식 아키텍처로 데이터 주권을 보장합니다.",
        color: "from-emerald-500 to-green-500",
        borderColor: "border-emerald-500/20",
    },
    {
        icon: Link2,
        title: "쉬운 연결과 단절",
        en: "Easy Connect & Cut off",
        description: "원할 때 연결하고, 원할 때 끊습니다. 서비스 간 데이터 이동과 삭제가 자유롭습니다.",
        color: "from-purple-500 to-pink-500",
        borderColor: "border-purple-500/20",
    },
];

function ValuesSection() {
    return (
        <section id="values" className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">CORE VALUES</p>
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        4가지 핵심 가치
                    </h2>
                    <p className="mt-4 text-neutral-400 max-w-xl mx-auto">
                        My Universe가 추구하는 불변의 원칙
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {coreValues.map((value) => (
                        <div
                            key={value.en}
                            className={`group relative p-6 rounded-2xl bg-white/[0.03] border ${value.borderColor} hover:bg-white/[0.06] transition-all duration-300`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4`}>
                                <value.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{value.title}</h3>
                            <p className="text-xs text-indigo-400 mb-3">{value.en}</p>
                            <p className="text-sm text-neutral-400 leading-relaxed">
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Agent Section ── */
const agentFeatures = [
    {
        icon: Brain,
        title: "맥락 이해",
        description: "당신의 일상, 업무, 관심사를 맥락적으로 이해하고 능동적으로 제안합니다.",
    },
    {
        icon: Sparkles,
        title: "초맞춤 큐레이션",
        description: "수만 개의 정보 중 지금 당신에게 필요한 것만 골라 전달합니다.",
    },
    {
        icon: Globe,
        title: "연결된 서비스",
        description: "캘린더, 이메일, 프로젝트 도구까지 — 모든 서비스를 하나로 연결합니다.",
    },
    {
        icon: Bot,
        title: "자율 에이전트",
        description: "반복 업무를 자동화하고, 위임한 작업을 스스로 판단하여 처리합니다.",
    },
];

function AgentSection() {
    return (
        <section id="agent" className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="space-y-6">
                            {agentFeatures.map((feature) => (
                                <div key={feature.title} className="flex gap-4 group">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                        <feature.icon className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                                        <p className="text-sm text-neutral-400 leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <p className="text-indigo-400 font-medium text-sm mb-3">AI AGENT</p>
                        <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                            당신만의
                            <br />
                            AI 에이전트
                        </h2>
                        <p className="mt-6 text-neutral-400 leading-relaxed">
                            인공 지능 시대, My Universe는 단순한 정보 앱이 아닙니다.
                            당신의 데이터를 기반으로 학습하고, 당신의 의도를 이해하며,
                            당신을 대신하여 행동하는 <strong className="text-white">개인 AI 에이전트</strong>입니다.
                        </p>
                        <div className="mt-8 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-white font-medium">MyVerse Agent</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                            </div>
                            <div className="space-y-2 text-sm text-neutral-400">
                                <p className="flex items-center gap-2">
                                    <ChevronRight className="h-3 w-3 text-indigo-400" />
                                    오늘 오후 미팅 준비 자료를 정리했습니다
                                </p>
                                <p className="flex items-center gap-2">
                                    <ChevronRight className="h-3 w-3 text-indigo-400" />
                                    관심 분야의 새로운 트렌드 3건을 발견했습니다
                                </p>
                                <p className="flex items-center gap-2">
                                    <ChevronRight className="h-3 w-3 text-indigo-400" />
                                    이번 주 목표 진행률: 68% 달성 중
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Roadmap Section ── */
const roadmapItems = [
    { phase: "Phase 1", title: "Foundation", description: "개인 프로필 · 데이터 보관함 · 기본 대시보드", status: "current" as const },
    { phase: "Phase 2", title: "Intelligence", description: "AI 맞춤 큐레이션 · 패턴 분석 · 인사이트 리포트", status: "upcoming" as const },
    { phase: "Phase 3", title: "Agent", description: "자율 에이전트 · 업무 자동화 · 서비스 연동", status: "upcoming" as const },
    { phase: "Phase 4", title: "Universe", description: "완성된 개인 세계관 · 커뮤니티 · 크로스 에이전트", status: "upcoming" as const },
];

function RoadmapSection() {
    return (
        <section id="roadmap" className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">ROADMAP</p>
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        개발 로드맵
                    </h2>
                    <p className="mt-4 text-neutral-400 max-w-xl mx-auto">
                        My Universe가 완성되어 가는 여정
                    </p>
                </div>

                <div className="relative max-w-3xl mx-auto">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/30 to-transparent hidden sm:block" />

                    <div className="space-y-8">
                        {roadmapItems.map((item) => (
                            <div key={item.phase} className="relative flex gap-6">
                                {/* Dot */}
                                <div className="flex-shrink-0 relative z-10">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xs font-bold ${
                                        item.status === "current"
                                            ? "bg-indigo-500 text-white"
                                            : "bg-white/5 border border-white/10 text-neutral-500"
                                    }`}>
                                        {item.phase.replace("Phase ", "P")}
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="pt-2">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                                        {item.status === "current" && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                In Progress
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Waitlist / CTA Section ── */
function WaitlistSection() {
    return (
        <section id="waitlist" className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="relative max-w-2xl mx-auto text-center">
                    {/* Glow */}
                    <div className="absolute -inset-x-20 -inset-y-10 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />

                    <div className="relative p-10 rounded-3xl bg-white/[0.03] border border-white/10">
                        <Orbit className="h-10 w-10 text-indigo-400 mx-auto mb-6" />
                        <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                            나만의 우주를 만들 준비가 되셨나요?
                        </h2>
                        <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                            Early Access에 등록하고, My Universe의 첫 번째 주민이 되어주세요.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="이메일을 입력하세요"
                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <button className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors whitespace-nowrap">
                                등록하기
                            </button>
                        </div>
                        <p className="text-xs text-neutral-500 mt-4">
                            스팸 없음 · 언제든 구독 해지 가능
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Main Page ── */
export default function MyVersePage() {
    return (
        <>
            <HeroSection />
            <AboutSection />
            <ValuesSection />
            <AgentSection />
            <RoadmapSection />
            <WaitlistSection />
        </>
    );
}
