"use client";

import Link from "next/link";
import {
    TrendingUp,
    Zap,
    Target,
    ArrowRight,
    ChevronRight,
    BarChart3,
    Briefcase,
    GraduationCap,
    Crown,
} from "lucide-react";

const tracks = [
    {
        code: "CMO",
        fullName: "Chief Marketing Officer",
        desc: "마케팅 / 브랜드",
        icon: BarChart3,
        levels: ["마케팅 인턴", "마케팅 매니저", "마케팅 디렉터", "CMO"],
        skills: ["SNS 운영", "퍼포먼스 마케팅", "브랜드 전략", "팀 리딩"],
    },
    {
        code: "CTO",
        fullName: "Chief Technology Officer",
        desc: "기술 / 개발",
        icon: Zap,
        levels: ["주니어 개발자", "시니어 개발자", "테크 리드", "CTO"],
        skills: ["프로그래밍", "아키텍처 설계", "기술 전략", "R&D 총괄"],
    },
    {
        code: "CSO",
        fullName: "Chief Strategy Officer",
        desc: "전략 / 기획",
        icon: Target,
        levels: ["전략 기획 사원", "전략 기획 매니저", "전략 디렉터", "CSO"],
        skills: ["시장 분석", "사업 모델링", "포트폴리오 전략", "비전 설계"],
    },
    {
        code: "CBO",
        fullName: "Chief Business Officer",
        desc: "사업 / 영업",
        icon: Briefcase,
        levels: ["영업 사원", "사업개발 매니저", "사업 디렉터", "CBO"],
        skills: ["고객 관리", "파트너십", "사업 총괄", "해외 확장"],
    },
];

const stages = [
    { icon: GraduationCap, label: "Entry", desc: "입문 단계", color: "bg-amber-100 text-amber-700" },
    { icon: Briefcase, label: "Growth", desc: "성장 단계", color: "bg-orange-100 text-orange-700" },
    { icon: TrendingUp, label: "Senior", desc: "시니어 단계", color: "bg-yellow-100 text-yellow-700" },
    { icon: Crown, label: "C-Level", desc: "경영진 단계", color: "bg-amber-500 text-white" },
];

export default function CareerPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-amber-500" />
                            <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">
                                Career Roadmap
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                            C-Level을 향한<br />
                            <span className="text-amber-500">성장 경로</span>를 설계합니다
                        </h1>
                        <p className="text-lg text-neutral-600 mb-8">
                            직무별 체계적인 성장 로드맵을 통해 당신만의 커리어 경로를 찾으세요.
                            각 단계별 필요 역량과 권장 경험을 안내합니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Growth Stages */}
            <section className="bg-white border-y border-neutral-200">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stages.map((stage, i) => (
                            <div key={stage.label} className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${stage.color} flex items-center justify-center`}>
                                    <stage.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{stage.label}</p>
                                    <p className="text-xs text-neutral-400">{stage.desc}</p>
                                </div>
                                {i < 3 && <ChevronRight className="h-4 w-4 text-neutral-300 hidden md:block ml-auto" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tracks */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">직무별 경로</h2>
                        <p className="text-neutral-500">4가지 C-Level 트랙에서 나의 경로를 선택하세요</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {tracks.map((track) => (
                            <div key={track.code} className="border border-neutral-200 rounded-xl p-6 hover:border-amber-300 transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-amber-500 text-white rounded-lg flex items-center justify-center">
                                        <track.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold px-2 py-0.5 bg-neutral-900 text-white rounded">
                                                {track.code}
                                            </span>
                                            <h3 className="text-base font-bold">{track.fullName}</h3>
                                        </div>
                                        <p className="text-xs text-neutral-400">{track.desc}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs text-neutral-400 mb-2">성장 경로</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {track.levels.map((level, i) => (
                                            <span key={level} className="flex items-center gap-1.5">
                                                <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                                                    {level}
                                                </span>
                                                {i < track.levels.length - 1 && (
                                                    <ChevronRight className="h-3 w-3 text-neutral-300" />
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-neutral-400 mb-2">핵심 역량</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {track.skills.map((skill) => (
                                            <span key={skill} className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-2xl font-bold mb-3">나만의 커리어 경로를 설계하세요</h2>
                    <p className="text-neutral-500 mb-8">HIT 진단을 완료하면 맞춤형 커리어 로드맵을 받을 수 있습니다</p>
                    <Link
                        href="/hr/hit"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors rounded-lg"
                    >
                        HIT 진단 시작하기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
