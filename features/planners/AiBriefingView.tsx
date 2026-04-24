"use client";

import { useEffect, useState } from "react";
import { Sparkles, Sun, Moon, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import type { PlannerBriefing } from "@/lib/planners/types";
import { trackPlanners } from "@/lib/planners/analytics";

export function AiBriefingView() {
    const [briefings, setBriefings] = useState<PlannerBriefing[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<"morning" | "evening" | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const today = new Date().toISOString().slice(0, 10);

    async function load() {
        setLoading(true);
        const res = await fetch(`/api/planners/briefing`);
        if (res.ok) {
            const d = await res.json();
            setBriefings(d.briefings || []);
            // 오늘치는 자동 펼치기
            const todays = (d.briefings || []).filter((b: PlannerBriefing) => b.briefing_date === today);
            if (todays.length > 0) setExpandedId(todays[0].id);
        }
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function generate(type: "morning" | "evening") {
        setGenerating(type);
        try {
            const res = await fetch(`/api/planners/briefing/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, date: today }),
            });
            if (res.ok) {
                trackPlanners("planners_ai_briefing_generated", { type });
                await load();
            } else {
                const err = await res.json();
                alert(`브리핑 생성 실패: ${err.message || err.error}`);
            }
        } finally {
            setGenerating(null);
        }
    }

    const todayMorning = briefings.find(b => b.briefing_date === today && b.briefing_type === "morning");
    const todayEvening = briefings.find(b => b.briefing_date === today && b.briefing_type === "evening");

    // 날짜별 그룹핑 (오늘 제외)
    const past = briefings.filter(b => b.briefing_date !== today);
    const grouped: Record<string, PlannerBriefing[]> = {};
    past.forEach(b => {
        grouped[b.briefing_date] = grouped[b.briefing_date] || [];
        grouped[b.briefing_date].push(b);
    });
    const pastDates = Object.keys(grouped).sort().reverse();

    return (
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-8 md:py-12">
            <div className="flex items-center gap-3 mb-8">
                <Sparkles className="h-6 w-6 text-[#0F766E]" />
                <h1 className="font-serif text-3xl text-neutral-900">AI Briefing</h1>
            </div>

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="space-y-6">
                    {/* 오늘 */}
                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3">오늘 · {today}</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <BriefingCard
                                type="morning"
                                briefing={todayMorning}
                                onGenerate={() => generate("morning")}
                                generating={generating === "morning"}
                            />
                            <BriefingCard
                                type="evening"
                                briefing={todayEvening}
                                onGenerate={() => generate("evening")}
                                generating={generating === "evening"}
                            />
                        </div>
                    </section>

                    {/* 과거 */}
                    {pastDates.length > 0 && (
                        <section>
                            <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3">이력</h2>
                            <div className="space-y-2">
                                {pastDates.map((d) => (
                                    <div key={d} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                                        <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50">
                                            <p className="text-sm font-medium text-neutral-700">{d}</p>
                                        </div>
                                        <div className="divide-y divide-neutral-100">
                                            {grouped[d].map((b) => (
                                                <div key={b.id}>
                                                    <button
                                                        onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                                                        className="w-full px-5 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left"
                                                    >
                                                        {expandedId === b.id ? (
                                                            <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                                                        ) : (
                                                            <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                                                        )}
                                                        {b.briefing_type === "morning" ? (
                                                            <Sun className="h-3.5 w-3.5 text-amber-500" />
                                                        ) : (
                                                            <Moon className="h-3.5 w-3.5 text-indigo-400" />
                                                        )}
                                                        <span className="text-sm text-neutral-700">
                                                            {b.briefing_type === "morning" ? "아침 브리핑" : "저녁 정리"}
                                                        </span>
                                                    </button>
                                                    {expandedId === b.id && (
                                                        <div className="px-5 pb-4 pt-1">
                                                            <pre className="text-sm text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed">
                                                                {b.content}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

function BriefingCard({
    type,
    briefing,
    onGenerate,
    generating,
}: {
    type: "morning" | "evening";
    briefing: PlannerBriefing | undefined;
    onGenerate: () => void;
    generating: boolean;
}) {
    const isMorning = type === "morning";
    return (
        <div className={`rounded-xl border p-5 ${
            isMorning
                ? "bg-gradient-to-br from-amber-50 to-white border-amber-200"
                : "bg-gradient-to-br from-indigo-50 to-white border-indigo-200"
        }`}>
            <div className="flex items-center gap-2 mb-3">
                {isMorning ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                    <Moon className="h-4 w-4 text-indigo-400" />
                )}
                <h3 className="text-sm font-semibold text-neutral-900">
                    {isMorning ? "아침 브리핑" : "저녁 정리"}
                </h3>
            </div>

            {briefing ? (
                <pre className="text-sm text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {briefing.content}
                </pre>
            ) : (
                <div>
                    <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                        {isMorning
                            ? "오늘의 도모를 AI와 함께 시작해 보세요."
                            : "오늘을 정리하고 내일을 준비합니다."}
                    </p>
                    <button
                        onClick={onGenerate}
                        disabled={generating}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                            isMorning
                                ? "bg-amber-500 text-white hover:bg-amber-600"
                                : "bg-indigo-500 text-white hover:bg-indigo-600"
                        }`}
                    >
                        {generating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> 생성 중…
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" /> 지금 생성
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
