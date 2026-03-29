"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchAiChats, saveAiChat } from "@/lib/myverse-supabase";
import type { MyverseAiChat } from "@/lib/myverse-supabase";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const SYSTEM_SUGGESTIONS = [
    "오늘 하루를 정리해줘",
    "이번 주 목표 진행률은?",
    "내 패턴을 분석해줘",
    "새 프로젝트를 기획하고 싶어",
    "올해 목표를 다시 점검하자",
];

const INITIAL_MESSAGE: Message = {
    id: "init",
    role: "assistant",
    content: "안녕하세요! 당신의 Myverse AI입니다.\n\n기록, 목표, 일정, 프로젝트 — 당신의 모든 데이터를 기반으로 대화합니다. 무엇이든 물어보세요.",
    timestamp: new Date(),
};

/* ── Mock AI 응답 (추후 Claude API 연동) ── */
const MOCK_RESPONSES: Record<string, string> = {
    "오늘 하루를 정리해줘": "오늘 일정 2개를 소화했고, LOG에 사진 1장과 메모 2개를 남겼어요.\n\n한 줄로 하면: \"생각이 많은 하루.\"\n\n더 남기고 싶은 것 있어요?",
    "이번 주 목표 진행률은?": "이번 주 목표 3개 중 2개 완료했어요. (67%)\n\n✅ 기획서 초안 작성\n✅ 레퍼런스 조사\n⬜ 발표 자료 준비 (내일까지)\n\n내일 집중하면 100% 가능합니다.",
    "내 패턴을 분석해줘": "2주간 데이터 분석 결과:\n\n• 가장 생산적인 시간: 오전 10~12시\n• 사진을 가장 많이 올리는 날: 토요일\n• 목표 달성률: 72%\n• 큰 태스크를 월요일에 시작하면 완료율 70%\n\n오전에 중요한 일을 배치하는 걸 추천합니다.",
};

export default function AIPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 초기 데이터 로드: 이전 대화 복원
    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            const { chats } = await fetchAiChats(user.id, 50);
            if (chats.length > 0) {
                // DB에서 가져온 대화로 복원
                const restored: Message[] = chats.map(c => ({
                    id: c.id,
                    role: c.role,
                    content: c.content,
                    timestamp: new Date(c.created_at),
                }));
                setMessages([INITIAL_MESSAGE, ...restored]);
            }
            setInitialLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;
        setInput("");

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        // DB에 사용자 메시지 저장
        if (userId) {
            await saveAiChat(userId, "user", msg);
        }

        // TODO: Claude API 연동 — 지금은 Mock 응답
        setTimeout(async () => {
            const responseContent = MOCK_RESPONSES[msg] ||
                `"${msg}"에 대해 생각해봤어요.\n\n현재 데이터 기반으로 더 정확한 답변을 드리려면 LOG, DREAM, WORK 탭에 기록을 더 쌓아주세요. 데이터가 쌓일수록 더 나은 인사이트를 제공합니다.`;

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: responseContent,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);
            setLoading(false);

            // DB에 AI 응답 저장
            if (userId) {
                await saveAiChat(userId, "assistant", responseContent);
            }
        }, 1500);
    };

    // 대화 초기화
    const handleReset = async () => {
        setMessages([INITIAL_MESSAGE]);
        // 주의: DB의 기존 대화는 유지 (히스토리 보존)
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto items-center justify-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Myverse AI</p>
                        <p className="text-[10px] text-slate-500">나를 가장 잘 아는 AI</p>
                    </div>
                </div>
                <button onClick={handleReset}
                    className="p-2 text-slate-500 hover:text-white transition-colors" title="대화 초기화">
                    <RotateCcw size={16} />
                </button>
            </div>

            {/* 메시지 영역 */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                            <div className="shrink-0 h-7 w-7 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                                <Sparkles size={12} className="text-indigo-400" />
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === "user"
                                ? "bg-indigo-600 text-white rounded-br-md"
                                : "bg-white/5 text-slate-300 rounded-bl-md"
                        }`}>
                            {msg.content}
                        </div>
                        {msg.role === "user" && (
                            <div className="shrink-0 h-7 w-7 rounded-lg bg-slate-700 flex items-center justify-center">
                                <User size={12} className="text-slate-300" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-2">
                        <div className="shrink-0 h-7 w-7 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                            <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                        </div>
                        <div className="bg-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1">
                                <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" />
                                <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 빠른 제안 */}
            {messages.length <= 2 && (
                <div className="px-4 pb-2">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {SYSTEM_SUGGESTIONS.map(s => (
                            <button key={s} onClick={() => sendMessage(s)}
                                className="shrink-0 px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:border-white/20 transition-colors">
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 입력 */}
            <div className="px-4 py-3 border-t border-white/5">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        placeholder="무엇이든 물어보세요..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
                    />
                    <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                        className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-colors disabled:opacity-30">
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
