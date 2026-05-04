"use client";

// 마이버스 AI 코칭 — "나와의 대화" 채팅 페이지
// 5가지 추천 질문 + 자유 채팅 + 무료 일일 5회 한도 안내

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Bot, User, Sparkles, Lock } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const SUGGESTED_QUESTIONS = [
    "최근 3개월 가장 생산적인 주는 언제였어?",
    "가장 자주 만난 사람 TOP 5와 만난 후의 패턴은?",
    "어느 장소에서 집중 시간이 가장 길어?",
    "운동·식사 패턴과 업무 시간의 상관은?",
    "최근 2주 어떻게 시간을 썼는지 한 줄 요약해줘",
];

export default function CoachPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [quotaReached, setQuotaReached] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function send(text?: string) {
        const content = (text ?? input).trim();
        if (!content || loading) return;

        const next: Message[] = [...messages, { role: "user", content }];
        setMessages(next);
        setInput("");
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/myverse/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: next, scope: { days: 90 } }),
            });
            const json = await res.json();

            if (res.status === 429) {
                setQuotaReached(true);
                setError(`무료 일일 한도 ${json.limit}회 도달 — ${json.hint ?? "구독 후 무제한"}`);
                return;
            }
            if (!res.ok) {
                setError(json.error ?? `오류: ${res.status}`);
                return;
            }
            setMessages([...next, { role: "assistant", content: json.reply }]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-3rem)]">
            {/* 헤더 */}
            <header className="px-6 py-4 border-b border-neutral-200 bg-white">
                <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-widest text-[#6366F1]">
                    <Sparkles className="h-3 w-3" /> AI Coach
                </div>
                <h1 className="text-xl font-serif text-neutral-900">나와의 대화</h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                    내 마이버스 데이터에 근거해 답합니다 (최근 90일 컨텍스트)
                </p>
            </header>

            {/* 대화 영역 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-2xl w-full mx-auto">
                {messages.length === 0 && (
                    <div className="space-y-3">
                        <div className="bg-gradient-to-br from-[#6366F1]/5 to-[#A855F7]/5 border border-[#6366F1]/10 rounded-2xl p-5 text-center">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white mb-3">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <p className="text-sm text-neutral-700 mb-1">
                                내 디지털 흔적이 답하는 시간
                            </p>
                            <p className="text-xs text-neutral-500">
                                9 영역을 가로지르는 교차 인사이트를 물어보세요
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 px-2">추천 질문</p>
                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => send(q)}
                                    className="w-full text-left text-sm bg-white border border-neutral-200 rounded-lg px-4 py-3 hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            m.role === "user"
                                ? "bg-neutral-200 text-neutral-700"
                                : "bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white"
                        }`}>
                            {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`flex-1 ${m.role === "user" ? "text-right" : ""}`}>
                            <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm ${
                                m.role === "user"
                                    ? "bg-[#6366F1] text-white"
                                    : "bg-white border border-neutral-200 text-neutral-800"
                            }`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white flex items-center justify-center">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-neutral-200">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6366F1]" />
                                <span className="text-xs text-neutral-500">데이터를 분석 중…</span>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-2 text-xs flex items-start gap-2">
                        {quotaReached && <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                        <div className="flex-1">
                            <p>{error}</p>
                            {quotaReached && (
                                <a href="/planners/purchase" className="inline-block mt-1 text-[#6366F1] underline">
                                    구독하기 →
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <div ref={scrollRef} />
            </div>

            {/* 입력 */}
            <div className="border-t border-neutral-200 bg-white px-4 py-3 max-w-2xl w-full mx-auto">
                <div className="flex items-end gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        }}
                        placeholder="질문하기… (Enter 전송 / Shift+Enter 줄바꿈)"
                        rows={1}
                        disabled={quotaReached}
                        className="flex-1 text-sm border border-neutral-200 rounded-xl px-3 py-2 placeholder:text-neutral-300 focus:outline-none focus:border-[#6366F1] resize-none max-h-32 disabled:opacity-50"
                    />
                    <button
                        onClick={() => send()}
                        disabled={loading || !input.trim() || quotaReached}
                        className="p-2 rounded-xl bg-[#6366F1] text-white hover:bg-[#4F46E5] disabled:opacity-40 transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1.5 text-center">
                    Haiku 4.5 · 무료 일일 5회 · 구독 시 무제한
                </p>
            </div>
        </div>
    );
}
