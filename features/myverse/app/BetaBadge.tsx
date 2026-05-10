"use client";

// 페이지 헤더 옆에 부착하는 작은 상태 배지.
// status="beta"   → 작동하나 안정화 중 (앰버)
// status="phase2" → 다음 단계 출시 예정 (인디고 외곽)

type Status = "beta" | "phase2";

const META: Record<Status, { text: string; cls: string }> = {
    beta:   { text: "베타",     cls: "bg-amber-50 text-amber-700 border-amber-200" },
    phase2: { text: "Phase 2",  cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

export function BetaBadge({ status }: { status: Status }) {
    const m = META[status];
    return (
        <span
            className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded border ${m.cls} myverse-dark:bg-transparent`}
            title={status === "beta" ? "베타 — 작동하지만 안정화 중" : "Phase 2 — 다음 단계 출시 예정"}
        >
            {m.text}
        </span>
    );
}
