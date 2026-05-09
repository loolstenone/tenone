import Link from "next/link";

// 시간 줌 토글 — 일간/주간/월간/연간
// "오늘" 라벨 사용 금지: lane "오늘"과 시간 줌의 "일간 슬라이스"는 다른 개념.
// 일간 진입점은 /today로 통합 (alias /daily는 redirect 유지).
const VIEWS = [
    { label: "일간", href: "/myverse/app/today",   key: "today" },
    { label: "주간", href: "/myverse/app/weekly",  key: "weekly" },
    { label: "월간", href: "/myverse/app/monthly", key: "monthly" },
    { label: "연간", href: "/myverse/app/yearly",  key: "yearly" },
] as const;

type ViewKey = typeof VIEWS[number]["key"];

export function ViewToggle({ current }: { current: ViewKey }) {
    return (
        <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 text-xs font-medium">
            {VIEWS.map(v => (
                <Link
                    key={v.key}
                    href={v.href}
                    className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                        v.key === current
                            ? "bg-white text-neutral-900 shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700"
                    }`}
                >
                    {v.label}
                </Link>
            ))}
        </div>
    );
}
