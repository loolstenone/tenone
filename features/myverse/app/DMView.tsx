"use client";

// DM — 1:1 메시지. 좌측 스레드 목록 + 우측 대화창. 모바일에서는 둘 중 하나만 노출.

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, MessageCircle, ChevronLeft, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Other { id: string; name: string | null; handle: string | null; avatar_url: string | null }
interface Thread { id: string; last_message_at: string | null; last_preview: string | null; unread: number; other: Other | null }
interface Message { id: string; sender_id: string; body: string; created_at: string; read_at: string | null }

export function DMView({ initialMemberId, initialThreadId }: { initialMemberId?: string; initialThreadId?: string }) {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeId, setActiveId] = useState<string | null>(initialThreadId ?? null);
    const [activeOther, setActiveOther] = useState<Other | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [meId, setMeId] = useState<string | null>(null);
    const [loadingThreads, setLoadingThreads] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchHandle, setSearchHandle] = useState("");
    const [startError, setStartError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    async function loadMe() {
        try {
            const r = await fetch("/api/myverse/me");
            if (r.ok) {
                const d = await r.json();
                setMeId(d?.member?.id ?? null);
            }
        } catch {}
    }

    async function loadThreads() {
        setLoadingThreads(true);
        try {
            const r = await fetch("/api/myverse/dm/threads");
            if (r.ok) {
                const d = await r.json();
                setThreads(d.threads ?? []);
            }
        } finally {
            setLoadingThreads(false);
        }
    }

    async function loadMessages(threadId: string) {
        setLoadingMessages(true);
        try {
            const r = await fetch(`/api/myverse/dm/threads/${threadId}/messages`);
            if (r.ok) {
                const d = await r.json();
                setMessages(d.messages ?? []);
                setActiveOther(d.other ?? null);
            }
        } finally {
            setLoadingMessages(false);
        }
    }

    async function startThread() {
        const handle = searchHandle.trim().replace(/^@/, "");
        if (!handle) return;
        setStartError(null);
        try {
            const r = await fetch("/api/myverse/dm/threads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ handle }),
            });
            const d = await r.json();
            if (!r.ok) {
                setStartError(d.error === "user_not_found" ? "그 핸들의 사용자를 찾을 수 없어." : "오류가 발생했어.");
                return;
            }
            setSearchOpen(false);
            setSearchHandle("");
            setActiveId(d.thread.id);
            await loadThreads();
        } catch {
            setStartError("네트워크 오류");
        }
    }

    async function send() {
        const text = input.trim();
        if (!text || !activeId || sending) return;
        setSending(true);
        const optimistic: Message = {
            id: "tmp_" + Date.now(),
            sender_id: meId ?? "me",
            body: text,
            created_at: new Date().toISOString(),
            read_at: null,
        };
        setMessages(arr => [...arr, optimistic]);
        setInput("");
        try {
            const r = await fetch(`/api/myverse/dm/threads/${activeId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: text }),
            });
            if (r.ok) {
                const d = await r.json();
                setMessages(arr => arr.map(m => m.id === optimistic.id ? d.message : m));
                void loadThreads();
            } else {
                setMessages(arr => arr.filter(m => m.id !== optimistic.id));
                setInput(text);
            }
        } finally {
            setSending(false);
        }
    }

    useEffect(() => { void loadMe(); void loadThreads(); }, []);

    useEffect(() => {
        if (initialMemberId && !activeId) {
            (async () => {
                const r = await fetch("/api/myverse/dm/threads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ member_id: initialMemberId }),
                });
                if (r.ok) {
                    const d = await r.json();
                    setActiveId(d.thread.id);
                    void loadThreads();
                }
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (activeId) void loadMessages(activeId);
        else { setMessages([]); setActiveOther(null); }
    }, [activeId]);

    // 활성 스레드의 새 메시지 — Realtime 구독
    useEffect(() => {
        if (!activeId) return;
        const supabase = createClient();
        const channel = supabase
            .channel(`dm:${activeId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "myverse_dm_messages", filter: `thread_id=eq.${activeId}` },
                (payload: { new: Record<string, unknown> }) => {
                    const m = payload.new as unknown as Message;
                    setMessages(arr => {
                        if (arr.some(x => x.id === m.id)) return arr;
                        return [...arr, m];
                    });
                    // 상대가 보낸 메시지면 즉시 read 처리 + 스레드 갱신
                    if (m.sender_id !== meId) {
                        fetch(`/api/myverse/dm/threads/${activeId}/messages`).catch(() => {});
                        void loadThreads();
                    }
                },
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId, meId]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [messages.length]);

    return (
        <div className="flex h-[calc(100vh-3rem)] bg-white">
            {/* 좌측 — 스레드 목록 */}
            <aside className={`${activeId ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 border-r border-neutral-200 shrink-0`}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                    <h1 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4 text-indigo-500" />
                        메시지
                    </h1>
                    <button onClick={() => setSearchOpen(v => !v)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100">
                        {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                    </button>
                </div>

                {searchOpen && (
                    <div className="p-3 border-b border-neutral-200 bg-neutral-50">
                        <input
                            value={searchHandle}
                            onChange={e => setSearchHandle(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && startThread()}
                            placeholder="@핸들 입력"
                            autoFocus
                            className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-indigo-400"
                        />
                        <button onClick={startThread}
                            className="w-full mt-2 px-3 py-2 text-xs bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                            대화 시작
                        </button>
                        {startError && <p className="text-[11px] text-rose-500 mt-1">{startError}</p>}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {loadingThreads ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                        </div>
                    ) : threads.length === 0 ? (
                        <div className="p-8 text-center text-xs text-neutral-400">
                            <MessageCircle className="h-6 w-6 text-neutral-200 mx-auto mb-2" />
                            아직 대화가 없어.<br />검색으로 시작해봐.
                        </div>
                    ) : (
                        threads.map(t => (
                            <button key={t.id} onClick={() => setActiveId(t.id)}
                                className={`w-full px-4 py-3 flex items-center gap-3 text-left border-b border-neutral-100 hover:bg-neutral-50 ${activeId === t.id ? "bg-indigo-50/60" : ""}`}>
                                <div className="shrink-0 h-9 w-9 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-xs text-neutral-500">
                                    {t.other?.avatar_url ? (
                                        <img src={t.other.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        (t.other?.name || t.other?.handle || "?").charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-neutral-900 truncate">
                                            {t.other?.name || (t.other?.handle ? `@${t.other.handle}` : "(알 수 없음)")}
                                        </p>
                                        {t.last_message_at && (
                                            <span className="text-[10px] text-neutral-400 shrink-0 tabular-nums">
                                                {fmtRelative(t.last_message_at)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-neutral-500 truncate">
                                        {t.last_preview || "(메시지 없음)"}
                                    </p>
                                </div>
                                {t.unread > 0 && (
                                    <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-medium text-white bg-indigo-500 rounded-full px-1">
                                        {t.unread}
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* 우측 — 대화 */}
            <main className={`${activeId ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0`}>
                {activeId ? (
                    <>
                        <header className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200">
                            <button onClick={() => setActiveId(null)}
                                className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <div className="h-8 w-8 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-xs text-neutral-500">
                                {activeOther?.avatar_url ? (
                                    <img src={activeOther.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    (activeOther?.name || activeOther?.handle || "?").charAt(0)
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">
                                    {activeOther?.name || (activeOther?.handle ? `@${activeOther.handle}` : "—")}
                                </p>
                                {activeOther?.handle && activeOther?.name && (
                                    <p className="text-[11px] text-neutral-400 truncate">@{activeOther.handle}</p>
                                )}
                            </div>
                        </header>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-neutral-50/50">
                            {loadingMessages ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8 text-xs text-neutral-400">
                                    첫 메시지를 보내보자.
                                </div>
                            ) : (
                                messages.map(m => {
                                    const mine = m.sender_id === meId;
                                    return (
                                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                                mine
                                                    ? "bg-indigo-500 text-white rounded-br-sm"
                                                    : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm"
                                            }`}>
                                                {m.body}
                                                <span className={`block text-[10px] mt-1 tabular-nums ${mine ? "text-white/70" : "text-neutral-400"}`}>
                                                    {fmtTime(m.created_at)}
                                                    {mine && (m.read_at ? " · 읽음" : " · 전송됨")}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="border-t border-neutral-200 p-3">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
                                    }}
                                    placeholder="메시지 입력… (Enter 전송 / Shift+Enter 줄바꿈)"
                                    rows={1}
                                    className="flex-1 text-sm border border-neutral-200 rounded-xl px-3 py-2 resize-none max-h-32 focus:outline-none focus:border-indigo-400"
                                />
                                <button onClick={send} disabled={!input.trim() || sending}
                                    className="p-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40">
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-neutral-400">
                        <div className="text-center">
                            <MessageCircle className="h-8 w-8 text-neutral-200 mx-auto mb-2" />
                            <p className="text-sm">대화를 선택하거나 새로 시작해봐.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function fmtRelative(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60_000) return "방금";
    if (ms < 3600_000) return `${Math.floor(ms / 60_000)}분`;
    if (ms < 86400_000) return `${Math.floor(ms / 3600_000)}시간`;
    if (ms < 7 * 86400_000) return `${Math.floor(ms / 86400_000)}일`;
    return new Date(iso).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
}

function fmtTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}
