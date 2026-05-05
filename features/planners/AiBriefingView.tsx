"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Sun, Sunrise, Moon, Loader2, Send } from "lucide-react";
import type { PlannerBriefing } from "@/lib/myverse/types";
import { Track } from "@/lib/analytics";

type BriefingType = "morning" | "midday" | "evening";

const TYPE_META: Record<BriefingType, { label: string; greet: string; icon: typeof Sun; color: string; bg: string }> = {
    morning: { label: "아침 브리핑", greet: "오늘을 시작합시다", icon: Sunrise, color: "text-amber-500", bg: "bg-amber-50" },
    midday:  { label: "중간 점검",   greet: "오전을 짚어 봅시다", icon: Sun,     color: "text-emerald-500", bg: "bg-emerald-50" },
    evening: { label: "저녁 정리",   greet: "오늘을 정리합시다", icon: Moon,    color: "text-indigo-400", bg: "bg-indigo-50" },
};

function inferType(now = new Date()): BriefingType {
    const hour = (now.getUTCHours() + 9) % 24; // KST
    if (hour >= 4 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "midday";
    return "evening";
}

interface ChatMessage {
    id: string;
    role: "ai" | "user";
    type?: BriefingType;
    content: string;
    timestamp: string;
}

export function AiBriefingView() {
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
        const res = await fetch(`/api/myverse/briefing`);
        if (res.ok) {
            const d = await res.json();
            setBriefings(d.briefings || []);
        }
        if (!silent) setLoading(false);
    }

    useEffect(() => { load(); }, []);

    // 스크롤 자동 하단
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [briefings.length, generating]);

    async function generate(type: BriefingType | "auto") {
        setGenerating(true);
        const startedAt = Date.now();
        try {
            const res = await fetch(`/api/myverse/briefing/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, date: today }),
            });
            const duration_ms = Date.now() - startedAt;
            if (res.ok) {
                const d = await res.json();
                Track.briefingGenerate({ kind: d.type ?? type, duration_ms, success: true });
                await load(true);
            } else {
                Track.briefingGenerate({ kind: typeof type === "string" ? type : "auto", duration_ms, success: false });
                const err = await res.json();
                alert(`브리핑 생성 실패: ${err.message || err.error}`);
            }
        } finally {
            setGenerating(false);
        }
    }

    const todayBriefings = briefings.filter(b => b.briefing_date === today)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const past = briefings.filter(b => b.briefing_date !== today);
    const pastByDate = useMemo(() => {
        const grouped: Record<string, PlannerBriefing[]> = {};
        past.forEach(b => { (grouped[b.briefing_date] = grouped[b.briefing_date] || []).push(b); });
        return grouped;
    }, [past]);
    const pastDates = Object.keys(pastByDate).sort().reverse();

    const messages: ChatMessage[] = todayBriefings.map(b => ({
        id: b.id,
        role: "ai",
        type: b.briefing_type as BriefingType,
        content: b.content,
        timestamp: b.created_at,
    }));

    const Greet = TYPE_META[suggested].icon;

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            <header className="flex items-center gap-2.5 mb-5">
                <Sparkles className="h-5 w-5 text-[#6366F1]" />
                <h1 className="font-serif text-2xl md:text-3xl text-neutral-900">AI 브리핑</h1>
            </header>

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm flex flex-col h-[calc(100vh-12rem)] min-h-[480px]">
                    {/* Chat thread */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
                        {/* Welcome */}
                        {messages.length === 0 && (
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

                        {messages.map(m => {
                            const meta = m.type ? TYPE_META[m.type] : TYPE_META[suggested];
                            const Icon = meta.icon;
                            return (
                                <div key={m.id} className="flex gap-2.5">
                                    <div className={`shrink-0 w-7 h-7 rounded-full ${meta.bg} flex items-center justify-center mt-0.5`}>
                                        <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                                            {meta.label} · {new Date(m.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                        <div className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
                                            {m.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {generating && (
                            <div className="flex gap-2.5">
                                <div className="shrink-0 w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center mt-0.5">
                                    <Loader2 className="h-3.5 w-3.5 text-neutral-500 animate-spin" />
                                </div>
                                <p className="text-sm text-neutral-400 mt-1.5 italic">AI가 생각 중…</p>
                            </div>
                        )}

                        {/* History toggle */}
                        {pastDates.length > 0 && (
                            <div className="pt-2">
                                <button
                                    onClick={() => setShowHistory(s => !s)}
                                    className="text-[11px] text-neutral-400 hover:text-neutral-700"
                                >
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

                    {/* Action bar — 시간대 자동 + 전체 타입 선택 */}
                    <div className="border-t border-neutral-100 px-3 md:px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                            <button
                                onClick={() => generate("auto")}
                                disabled={generating}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg text-sm font-medium hover:bg-[#4F46E5] transition-colors disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                                지금 시각에 맞춰 브리핑 받기 <span className="text-[10px] opacity-80">({TYPE_META[suggested].label})</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-neutral-400 mr-1">또는</span>
                            {(["morning", "midday", "evening"] as BriefingType[]).map(t => {
                                const meta = TYPE_META[t];
                                const Icon = meta.icon;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => generate(t)}
                                        disabled={generating}
                                        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
                                    >
                                        <Icon className={`h-3 w-3 ${meta.color}`} />
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-2 italic">
                            이메일/푸시는 <Link href="/myverse/app/settings" className="underline hover:text-neutral-700">설정</Link>에서 따로 켤 수 있습니다.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
