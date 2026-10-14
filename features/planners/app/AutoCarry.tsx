"use client";

import { useEffect, useState } from "react";
import { CalendarClock, X } from "lucide-react";
import { todayKst } from "@/features/myverse/planner/ai-actions";

// 못 끝낸 일 자동 재배치 — 플래너'스 AI 1단계 (2026-10-14)
// "일정이 밀렸을 때 다음 페이지에 다시 쓰는 피로"를 없앤다: 오늘 화면을 처음 열면 하루 한 번,
// 최근 14일의 미완료·보류를 오늘로 옮기고 빈 시간(09~21시, 일정·시각 있는 할 일 피함)에 넣는다 (/api/myverse/daily/carry-over schedule)
// AI 호출 없음 → 무료 회원도 쓴다 · 14일보다 오래된 것은 기존 '누적 미완료' 안내에서 직접 고른다
const RUN_KEY = "planners_autocarry_";

export function AutoCarry({ date }: { date: string }) {
    const [done, setDone] = useState<{ carried: number; scheduled: number } | null>(null);

    useEffect(() => {
        if (date !== todayKst()) return;
        try {
            if (localStorage.getItem(RUN_KEY + date) === "1") return;
            localStorage.setItem(RUN_KEY + date, "1");
        } catch { /* 저장소 없음 — 한 번만 시도 */ }
        let cancelled = false;
        (async () => {
            const res = await fetch("/api/myverse/daily/carry-over", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, days: 14, schedule: true }),
            }).catch(() => null);
            if (cancelled || !res?.ok) return;
            const d = await res.json().catch(() => null);
            if (d?.carried > 0) {
                setDone({ carried: d.carried, scheduled: d.scheduled ?? 0 });
                window.dispatchEvent(new CustomEvent("planner-data-changed"));
            }
        })();
        return () => { cancelled = true; };
    }, [date]);

    if (!done) return null;
    return (
        <div className="mb-4 flex items-start gap-3 bg-[var(--pp-accent)]/10 px-4 py-3 text-sm text-neutral-800 myverse-dark:text-neutral-200">
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--pp-accent)]" />
            <p className="flex-1 break-keep">
                지난 2주 동안 못 끝낸 일 <b>{done.carried}개</b>를 오늘로 옮겼어요.
                {done.scheduled > 0 && <> 그중 <b>{done.scheduled}개</b>는 빈 시간에 넣었습니다.</>}
                {done.scheduled < done.carried && <> 나머지는 시간 없이 목록에 있어요.</>}
            </p>
            <button onClick={() => setDone(null)} className="text-neutral-400 hover:text-neutral-700" aria-label="닫기"><X className="h-4 w-4" /></button>
        </div>
    );
}
