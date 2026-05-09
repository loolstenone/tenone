"use client";

// AI 코치 — Stitch 디자인 (세션 122)
// Daily Briefing 카드 + Weekly Balance 차트 + Recent Capsules
// 자유 채팅·자연어 질의는 /myverse/app/ask로 일원화 (세션 119 IA)

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PlannerBriefing } from "@/lib/myverse/types";
import { LaneSubNav, AI_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

const ACCENT = "#6366F1";
const ACCENT_DARK = "#4F46E5";
const ACCENT_SOFT = "#EEF0FF";

const DOMAIN_META: Record<string, { label: string; color: string }> = {
    body:     { label: "Body",   color: "#10B981" },
    work:     { label: "Work",   color: "#3B82F6" },
    study:    { label: "Study",  color: "#A855F7" },
    daily:    { label: "Daily",  color: "#F59E0B" },
    schedule: { label: "Sched",  color: "#0F766E" },
    travel:   { label: "Travel", color: "#EC4899" },
    move:     { label: "Move",   color: "#6B7280" },
    relation: { label: "Relate", color: "#EF4444" },
};
const DOMAIN_KEYS = ["body", "work", "study", "daily", "schedule", "travel", "move", "relation"];

interface Capsule {
    id: string;
    title: string | null;
    open_at: string;
    opened_at: string | null;
    image_urls?: string[] | null;
    status?: "pending" | "ready" | "opened";
}

type BriefingType = "morning" | "midday" | "evening";
const TYPE_LABEL: Record<BriefingType, string> = {
    morning: "아침 브리핑",
    midday:  "중간 점검",
    evening: "저녁 정리",
};

function inferType(): BriefingType {
    const h = (new Date().getUTCHours() + 9) % 24;
    if (h >= 4 && h < 12) return "morning";
    if (h >= 12 && h < 18) return "midday";
    return "evening";
}

function todayKST(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
}

function daysAgoKST(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(d);
}

export default function CoachPage() {
    const [briefings, setBriefings] = useState<PlannerBriefing[]>([]);
    const [domainCounts, setDomainCounts] = useState<Record<string, number>>({});
    const [capsules, setCapsules] = useState<Capsule[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const today = useMemo(todayKST, []);
    const suggested = useMemo(inferType, []);

    async function load(silent = false) {
        if (!silent) setLoading(true);
        try {
            const from = daysAgoKST(7);
            const [bRes, mRes, cRes] = await Promise.all([
                fetch("/api/myverse/briefing"),
                fetch(`/api/myverse/moments?from=${from}&to=${today}`),
                fetch("/api/myverse/capsules"),
            ]);
            if (bRes.ok) {
                const j = await bRes.json();
                setBriefings(j.briefings ?? []);
            }
            if (mRes.ok) {
                const j = await mRes.json();
                const moments = (j.moments ?? j.items ?? []) as Array<{ domain: string | null }>;
                const counts: Record<string, number> = {};
                DOMAIN_KEYS.forEach(k => { counts[k] = 0; });
                moments.forEach(m => {
                    const d = (m.domain ?? "daily") as string;
                    if (counts[d] !== undefined) counts[d]++;
                });
                setDomainCounts(counts);
            }
            if (cRes.ok) {
                const j = await cRes.json();
                setCapsules((j.capsules ?? j.items ?? []).slice(0, 3));
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

    async function generate(type: BriefingType | "auto") {
        setGenerating(true);
        try {
            const res = await fetch("/api/myverse/briefing/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, date: today }),
            });
            if (res.ok) await load(true);
            else {
                const err = await res.json();
                alert(`브리핑 생성 실패: ${err.message ?? err.error}`);
            }
        } finally {
            setGenerating(false);
        }
    }

    const todayBriefing = useMemo(() => {
        const sorted = briefings
            .filter(b => b.briefing_date === today)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return sorted[0] ?? briefings[0];
    }, [briefings, today]);

    const totalCount = Object.values(domainCounts).reduce((a, b) => a + b, 0);
    const maxCount = Math.max(...Object.values(domainCounts), 1);

    return (
        <div className="bg-neutral-50 myverse-dark:bg-[#08080E] min-h-screen pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <LaneSubNav tabs={AI_LANE_TABS} />

            <main className="max-w-5xl mx-auto px-5 md:px-10 py-8 space-y-8">
                {/* ── Hero Briefing Card ───────────────────────────────────── */}
                <section>
                    <div
                        className="bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden border border-neutral-100"
                        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}
                    >
                        <div
                            className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                            style={{ backgroundColor: `${ACCENT}14` }}
                        />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="space-y-3 max-w-2xl">
                                <div className="flex items-center gap-2" style={{ color: ACCENT }}>
                                    <span
                                        className="material-symbols-outlined text-xl"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        auto_awesome
                                    </span>
                                    <span className="text-[11px] font-semibold uppercase tracking-widest">
                                        {todayBriefing ? `${TYPE_LABEL[todayBriefing.briefing_type as BriefingType] ?? "오늘의 브리핑"}` : "오늘의 브리핑"}
                                    </span>
                                </div>
                                {(() => {
                                    const c = todayBriefing?.content ?? "";
                                    const split = c.match(/^(.{1,80}?[.!?。…\n])(.*)/s);
                                    const head = (split?.[1] ?? c).trim();
                                    const rest = (split?.[2] ?? "").trim();
                                    return (
                                        <>
                                            <h2
                                                className="text-[22px] md:text-[26px] font-medium text-neutral-900 leading-snug"
                                                style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                                            >
                                                {head || "오늘의 브리핑이 아직 없어요"}
                                            </h2>
                                            {rest ? (
                                                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                                                    {rest.slice(0, 360)}{rest.length > 360 && "…"}
                                                </p>
                                            ) : !todayBriefing && (
                                                <p className="text-sm text-neutral-500 leading-relaxed">
                                                    지금 시각에 맞춘 브리핑을 아래 버튼으로 받아 보세요. 흔적·일정·기록을 종합해 짧게 정리해 드립니다.
                                                </p>
                                            )}
                                        </>
                                    );
                                })()}
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <button
                                        onClick={() => generate("auto")}
                                        disabled={generating}
                                        className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase text-white disabled:opacity-50 transition-all active:scale-95"
                                        style={{ backgroundColor: ACCENT }}
                                    >
                                        {generating ? "생성 중…" : `지금 ${TYPE_LABEL[suggested]} 받기`}
                                    </button>
                                    {(["morning", "midday", "evening"] as BriefingType[]).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => generate(t)}
                                            disabled={generating}
                                            className="px-3 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                                        >
                                            {TYPE_LABEL[t]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {totalCount > 0 && (
                                <div
                                    className="flex flex-col items-center justify-center p-5 rounded-2xl min-w-[120px] shrink-0"
                                    style={{ backgroundColor: ACCENT_SOFT }}
                                >
                                    <span
                                        className="text-[40px] font-semibold leading-none tabular-nums"
                                        style={{ color: ACCENT, fontFamily: "'Hanken Grotesk', sans-serif" }}
                                    >
                                        {totalCount}
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase tracking-widest mt-2" style={{ color: ACCENT }}>
                                        7일 흔적
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Weekly Balance ──────────────────────────────────────── */}
                <section>
                    <div
                        className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100"
                        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}
                    >
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <h3
                                    className="text-[18px] font-medium text-neutral-900"
                                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                                >
                                    Weekly Balance
                                </h3>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    지난 7일 흔적의 9영역 분포 · 총 {totalCount}건
                                </p>
                            </div>
                            <Link
                                href="/myverse/app/insights"
                                className="text-xs font-semibold tracking-wider uppercase hover:underline"
                                style={{ color: ACCENT }}
                            >
                                인사이트 →
                            </Link>
                        </div>
                        <div className="flex items-end justify-between gap-2 md:gap-3 h-40">
                            {DOMAIN_KEYS.map(key => {
                                const meta = DOMAIN_META[key];
                                const count = domainCounts[key] ?? 0;
                                const pct = (count / maxCount) * 100;
                                return (
                                    <div key={key} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                                        <div className="w-full flex-1 flex items-end relative group">
                                            <div
                                                className="w-full rounded-t-lg transition-all duration-500"
                                                style={{
                                                    height: `${Math.max(pct, 4)}%`,
                                                    backgroundColor: count > 0 ? meta.color : "#E5E7EB",
                                                    opacity: count > 0 ? 1 : 0.4,
                                                }}
                                                title={`${meta.label}: ${count}건`}
                                            />
                                            {count > 0 && (
                                                <span
                                                    className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold tabular-nums"
                                                    style={{ color: meta.color }}
                                                >
                                                    {count}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-neutral-400 truncate w-full text-center">
                                            {meta.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── Recent Capsules ─────────────────────────────────────── */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3
                            className="text-[18px] font-medium text-neutral-900"
                            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                        >
                            Recent Capsules
                        </h3>
                        <Link
                            href="/myverse/app/capsules"
                            className="text-xs font-semibold tracking-wider uppercase hover:underline"
                            style={{ color: ACCENT }}
                        >
                            전체 보기
                        </Link>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="aspect-[4/3] rounded-2xl bg-neutral-100 animate-pulse" />
                            ))}
                        </div>
                    ) : capsules.length === 0 ? (
                        <Link
                            href="/myverse/app/capsules"
                            className="block bg-white rounded-2xl p-8 text-center text-sm text-neutral-500 border border-dashed border-neutral-200 hover:border-neutral-300"
                        >
                            <span className="material-symbols-outlined text-3xl text-neutral-400 block mb-2">
                                redeem
                            </span>
                            <span className="font-medium">미래의 나에게 첫 캡슐을 남겨 보세요</span>
                        </Link>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {capsules.map(c => (
                                <Link
                                    key={c.id}
                                    href={`/myverse/app/capsules?id=${c.id}`}
                                    className="aspect-[4/3] rounded-2xl bg-white overflow-hidden relative group border border-neutral-100"
                                    style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}
                                >
                                    {c.image_urls?.[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={c.image_urls[0]}
                                            alt={c.title ?? ""}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            style={{ backgroundColor: ACCENT_SOFT }}
                                        >
                                            <span
                                                className="material-symbols-outlined text-5xl"
                                                style={{ color: ACCENT, fontVariationSettings: "'FILL' 1" }}
                                            >
                                                redeem
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-5">
                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80 mb-1">
                                            {c.status === "ready" ? "✓ 열 수 있어요" : c.status === "opened" ? "열어 본 캡슐" : `D-${Math.max(0, Math.ceil((new Date(c.open_at).getTime() - Date.now()) / 86400000))}`}
                                        </span>
                                        <h4
                                            className="text-white font-medium leading-snug line-clamp-2"
                                            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                                        >
                                            {c.title || "(제목 없음)"}
                                        </h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <p className="text-[11px] text-neutral-400 text-center">
                    이메일·푸시 알림은{" "}
                    <Link href="/myverse/app/settings" className="underline hover:text-neutral-700">설정</Link>
                    에서 켤 수 있습니다.
                </p>
            </main>
        </div>
    );
}
