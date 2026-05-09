"use client";

// AI 코치 페이지 — 브리핑 + 주간 리포트
// 자유 채팅·자연어 질의는 /myverse/app/ask 로 일원화 (세션 119 IA 정리)

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Sun, Sunrise, Moon, Loader2, Send } from "lucide-react";
import Link from "next/link";
import type { PlannerBriefing } from "@/lib/myverse/types";
import { CoachInsightCard } from "@/features/myverse/app/CoachInsightCard";
import { WeeklyReportView } from "@/features/myverse/app/WeeklyReportView";
import { LaneSubNav, AI_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

// ── 브리핑 타입 ────────────────────────────────────────────────
type BriefingType = "morning" | "midday" | "evening";

const TYPE_META: Record<BriefingType, { label: string; greet: string; icon: typeof Sun; color: string; bg: string }> = {
    morning: { label: "아침 브리핑", greet: "오늘을 시작합시다",   icon: Sunrise, color: "text-amber-500",   bg: "bg-amber-50" },
    midday:  { label: "중간 점검",   greet: "오전을 짚어 봅시다", icon: Sun,     color: "text-emerald-500", bg: "bg-emerald-50" },
    evening: { label: "저녁 정리",   greet: "오늘을 정리합시다",  icon: Moon,    color: "text-indigo-400",  bg: "bg-indigo-50" },
};

function inferType(): BriefingType {
    const hour = (new Date().getUTCHours() + 9) % 24;
    if (hour >= 4 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "midday";
    return "evening";
}

export default function CoachPage() {
    const [tab, setTab] = useState<"briefing" | "weekly">("briefing");

    return (
        <div className="flex flex-col h-[calc(100vh-3rem)]">
            <LaneSubNav tabs={AI_LANE_TABS} />
            {/* 헤더 */}
            <header className="px-6 pt-4 pb-0 border-b border-neutral-200 bg-white shrink-0">
                <h1 className="text-xl font-serif text-neutral-900">AI 코치</h1>
                <p className="text-xs text-neutral-500 mt-0.5 mb-3">묻지 않아도 먼저 보내는 일일 브리핑·주간 리포트</p>
                {/* 탭 — 채팅 제거 (ask로 일원화) */}
                <div className="flex gap-0">
                    {[
                        { key: "briefing" as const, label: "브리핑" },
                        { key: "weekly" as const,   label: "주간 리포트" },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                tab === t.key
                                    ? "border-[#6366F1] text-[#6366F1]"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </header>

            {tab === "briefing" && <BriefingTab />}
            {tab === "weekly" && (
                <div className="flex-1 overflow-y-auto">
                    <WeeklyReportView />
                </div>
            )}
        </div>
    );
}

// ── 브리핑 탭 ─────────────────────────────────────────────────
function BriefingTab() {
    const [briefings, setBriefings] = useState<PlannerBriefing[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const today = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }, []);
    const suggested = useMemo(() => inferType(), []);

    async function load(silent = false) {
        if (!silent) setLoading(true);
        try {
            const res = await fetch("/api/myverse/briefing");
            if (res.ok) {
                const d = await res.json();
                setBriefings(d.briefings ?? []);
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [briefings.length, generating]);

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

    const todayBriefings = briefings
        .filter(b => b.briefing_date === today)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const past = briefings.filter(b => b.briefing_date !== today);
    const pastByDate = useMemo(() => {
        const g: Record<string, PlannerBriefing[]> = {};
        past.forEach(b => { (g[b.briefing_date] = g[b.briefing_date] ?? []).push(b); });
        return g;
    }, [past]);
    const pastDates = Object.keys(pastByDate).sort().reverse();
    const Greet = TYPE_META[suggested].icon;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                </div>
            ) : (
                <>
                    {/* 채팅 영역 */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 max-w-2xl w-full mx-auto">
                        {/* 영혼의 단짝 — 관찰 인사이트 카드 */}
                        <CoachInsightCard />

                        {todayBriefings.length === 0 && (
                            <div className={`rounded-xl p-5 ${TYPE_META[suggested].bg} border border-neutral-100`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Greet className={`h-4 w-4 ${TYPE_META[suggested].color}`} />
                                    <p className={`text-xs font-semibold ${TYPE_META[suggested].color} tracking-wider uppercase`}>
                                        {TYPE_META[suggested].label}
                                    </p>
                                </div>
                                <p className="text-sm text-neutral-800 leading-relaxed">
                                    {TYPE_META[suggested].greet}. 오늘의 컨텍스트를 모아 함께 이야기해 볼까요?
                                </p>
                            </div>
                        )}

                        {todayBriefings.map(b => {
                            const meta = TYPE_META[b.briefing_type as BriefingType] ?? TYPE_META[suggested];
                            const Icon = meta.icon;
                            return (
                                <div key={b.id} className="flex gap-3">
                                    <div className={`shrink-0 w-8 h-8 rounded-full ${meta.bg} flex items-center justify-center mt-0.5`}>
                                        <Icon className={`h-4 w-4 ${meta.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
                                            {meta.label} · {new Date(b.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                        <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
                                            {b.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {generating && (
                            <div className="flex gap-3">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white flex items-center justify-center">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-neutral-200">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6366F1]" />
                                        <span className="text-xs text-neutral-500">AI가 브리핑을 작성 중…</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {pastDates.length > 0 && (
                            <div className="pt-2 border-t border-neutral-100">
                                <button onClick={() => setShowHistory(s => !s)}
                                    className="text-[11px] text-neutral-400 hover:text-neutral-700">
                                    {showHistory ? "지난 브리핑 숨기기" : `지난 브리핑 ${past.length}건 보기`}
                                </button>
                                {showHistory && (
                                    <div className="mt-3 space-y-3">
                                        {pastDates.map(d => (
                                            <div key={d} className="border-l-2 border-neutral-200 pl-3">
                                                <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">{d}</p>
                                                {pastByDate[d].map(b => {
                                                    const meta = TYPE_META[b.briefing_type as BriefingType];
                                                    const Icon = meta.icon;
                                                    return (
                                                        <details key={b.id} className="mb-1.5">
                                                            <summary className="text-xs text-neutral-600 cursor-pointer flex items-center gap-1.5 hover:text-neutral-900">
                                                                <Icon className={`h-3 w-3 ${meta.color}`} />
                                                                {meta.label}
                                                            </summary>
                                                            <div className="mt-1.5 text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed pl-4">
                                                                {b.content}
                                                            </div>
                                                        </details>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 액션 바 */}
                    <div className="border-t border-neutral-200 bg-white px-4 py-3 max-w-2xl w-full mx-auto shrink-0">
                        <button onClick={() => generate("auto")} disabled={generating}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-xl text-sm font-medium hover:bg-[#4F46E5] disabled:opacity-50 mb-2">
                            <Send className="h-4 w-4" />
                            지금 시각에 맞춰 브리핑 받기
                            <span className="text-[10px] opacity-80">({TYPE_META[suggested].label})</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-neutral-400 mr-1">또는</span>
                            {(["morning", "midday", "evening"] as BriefingType[]).map(t => {
                                const meta = TYPE_META[t];
                                const Icon = meta.icon;
                                return (
                                    <button key={t} onClick={() => generate(t)} disabled={generating}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 border border-neutral-200">
                                        <Icon className={`h-3 w-3 ${meta.color}`} />
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-2">
                            이메일·푸시 알림은{" "}
                            <Link href="/myverse/app/settings" className="underline hover:text-neutral-700">설정</Link>에서 켤 수 있습니다.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

