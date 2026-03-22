"use client";

import Link from "next/link";
import {
    Sparkles,
    Hash,
    FileText,
    FolderOpen,
    ArrowRight,
    CheckCircle,
    Palette,
    Globe,
    Camera,
} from "lucide-react";

const programs = [
    {
        icon: Sparkles,
        title: "HeRo 캐릭터",
        desc: "HIT 진단 결과 기반 나만의 퍼스널 브랜드 캐릭터를 생성합니다.",
        features: ["DISC 기반 성격 유형", "강점 키워드", "브랜드 스토리", "비주얼 캐릭터"],
    },
    {
        icon: FolderOpen,
        title: "포트폴리오 제작",
        desc: "프로젝트 경험을 체계적으로 정리한 전문 포트폴리오를 제작합니다.",
        features: ["프로젝트 하이라이트", "성과 시각화", "디자인 템플릿", "PDF 내보내기"],
    },
    {
        icon: Globe,
        title: "SNS 브랜딩",
        desc: "LinkedIn, Instagram 등 소셜 미디어 프로필을 최적화합니다.",
        features: ["프로필 컨설팅", "콘텐츠 전략", "해시태그 전략", "인사이트 분석"],
    },
    {
        icon: Camera,
        title: "프로필 촬영",
        desc: "전문 프로필 사진 촬영 및 보정 서비스를 제공합니다.",
        features: ["전문 스튜디오 촬영", "리터칭 포함", "다양한 컨셉", "SNS/이력서 최적화"],
    },
];

const brandingProcess = [
    { step: 1, title: "진단 분석", desc: "HIT 결과로 브랜드 DNA 추출" },
    { step: 2, title: "키워드 도출", desc: "나만의 브랜드 키워드 정의" },
    { step: 3, title: "스토리 구성", desc: "브랜드 스토리 및 비전 정리" },
    { step: 4, title: "비주얼 제작", desc: "포트폴리오/프로필 제작" },
    { step: 5, title: "채널 배포", desc: "SNS 및 구직 플랫폼 최적화" },
];

export default function BrandingPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-amber-50 via-white to-yellow-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="h-5 w-5 text-amber-500" />
                            <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">
                                Personal Branding
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                            나만의 <span className="text-amber-500">브랜드</span>를<br />
                            만드세요
                        </h1>
                        <p className="text-lg text-neutral-600 mb-8">
                            퍼스널 브랜딩 프로그램을 통해 당신만의 고유한 브랜드를 기획하고,
                            포트폴리오와 SNS 프로필을 전문적으로 구축합니다.
                        </p>
                        <Link
                            href="/hr/hit"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors rounded-lg"
                        >
                            브랜딩 시작하기 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Branding Process */}
            <section className="bg-white border-y border-neutral-200">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {brandingProcess.map((p, i) => (
                            <div key={p.step} className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        {p.step}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">{p.title}</p>
                                        <p className="text-xs text-neutral-400">{p.desc}</p>
                                    </div>
                                </div>
                                {i < brandingProcess.length - 1 && (
                                    <ArrowRight className="h-3 w-3 text-neutral-300 hidden sm:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programs */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">브랜딩 프로그램</h2>
                        <p className="text-neutral-500">4가지 프로그램으로 나만의 브랜드를 구축하세요</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {programs.map((prog) => (
                            <div key={prog.title} className="border border-neutral-200 rounded-xl p-6 hover:border-amber-300 transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                                        <prog.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{prog.title}</h3>
                                        <p className="text-xs text-neutral-500">{prog.desc}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {prog.features.map((f) => (
                                        <div key={f} className="flex items-center gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                            <span className="text-xs text-neutral-600">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sample Character */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">HeRo 캐릭터 예시</h2>
                        <p className="text-neutral-500">HIT 진단 결과를 기반으로 생성되는 캐릭터</p>
                    </div>
                    <div className="max-w-2xl mx-auto bg-white border border-neutral-200 rounded-xl p-8">
                        <div className="flex items-start gap-5 mb-6">
                            <div className="w-20 h-20 bg-amber-500 text-white flex items-center justify-center rounded-xl flex-shrink-0">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-xs text-amber-600 uppercase tracking-wider mb-1">HeRo Character</p>
                                <h3 className="text-xl font-bold mb-1">비전을 제시하는 전략가</h3>
                                <p className="text-sm text-neutral-500 italic mb-3">The Visionary Strategist</p>
                                <p className="text-sm text-neutral-600">
                                    큰 그림을 그리고, 사람을 모으며, 세계관을 설계하는 리더형 인재.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="text-xs px-3 py-1 bg-amber-500 text-white rounded-full">ENTJ</span>
                            <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">D 주도형</span>
                            <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">전략적 사고 92점</span>
                            <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">리더십 90점</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["#전략", "#연결", "#세계관", "#AI", "#브랜드", "#리더십"].map((kw) => (
                                <span key={kw} className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-medium">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-amber-500">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl font-bold text-white mb-3">나만의 브랜드를 시작하세요</h2>
                    <p className="text-amber-100 mb-8">HIT 진단 결과를 기반으로 퍼스널 브랜딩 프로그램에 참여하세요</p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white text-amber-600 font-bold hover:bg-amber-50 transition-colors rounded-lg"
                    >
                        시작하기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
