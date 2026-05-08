"use client";

// AI 코칭 + AI 브리핑 통합 페이지
// 탭 1: 브리핑 — 아침/낮/저녁 구조화 브리핑 + 히스토리
// 탭 2: 코칭   — 내 데이터 기반 자유 채팅

import { useEffect, useMemo, useRef, useState } from "react";
import {
    Sparkles, Sun, Sunrise, Moon, Loader2, Send,
    Bot, User, Lock,
} from "lucide-react";
import Link from "next/link";
import type { PlannerBriefing } from "@/lib/myverse/types";

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

// ── 코칭 추천 질문 ─────────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
    "최근 3개월 가장 생산적인 주는 언제였어?",
    "가장 자주 만난 사람 TOP 5와 만난 후의 패턴은?",
    "어느 장소에서 집중 시간이 가장 길어?",
    "운동·식사 패턴과 업무 시간의 상관은?",
    "최근 2주 어떻게 시간을 썼는지 한 줄 요약해줘",
];

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export default function CoachPage() {
    const [tab, setTab] = useState<"briefing" | "chat">("briefing");

    return (
        <div className="flex flex-col h-[calc(100vh-3rem)]">
            {/* 헤더 */}
            <header className="px-6 pt-6 pb-0 border-b border-neutral-200 bg-white shrink-0">
                <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-widest text-[#6366F1]">
                    <Sparkles className="h-3 w-3" /> AI
                </div>
                <h1 className="text-xl font-serif text-neutral-900 mb-3">AI 코칭</h1>
                {/* 탭 */}
                <div className="flex gap-0">
                    {[
                        { key: "briefing" as const, label: "브리핑" },
                        { key: "chat" as const,     label: "코칭 채팅" },
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

            {tab === "briefing" ? <BriefingTab /> : <ChatTab />}
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

// ── 코칭 채팅 탭 ──────────────────────────────────────────────
function ChatTab() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
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

        const next: ChatMessage[] = [...messages, { role: "user", content }];
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
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-2xl w-full mx-auto">
                {messages.length === 0 && (
                    <div className="space-y-3">
                        <div className="bg-gradient-to-br from-[#6366F1]/5 to-[#A855F7]/5 border border-[#6366F1]/10 rounded-2xl p-5 text-center">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white mb-3">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <p className="text-sm text-neutral-700 mb-1">내 디지털 흔적이 답하는 시간</p>
                            <p className="text-xs text-neutral-500">9 영역을 가로지르는 교차 인사이트를 물어보세요</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 px-2">추천 질문</p>
                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                <button key={i} onClick={() => send(q)}
                                    className="w-full text-left text-sm bg-white border border-neutral-200 rounded-lg px-4 py-3 hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-colors">
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
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-neutral-200">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6366F1]" />
                            <span className="text-xs text-neutral-500">데이터를 분석 중…</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-2 text-xs flex items-start gap-2">
                        {quotaReached && <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                        <div>
                            <p>{error}</p>
                            {quotaReached && (
                                <Link href="/myverse/purchase" className="inline-block mt-1 text-[#6366F1] underline">
                                    구독하기 →
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                <div ref={scrollRef} />
            </div>

            {/* 입력 */}
            <div className="border-t border-neutral-200 bg-white px-4 py-3 max-w-2xl w-full mx-auto shrink-0">
                <div className="flex items-end gap-2">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                        }}
                        placeholder="질문하기… (Enter 전송 / Shift+Enter 줄바꿈)"
                        rows={1}
                        disabled={quotaReached}
                        className="flex-1 text-sm border border-neutral-200 rounded-xl px-3 py-2 placeholder:text-neutral-300 focus:outline-none focus:border-[#6366F1] resize-none max-h-32 disabled:opacity-50"
                    />
                    <button onClick={() => send()} disabled={loading || !input.trim() || quotaReached}
                        className="p-2 rounded-xl bg-[#6366F1] text-white hover:bg-[#4F46E5] disabled:opacity-40 transition-colors">
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
