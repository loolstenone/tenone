"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getISOWeek } from "@/lib/planners/types";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";

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

interface Project {
    id: string;
    title: string;
}

export function IndexView() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const [year, setYear] = useState(now.getFullYear());
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoaded, setProjectsLoaded] = useState(false);

    useEffect(() => {
        fetch("/api/planners/projects")
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.projects) setProjects(d.projects.slice(0, 20));
                setProjectsLoaded(true);
            })
            .catch(() => { setProjectsLoaded(true); });
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            <div className="flex items-center gap-3 mb-8">
                <h1 className="font-serif text-3xl text-neutral-900">Index</h1>
                <div className="flex items-center gap-0.5 ml-1">
                    <button onClick={() => setYear(y => y - 1)} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium text-neutral-500 w-10 text-center">{year}</span>
                    <button onClick={() => setYear(y => y + 1)} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
                <PlannersUtilityLinks className="ml-auto" />
            </div>

            <div className="grid grid-cols-[3fr_1fr_1fr] gap-x-10 gap-y-0 items-start">

                {/* ── Left: 12-month calendar ── */}
                <div className="grid grid-cols-3 gap-x-6 gap-y-8">
                    {MONTHS_EN.map((monthName, mIdx) => {
                        const rows = buildMonth(year, mIdx);
                        return (
                            <div key={mIdx}>
                                <Link href={`/planners/app/monthly?year=${year}&month=${mIdx + 1}`}>
                                    <div className="bg-neutral-500 text-white text-center text-[11px] font-semibold py-1 hover:bg-[#0F766E] transition-colors">
                                        {monthName}
                                    </div>
                                </Link>

                                <div className="grid grid-cols-[28px_repeat(7,1fr)] mt-0.5 mb-px">
                                    <div />
                                    {["M", "T", "W", "T", "F", "S", "S"].map((d, di) => (
                                        <div key={di} className={`text-center text-[10px] font-medium ${di >= 5 ? "text-pink-400" : "text-neutral-400"}`}>
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {rows.map((row, ri) => (
                                    <div key={ri} className="grid grid-cols-[28px_repeat(7,1fr)]">
                                        <Link
                                            href={`/planners/app/weekly?year=${year}&week=${row[0].week}`}
                                            className="flex items-center justify-end pr-1 text-[9px] text-neutral-300 hover:text-[#0F766E] transition-colors leading-5"
                                        >
                                            W{String(row[0].week).padStart(2, "0")}
                                        </Link>
                                        {row.map((cell, ci) => {
                                            const isToday = cell.date === todayStr;
                                            const isWeekend = ci >= 5;
                                            return (
                                                <Link
                                                    key={ci}
                                                    href={`/planners/app/daily?date=${cell.date}`}
                                                    className={`text-center text-[11px] leading-5 rounded-sm transition-colors hover:bg-neutral-100 ${
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

                {/* ── Center: Project ── */}
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">Project</p>
                    {!projectsLoaded ? (
                        <div className="space-y-1.5">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-[11px] text-neutral-200 font-mono w-6 shrink-0">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="flex-1 border-b border-neutral-100 pb-0.5" />
                                </div>
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="space-y-1.5">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-[11px] text-neutral-300 font-mono w-6 shrink-0">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="flex-1 border-b border-neutral-100 pb-0.5" />
                                </div>
                            ))}
                            <Link href="/planners/app/projects" className="mt-3 inline-block text-[10px] text-[#0F766E] hover:underline">
                                + 만들기
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {projects.map((project, i) => (
                                <div key={project.id} className="flex items-center gap-2">
                                    <span className="text-[11px] text-neutral-400 font-mono w-6 shrink-0">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <Link
                                        href={`/planners/app/projects/${project.id}`}
                                        className="flex-1 border-b border-neutral-200 text-xs text-neutral-700 hover:text-[#0F766E] hover:border-[#0F766E] transition-colors pb-0.5 truncate"
                                    >
                                        {project.title}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Right: Templates ── */}
                <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">Templates</p>
                    <Link href="/planners/app/templates?category=note" className="block text-sm font-semibold text-neutral-700 hover:text-[#0F766E] transition-colors">
                        Note <span className="text-[10px] font-normal text-neutral-400">64</span>
                    </Link>
                    <Link href="/planners/app/templates?category=schedule" className="block text-sm font-semibold text-neutral-700 hover:text-[#0F766E] transition-colors">
                        Schedule <span className="text-[10px] font-normal text-neutral-400">19</span>
                    </Link>
                    <Link href="/planners/app/templates?category=framework" className="block text-sm font-semibold text-neutral-700 hover:text-[#0F766E] transition-colors">
                        FrameWorkBook <span className="text-[10px] font-normal text-neutral-400">26</span>
                    </Link>
                    <div className="border-t border-neutral-100 pt-2 space-y-2">
                        <Link href="/planners/app/templates?category=cover" className="block text-sm font-semibold text-neutral-700 hover:text-[#0F766E] transition-colors">
                            Front Cover
                        </Link>
                        <Link href="/planners/app/identity" className="block text-sm font-semibold text-neutral-700 hover:text-[#0F766E] transition-colors">
                            Personal Identity
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
