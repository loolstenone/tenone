"use client";

// 영혼의 단짝 인사이트 카드 — 1일 최대 2개, dismiss 가능, 반응 기록.
// 사용처: Coach 페이지, Lifestyle(일상) 상단, Today.

import { useEffect, useState } from "react";
import { Sparkles, X, Heart, ThumbsUp, Loader2 } from "lucide-react";

interface Insight {
    id: string;
    kind: string;
    body: string;
    created_at: string;
    reaction: string | null;
}

const KIND_LABEL: Record<string, string> = {
    pattern: "패턴",
    mood: "기분",
    discovery: "발견",
    routine: "루틴",
};

export function CoachInsightCard({ autoGenerate = true, compact = false }: { autoGenerate?: boolean; compact?: boolean }) {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [empty, setEmpty] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch("/api/myverse/coach/insights");
            if (res.ok) {
                const d = await res.json();
                setInsights(d.insights ?? []);
            }
        } finally {
            setLoading(false);
        }
    }

    async function generate() {
        setGenerating(true);
        try {
            const res = await fetch("/api/myverse/coach/insights", { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                setInsights(d.insights ?? []);
                setEmpty(d.empty === true || (d.insights ?? []).length === 0);
            }
        } finally {
            setGenerating(false);
        }
    }

    useEffect(() => {
        (async () => {
            await load();
        })();
    }, []);

    useEffect(() => {
        if (!autoGenerate || loading) return;
        if (insights.length === 0 && !empty && !generating) {
            void generate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

    async function dismiss(id: string) {
        setInsights(arr => arr.filter(x => x.id !== id));
        await fetch(`/api/myverse/coach/insights/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dismiss: true }),
        });
    }

    async function react(id: string, reaction: "helpful" | "loved") {
        setInsights(arr => arr.map(x => x.id === id ? { ...x, reaction } : x));
        await fetch(`/api/myverse/coach/insights/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reaction }),
        });
    }

    if (loading) {
        return (
            <div className={compact ? "px-2 py-3" : "px-4 py-6"}>
                <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
            </div>
        );
    }

    if (insights.length === 0) {
        if (empty) return null;
        return (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white px-4 py-3 flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
                <p className="text-xs text-neutral-600 flex-1">최근 흔적을 보고 한 마디 적어볼게.</p>
                <button onClick={generate} disabled={generating}
                    className="text-xs px-3 py-1 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40">
                    {generating ? "보는 중…" : "받기"}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {insights.map(ins => (
                <div key={ins.id}
                    className="group rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white px-4 py-3 relative">
                    <div className="flex items-start gap-3">
                        <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center mt-0.5">
                            <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                            <p className="text-[10px] uppercase tracking-widest text-indigo-400 mb-0.5">
                                영혼의 단짝 · {KIND_LABEL[ins.kind] ?? ins.kind}
                            </p>
                            <p className="text-sm text-neutral-800 leading-relaxed">{ins.body}</p>
                            <div className="flex items-center gap-1 mt-2">
                                <button onClick={() => react(ins.id, "helpful")}
                                    className={`p-1 rounded-full hover:bg-indigo-100 ${ins.reaction === "helpful" ? "text-indigo-500" : "text-neutral-300"}`}
                                    title="도움 됨">
                                    <ThumbsUp className="h-3 w-3" />
                                </button>
                                <button onClick={() => react(ins.id, "loved")}
                                    className={`p-1 rounded-full hover:bg-rose-100 ${ins.reaction === "loved" ? "text-rose-500" : "text-neutral-300"}`}
                                    title="좋아">
                                    <Heart className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                        <button onClick={() => dismiss(ins.id)}
                            className="absolute top-2.5 right-2.5 p-1 rounded-full text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="닫기">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
