"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";

// 인공지능 기능 = 베타 테스터 전용 (lib/myverse/ai-access.ts → 402 ai_paid_only)
// 공용 플래너 화면(features/myverse/planner)은 AI 호출 실패를 제각각 처리하므로, 앱 쉘에서 fetch 응답을 한 곳에서 보고 안내한다
// 세션 첫 번째는 안내 창, 그 뒤로는 아래 짧은 알림 — 전엔 두 번째부터 아무 반응이 없어 버튼이 고장 난 것처럼 보였다 (2026-10-15 QA)
// ❌ 가격·결제 링크 없음 (베타 — CLAUDE.md §0.1 유료화는 베타 테스트를 거친다)
const SEEN_KEY = "planners_ai_paid_notice_seen";

export function AiPaidOnlyNotice() {
    const [open, setOpen] = useState(false);
    const [toast, setToast] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const original = window.fetch;
        const patched: typeof window.fetch = async (...args) => {
            const res = await original(...args);
            if (res.status === 402) {
                const url = typeof args[0] === "string" ? args[0] : args[0] instanceof URL ? args[0].href : (args[0] as Request).url;
                if (url.includes("/api/myverse/")) {
                    let seen = false;
                    try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* 저장소 없음 */ }
                    if (!seen) setOpen(true);
                    else {
                        setToast(true);
                        if (timer.current) clearTimeout(timer.current);
                        timer.current = setTimeout(() => setToast(false), 3500);
                    }
                }
            }
            return res;
        };
        window.fetch = patched;
        return () => {
            window.fetch = original;
            if (timer.current) clearTimeout(timer.current);
        };
    }, []);

    if (toast && !open) {
        return (
            <div role="status" className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 bg-neutral-900 px-4 py-2.5 text-sm text-white shadow-lg">
                인공지능 기능은 지금 베타 테스터에게만 열려 있습니다
            </div>
        );
    }
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-6" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
            <div className="relative w-full max-w-sm bg-white p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setOpen(false)} className="absolute right-3 top-3 p-1 text-neutral-400 hover:text-neutral-900" aria-label="닫기"><X className="h-4 w-4" /></button>
                <Sparkles className="mx-auto h-8 w-8 text-[#0F766E]" />
                <p className="mt-4 text-lg font-bold">인공지능 기능은 베타 테스터에게 먼저 열고 있습니다</p>
                <p className="mt-3 break-keep text-sm leading-relaxed text-neutral-600">
                    할 일·일정·메모 기록과 계획은 지금처럼 자유롭게 쓸 수 있습니다.
                    생각 정리·하루 코치·회고 같은 인공지능 기능은 베타 테스터에게 먼저 열립니다. 참여 방법은 &lsquo;이야기 › 공지&rsquo;에서 알려 드립니다.
                </p>
                <button onClick={() => setOpen(false)} className="mt-6 w-full bg-[#0F766E] py-3 text-sm font-bold text-white hover:bg-[#134E4A]">확인</button>
            </div>
        </div>
    );
}
