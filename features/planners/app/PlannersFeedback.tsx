"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, X, Send, Check } from "lucide-react";

// 베타 의견 보내기 (2026-10-18) - 플래너'스 AI를 함께 만들어 가는 통로. 받는 곳 = /api/myverse/feedback → 인트라 Planner's › 피드백
// 상단 바 버튼으로 열고, 다른 화면에서는 window 이벤트 PLANNERS_FEEDBACK_OPEN으로 연다
export const PLANNERS_FEEDBACK_OPEN = "planners-feedback-open";

export function PlannersFeedbackButton() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const onOpen = () => setOpen(true);
        window.addEventListener(PLANNERS_FEEDBACK_OPEN, onOpen);
        return () => window.removeEventListener(PLANNERS_FEEDBACK_OPEN, onOpen);
    }, []);

    async function send() {
        if (!text.trim() || sending) return;
        setSending(true); setError(null);
        try {
            const res = await fetch("/api/myverse/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text.trim(), page_path: pathname }),
            });
            if (!res.ok) { setError("보내지 못했어요. 잠시 후 다시 시도해 주세요."); return; }
            setSent(true);
            setText("");
            setTimeout(() => { setSent(false); setOpen(false); }, 2000);
        } catch {
            setError("연결이 불안정해요. 잠시 후 다시 시도해 주세요.");
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-8 items-center gap-1.5 px-2 text-sm text-teal-100/70 hover:text-white"
                title="의견 보내기"
                aria-label="의견 보내기"
            >
                <MessageSquarePlus className="h-4 w-4" />
                <span className="hidden md:inline">의견 보내기</span>
            </button>

            {open && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-16 sm:items-center sm:pt-4" onClick={() => setOpen(false)}>
                    <div className="w-full max-w-md bg-white text-neutral-900 shadow-xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="의견 보내기">
                        <div className="flex items-start justify-between border-b border-neutral-100 px-5 py-4">
                            <div>
                                <h3 className="font-bold">함께 만들어 주세요</h3>
                                <p className="mt-1 break-keep text-sm text-neutral-500">
                                    불편했던 것, 있었으면 하는 것, 플래너&apos;스 AI가 틀린 순간. 보내 주신 의견은 직접 읽고 다음 버전에 담습니다.
                                </p>
                            </div>
                            <button type="button" onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-900" aria-label="닫기">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3 p-5">
                            {sent ? (
                                <p className="flex items-center justify-center gap-2 py-6 font-medium text-[#0F766E]">
                                    <Check className="h-5 w-5" /> 잘 받았어요. 고맙습니다.
                                </p>
                            ) : (
                                <>
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        maxLength={2000}
                                        rows={5}
                                        autoFocus
                                        placeholder="예: 사진으로 옮긴 할 일 중 날짜가 틀렸어요 / 주간 계획을 한 번에 보고 싶어요"
                                        className="w-full resize-none border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm placeholder:text-neutral-400 focus:border-[#0F766E] focus:outline-none"
                                    />
                                    {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
                                    <button
                                        type="button"
                                        onClick={send}
                                        disabled={sending || !text.trim()}
                                        className="flex w-full items-center justify-center gap-2 bg-[#0F766E] py-2.5 text-sm text-white hover:bg-[#134E4A] disabled:opacity-50"
                                    >
                                        {sending ? "보내는 중" : <><Send className="h-4 w-4" /> 보내기</>}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
