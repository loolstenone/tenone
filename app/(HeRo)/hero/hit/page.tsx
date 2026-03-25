"use client";

import Link from "next/link";
import {
    Search,
    Target,
    Brain,
    Zap,
    Users,
    ArrowRight,
    CheckCircle,
    ClipboardCheck,
    ChevronRight,
} from "lucide-react";

const steps = [
    {
        step: 1,
        title: "기질/태도 검사",
        desc: "행동유형(DISC 기반), 일상태도(MBTI 기반), 자존감/자존심을 측정합니다.",
        icon: Brain,
        items: ["주도형(D)", "사교형(I)", "안정형(S)", "신중형(C)"],
    },
    {
        step: 2,
        title: "역량/적성 검사",
        desc: "강점유형(S-Power), 직무적성, 취업준비도를 측정합니다.",
        icon: Target,
        items: ["전략적 사고", "실행력", "창의성", "대인관계", "분석력"],
    },
    {
        step: 3,
        title: "HeRo 캐릭터 생성",
        desc: "진단 결과를 기반으로 나만의 HeRo 캐릭터와 역량 프로필이 생성됩니다.",
        icon: Zap,
        items: ["역량 레이더", "강점 TOP 3", "개발 영역", "성장 로드맵"],
    },
];

const benefits = [
    { title: "과학적 진단", desc: "DISC, MBTI 기반의 검증된 진단 도구로 객관적 분석" },
    { title: "맞춤 커리어 설계", desc: "진단 결과에 따른 개인화된 성장 경로 제안" },
    { title: "멘토 매칭", desc: "강점/약점 분석을 통한 최적의 멘토 연결" },
    { title: "HeRo 캐릭터", desc: "나만의 브랜드 캐릭터 생성 및 포트폴리오 활용" },
    { title: "지속적 성장 트래킹", desc: "주기적 재진단을 통한 성장 추이 분석" },
    { title: "커뮤니티 연결", desc: "비슷한 유형의 인재들과 네트워킹 기회" },
];

export default function HitProgramPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Search className="h-5 w-5 text-amber-500" />
                            <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">
                                HIT Program
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                            Hidden Intelligence<br />
                            <span className="text-amber-500">Talent</span>
                        </h1>
                        <p className="text-lg text-neutral-600 mb-8 max-w-2xl">
                            HeRo Integrated Test. 인성, 적성, 역량, 준비도를 통합 진단하여
                            숨겨진 인재를 발굴하는 프로그램입니다.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors rounded-lg"
                        >
                            지원하기 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-xl md:text-3xl font-bold mb-3">선발 과정</h2>
                        <p className="text-neutral-500">3단계 통합 진단으로 숨겨진 인재를 발굴합니다</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((s, i) => (
                            <div key={s.step} className="relative">
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-12 -right-4 z-10">
                                        <ChevronRight className="h-6 w-6 text-amber-300" />
                                    </div>
                                )}
                                <div className="border border-neutral-200 rounded-xl p-6 h-full hover:border-amber-300 transition-colors">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                                            {s.step}
                                        </div>
                                        <s.icon className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                                    <p className="text-sm text-neutral-500 mb-4">{s.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {s.items.map((item) => (
                                            <span
                                                key={item}
                                                className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-xl md:text-3xl font-bold mb-3">HIT 프로그램 혜택</h2>
                        <p className="text-neutral-500">진단 완료 후 받을 수 있는 혜택</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((b) => (
                            <div key={b.title} className="bg-white border border-neutral-200 rounded-xl p-6">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-bold mb-1">{b.title}</h3>
                                        <p className="text-xs text-neutral-500">{b.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-amber-500">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 text-center">
                    <ClipboardCheck className="h-12 w-12 text-white mx-auto mb-4" />
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-3">HIT 진단 시작하기</h2>
                    <p className="text-amber-100 mb-8 max-w-lg mx-auto">
                        20문항 통합 진단으로 나의 숨겨진 잠재력을 발견하세요. 소요 시간 약 10분.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white text-amber-600 font-bold hover:bg-amber-50 transition-colors rounded-lg"
                    >
                        지원하기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
