"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ArrowLeft, Sparkles, Lock } from "lucide-react";
import SmarCommHeader from "@/features/smarcomm/SmarCommHeader";
import SmarCommFooter from "@/features/smarcomm/SmarCommFooter";

// ──────────────────────────────────────────────
// Marvis 라이트 진단 (Phase 0 스캐폴딩)
// 실제 진단은 lib/smarcomm/run-scan.ts + computeIndex 재활용 예정.
// 현재는 입력 폼 + Pro 차등 안내만. 정직성 원칙으로 가짜 결과 표시 금지.
// ──────────────────────────────────────────────

export default function MarvisScanPage() {
    const [url, setUrl] = useState("");

    return (
        <div className="min-h-screen bg-white">
            <SmarCommHeader />

            <main className="mx-auto max-w-3xl px-5 py-12">
                <Link
                    href="/smarcomm/marvis"
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-neutral-500 hover:text-neutral-900 mb-6"
                >
                    <ArrowLeft size={14} /> Marvis 홈
                </Link>

                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase mb-3">
                        <Search size={12} /> 라이트 진단
                    </div>
                    <h1 className="text-[28px] font-bold leading-tight text-neutral-900">
                        쇼핑몰 URL 하나로 마케팅 점수 확인
                    </h1>
                    <p className="mt-2 text-[14px] text-neutral-600">
                        SEO · GEO(AI 검색 노출) · 퍼널 기준 종합 점수와 핵심 권고 3가지를 알려드립니다.
                    </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 mb-6">
                    <label className="block text-[12px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
                        쇼핑몰 URL
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://yourshop.com"
                            className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-[14px] focus:outline-none focus:border-neutral-900 placeholder:text-neutral-400"
                        />
                        <button
                            disabled
                            className="rounded-xl bg-neutral-300 px-5 py-3 text-[13px] font-bold text-white cursor-not-allowed"
                            title="Phase 1에서 활성화"
                        >
                            진단 시작
                        </button>
                    </div>
                    <p className="mt-2 text-[11px] text-neutral-400">
                        진단 엔진은 Phase 1에서 활성화됩니다. SmarComm Index의 라이트 버전을 재사용합니다.
                    </p>
                </div>

                {/* Pro 차등 안내 */}
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                    <div className="flex items-start gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-900 flex items-center justify-center text-white">
                            <Sparkles size={14} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[14px] font-bold text-neutral-900 mb-1">Marvis 진단은 라이트 버전입니다</p>
                            <p className="text-[13px] text-neutral-600 leading-relaxed mb-3">
                                풀 진단(AI Visibility Map · Trust 4축 · Schema Generator · Trend 시계열 · Action Matrix)은
                                Pro 티어에서 제공됩니다.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                                <FeatureItem label="종합 점수 + 등급" tier="marvis" />
                                <FeatureItem label="핵심 권고 3개" tier="marvis" />
                                <FeatureItem label="AI 5 플랫폼 노출 진단" tier="pro" />
                                <FeatureItem label="Trust 4축 (E-E-A-T)" tier="pro" />
                                <FeatureItem label="Schema Generator (14종)" tier="pro" />
                                <FeatureItem label="Trend 시계열 차트" tier="pro" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <SmarCommFooter />
        </div>
    );
}

function FeatureItem({ label, tier }: { label: string; tier: "marvis" | "pro" }) {
    return (
        <div className="flex items-center gap-2">
            {tier === "marvis" ? (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700">
                    <span className="text-[10px] font-bold">M</span>
                </span>
            ) : (
                <Lock size={14} className="text-neutral-400" />
            )}
            <span className={tier === "marvis" ? "text-neutral-900 font-semibold" : "text-neutral-500"}>
                {label}
            </span>
        </div>
    );
}
