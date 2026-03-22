"use client";

import Link from "next/link";
import {
    Search,
    TrendingUp,
    Users,
    Sparkles,
    FileText,
    ArrowRight,
    Star,
    Target,
    Zap,
} from "lucide-react";

const features = [
    {
        icon: Search,
        title: "HIT 프로그램",
        desc: "Hidden Intelligence Talent. 숨겨진 인재를 발굴하는 통합 진단 프로그램.",
        href: "/hr/hit",
        color: "bg-amber-50 text-amber-600",
    },
    {
        icon: TrendingUp,
        title: "커리어 로드맵",
        desc: "C-Level을 향한 체계적인 성장 경로를 설계합니다.",
        href: "/hr/career",
        color: "bg-orange-50 text-orange-600",
    },
    {
        icon: Users,
        title: "멘토링",
        desc: "현직 전문가 멘토단과 1:1 매칭으로 실전 조언을 받습니다.",
        href: "/hr/mentor",
        color: "bg-yellow-50 text-yellow-600",
    },
    {
        icon: Sparkles,
        title: "퍼스널 브랜딩",
        desc: "나만의 브랜드를 기획하고 포트폴리오를 제작합니다.",
        href: "/hr/branding",
        color: "bg-amber-50 text-amber-600",
    },
];

const successStories = [
    {
        name: "김전략",
        role: "전략 기획 → 스타트업 CEO",
        quote: "HIT 진단으로 제 강점을 정확히 파악하고, 멘토링을 통해 창업의 방향을 잡았습니다.",
        score: 95,
    },
    {
        name: "박마케터",
        role: "마케팅 인턴 → 브랜드 디렉터",
        quote: "커리어 로드맵 덕분에 3년 안에 디렉터로 성장할 수 있었습니다.",
        score: 91,
    },
    {
        name: "이개발자",
        role: "주니어 → 테크 리드",
        quote: "퍼스널 브랜딩 프로그램이 취업 시장에서 차별화되는 무기가 되었습니다.",
        score: 88,
    },
];

const stats = [
    { label: "인재 발굴", value: "500+", unit: "명" },
    { label: "멘토 매칭", value: "200+", unit: "건" },
    { label: "커리어 성장률", value: "87", unit: "%" },
    { label: "만족도", value: "4.8", unit: "/5" },
];

