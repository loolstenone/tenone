"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getISOWeek } from "@/lib/planners/types";

const MONTHS_EN = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

type CalCell = { date: string; dom: number; inMonth: boolean; week: number };

function buildMonth(year: number, mIdx: number): CalCell[][] {
    const first = new Date(Date.UTC(year, mIdx, 1));
    const last = new Date(Date.UTC(year, mIdx + 1, 0));
    const pad = (first.getUTCDay() + 6) % 7;
    const rows: CalCell[][] = [];
    let row: CalCell[] = [];

    for (let i = pad; i > 0; i--) {
        const d = new Date(first);
        d.setUTCDate(d.getUTCDate() - i);
        const { week } = getISOWeek(d);
        row.push({ date: d.toISOString().slice(0, 10), dom: d.getUTCDate(), inMonth: false, week });
    }

    for (let dom = 1; dom <= last.getUTCDate(); dom++) {
        const d = new Date(Date.UTC(year, mIdx, dom));
        const { week } = getISOWeek(d);
        row.push({ date: d.toISOString().slice(0, 10), dom, inMonth: true, week });
        if (row.length === 7) { rows.push(row); row = []; }
    }

    if (row.length > 0) {
        const tail = new Date(row[row.length - 1].date + "T00:00:00Z");
        while (row.length < 7) {
            tail.setUTCDate(tail.getUTCDate() + 1);
            const { week } = getISOWeek(tail);
            row.push({ date: tail.toISOString().slice(0, 10), dom: tail.getUTCDate(), inMonth: false, week });
        }
        rows.push(row);
    }

    return rows;
}

export function MonthlyCalendarView({ initialYear }: { initialYear: number }) {
    const [year, setYear] = useState(initialYear);

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            {/* Header */}
            <div className="flex items-start gap-10 mb-8">
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setYear(y => y - 1)}
                        className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h1 className="font-serif text-5xl font-bold italic text-neutral-400 leading-none select-none tracking-tight">
                        Monthly
                    </h1>
                    <button
                        onClick={() => setYear(y => y + 1)}
                        className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Legend */}
                <ul className="pt-3 space-y-0.5 text-[11px] text-neutral-400">
                    {[
                        ["W01", "Weekly 링크"],
                        ["01", "Daily 링크"],
                        ["January", "Monthly 링크"],
                    ].map(([key, label]) => (
                        <li key={key} className="flex items-center gap-1.5">
                            <span className="text-[8px] text-neutral-400">▪</span>
                            <span className="text-neutral-600 font-medium">{key}:</span>
                            <span>{label}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 12-month grid */}
            <div className="grid grid-cols-3 gap-x-8 gap-y-8">
                {MONTHS_EN.map((monthName, mIdx) => {
                    const rows = buildMonth(year, mIdx);
                    return (
                        <div key={mIdx}>
                            {/* Month name → monthly detail */}
                            <Link href={`/planners/app/monthly?year=${year}&month=${mIdx + 1}`}>
                                <div className="bg-neutral-500 text-white text-center text-[11px] font-semibold py-1 hover:bg-[#0F766E] transition-colors">
                                    {monthName}
                                </div>
                            </Link>

                            {/* Day headers */}
                            <div className="grid grid-cols-[26px_repeat(7,1fr)] mt-0.5 mb-px">
                                <div />
                                {["M", "T", "W", "T", "F", "S", "S"].map((d, di) => (
                                    <div
                                        key={di}
                                        className={`text-center text-[9px] font-medium ${di >= 5 ? "text-pink-400" : "text-neutral-400"}`}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Week rows */}
                            {rows.map((row, ri) => (
                                <div key={ri} className="grid grid-cols-[26px_repeat(7,1fr)]">
                                    {/* Week number → weekly view */}
                                    <Link
                                        href={`/planners/app/weekly?year=${year}&week=${row[0].week}`}
                                        className="flex items-center justify-end pr-1 text-[8px] text-neutral-300 hover:text-[#0F766E] transition-colors leading-5"
                                    >
                                        W{String(row[0].week).padStart(2, "0")}
                                    </Link>

                                    {/* Date cells → daily view */}
                                    {row.map((cell, ci) => {
                                        const isWeekend = ci >= 5;
                                        const isToday = cell.date === todayStr;
                                        return (
                                            <Link
                                                key={ci}
                                                href={`/planners/app/daily?date=${cell.date}`}
                                                className={`text-center text-[10px] leading-5 rounded-sm transition-colors hover:bg-neutral-100 ${
                                                    isToday
                                                        ? "bg-[#0F766E]/10 text-[#0F766E] font-bold"
                                                        : !cell.inMonth
                                                        ? "text-neutral-200"
                                                        : isWeekend
                                                        ? "text-pink-400"
                                                        : "text-neutral-600"
                                                }`}
                                            >
                                                {cell.dom}
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
