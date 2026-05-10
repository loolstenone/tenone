"use client";

// 무끼 플로팅 버튼 — 사이드바 MUKKI 그룹 대체.
// 우측 하단 fixed. 클릭 시 드로어 오픈, 모드 탭 [무끼/일기/코치] + 입력 + 답변.
// 대화 자체는 기록 X. 단, 의도(일정·연락처·할일 등)는 마이버스 서비스로 반영됨.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, Send, Loader2, Edit3, Brain } from "lucide-react";

type Mode = "ask" | "diary" | "coach";

const MODE_META: Record<Mode, { label: string; icon: typeof Sparkles; ph: string; help: string }> = {
    ask: {
        label: "무끼",
        icon: Sparkles,
        ph: "무엇이든 물어보세요. 일정·연락처·할일은 자동으로 마이버스에 반영돼요.\n예: 5월 20일 오후 2시 LG CNS 김철중 미팅",
        help: "묻기 모드 — 1:1 대화. 일정·할일·연락처를 말하면 자동 등록.",
    },
    diary: {
        label: "일기",
        icon: Edit3,
        ph: "오늘 어땠어요? 한 줄이라도 좋아요.",
        help: "일기 모드 — 흔적을 정리하고 패턴을 짚어줘요.",
    },
    coach: {
        label: "코치",
        icon: Brain,
        ph: "지금 고민·결정할 일을 적어보세요.",
        help: "코치 모드 — 묻지 않아도 일일/주간 리포트로 먼저 말 걸어요.",
    },
};

interface ChatTurn {
    role: "user" | "mukki";
    text: string;
    actions?: { label: string; href?: string }[];
}

// /ask·/diary·/coach 페이지에서는 FAB 숨김 — 페이지 자체가 같은 기능 제공
const HIDE_PATHS = ["/myverse/app/ask", "/myverse/app/diary", "/myverse/app/coach"];

export function MukkiFab() {
    const pathname = usePathname() ?? "";
    const hidden = HIDE_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("ask");
    const [input, setInput] = useState("");
    const [turns, setTurns] = useState<ChatTurn[]>([]);
    const [busy, setBusy] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 드로어 열릴 때 입력 포커스
    useEffect(() => {
        if (open) {
            const t = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [open]);

    // 새 turn 추가 시 스크롤 하단
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [turns]);

    // ESC로 닫기
    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    async function send() {
        const text = input.trim();
        if (!text || busy) return;
        setInput("");
        setTurns(prev => [...prev, { role: "user", text }]);
        setBusy(true);
        try {
            const res = await fetch("/api/myverse/mukki/intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode, text }),
            });
            const data = await res.json().catch(() => ({}));
            const reply = (data.reply as string) || "이해하지 못했어요. 다시 말해 줄래요?";
            const actions = (data.actions as { label: string; href?: string }[] | undefined) ?? undefined;
            setTurns(prev => [...prev, { role: "mukki", text: reply, actions }]);
        } catch {
            setTurns(prev => [...prev, { role: "mukki", text: "네트워크 오류 — 잠시 후 다시 시도해 주세요." }]);
        } finally {
            setBusy(false);
            inputRef.current?.focus();
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        // Enter = 전송, Shift+Enter = 줄바꿈
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
        }
    }

    if (hidden && !open) return null;

    return (
        <>
            {/* FAB — BetaFeedbackButton(우하단)과 겹치지 않게 위쪽으로 띄움 */}
            {!open && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    title="무끼 — 묻기 / 일기 / 코치"
                    aria-label="무끼 열기"
                    className="fixed bottom-[5.25rem] md:bottom-[4.5rem] right-5 z-[8500] w-14 h-14 rounded-full shadow-xl flex items-center justify-center bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white hover:scale-105 transition-all"
                >
                    <Sparkles className="h-6 w-6" />
                </button>
            )}

            {/* Drawer overlay */}
            {open && (
                <div className="fixed inset-0 z-[8600] flex items-end md:items-center md:justify-end bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
                    <div
                        onClick={e => e.stopPropagation()}
                        className="w-full md:w-[420px] md:max-h-[80vh] md:mr-5 md:mb-5 bg-white myverse-dark:bg-[#0D0D15] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[80vh] md:h-[640px]"
                    >
                        {/* Header */}
                        <div className="px-4 pt-3 pb-2 border-b border-neutral-100 myverse-dark:border-white/10 flex items-center gap-2 shrink-0">
                            <Sparkles className="h-4 w-4 text-[#6366F1]" />
                            <span className="text-sm font-semibold text-neutral-900 myverse-dark:text-white">무끼</span>
                            <span className="text-[10px] text-neutral-400">대화는 저장되지 않아요 · 의도는 자동 반영</span>
                            <button onClick={() => setOpen(false)} className="ml-auto w-7 h-7 rounded-full hover:bg-neutral-100 myverse-dark:hover:bg-white/10 flex items-center justify-center text-neutral-500">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Mode tabs */}
                        <div className="px-3 pt-2 pb-1.5 flex gap-1 shrink-0">
                            {(Object.keys(MODE_META) as Mode[]).map(m => {
                                const meta = MODE_META[m];
                                const Icon = meta.icon;
                                const active = mode === m;
                                return (
                                    <button
                                        key={m}
                                        onClick={() => setMode(m)}
                                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            active
                                                ? "bg-[#6366F1] text-white shadow-sm"
                                                : "text-neutral-500 hover:bg-neutral-100 myverse-dark:hover:bg-white/5"
                                        }`}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Body */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                            {turns.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line">{MODE_META[mode].help}</p>
                                </div>
                            )}
                            {turns.map((t, i) => (
                                <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                                        t.role === "user"
                                            ? "bg-[#6366F1] text-white rounded-br-md"
                                            : "bg-neutral-100 myverse-dark:bg-white/8 text-neutral-800 myverse-dark:text-neutral-200 rounded-bl-md"
                                    }`}>
                                        {t.text}
                                        {t.actions && t.actions.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {t.actions.map((a, ai) => a.href ? (
                                                    <a key={ai} href={a.href} className="text-xs px-2 py-1 rounded-full bg-white text-[#6366F1] hover:bg-[#6366F1]/10 transition-colors">
                                                        {a.label} →
                                                    </a>
                                                ) : (
                                                    <span key={ai} className="text-xs px-2 py-1 rounded-full bg-white/40 text-current">{a.label}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {busy && (
                                <div className="flex justify-start">
                                    <div className="px-3 py-2 rounded-2xl bg-neutral-100 myverse-dark:bg-white/8 text-neutral-500 flex items-center gap-2 text-sm">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> 생각 중…
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="border-t border-neutral-100 myverse-dark:border-white/10 p-3 shrink-0">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    placeholder={MODE_META[mode].ph}
                                    rows={1}
                                    className="flex-1 max-h-32 resize-none bg-neutral-50 myverse-dark:bg-white/5 border border-neutral-200 myverse-dark:border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-900 myverse-dark:text-white placeholder:text-neutral-300 focus:outline-none focus:border-[#6366F1] transition-colors"
                                    style={{ height: "auto" }}
                                    onInput={e => {
                                        const el = e.currentTarget;
                                        el.style.height = "auto";
                                        el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
                                    }}
                                />
                                <button
                                    onClick={send}
                                    disabled={!input.trim() || busy}
                                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[#6366F1] text-white hover:bg-[#4F46E5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="전송 (Enter)"
                                    aria-label="전송"
                                >
                                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-1.5 px-1">Enter 전송 · Shift+Enter 줄바꿈 · ESC 닫기</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
