"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Save, CheckCircle2, BookOpen, Clock } from "lucide-react";

const RED = "#E53935";

interface Reflection {
    id: string;
    month: string;
    q1: string | null;
    q2: string | null;
    q3: string | null;
    q4: string | null;
    q5: string | null;
    updated_at: string;
}

const QUESTIONS = [
    {
        key: "q1" as const,
        label: "이번 달 가장 잘한 것",
        placeholder: "스스로 칭찬할 행동, 성과, 결정을 적어보세요.",
        emoji: "🏆",
    },
    {
        key: "q2" as const,
        label: "이번 달 가장 크게 배운 것",
        placeholder: "새로 알게 된 것, 깨달은 것, 관점이 바뀐 것.",
        emoji: "💡",
    },
    {
        key: "q3" as const,
        label: "아쉬웠던 점 · 다음엔 어떻게?",
        placeholder: "실수나 아쉬운 점을 솔직하게, 그리고 개선 방법까지.",
        emoji: "🔧",
    },
    {
        key: "q4" as const,
        label: "다음 달 핵심 목표 하나",
        placeholder: "측정 가능하고 구체적인 목표 한 가지.",
        emoji: "🎯",
    },
    {
        key: "q5" as const,
        label: "이달의 나에게 한마디",
        placeholder: "격려, 다짐, 또는 미래의 나에게 전하고 싶은 말.",
        emoji: "💬",
    },
] as const;

type QKey = "q1" | "q2" | "q3" | "q4" | "q5";

function toMonthLabel(month: string) {
    const [y, m] = month.split("-");
    return `${y}년 ${parseInt(m)}월`;
}

function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}

function offsetMonth(base: string, delta: number): string {
    const [y, m] = base.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function ReflectionTab({ memberId }: { memberId: string }) {
    const [month, setMonth] = useState(currentMonth());
    const [answers, setAnswers] = useState<Record<QKey, string>>({ q1: "", q2: "", q3: "", q4: "", q5: "" });
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<Pick<Reflection, "month" | "updated_at">[]>([]);
    const [savedToast, setSavedToast] = useState(false);

    const loadMonth = useCallback(async (m: string) => {
        setLoading(true);
        setSaved(false);
        try {
            const r = await fetch(`/api/hero/reflections?memberId=${memberId}&month=${m}`);
            if (r.ok) {
                const { item } = await r.json() as { item: Reflection | null };
                if (item) {
                    setAnswers({ q1: item.q1 ?? "", q2: item.q2 ?? "", q3: item.q3 ?? "", q4: item.q4 ?? "", q5: item.q5 ?? "" });
                    setSaved(true);
                } else {
                    setAnswers({ q1: "", q2: "", q3: "", q4: "", q5: "" });
                }
            }
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    useEffect(() => { loadMonth(month); }, [month, loadMonth]);

    // 히스토리 목록 로드 (한 번만)
    useEffect(() => {
        fetch(`/api/hero/reflections?memberId=${memberId}`)
            .then(r => r.json())
            .then(({ items }: { items: Reflection[] }) => {
                setHistory(items.map(i => ({ month: i.month, updated_at: i.updated_at })));
            })
            .catch(() => {});
    }, [memberId]);

    function setAnswer(key: QKey, val: string) {
        setAnswers(prev => ({ ...prev, [key]: val }));
        setSaved(false);
    }

    async function handleSave() {
        if (saving) return;
        setSaving(true);
        try {
            const r = await fetch("/api/hero/reflections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberId, month, ...answers }),
            });
            if (r.ok) {
                setSaved(true);
                setSavedToast(true);
                setTimeout(() => setSavedToast(false), 2500);
                // 히스토리 갱신
                setHistory(prev => {
                    const exists = prev.some(h => h.month === month);
                    if (exists) return prev.map(h => h.month === month ? { ...h, updated_at: new Date().toISOString() } : h);
                    return [{ month, updated_at: new Date().toISOString() }, ...prev];
                });
            }
        } finally {
            setSaving(false);
        }
    }

    const isFuture = month > currentMonth();
    const filledCount = QUESTIONS.filter(q => answers[q.key].trim()).length;

    return (
        <div className="space-y-6">
            {/* 월 선택 헤더 */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMonth(m => offsetMonth(m, -1))}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-neutral-500" />
                        </button>
                        <h3 className="text-lg font-black text-neutral-900 min-w-[120px] text-center">
                            {toMonthLabel(month)}
                        </h3>
                        <button
                            onClick={() => setMonth(m => offsetMonth(m, 1))}
                            disabled={month >= currentMonth()}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4 text-neutral-500" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* 작성 진행률 */}
                        <span className="text-xs text-neutral-400 font-medium">{filledCount}/5</span>

                        {saved && !saving && (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 저장됨
                            </span>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={saving || isFuture || filledCount === 0}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: RED }}
                        >
                            <Save className="w-3.5 h-3.5" />
                            {saving ? "저장 중..." : "저장"}
                        </button>
                    </div>
                </div>

                {savedToast && (
                    <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-center text-sm font-bold text-green-700">
                        회고가 저장되었습니다 ✓
                    </div>
                )}

                {isFuture && (
                    <p className="mt-3 text-xs text-neutral-400 text-center">아직 오지 않은 달은 작성할 수 없습니다.</p>
                )}
            </div>

            {/* 5문항 */}
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-32 bg-neutral-100 rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {QUESTIONS.map((q, idx) => (
                        <div key={q.key} className="bg-white border border-neutral-200 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">{q.emoji}</span>
                                <div>
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-2">
                                        Q{idx + 1}
                                    </span>
                                    <span className="text-sm font-bold text-neutral-900">{q.label}</span>
                                </div>
                                {answers[q.key].trim() && (
                                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto shrink-0" />
                                )}
                            </div>
                            <textarea
                                value={answers[q.key]}
                                onChange={e => setAnswer(q.key, e.target.value)}
                                placeholder={q.placeholder}
                                disabled={isFuture}
                                maxLength={500}
                                rows={3}
                                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl resize-none focus:outline-none focus:border-[#E53935] disabled:bg-neutral-50 disabled:text-neutral-400 transition-colors leading-relaxed"
                            />
                            <div className="text-right text-[11px] text-neutral-300 mt-1">
                                {answers[q.key].length}/500
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 지난 회고 히스토리 */}
            {history.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4" style={{ color: RED }} />
                        <h4 className="text-sm font-bold text-neutral-700">지난 회고</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {history.map(h => (
                            <button
                                key={h.month}
                                onClick={() => setMonth(h.month)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    h.month === month
                                        ? "text-white"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                                style={h.month === month ? { backgroundColor: RED } : undefined}
                            >
                                {toMonthLabel(h.month)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {history.length === 0 && !loading && (
                <div className="text-center py-10 border border-dashed border-neutral-200 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">첫 월간 회고를 작성해보세요.</p>
                    <p className="text-xs text-neutral-300 mt-1">매달 5문항으로 성장을 기록합니다.</p>
                </div>
            )}
        </div>
    );
}
