"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid, CalendarRange, FolderKanban, LayoutTemplate, User } from "lucide-react";
import { getISOWeek } from "@/lib/planners/types";
import type { PlannerRole } from "@/lib/planners/types";
import { PLANNER_ROLE_META } from "@/lib/planners/types";
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
interface RoleTemplate { id: string; key: string; label: string; category: string; role_tags?: string[] }

export function IndexView() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const [year, setYear] = useState(now.getFullYear());
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoaded, setProjectsLoaded] = useState(false);
    const [identity, setIdentity] = useState<Identity | null>(null);
    const [yearlyTheme, setYearlyTheme] = useState<string>("");
    const [userRole, setUserRole] = useState<PlannerRole | null>(null);
    const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);

    useEffect(() => {
        fetch("/api/planners/projects")
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.projects) setProjects(d.projects.slice(0, 20)); setProjectsLoaded(true); })
            .catch(() => setProjectsLoaded(true));
        fetch("/api/planners/identity")
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.identity) setIdentity(d.identity); })
            .catch(() => {});
        fetch(`/api/planners/yearly?year=${now.getFullYear()}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.yearly) setYearlyTheme(d.yearly.theme || ""); })
            .catch(() => {});
        // 역할 + 템플릿 병렬 fetch
        Promise.all([
            fetch("/api/planners/settings").then(r => r.ok ? r.json() : null),
            fetch("/api/planners/templates").then(r => r.ok ? r.json() : null),
        ]).then(([settings, tplData]) => {
            const role = settings?.user?.user_role as PlannerRole | null | undefined;
            if (role) {
                setUserRole(role);
                const all: RoleTemplate[] = tplData?.templates ?? [];
                const matched = all.filter((t: RoleTemplate) => t.role_tags?.includes(role));
                setRoleTemplates(matched.slice(0, 5));
            }
        }).catch(() => {});
    }, []);

    const vision = identity?.vision_statement ?? identity?.vision_roof ?? identity?.inside_vision ?? "";
    const mission = identity?.mission_statement ?? identity?.vision_walls ?? "";

    const swipeRef = useSwipeNav(
        () => setYear(y => y + 1),
        () => setYear(y => y - 1),
    );

    // ── 프로젝트 + 템플릿 공통 렌더 헬퍼 ──────────────────────────────────────
    function renderProjects() {
        if (!projectsLoaded) return (
            <div className="space-y-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-200 font-mono w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <span className="flex-1 border-b border-neutral-100 pb-0.5" />
                    </div>
                ))}
            </div>
        );
        if (projects.length === 0) return (
            <div className="space-y-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-300 font-mono w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <span className="flex-1 border-b border-neutral-100 pb-0.5" />
                    </div>
                ))}
                <Link href="/planners/app/projects" className="mt-2 inline-block text-[10px] text-[#0F766E] hover:underline">+ 만들기</Link>
            </div>
        );
        return (
            <div className="space-y-1.5">
                {projects.map((project, i) => (
                    <div key={project.id} className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400 font-mono w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <Link href={`/planners/app/projects/${project.id}`} className="flex-1 border-b border-neutral-200 text-xs text-neutral-700 hover:text-[#0F766E] hover:border-[#0F766E] transition-colors pb-0.5 truncate">
                            {project.title}
                        </Link>
                    </div>
                ))}
            </div>
        );
    }

    function renderTemplates() {
        if (userRole && roleTemplates.length > 0) return (
            <>
                <div className="flex items-center gap-1.5 mb-2.5">
                    <User className="h-3.5 w-3.5 text-teal-600" />
                    <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wide">{PLANNER_ROLE_META[userRole].label} 추천</span>
                </div>
                <div className="space-y-1.5">
                    {roleTemplates.map((tpl, i) => (
                        <Link key={tpl.id} href="/planners/app/templates?category=my_role" className="flex items-center gap-2 py-1 border-b border-neutral-100 hover:border-teal-300 group transition-colors">
                            <span className="text-[11px] text-neutral-300 font-mono w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                            <span className="flex-1 text-xs text-neutral-700 group-hover:text-teal-700 transition-colors truncate">{tpl.label}</span>
                        </Link>
                    ))}
                </div>
            </>
        );
        return (
            <div className="space-y-2">
                {[
                    { href: "framework", label: "프레임워크북", count: 26 },
                    { href: "schedule",  label: "일정",         count: 19 },
                    { href: "note",      label: "노트",         count: 64 },
                ].map(cat => (
                    <Link key={cat.href} href={`/planners/app/templates?category=${cat.href}`} className="flex items-center justify-between py-1 border-b border-neutral-100 hover:border-[#0F766E] group transition-colors">
                        <span className="text-sm font-semibold text-neutral-700 group-hover:text-[#0F766E] transition-colors">{cat.label}</span>
                        <span className="text-[10px] text-neutral-400">{cat.count}</span>
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <div ref={swipeRef} className="max-w-screen-xl mx-auto px-4 md:px-8 py-6 md:py-10">

            {/* ── 헤더 ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-3 mb-6 md:mb-8">
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

            {/* ── 헤더 바로 아래: 퍼스널 아이덴티티 + 연간 목표 ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 pb-6 border-b border-neutral-100">
                {/* 퍼스널 아이덴티티 */}
                <div>
                    <Link href="/planners/app/identity" className="flex items-center gap-1.5 mb-2 group">
                        <User className="h-3.5 w-3.5 text-neutral-400 group-hover:text-[#0F766E] transition-colors" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 group-hover:text-[#0F766E] transition-colors">퍼스널 아이덴티티 →</p>
                    </Link>
                    {vision ? (
                        <div className="space-y-1">
                            {vision.split("\n").filter(Boolean).map((line, i) => (
                                <p key={i} className={`leading-snug ${i === 0 ? "text-sm font-medium text-neutral-800" : "text-xs text-neutral-500"}`}>{line}</p>
                            ))}
                            {mission && <p className="text-xs text-neutral-400 mt-0.5 pt-1 border-t border-neutral-100">{mission.split("\n")[0]}</p>}
                        </div>
                    ) : (
                        <Link href="/planners/app/identity" className="block text-xs text-neutral-300 italic hover:text-[#0F766E] transition-colors">
                            비전·미션·핵심가치를 입력해보세요 →
                        </Link>
                    )}
                </div>

                {/* 연간 목표 */}
                <div>
                    <Link href={`/planners/app/yearly?year=${now.getFullYear()}`} className="flex items-center gap-1.5 mb-2 group">
                        <CalendarRange className="h-3.5 w-3.5 text-neutral-400 group-hover:text-[#0F766E] transition-colors" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 group-hover:text-[#0F766E] transition-colors">연간 목표 →</p>
                    </Link>
                    {yearlyTheme ? (
                        <Link href={`/planners/app/yearly?year=${now.getFullYear()}`} className="block">
                            <p className="text-sm font-medium text-neutral-800 hover:text-[#0F766E] transition-colors">{yearlyTheme}</p>
                        </Link>
                    ) : (
                        <Link href={`/planners/app/yearly?year=${now.getFullYear()}`} className="block text-xs text-neutral-300 italic hover:text-[#0F766E] transition-colors">
                            올해의 목표를 설정해보세요 →
                        </Link>
                    )}
                </div>
            </div>

            {/* ── 메인 2열 레이아웃 ── */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-start">

                {/* ────── 좌: 연간 달력 ────── */}
                <section className="flex-1 min-w-0 order-2 lg:order-1">

                    {/* 연간 달력 그리드 */}
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">연간 달력</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-5 gap-y-6">
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
                                            <div key={di} className={`text-center text-[10px] font-medium ${di >= 5 ? "text-pink-400" : "text-neutral-400"}`}>{d}</div>
                                        ))}
                                    </div>
                                    {rows.map((row, ri) => (
                                        <div key={ri} className="grid grid-cols-[28px_repeat(7,1fr)]">
                                            <Link href={`/planners/app/weekly?year=${year}&week=${row[0].week}`} className="flex items-center justify-end pr-1 text-[9px] text-neutral-300 hover:text-[#0F766E] transition-colors leading-5">
                                                W{String(row[0].week).padStart(2, "0")}
                                            </Link>
                                            {row.map((cell, ci) => {
                                                const isToday = cell.date === todayStr;
                                                const isWeekend = ci >= 5;
                                                return (
                                                    <Link key={ci} href={`/planners/app/daily?date=${cell.date}`}
                                                        className={`text-center text-[11px] leading-5 rounded-sm transition-colors hover:bg-neutral-100 ${
                                                            isToday ? "bg-[#0F766E]/10 text-[#0F766E] font-bold"
                                                            : !cell.inMonth ? "text-neutral-200"
                                                            : isWeekend ? "text-pink-400"
                                                            : "text-neutral-600"
                                                        }`}
                                                    >{cell.dom}</Link>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    {/* 모바일 전용 — 프로젝트 + 템플릿 달력 아래 표시 */}
                    <div className="lg:hidden mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">프로젝트</p>
                                <Link href="/planners/app/projects" className="text-[10px] text-[#0F766E] hover:underline">전체 →</Link>
                            </div>
                            {renderProjects()}
                        </section>
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">템플릿</p>
                                <Link href="/planners/app/templates" className="text-[10px] text-[#0F766E] hover:underline">전체 →</Link>
                            </div>
                            {renderTemplates()}
                        </section>
                    </div>
                </section>

                {/* ────── 우: 사이드바 — PC·태블릿(lg+)만 표시 ────── */}
                <aside className="hidden lg:flex flex-col gap-6 w-64 xl:w-72 shrink-0 order-1 lg:order-2">

                    {/* 프로젝트 */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-1.5">
                                <FolderKanban className="h-3.5 w-3.5 text-neutral-400" />
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">프로젝트</p>
                            </div>
                            <Link href="/planners/app/projects" className="text-[10px] text-[#0F766E] hover:underline">전체 →</Link>
                        </div>
                        {renderProjects()}
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* 템플릿 */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-1.5">
                                <LayoutTemplate className="h-3.5 w-3.5 text-neutral-400" />
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">템플릿</p>
                            </div>
                            <Link href="/planners/app/templates" className="text-[10px] text-[#0F766E] hover:underline">전체 →</Link>
                        </div>
                        {renderTemplates()}
                    </div>

                </aside>
            </div>

        </div>
    );
}
