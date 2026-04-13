"use client";

/**
 * AI 컨텍스트 패널
 * - 모든 intra 페이지 우측에서 슬라이드로 열림
 * - 현재 페이지 데이터를 자동으로 컨텍스트에 주입
 * - /api/agent/hub 호출 (기존 Agent Hub API 재사용)
 */

import {
    createContext, useContext, useState, useRef, useEffect, useCallback,
    type ReactNode,
} from "react";
import { Bot, X, Send, Loader2, ChevronDown, Sparkles } from "lucide-react";
import clsx from "clsx";

// ── 타입 ────────────────────────────────────────────────────────

interface ChatMessage {
    id: string;
    role: "user" | "agent";
    content: string;
    timestamp: Date;
}

interface AIContextValue {
    /** 현재 페이지가 AI에게 주입할 컨텍스트 데이터를 설정 */
    setPageContext: (ctx: string) => void;
    /** 패널 토글 */
    togglePanel: () => void;
    /** 패널 오픈 여부 */
    isOpen: boolean;
}

const AIContext = createContext<AIContextValue>({
    setPageContext: () => {},
    togglePanel: () => {},
    isOpen: false,
});

export function useAIContext() { return useContext(AIContext); }

// ── 에이전트 선택 옵션 ───────────────────────────────────────────

const QUICK_AGENTS = [
    { id: "1001", name: "열시일분", desc: "전략·운영 오케스트레이터" },
    { id: "badak-bot", name: "바닥봇", desc: "Badak 커뮤니티" },
    { id: "mindle-agent", name: "Mindle", desc: "트렌드 인텔리전스" },
];

// ── 메인 컴포넌트 ────────────────────────────────────────────────

