"use client";

import Link from "next/link";
import {
    ArrowRight,
    Orbit,
    Database,
    Brain,
    Bot,
    Globe,
    Check,
} from "lucide-react";

/* ── Hero ── */
function Hero() {
    return (
        <section className="relative overflow-hidden py-32 lg:py-40">
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/8 blur-[120px]" />
            </div>
            <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
                <p className="text-indigo-400 font-medium text-sm mb-4">ROADMAP</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    로드맵
                </h1>
                <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                    My Universe가 완성되어 가는 여정
                </p>
            </div>
        </section>
    );
}

/* ── Phases ── */
const phases = [
    {
        phase: "Phase 1",
        title: "Foundation",
        period: "MVP — 6개월",
        icon: Database,
        status: "current" as const,
        description: "개인 프로필, 데이터 보관함, 기본 대시보드",
        milestones: [
            "React Native 앱 세팅",
            "Universal Record 스키마",
            "Instagram / KakaoTalk / Facebook 파서",
            "통합 타임라인 UI",
            "온보딩 플로우 (어둠 → 점 → 성장)",
            "Quick Capture (음성/사진/메모)",
            "자연어 검색",
            "베타 100명 → 앱스토어",
        ],
    },
    {
        phase: "Phase 2",
        title: "Intelligence",
        period: "6~12개월",
        icon: Brain,
        status: "upcoming" as const,
        description: "AI 맞춤 큐레이션, 패턴 분석, 인사이트 리포트",
        milestones: [
            "자동 기록 고도화 (위치, 결제, 스크린타임)",
            "Twitter/X, YouTube, 네이버 파서",
            "Apple Health / 삼성 헬스 연동",
            "성장 시스템 고도화",
        ],
    },
    {
        phase: "Phase 3",
        title: "Agent",
        period: "12~18개월",
        icon: Bot,
        status: "upcoming" as const,
        description: "자율 에이전트, 업무 자동화, 서비스 연동",
        milestones: [
            "\"나와의 대화\" 정식 오픈",
            "패턴 분석, 교차 인사이트",
            "연간 라이프 리포트",
            "\"나의 변화\" 시각화",
        ],
    },
    {
        phase: "Phase 4",
        title: "Universe",
        period: "18개월~",
        icon: Globe,
        status: "upcoming" as const,
        description: "완성된 개인 세계관, 커뮤니티, 크로스 에이전트",
        milestones: [
            "마이데이터 API 연동 (금융/의료/통신)",
            "외부 서비스 접속 구조",
            "접근 권한 관리",
            "디지털 유산",
        ],
    },
];

function PhasesSection() {
    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    {phases.map((p) => (
                        <div key={p.phase} className={`p-6 rounded-2xl border transition-colors ${
                            p.status === "current"
                                ? "bg-indigo-500/5 border-indigo-500/20"
                                : "bg-white/[0.03] border-white/5"
                        }`}>
                            <div className="flex items-start gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                    p.status === "current"
                                        ? "bg-indigo-500 text-white"
                                        : "bg-white/5 border border-white/10 text-neutral-500"
                                }`}>
                                    <p.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-mono text-indigo-400">{p.phase}</span>
                                        <h3 className="text-white font-semibold text-lg">{p.title}</h3>
                                        {p.status === "current" && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                In Progress
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-neutral-500 mb-2">{p.period}</p>
                                    <p className="text-sm text-neutral-400 mb-4">{p.description}</p>
                                    <div className="grid sm:grid-cols-2 gap-1.5">
                                        {p.milestones.map((m) => (
                                            <div key={m} className="flex items-start gap-2 text-sm text-neutral-400">
                                                <Check className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                                <span>{m}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Pricing ── */
const plans = [
    {
        name: "Free",
        price: "0원",
        features: ["3개 서비스 아카이브", "수동 입력", "3개월 보관"],
        cta: false,
    },
    {
        name: "Plus",
        price: "4,900원/월",
        features: ["무제한 아카이브", "자동 기록", "1년 보관", "AI 검색"],
        cta: false,
    },
    {
        name: "Pro",
        price: "9,900원/월",
        features: ["전체 기능", "무제한 보관", "나와의 대화", "라이프 리포트"],
        cta: true,
    },
    {
        name: "Family",
        price: "14,900원/월",
        features: ["Pro × 5명", "가족 공유", "디지털 유산"],
        cta: false,
    },
];

function PricingSection() {
    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">PRICING</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">구독 플랜</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    {plans.map((p) => (
                        <div key={p.name} className={`p-6 rounded-2xl border ${
                            p.cta ? "bg-indigo-500/5 border-indigo-500/20" : "bg-white/[0.03] border-white/5"
                        }`}>
                            <h3 className="text-white font-semibold text-lg">{p.name}</h3>
                            <p className="text-2xl font-bold text-white mt-2 mb-4">{p.price}</p>
                            <div className="space-y-2">
                                {p.features.map((f) => (
                                    <div key={f} className="flex items-start gap-2 text-sm text-neutral-400">
                                        <Check className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>
                            {p.cta && (
                                <p className="text-xs text-indigo-400 mt-4">추천</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── CTA ── */
function CTASection() {
    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
                <Orbit className="h-10 w-10 text-indigo-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">
                    MVP 가치 문장
                </h2>
                <p className="text-xl text-neutral-300 mb-8">
                    &ldquo;흩어져 있던 나를 처음으로 한 곳에 모았다.&rdquo;
                </p>
                <Link
                    href="/mv/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors"
                >
                    Early Access 신청
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </section>
    );
}

export default function RoadmapPage() {
    return (
        <>
            <Hero />
            <PhasesSection />
            <PricingSection />
            <CTASection />
        </>
    );
}
