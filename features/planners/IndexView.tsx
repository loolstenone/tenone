"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { getISOWeek } from "@/lib/planners/types";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { useSwipeNav } from "./useSwipeNav";

const MONTHS_KO = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
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

interface Project { id: string; title: string }
interface Identity {
    vision_statement?: string; vision_roof?: string; inside_vision?: string;
    mission_statement?: string; vision_walls?: string;
    inside_values?: string[];
}

export function IndexView() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const [year, setYear] = useState(now.getFullYear());
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoaded, setProjectsLoaded] = useState(false);
    const [identity, setIdentity] = useState<Identity | null>(null);

    useEffect(() => {
        fetch("/api/planners/projects")
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.projects) setProjects(d.projects.slice(0, 20)); setProjectsLoaded(true); })
            .catch(() => setProjectsLoaded(true));
        fetch("/api/planners/identity")
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.identity) setIdentity(d.identity); })
            .catch(() => {});
    }, []);

    const vision = identity?.vision_statement ?? identity?.vision_roof ?? identity?.inside_vision ?? "";
    const mission = identity?.mission_statement ?? identity?.vision_walls ?? "";

    const swipeRef = useSwipeNav(
        () => setYear(y => y + 1),
        () => setYear(y => y - 1),
    );

    return (
        <div ref={swipeRef} className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12 space-y-8 md:space-y-12">

            {/* ── 헤더 ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-3">
                <div className="flex items-center gap-2">
                    <LayoutGrid className="h-6 w-6 text-[#0F766E]" />
                    <h1 className="font-serif text-2xl md:text-3xl text-neutral-900">인덱스</h1>
                    <div className="flex items-center gap-0.5 ml-1">
                        <button onClick={() => setYear(y => y - 1)} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium text-neutral-500 w-10 text-center">{year}</span>
                        <button onClick={() => setYear(y => y + 1)} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <PlannersUtilityLinks className="sm:ml-auto" />
            </div>

            {/* ── 1. 퍼스널 아이덴티티 ── */}
            <section>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">퍼스널 아이덴티티</p>
                {vision ? (
                    <div className="mb-3 space-y-1">
                        {vision.split("\n").filter(Boolean).map((line, i) => (
                            <p key={i} className={`text-neutral-800 leading-snug ${i === 0 ? "text-sm font-medium" : "text-xs text-neutral-500"}`}>
                                {line}
                            </p>
                        ))}
                        {mission && (
                            <p className="text-xs text-neutral-400 mt-0.5">{mission.split("\n")[0]}</p>
                        )}
                    </div>
                ) : (
                    <p className="text-xs text-neutral-300 italic mb-3">비전을 입력해보세요</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    <Link href="/planners/app/identity" className="text-xs text-neutral-500 hover:text-[#0F766E] transition-colors">비전</Link>
                    <Link href="/planners/app/identity" className="text-xs text-neutral-500 hover:text-[#0F766E] transition-colors">미션</Link>
                    <Link href="/planners/app/identity" className="text-xs text-neutral-500 hover:text-[#0F766E] transition-colors">핵심가치</Link>
                    <Link href="/planners/app/identity" className="text-xs text-[#0F766E] hover:underline transition-colors font-medium">전체 →</Link>
                </div>
            </section>

            {/* ── 2. 연간 달력 (모바일 2열, 태블릿+ 3열, 대화면 4열) ── */}
            <section>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">연간 달력</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-6">
                    {MONTHS_KO.map((monthName, mIdx) => {
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
            </section>

            {/* ── 3. 프로젝트 + 템플릿 ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">

                {/* 프로젝트 */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">프로젝트</p>
                        <Link href="/planners/app/projects" className="text-[10px] text-[#0F766E] hover:underline">전체 →</Link>
                    </div>
                    {!projectsLoaded ? (
                        <div className="space-y-1.5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-[11px] text-neutral-200 font-mono w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                    <span className="flex-1 border-b border-neutral-100 pb-0.5" />
                                </div>
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="space-y-1.5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-[11px] text-neutral-300 font-mono w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                    <span className="flex-1 border-b border-neutral-100 pb-0.5" />
                                </div>
                            ))}
                            <Link href="/planners/app/projects" className="mt-3 inline-block text-[10px] text-[#0F766E] hover:underline">+ 만들기</Link>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {projects.map((project, i) => (
                                <div key={project.id} className="flex items-center gap-2">
                                    <span className="text-[11px] text-neutral-400 font-mono w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
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
                </section>

                {/* 템플릿 */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">템플릿</p>
                        <Link href="/planners/app/templates" className="text-[10px] text-[#0F766E] hover:underline">전체 →</Link>
                    </div>
                    <div className="space-y-2">
                        <Link href="/planners/app/templates?category=framework" className="flex items-center justify-between py-1 border-b border-neutral-100 hover:border-[#0F766E] group transition-colors">
                            <span className="text-sm font-semibold text-neutral-700 group-hover:text-[#0F766E] transition-colors">프레임워크북</span>
                            <span className="text-[10px] text-neutral-400">26</span>
                        </Link>
                        <Link href="/planners/app/templates?category=schedule" className="flex items-center justify-between py-1 border-b border-neutral-100 hover:border-[#0F766E] group transition-colors">
                            <span className="text-sm font-semibold text-neutral-700 group-hover:text-[#0F766E] transition-colors">일정</span>
                            <span className="text-[10px] text-neutral-400">19</span>
                        </Link>
                        <Link href="/planners/app/templates?category=note" className="flex items-center justify-between py-1 border-b border-neutral-100 hover:border-[#0F766E] group transition-colors">
                            <span className="text-sm font-semibold text-neutral-700 group-hover:text-[#0F766E] transition-colors">노트</span>
                            <span className="text-[10px] text-neutral-400">64</span>
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}
