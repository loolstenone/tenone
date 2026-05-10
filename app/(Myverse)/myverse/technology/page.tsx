"use client";

import Link from "next/link";
import {
    Database,
    Shield,
    Server,
    Code2,
    ArrowRight,
    Lock,
    Download,
    Trash2,
    HardDrive,
    FileJson,
    Plug,
} from "lucide-react";

/* ── Hero ── */
function Hero() {
    return (
        <section className="relative overflow-hidden py-32 lg:py-40">
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[120px]" />
            </div>
            <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
                <p className="text-indigo-400 font-medium text-sm mb-4">TECHNOLOGY & SECURITY</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    기술과 보안
                </h1>
                <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                    당신의 데이터는 오직 당신의 것. 로컬 우선, 제로 지식 아키텍처.
                </p>
            </div>
        </section>
    );
}

/* ── Universal Record ── */
function UniversalRecordSection() {
    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-indigo-400 font-medium text-sm mb-3">UNIVERSAL RECORD</p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            하나의 포맷으로 정규화
                        </h2>
                        <p className="mt-4 text-neutral-400 leading-relaxed">
                            Instagram 사진이든, 카카오톡 대화든, 구글 캘린더 일정이든
                            모든 출처의 데이터를 하나의 Universal Record 포맷으로 변환하는 것을 목표로 합니다.
                            기본 포맷은 정의되어 있으며, 출처별 파서와 자동 분류는 단계적으로 도입됩니다.
                        </p>
                        <div className="mt-6 space-y-3">
                            {[
                                { label: "사진", result: "타입·시간·위치 메타데이터 추출 (제공)" },
                                { label: "Vision 자동 태깅", result: "음식·문서·인물 인식 (도입 예정)" },
                                { label: "음성", result: "STT 텍스트 변환 + 요약 (베타)" },
                                { label: "위치", result: "Reverse geocoding + 거점 매칭 (제공)" },
                            ].map((e) => (
                                <div key={e.label} className="flex items-start gap-3 text-sm">
                                    <span className="text-indigo-400 mt-0.5">→</span>
                                    <div>
                                        <span className="text-white">{e.label}</span>
                                        <span className="text-neutral-500 ml-2">{e.result}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-xs text-neutral-400 leading-relaxed">
                        <p className="text-indigo-400 mb-2">Record &#123;</p>
                        <p className="ml-4">id &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span className="text-neutral-500">고유 식별자</span></p>
                        <p className="ml-4">source &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span className="text-neutral-500">instagram | kakaotalk | camera | ...</span></p>
                        <p className="ml-4">type &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span className="text-neutral-500">post | message | event | food_photo | ...</span></p>
                        <p className="ml-4">timestamp &nbsp;&nbsp;&nbsp; <span className="text-neutral-500">2025-08-12T19:30:00+09:00</span></p>
                        <p className="ml-4">location &nbsp;&nbsp;&nbsp;&nbsp; <span className="text-neutral-500">&#123; lat, lng, name &#125;</span></p>
                        <p className="ml-4">content &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span className="text-neutral-500">&#123; text, media[], metadata &#125;</span></p>
                        <p className="ml-4">ai_tags &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span className="text-neutral-500">&#123; category, objects[], mood &#125;</span></p>
                        <p className="ml-4">embedding &nbsp;&nbsp;&nbsp; <span className="text-neutral-500">[ AI 벡터 ]</span></p>
                        <p className="ml-4">privacy &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span className="text-neutral-500">private | shared</span></p>
                        <p className="text-indigo-400">&#125;</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Data Sovereignty ── */
const sovereignty = [
    { icon: Lock, title: "소유", desc: "사용자 소유. Myverse는 보관 대행." },
    { icon: HardDrive, title: "로컬 우선", desc: "핵심 데이터 디바이스 저장. 클라우드는 동기화." },
    { icon: Trash2, title: "완전 삭제", desc: "탈퇴 시 즉시 전량 파기. 유예 없음." },
    { icon: Download, title: "이식성", desc: "전체 데이터 원클릭 내보내기. JSON + 원본 미디어." },
    { icon: FileJson, title: "생존성", desc: "Myverse가 사라져도 표준 포맷으로 존속." },
];

function SovereigntySection() {
    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">DATA SOVEREIGNTY</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">데이터 주권 5원칙</h2>
                    <p className="mt-4 text-neutral-400 max-w-lg mx-auto">
                        서비스는 사라져도, 내 기록은 남는다.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                    {sovereignty.map((s) => (
                        <div key={s.title} className="p-5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                <s.icon className="h-5 w-5 text-emerald-400" />
                            </div>
                            <h3 className="text-white font-semibold text-sm mb-1">{s.title}</h3>
                            <p className="text-xs text-neutral-400 leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Tech Stack ── */
function StackSection() {
    const stack = [
        { layer: "Web", tech: "Next.js 16 + React 19 (현재 운영)", icon: Plug },
        { layer: "App", tech: "iOS · Android 네이티브 (출시 예정)", icon: Plug },
        { layer: "Database", tech: "PostgreSQL (Supabase)", icon: Database },
        { layer: "Storage", tech: "Supabase Storage (사진·영상)", icon: HardDrive },
        { layer: "AI", tech: "Claude API · RAG 단계 도입", icon: Shield },
        { layer: "Auth", tech: "Supabase Auth (이메일·OAuth)", icon: Server },
    ];

    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">TECH STACK</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">기술 스택</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {stack.map((s) => (
                        <div key={s.layer} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                <s.icon className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-400 font-mono">{s.layer}</p>
                                <p className="text-sm text-white">{s.tech}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Parser Architecture ── */
function ParserSection() {
    const parsers = [
        "base — 공통 인터페이스 (제공)",
        "instagram — JSON export 파싱 (베타)",
        "kakaotalk — txt export 파싱 (베타)",
        "google_cal — OAuth 연동 (개발 중)",
        "facebook — JSON export 파싱 (예정)",
        "twitter — archive.zip 파싱 (예정)",
        "apple_health — HealthKit 연동 (예정)",
    ];

    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-indigo-400 font-medium text-sm mb-3">PARSER ARCHITECTURE</p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            플러그인 구조
                        </h2>
                        <p className="mt-4 text-neutral-400 leading-relaxed">
                            각 플랫폼 데이터를 Universal Record로 변환하는 파서 모듈.
                            새 서비스 추가 시 파서만 작성하면 됩니다.
                        </p>
                        <Link href="/myverse/contact" className="mt-6 inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                            파트너십 문의 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-sm text-neutral-400">
                        <p className="text-indigo-400 mb-2">parsers/</p>
                        {parsers.map((p) => (
                            <p key={p} className="ml-4 py-0.5">{p}</p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function TechnologyPage() {
    return (
        <>
            <Hero />
            <UniversalRecordSection />
            <SovereigntySection />
            <StackSection />
            <ParserSection />
        </>
    );
}
