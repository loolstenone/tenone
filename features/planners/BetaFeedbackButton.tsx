"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, X, Send, Check } from "lucide-react";
import { trackPlanners } from "@/lib/planners/analytics";

export function BetaFeedbackButton() {
    const pathname = usePathname();
    if (/^\/planners\/app\/canvas\/.+/.test(pathname)) return null;
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit() {
        if (!text.trim()) return;
        setSending(true);
        try {
            await fetch("/api/planners/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text.trim(), page_path: pathname }),
            });
            trackPlanners("planners_beta_feedback_sent");
            setSent(true);
            setText("");
            setTimeout(() => { setSent(false); setOpen(false); }, 2000);
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="pp-hide-when-ai-open fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] text-white rounded-full shadow-lg hover:bg-[#0d5e56] transition-colors text-sm font-medium"
            >
                <MessageSquarePlus className="h-4 w-4" />
                <span>피드백</span>
            </button>

            {open && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-neutral-900">베타 피드백 보내기</h3>
                                <p className="text-xs text-neutral-500 mt-0.5">불편한 점, 원하는 기능, 버그 모두 환영합니다.</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {sent ? (
                                <div className="flex items-center gap-3 py-6 justify-center text-[#0F766E]">
                                    <Check className="h-5 w-5" />
                                    <span className="font-medium">전송됐습니다. 감사합니다!</span>
                                </div>
                            ) : (
                                <>
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="어떤 점이 불편하셨나요? 어떤 기능이 있으면 좋겠나요?"
                                        rows={5}
                                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0F766E] resize-none"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSubmit}
                                        disabled={sending || !text.trim()}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors disabled:opacity-50"
                                    >
                                        {sending ? "전송 중…" : <><Send className="h-4 w-4" /> 보내기</>}
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
