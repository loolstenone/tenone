"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
}

interface UniverseChatbotProps {
    siteId?: string;
    siteName?: string;
    accentColor?: string;
}

export function UniverseChatbot({ siteId, siteName = "Ten:One", accentColor = "#1a1a2e" }: UniverseChatbotProps) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: "0", role: "assistant", text: `안녕하세요! ${siteName} 챗봇입니다. 무엇이 궁금하신가요?` },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    const send = async () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput("");

        const userMsg: Message = { id: Date.now().toString(), role: "user", text };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            const res = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, siteId, history: messages.slice(-6) }),
            });
            const data = await res.json();
            setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", text: data.reply ?? "죄송해요, 잠시 후 다시 시도해주세요." }]);
        } catch {
            setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", text: "오류가 발생했습니다. 잠시 후 다시 시도해주세요." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* 플로팅 버튼 */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 z-[9990] flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ffd93d, #ff6b6b)', width: 52, height: 52 }}
                aria-label="챗봇 열기"
            >
                {open ? <X className="h-5 w-5 text-[#1a1a2e]" /> : <MessageCircle className="h-5 w-5 text-[#1a1a2e]" />}
            </button>

            {/* 채팅 패널 */}
            {open && (
                <div
                    className="fixed bottom-[72px] right-6 z-[9990] flex w-80 flex-col overflow-hidden rounded-2xl shadow-2xl"
                    style={{ height: 420, background: '#12122a', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    {/* 헤더 */}
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/8">
                        <Bot className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-semibold text-white">{siteName} 챗봇</span>
                        <button onClick={() => setOpen(false)} className="ml-auto text-white/30 hover:text-white">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* 메시지 목록 */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                        {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className="max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed"
                                    style={m.role === "user"
                                        ? { background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }
                                        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }
                                    }
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-xl px-3 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                                    입력 중...
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* 입력 */}
                    <div className="flex items-center gap-2 border-t border-white/8 px-3 py-2.5">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none"
                        />
                        <button onClick={send} disabled={!input.trim() || loading}
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-opacity disabled:opacity-30"
                            style={{ background: 'rgba(255,217,61,0.15)' }}>
                            <Send className="h-3.5 w-3.5 text-amber-400" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
