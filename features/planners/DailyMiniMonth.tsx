"use client";

// Daily 우측 미니 캘린더 — 해당 월 그리드 + 오늘 강조 + 일정 dot
// 셀 클릭 → 해당 일자로 이동.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getHoliday } from "@/lib/planners/holidays";
import { expandOccurrences, isVisible, type CalendarEntry } from "@/lib/planners/calendar-rules";
import { getISOWeek } from "@/lib/planners/types";

interface Props {
    date: string;  // YYYY-MM-DD (현재 보고 있는 날짜)
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export function DailyMiniMonth({ date }: Props) {
    const [year, setYear] = useState(parseInt(date.slice(0, 4), 10));
    const [month, setMonth] = useState(parseInt(date.slice(5, 7), 10));
    const [entries, setEntries] = useState<CalendarEntry[]>([]);

    useEffect(() => {
        setYear(parseInt(date.slice(0, 4), 10));
        setMonth(parseInt(date.slice(5, 7), 10));
    }, [date]);

    useEffect(() => {
        const first = `${year}-${pad(month)}-01`;
        const lastD = new Date(year, month, 0).getDate();
        const last = `${year}-${pad(month)}-${pad(lastD)}`;
        fetch(`/api/planners/calendar?from=${first}&to=${last}`)
            .then((r) => r.ok ? r.json() : null)
            .then((d) => { if (d?.entries) setEntries(d.entries); })
            .catch(() => {});
    }, [year, month]);

    // 셀별 일정 마커
    const entryDates = useMemo(() => {
        const first = `${year}-${pad(month)}-01`;
        const lastD = new Date(year, month, 0).getDate();
        const last = `${year}-${pad(month)}-${pad(lastD)}`;
        const set = new Set<string>();
        entries.forEach((e) => {
            if (!isVisible(e.kind, "monthly")) return;
            expandOccurrences(e, first, last).forEach(({ date }) => set.add(date));
        });
        return set;
    }, [entries, year, month]);

    // 캘린더 매트릭스 (월~일)
    const cells = useMemo(() => {
        const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
        const lastOfMonth  = new Date(Date.UTC(year, month, 0));
        const padStart = (firstOfMonth.getUTCDay() + 6) % 7;  // Mon=0
        const out: Array<{ date: string; dom: number; inMonth: boolean }> = [];

        for (let i = padStart; i > 0; i--) {
            const d = new Date(firstOfMonth);
            d.setUTCDate(d.getUTCDate() - i);
            out.push({ date: d.toISOString().slice(0, 10), dom: d.getUTCDate(), inMonth: false });
        }
        for (let dom = 1; dom <= lastOfMonth.getUTCDate(); dom++) {
            const d = new Date(Date.UTC(year, month - 1, dom));
            out.push({ date: d.toISOString().slice(0, 10), dom, inMonth: true });
        }
        // 마지막 주 패딩 (총 6주 = 42셀까지)
        while (out.length % 7 !== 0) {
            const last = new Date(out[out.length - 1].date + "T00:00:00Z");
            last.setUTCDate(last.getUTCDate() + 1);
            out.push({ date: last.toISOString().slice(0, 10), dom: last.getUTCDate(), inMonth: false });
        }
        return out;
    }, [year, month]);

    function navigate(delta: number) {
        let m = month + delta;
        let y = year;
        if (m < 1) { m = 12; y -= 1; }
        if (m > 12) { m = 1; y += 1; }
        setMonth(m); setYear(y);
    }

    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
                <button onClick={() => navigate(-1)} className="p-0.5 rounded hover:bg-neutral-100 text-neutral-400">
                    <ChevronLeft className="h-3 w-3" />
                </button>
                <Link
                    href={`/planners/app/monthly?year=${year}&month=${month}`}
                    className="text-[11px] font-semibold text-neutral-700 hover:text-[#0F766E]"
                >
                    {year}년 {month}월
                </Link>
                <button onClick={() => navigate(1)} className="p-0.5 rounded hover:bg-neutral-100 text-neutral-400">
                    <ChevronRight className="h-3 w-3" />
                </button>
            </div>
            <div className="grid grid-cols-[18px_repeat(7,1fr)] gap-px text-center mb-0.5">
                <span className="text-[7px] text-neutral-300">W</span>
                {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => (
                    <span key={d} className={`text-[8px] ${i >= 5 ? (i === 6 ? "text-rose-400" : "text-rose-300") : "text-neutral-400"}`}>
                        {d}
                    </span>
                ))}
            </div>
            {/* 주 단위로 행 분할 — 좌측에 W주차 표시 */}
            <div className="space-y-px">
                {Array.from({ length: cells.length / 7 }, (_, rowIdx) => {
                    const rowCells = cells.slice(rowIdx * 7, rowIdx * 7 + 7);
                    const firstDate = new Date(rowCells[0].date + "T00:00:00Z");
                    const { week } = getISOWeek(firstDate);
                    const weekYear = rowCells[0].date.slice(0, 4);
                    return (
                        <div key={rowIdx} className="grid grid-cols-[18px_repeat(7,1fr)] gap-px">
                            <Link
                                href={`/planners/app/weekly?year=${weekYear}&week=${week}`}
                                title={`W${week} 주간 보기`}
                                className="flex items-center justify-center text-[8px] text-neutral-300 hover:text-[#0F766E] font-mono leading-none"
                            >
                                {week}
                            </Link>
                            {rowCells.map((c) => {
                                const isToday = c.date === date;
                                const holiday = getHoliday(c.date);
                                const dow = new Date(c.date + "T00:00:00Z").getUTCDay();
                                const isSun = dow === 0;
                                const isSat = dow === 6;
                                const isHol = holiday?.type === "holiday";
                                const hasEntry = entryDates.has(c.date);
                                return (
                                    <Link
                                        key={c.date}
                                        href={`/planners/app/daily?date=${c.date}`}
                                        className={`relative flex items-center justify-center text-[10px] rounded py-[3px] transition-colors
                                            ${isToday ? "bg-[#0F766E] text-white font-semibold"
                                            : !c.inMonth ? "text-neutral-200"
                                            : isHol || isSun ? "text-rose-500 hover:bg-rose-50"
                                            : isSat ? "text-sky-500 hover:bg-neutral-50"
                                            : "text-neutral-700 hover:bg-neutral-50"}`}
                                        title={holiday?.label || c.date}
                                    >
                                        {c.dom}
                                        {hasEntry && !isToday && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-[#0F766E]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
