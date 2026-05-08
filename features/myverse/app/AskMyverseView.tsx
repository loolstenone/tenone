"use client";

// Ask Myverse — 자연어로 자기 흔적에 질문하는 채팅형 뷰

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2, MapPin, Calendar } from "lucide-react";
import { DOMAINS, type DomainKey } from "@/lib/myverse/domains";

interface Cited {
    id: string;
    date: string;
    domain: DomainKey | null;
    media_type: string;
    media_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    location: string | null;
}

interface Turn {
    question: string;
    answer: string;
    cited: Cited[];
    keywords: string[];
    total_searched: number;
    error?: string;
}

const SUGGESTIONS = [
    "지난 주말에 뭐 했지?",
    "최근에 운동한 사진 보여줘",
    "올해 가장 많이 간 곳은?",
    "친구랑 같이 찍은 흔적은?",
    "지난 달의 인상 깊은 순간은?",
];

export function AskMyverseView() {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [turns, setTurns] = useState<Turn[]>([]);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [turns, loading]);

    async function ask(q?: string) {
        const target = (q ?? question).trim();
        if (!target || loading) return;
        setLoading(true);
        setQuestion("");
        try {
            const res = await fetch("/api/myverse/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: target }),
            });
            const data = await res.json();
            if (!res.ok) {
                setTurns(prev => [...prev, { question: target, answer: "", cited: [], keywords: [], total_searched: 0, error: data.error || "응답 실패" }]);
                return;
            }
            setTurns(prev => [...prev, {
                question: target,
                answer: data.answer,
                cited: data.cited ?? [],
                keywords: data.keywords ?? [],
                total_searched: data.total_searched ?? 0,
            }]);
        } catch (e) {
            setTurns(prev => [...prev, { question: target, answer: "", cited: [], keywords: [], total_searched: 0, error: (e as Error).message }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8 flex flex-col h-[calc(100vh-3rem-3.5rem)] sm:h-[calc(100vh-3rem)]">
            {/* 헤더 */}
            <div className="mb-4 shrink-0">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    ASK MYVERSE
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
                    내 디지털 분신에게 묻기
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                    그동안 쌓인 흔적·일정·기록을 한 줄 질문으로 불러옵니다
                </p>
            </div>

            {/* 대화 영역 */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto -mx-2 px-2 pb-4 space-y-6">
                {turns.length === 0 && (
                    <div className="space-y-3">
                        <p className="text-xs text-neutral-400 uppercase tracking-widest">예시 질문</p>
                        <div className="flex flex-wrap gap-1.5">
                            {SUGGESTIONS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => ask(s)}
                                    disabled={loading}
                                    className="px-3 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-full hover:border-[#6366F1] hover:text-[#6366F1] transition-colors disabled:opacity-50"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {turns.map((t, i) => (
                    <div key={i} className="space-y-3">
                        {/* 질문 */}
                        <div className="flex justify-end">
                            <div className="max-w-[80%] px-4 py-2.5 bg-[#6366F1] text-white text-sm rounded-2xl rounded-tr-sm">
                                {t.question}
                            </div>
                        </div>
                        {/* 답변 */}
                        <div className="flex items-start gap-2">
                            <div className="h-7 w-7 rounded-full bg-[#6366F1]/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkles className="h-3.5 w-3.5 text-[#6366F1]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                {t.error ? (
                                    <p className="text-sm text-rose-600">⚠ {t.error}</p>
                                ) : (
                                    <>
                                        <p className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">{t.answer}</p>
                                        {t.cited.length > 0 && (
                                            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
                                                {t.cited.map(c => <CitedTile key={c.id} c={c} />)}
                                            </div>
                                        )}
                                        <p className="text-[10px] text-neutral-400 mt-2">
                                            {t.total_searched}건 중 {t.cited.length}건 인용
                                            {t.keywords.length > 0 && ` · 키워드: ${t.keywords.join(", ")}`}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Loader2 className="h-4 w-4 animate-spin text-[#6366F1]" />
                        흔적을 살펴보는 중…
                    </div>
                )}
            </div>

            {/* 인풋 */}
            <form
                onSubmit={(e) => { e.preventDefault(); ask(); }}
                className="shrink-0 mt-2 flex items-end gap-2 bg-white border border-neutral-200 rounded-2xl p-2 focus-within:border-[#6366F1] transition-colors"
            >
                <textarea
                    ref={inputRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); }
                    }}
                    placeholder="내 흔적에 대해 무엇이든 물어보세요"
                    rows={1}
                    disabled={loading}
                    className="flex-1 min-h-[2.25rem] max-h-32 resize-none px-3 py-2 text-sm bg-transparent text-neutral-800 placeholder:text-neutral-400 focus:outline-none disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!question.trim() || loading}
                    className="shrink-0 h-9 w-9 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white flex items-center justify-center disabled:opacity-30 transition-colors"
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>
        </div>
    );
}

function CitedTile({ c }: { c: Cited }) {
    const domain = c.domain ? DOMAINS[c.domain] : null;
    return (
        <div className="group relative aspect-square rounded-md overflow-hidden bg-neutral-100">
            {c.media_type === "image" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={c.thumbnail_url || c.media_url}
                    alt={c.caption || ""}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <video src={c.media_url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
            )}
            {domain && (
                <span
                    className="absolute top-0.5 right-0.5 text-[7px] font-medium text-white px-1 py-0.5 rounded"
                    style={{ backgroundColor: domain.color_hex }}
                >
                    {domain.label_ko}
                </span>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-1 pt-3 pb-0.5 text-[8px] text-white space-y-0.5">
                <div className="flex items-center gap-0.5">
                    <Calendar className="h-2 w-2" />
                    {c.date.slice(5)}
                </div>
                {c.location && (
                    <div className="flex items-center gap-0.5 truncate">
                        <MapPin className="h-2 w-2" />
                        <span className="truncate">{c.location}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
