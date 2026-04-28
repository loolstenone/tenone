"use client";

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const CALENDAR_PATHS = [
    "/planners/app/index",
    "/planners/app/daily",
    "/planners/app/weekly",
    "/planners/app/monthly",
    "/planners/app/yearly",
];

function MonthBarInner() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const showBar = CALENDAR_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
    if (!showBar) return null;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const isMonthlyPage = pathname === "/planners/app/monthly";
    const activeYear = isMonthlyPage && searchParams.get("year")
        ? parseInt(searchParams.get("year")!)
        : currentYear;
    const activeMonth = isMonthlyPage && searchParams.get("month")
        ? parseInt(searchParams.get("month")!)
        : currentMonth;

    function handleClick(month: number) {
        router.push(`/planners/app/monthly?year=${activeYear}&month=${month}`);
    }

    return (
        <nav className="hidden md:flex w-10 shrink-0 flex-col items-center py-3 gap-0.5 sticky top-12 h-[calc(100vh-3rem)] border-l border-neutral-100 bg-white overflow-y-auto">
            <span className="text-[9px] font-mono text-neutral-300 mb-1 tracking-tight">{activeYear}</span>
            {MONTHS.map((label, idx) => {
                const month = idx + 1;
                const isActive = isMonthlyPage && month === activeMonth;
                const isNow = month === currentMonth && activeYear === currentYear;
                return (
                    <button
                        key={label}
                        onClick={() => handleClick(month)}
                        className={`text-[10px] font-medium w-8 h-7 rounded transition-colors ${
                            isActive
                                ? "bg-[#0F766E] text-white"
                                : isNow
                                    ? "text-[#0F766E] font-semibold hover:bg-[#0F766E]/10"
                                    : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </nav>
    );
}

export function AppMonthBar() {
    return (
        <Suspense fallback={null}>
            <MonthBarInner />
        </Suspense>
    );
}
