"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowLeft, Sparkles, Lock, AlertCircle } from "lucide-react";
import SmarCommHeader from "@/features/smarcomm/SmarCommHeader";
import SmarCommFooter from "@/features/smarcomm/SmarCommFooter";

// ──────────────────────────────────────────────
// Marvis 라이트 진단 — 기존 SmarComm Index 엔진(/api/smarcomm/scan) 재사용.
// 사용자가 URL 입력 → /smarcomm/scan?url=...&from=marvis 로 위임 → /smarcomm/report/[id] 로 결과.
// 결과 페이지에서 from=marvis 감지 시 라이트 라벨 적용 예정.
// ──────────────────────────────────────────────

export default function MarvisScanPage() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");

    function normalizeUrl(raw: string): string | null {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        const withScheme = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
        try {
            const u = new URL(withScheme);
            if (!u.hostname.includes(".")) return null;
            return withScheme;
        } catch {
            return null;
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        const normalized = normalizeUrl(url);
        if (!normalized) {
            setError("유효한 쇼핑몰 URL을 입력해주세요 (예: https://yourshop.com)");
            return;
        }
        router.push(`/smarcomm/scan?url=${encodeURIComponent(normalized)}&from=marvis`);
    }

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

                <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-6 mb-6">
                    <label className="block text-[12px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
                        쇼핑몰 URL
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            inputMode="url"
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); if (error) setError(""); }}
                            placeholder="https://yourshop.com"
                            className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-[14px] focus:outline-none focus:border-neutral-900 placeholder:text-neutral-400"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!url.trim()}
                            className="rounded-xl bg-neutral-900 px-5 py-3 text-[13px] font-bold text-white hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                        >
                            진단 시작
                        </button>
                    </div>
                    {error && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    <p className="mt-2 text-[11px] text-neutral-500">
                        SmarComm Index 엔진을 재사용한 라이트 진단입니다. 풀 진단(Pro)에서는 5 AI 플랫폼·Schema Generator·Trend가 추가됩니다.
                    </p>
                </form>

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