export default function HeRoHomePage() {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-32">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-6">
                            <Target className="h-5 w-5 text-amber-500" />
                            <span className="text-sm font-medium text-amber-600 uppercase tracking-wider">
                                Hidden Intelligence &amp; Real Opportunity
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6">
                            숨겨진 인재를<br />
                            <span className="text-amber-500">발굴</span>하고{" "}
                            <span className="text-amber-500">성장</span>시킵니다
                        </h1>
                        <p className="text-lg text-neutral-600 mb-8 max-w-2xl">
                            HeRo는 인재의 잠재력을 발견하고, 체계적인 성장 프로그램을 통해
                            꿈을 현실로 만드는 인재 발굴 · 성장 플랫폼입니다.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/hr/hit"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors rounded-lg"
                            >
                                HIT 진단 시작하기 <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/hr/about"
                                className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors rounded-lg"
                            >
                                HeRo 알아보기
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="border-y border-neutral-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl font-extrabold text-amber-500">
                                    {stat.value}
                                    <span className="text-lg text-neutral-400 ml-1">{stat.unit}</span>
                                </p>
                                <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">HeRo 프로그램</h2>
                        <p className="text-neutral-500">인재 발굴부터 성장까지, 체계적인 프로그램을 제공합니다</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => (
                            <Link
                                key={feature.href}
                                href={feature.href}
                                className="group border border-neutral-200 rounded-xl p-6 hover:border-amber-300 hover:shadow-lg transition-all"
                            >
                                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-amber-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
                                <div className="mt-4 flex items-center gap-1 text-sm text-amber-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    자세히 보기 <ArrowRight className="h-3 w-3" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Career Roadmap Preview */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">커리어 로드맵</h2>
                            <p className="text-neutral-600 mb-6">
                                C-Level을 향한 성장 경로를 설계합니다. CMO, CTO, CSO, CBO 등
                                다양한 트랙에서 나만의 커리어 경로를 찾으세요.
                            </p>
                            <div className="space-y-3 mb-8">
                                {["CMO — 마케팅/브랜드", "CTO — 기술/개발", "CSO — 전략/기획", "CBO — 사업/영업"].map((track) => (
                                    <div key={track} className="flex items-center gap-3">
                                        <Zap className="h-4 w-4 text-amber-500" />
                                        <span className="text-sm font-medium">{track}</span>
                                    </div>
                                ))}
                            </div>
                            <Link
                                href="/hr/career"
                                className="inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700"
                            >
                                로드맵 보기 <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="bg-white border border-neutral-200 rounded-xl p-8">
                            <div className="space-y-6">
                                {[
                                    { level: "인턴", status: "완료", active: false },
                                    { level: "매니저", status: "완료", active: false },
                                    { level: "디렉터", status: "진행 중", active: true },
                                    { level: "C-Level", status: "목표", active: false },
                                ].map((step, i) => (
                                    <div key={step.level} className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${step.active ? "bg-amber-500 text-white" : i < 2 ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-400"}`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">{step.level}</p>
                                            <p className={`text-xs ${step.active ? "text-amber-500" : "text-neutral-400"}`}>{step.status}</p>
                                        </div>
                                        {i < 3 && <div className="w-px h-8 bg-neutral-200 ml-5 absolute" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mentor Highlights */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">멘토 하이라이트</h2>
                        <p className="text-neutral-500">현직 전문가들이 당신의 성장을 돕습니다</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: "김전략", field: "경영전략", career: "전 삼성전자 전략기획실", tags: ["전략", "M&A"] },
                            { name: "박브랜드", field: "브랜드/마케팅", career: "전 나이키코리아 마케팅 디렉터", tags: ["브랜드", "글로벌"] },
                            { name: "최리더", field: "리더십/HR", career: "전 구글코리아 HR Director", tags: ["리더십", "코칭"] },
                        ].map((mentor) => (
                            <div key={mentor.name} className="border border-neutral-200 rounded-xl p-6 hover:border-amber-300 transition-colors">
                                <div className="w-14 h-14 bg-amber-50 text-amber-600 flex items-center justify-center rounded-full text-lg font-bold mb-4">
                                    {mentor.name.charAt(0)}
                                </div>
                                <h3 className="text-base font-bold mb-1">{mentor.name}</h3>
                                <p className="text-xs text-amber-600 mb-1">{mentor.field}</p>
                                <p className="text-xs text-neutral-500 mb-3">{mentor.career}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {mentor.tags.map((tag) => (
                                        <span key={tag} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link
                            href="/hr/mentor"
                            className="inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700"
                        >
                            전체 멘토 보기 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">성공 사례</h2>
                        <p className="text-neutral-500">HeRo와 함께 성장한 인재들의 이야기</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {successStories.map((story) => (
                            <div key={story.name} className="bg-white border border-neutral-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-neutral-900 text-white flex items-center justify-center rounded-full text-sm font-bold">
                                        {story.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{story.name}</p>
                                        <p className="text-xs text-amber-600">{story.role}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1">
                                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                        <span className="text-xs font-bold text-neutral-600">{story.score}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    &ldquo;{story.quote}&rdquo;
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-amber-500">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">HeRo가 되어보세요</h2>
                    <p className="text-amber-100 mb-8 max-w-xl mx-auto">
                        숨겨진 당신의 잠재력을 발견하고, 체계적인 성장 프로그램으로 꿈을 현실로 만드세요.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/hr/hit"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-amber-600 font-bold hover:bg-amber-50 transition-colors rounded-lg"
                        >
                            HIT 진단 시작하기 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white font-bold hover:bg-amber-600 transition-colors rounded-lg"
                        >
                            회원가입
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
