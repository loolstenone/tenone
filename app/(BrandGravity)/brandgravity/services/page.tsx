"use client";

import Link from "next/link";
import { ArrowRight, Search, Brain, BarChart3, Users, Check } from "lucide-react";

const services = [
    {
        tag: "SCAN",
        name: "Gravity Scan",
        price: "100 – 300만원",
        priceNote: "프로젝트 단위",
        phase: "Phase 1",
        headline: "AI 추천 채널에서의 브랜드 현황 진단",
        desc: "페인 포인트 맵부터 AI 추천 결과, 경쟁사 비교, 갭 진단서까지. 계약 후 4주 이내 결과물을 납품합니다.",
        deliverables: [
            "카테고리 페인 포인트 맵 (상위 20~30개)",
            "상황 기반 AI 질의 패턴 30개",
            "5대 AI 질의 결과 (ChatGPT, Gemini, Perplexity, Claude, Copilot)",
            "Gravity Score (등장률·순위·맥락 정확도·커버리지)",
            "경쟁사 대비 비교 분석",
            "갭 진단서 및 우선순위 액션 아이템",
        ],
        cta: "Scan 신청",
        ctaHref: "/brandgravity/apply",
        color: "border-amber-500/30 bg-amber-500/5",
        accent: "text-amber-500",
        icon: Search,
    },
    {
        tag: "PROGRAM",
        name: "Gravity Program",
        price: "월 300 – 500만원",
        priceNote: "3개월 이상",
        phase: "Phase 1~2",
        headline: "AI 추천 부재 갭 해소 및 브랜드 보이스 재설계",
        desc: "Scan 결과를 기반으로 브랜드 메시지를 재설계하고, 리뷰 전략·구조화 데이터·콘텐츠 브리프를 실행합니다. 분기별 Gravity Score 추이 포함.",
        deliverables: [
            "Gravity Scan 포함",
            "실구매자 언어 기반 브랜드 보이스 가이드",
            "채널별 리뷰 유도 전략 및 질문 설계",
            "schema.org 구조화 데이터 코드 납품",
            "상황 문장 기반 AEO 콘텐츠 브리프",
            "분기별 Gravity Score 추이 리포트",
        ],
        cta: "Program 문의",
        ctaHref: "/brandgravity/apply?type=program",
        color: "border-white/10",
        accent: "text-white",
        icon: Brain,
    },
    {
        tag: "DASHBOARD",
        name: "Gravity Dashboard",
        price: "월 50 – 100만원",
        priceNote: "SaaS 구독",
        phase: "Phase 2~3",
        headline: "AI 추천 현황 상시 모니터링",
        desc: "월간 Gravity Score, 경쟁사 변동 현황, 질의 패턴 트렌드를 대시보드로 제공합니다. (Phase 2 출시 예정)",
        deliverables: [
            "월간 Gravity Score 스냅샷",
            "경쟁사 Score 변동 현황",
            "신규 질의 패턴 트렌드",
            "AI별 추천 현황 히트맵",
            "갭 변화 추이",
        ],
        cta: "사전 등록",
        ctaHref: "/brandgravity/apply?type=dashboard",
        color: "border-white/10",
        accent: "text-white",
        icon: BarChart3,
        badge: "출시 예정",
    },
    {
        tag: "WORKSHOP",
        name: "Gravity Workshop",
        price: "200 – 400만원",
        priceNote: "회당",
        phase: "Phase 1",
        headline: "AI 추천 구조 이해 및 전략 설계 실습",
        desc: "AI 추천 메커니즘을 이해하고, 자사 카테고리에 맞는 상황 문장을 직접 설계하는 실습 워크숍입니다. 마케팅·브랜드팀 대상.",
        deliverables: [
            "AI 추천 메커니즘 강의 (2시간)",
            "자사 카테고리 페인 포인트 실습 분석",
            "상황 문장 30개 팀 설계 실습",
            "Gravity Score 해석 가이드",
            "워크숍 후속 액션 로드맵",
        ],
        cta: "Workshop 문의",
        ctaHref: "/brandgravity/apply?type=workshop",
        color: "border-white/10",
        accent: "text-white",
        icon: Users,
    },
];

export default function GravityServicesPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">

                {/* Header */}
                <section className="mb-20">
                    <p className="text-xs tracking-[0.3em] uppercase text-amber-500 mb-4">Services</p>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">서비스 라인업</h1>
                    <p className="text-neutral-400 max-w-xl leading-relaxed">
                        진단(Scan)에서 시작해 실행(Program)으로 이어지고, 상시 모니터링(Dashboard)으로 완성됩니다.<br />
                        대부분의 클라이언트는 Gravity Scan을 시작점으로 합니다.
                    </p>
                </section>

                {/* Services */}
                <div className="space-y-6">
                    {services.map((s) => (
                        <div key={s.tag} className={`border rounded-2xl p-8 ${s.color}`}>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] tracking-[0.2em] px-2 py-0.5 border border-neutral-700 rounded font-mono text-neutral-500">{s.tag}</span>
                                        {s.badge && (
                                            <span className="text-[10px] px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded">{s.badge}</span>
                                        )}
                                    </div>
                                    <h2 className={`text-2xl font-bold mb-1 ${s.accent}`}>{s.name}</h2>
                                    <p className="text-sm text-neutral-400">{s.headline}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xl font-bold text-white">{s.price}</p>
                                    <p className="text-xs text-neutral-500">{s.priceNote}</p>
                                    <p className="text-[10px] text-neutral-600 mt-1">{s.phase}</p>
                                </div>
                            </div>

                            <p className="text-sm text-neutral-400 leading-relaxed mb-6">{s.desc}</p>

                            <div className="mb-6">
                                <p className="text-[10px] tracking-[0.2em] text-neutral-600 uppercase mb-3">납품물</p>
                                <ul className="space-y-2">
                                    {s.deliverables.map((d) => (
                                        <li key={d} className="flex items-start gap-2 text-sm text-neutral-300">
                                            <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            {d}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link
                                href={s.ctaHref}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition"
                            >
                                {s.cta} <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <section className="mt-20 border-t border-neutral-800 pt-16">
                    <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-8">자주 묻는 질문</p>
                    <div className="space-y-6">
                        {[
                            { q: "어떤 업종·카테고리에 적합한가요?", a: "리뷰 데이터가 존재하는 소비재, B2C 서비스, SaaS 전반에 적합합니다. 리뷰 데이터의 양과 질이 분석 정밀도에 직결됩니다. B2B 업종은 Gravity Workshop을 선행 권장합니다." },
                            { q: "Scan 결과물 납품까지 소요 기간은?", a: "계약 후 4주 이내 납품을 목표로 합니다. 데이터 수집 1~2주, 분석 1주, 리포트 작성 1주 순서로 진행됩니다." },
                            { q: "경쟁사 정보를 사전에 제공해야 하나요?", a: "신청 폼에서 주요 경쟁사 2~3개를 입력합니다. Pain Collector가 이를 기반으로 분석 범위를 자동 확장합니다." },
                        ].map((f) => (
                            <div key={f.q} className="border-b border-neutral-800 pb-6">
                                <p className="text-sm font-bold mb-2">{f.q}</p>
                                <p className="text-sm text-neutral-400 leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="mt-16 text-center">
                    <h2 className="text-2xl font-bold mb-3">Gravity Scan으로 시작하십시오</h2>
                    <p className="text-sm text-neutral-400 mb-8">진단 없이 실행하지 마십시오.</p>
                    <Link href="/brandgravity/apply" className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition">
                        Scan 신청 <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </div>

        </div>
    );
}