export function AIContextProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [pageContext, setPageContextState] = useState("");
    const [selectedAgent, setSelectedAgent] = useState(QUICK_AGENTS[0]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [agentDropOpen, setAgentDropOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 패널 열릴 때 인풋 포커스
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
    }, [isOpen]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const setPageContext = useCallback((ctx: string) => {
        setPageContextState(ctx);
    }, []);

    const togglePanel = useCallback(() => setIsOpen((v) => !v), []);

    const handleSend = async () => {
        if (!input.trim() || sending) return;

        // 컨텍스트를 첫 메시지에 자동 첨부
        const content = input.trim();
        const contextPrefix = pageContext
            ? `[현재 페이지 데이터]\n${pageContext}\n\n[질문]\n`
            : "";

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setSending(true);

        try {
            const res = await fetch("/api/agent/hub", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: contextPrefix + content,
                    agentName: selectedAgent.id,
                }),
            });
            const json = await res.json();
            const hub = json.response ? json : (json.data ?? json);

            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "agent",
                    content: hub.response || hub.error || "응답 없음",
                    timestamp: new Date(),
                },
            ]);
            // 첫 전송 후 컨텍스트 초기화 (다음 메시지부터는 불필요)
            setPageContextState("");
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "agent",
                    content: "오류가 발생했습니다. 다시 시도해주세요.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setSending(false);
        }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const clearMessages = () => setMessages([]);

    return (
        <AIContext.Provider value={{ setPageContext, togglePanel, isOpen }}>
            {children}

            {/* ── 토글 버튼 (오른쪽 하단 고정) ── */}
            <button
                onClick={togglePanel}
                className={clsx(
                    "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2.5 rounded-full shadow-lg transition-all duration-200",
                    isOpen
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-900 text-white hover:bg-neutral-700"
                )}
                title="AI 어시스턴트"
            >
                {isOpen ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                <span className="text-xs font-medium">{isOpen ? "닫기" : "AI"}</span>
            </button>

            {/* ── 패널 오버레이 (모바일) ── */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={togglePanel}
                />
            )}

            {/* ── AI 패널 ── */}
            <div
                className={clsx(
                    "fixed top-0 right-0 bottom-0 z-40 w-full sm:w-[380px] bg-white border-l border-neutral-200 flex flex-col shadow-xl transition-transform duration-250",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* 헤더 */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 shrink-0">
                    <div className="flex items-center gap-2 flex-1">
                        <Sparkles className="h-4 w-4 text-neutral-500" />
                        <span className="text-sm font-semibold text-neutral-800">AI 어시스턴트</span>
                    </div>

                    {/* 에이전트 선택 */}
                    <div className="relative">
                        <button
                            onClick={() => setAgentDropOpen((v) => !v)}
                            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 px-2 py-1 rounded border border-neutral-200 hover:border-neutral-300 transition-all"
                        >
                            <span>{selectedAgent.name}</span>
                            <ChevronDown className="h-3 w-3" />
                        </button>
                        {agentDropOpen && (
                            <div className="absolute right-0 top-8 w-52 bg-white border border-neutral-200 rounded shadow-lg z-50">
                                {QUICK_AGENTS.map((a) => (
                                    <button
                                        key={a.id}
                                        onClick={() => { setSelectedAgent(a); setAgentDropOpen(false); clearMessages(); }}
                                        className={clsx(
                                            "w-full text-left px-3 py-2.5 text-xs hover:bg-neutral-50 transition-colors",
                                            a.id === selectedAgent.id && "bg-neutral-50 font-medium"
                                        )}
                                    >
                                        <p className="font-medium text-neutral-900">{a.name}</p>
                                        <p className="text-neutral-400 mt-0.5">{a.desc}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={togglePanel}
                        className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* 페이지 컨텍스트 인디케이터 */}
                {pageContext && (
                    <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                        <Bot className="h-3 w-3 text-blue-400 shrink-0" />
                        <p className="text-[11px] text-blue-600 truncate flex-1">
                            현재 페이지 데이터가 컨텍스트에 포함됩니다
                        </p>
                        <button
                            onClick={() => setPageContextState("")}
                            className="text-blue-400 hover:text-blue-600"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}

                {/* 메시지 영역 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                                <Sparkles className="h-5 w-5 text-neutral-400" />
                            </div>
                            <p className="text-sm font-medium text-neutral-600 mb-1">
                                {selectedAgent.name}
                            </p>
                            <p className="text-xs text-neutral-400 max-w-[240px] leading-relaxed">
                                {selectedAgent.desc}에 대해 물어보세요.
                                현재 페이지 데이터를 자동으로 분석합니다.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={clsx("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                            >
                                {msg.role === "agent" && (
                                    <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center mr-2 shrink-0 mt-1">
                                        <Bot className="h-3.5 w-3.5 text-neutral-500" />
                                    </div>
                                )}
                                <div
                                    className={clsx(
                                        "max-w-[82%] px-3 py-2 text-xs leading-relaxed rounded",
                                        msg.role === "user"
                                            ? "bg-neutral-900 text-white rounded-br-none"
                                            : "bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-bl-none"
                                    )}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <p className={clsx(
                                        "text-[10px] mt-1 text-right",
                                        msg.role === "user" ? "text-neutral-400" : "text-neutral-400"
                                    )}>
                                        {msg.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    {sending && (
                        <div className="flex justify-start items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                <Bot className="h-3.5 w-3.5 text-neutral-500" />
                            </div>
                            <div className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded rounded-bl-none">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* 빠른 질문 (메시지 없을 때만) */}
                {messages.length === 0 && !sending && (
                    <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                        {[
                            "오늘 현황을 요약해줘",
                            "이 데이터에서 이슈가 있나?",
                            "개선 방향을 제안해줘",
                        ].map((q) => (
                            <button
                                key={q}
                                onClick={() => { setInput(q); inputRef.current?.focus(); }}
                                className="text-[11px] px-2.5 py-1 rounded-full border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-all"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* 입력창 */}
                <div className="px-4 py-3 border-t border-neutral-100 shrink-0">
                    <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus-within:border-neutral-400 transition-colors">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={`${selectedAgent.name}에게 물어보세요...`}
                            className="flex-1 bg-transparent text-xs text-neutral-800 placeholder:text-neutral-400 outline-none"
                            disabled={sending}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || sending}
                            className="p-1 text-neutral-400 hover:text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1.5 text-center">
                        Enter로 전송 · 현재 에이전트: {selectedAgent.name}
                    </p>
                </div>
            </div>
        </AIContext.Provider>
    );
}
