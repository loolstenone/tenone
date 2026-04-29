"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid, UserCircle2, CalendarRange, FolderKanban, LayoutTemplate, User } from "lucide-react";
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

            {/* ── 메인 레이아웃: 모바일 단열 / md+ 2열 ── */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-start">

                {/* ────── 좌: 연간 달력 ────── */}
                <section className="flex-1 min-w-0">
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

                {/* ────── 우: 인덱스 사이드바 (PC·태블릿만) ────── */}
                <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-6">

                    {/* 인덱스 — 플래너 섹션 빠른 이동 */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">인덱스</p>
                        <nav className="space-y-px">
                            {[
                                { href: "/planners/app/daily",    label: "일간",     sub: "오늘 일정·노트" },
                                { href: "/planners/app/weekly",   label: "주간",     sub: "이번 주 계획" },
                                { href: "/planners/app/monthly",  label: "월간",     sub: "월 달력·목표" },
                                { href: `/planners/app/yearly?year=${year}`, label: "연간", sub: `${year}년 로드맵` },
                                { href: "/planners/app/projects", label: "프로젝트", sub: "목표·마일스톤" },
                                { href: "/planners/app/templates",label: "템플릿",   sub: "프레임워크·노트" },
                                { href: "/planners/app/canvas",   label: "캔버스",   sub: "자유 스케치" },
                                { href: "/planners/app/identity", label: "아이덴티티", sub: "비전·미션·가치" },
                            ].map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-neutral-50 group transition-colors"
                                >
                                    <span className="text-sm font-medium text-neutral-700 group-hover:text-[#0F766E] transition-colors">{item.label}</span>
                                    <span className="text-[10px] text-neutral-300 group-hover:text-neutral-400 transition-colors">{item.sub}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* 퍼스널 아이덴티티 */}
                    <div>
                        <Link href="/planners/app/identity" className="flex items-center gap-1.5 mb-3 group">
                            <User className="h-3.5 w-3.5 text-neutral-400 group-hover:text-[#0F766E] transition-colors" />
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 group-hover:text-[#0F766E] transition-colors">퍼스널 아이덴티티 →</p>
                        </Link>
                        {vision ? (
                            <div className="space-y-1">
                                {vision.split("\n").filter(Boolean).map((line, i) => (
                                    <p key={i} className={`leading-snug ${i === 0 ? "text-sm font-medium text-neutral-800" : "text-xs text-neutral-400"}`}>
                                        {line}
                                    </p>
                                ))}
                                {mission && (
                                    <p className="text-xs text-neutral-400 mt-0.5 pt-1 border-t border-neutral-100">{mission.split("\n")[0]}</p>
                                )}
                            </div>
                        ) : (
                            <Link href="/planners/app/identity" className="block text-xs text-neutral-300 italic hover:text-[#0F766E] transition-colors">
                                비전·미션·핵심가치를 입력해보세요 →
                            </Link>
                        )}
                    </div>

                    <div className="h-px bg-neutral-100" />

                    {/* 연간 목표 */}
                    <div>
                        <Link href={`/planners/app/yearly?year=${now.getFullYear()}`} className="flex items-center gap-1.5 mb-3 group">
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

                    <div className="h-px bg-neutral-100" />

                    {/* 달력 · 프로젝트 · 템플릿 */}
                    <div className="space-y-3">

                        {/* 프로젝트 */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <FolderKanban className="h-3.5 w-3.5 text-neutral-400" />
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">프로젝트</p>
                                </div>
                                <Link href="/planners/app/projects" className="text-[10px] text-[#0F766E] hover:underline">전체 →</Link>
                            </div>
                            {!projectsLoaded ? (
                                <div className="space-y-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-[10px] text-neutral-200 font-mono w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                            <span className="flex-1 border-b border-neutral-100 pb-0.5 h-3.5" />
                                        </div>
                                    ))}
                                </div>
                            ) : projects.length === 0 ? (
                                <Link href="/planners/app/projects" className="text-xs text-neutral-300 italic hover:text-[#0F766E] transition-colors">
                                    + 프로젝트 만들기
                                </Link>
                            ) : (
                                <div className="space-y-1">
                                    {projects.slice(0, 6).map((project, i) => (
                                        <div key={project.id} className="flex items-center gap-2">
                                            <span className="text-[10px] text-neutral-400 font-mono w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                            <Link
                                                href={`/planners/app/projects/${project.id}`}
                                                className="flex-1 border-b border-neutral-150 text-xs text-neutral-700 hover:text-[#0F766E] hover:border-[#0F766E] transition-colors pb-0.5 truncate"
                                            >
                                                {project.title}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 템플릿 */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <LayoutTemplate className="h-3.5 w-3.5 text-neutral-400" />
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">템플릿</p>
                                </div>
                                <Link href="/planners/app/templates" className="text-[10px] text-[#0F766E] hover:underline">전체 →</Link>
                            </div>
                            {userRole && roleTemplates.length > 0 ? (
                                <div className="space-y-1 mb-2">
                                    <div className="flex items-center gap-1 mb-1.5">
                                        <UserCircle2 className="h-3 w-3 text-teal-500" />
                                        <span className="text-[9px] font-semibold text-teal-600 uppercase tracking-wide">{PLANNER_ROLE_META[userRole].label} 추천</span>
                                    </div>
                                    {roleTemplates.slice(0, 4).map((tpl, i) => (
                                        <Link
                                            key={tpl.id}
                                            href="/planners/app/templates?category=my_role"
                                            className="flex items-center gap-2 py-0.5 border-b border-neutral-100 hover:border-teal-200 group transition-colors"
                                        >
                                            <span className="text-[10px] text-neutral-300 font-mono w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                            <span className="flex-1 text-xs text-neutral-600 group-hover:text-teal-700 transition-colors truncate">{tpl.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {[
                                        { href: "framework", label: "프레임워크북", count: 26 },
                                        { href: "schedule",  label: "일정",         count: 19 },
                                        { href: "note",      label: "노트",         count: 64 },
                                    ].map(cat => (
                                        <Link
                                            key={cat.href}
                                            href={`/planners/app/templates?category=${cat.href}`}
                                            className="flex items-center justify-between py-1 border-b border-neutral-100 hover:border-[#0F766E] group transition-colors"
                                        >
                                            <span className="text-xs text-neutral-700 group-hover:text-[#0F766E] transition-colors">{cat.label}</span>
                                            <span className="text-[10px] text-neutral-300">{cat.count}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 모바일: 섹션들 인라인 표시 */}
                </aside>
            </div>

            {/* ── 모바일 전용 — 아이덴티티 + 목표 + 프로젝트 + 템플릿 (lg 이상에서 숨김) ── */}
            <div className="lg:hidden mt-8 space-y-8">

                {/* 퍼스널 아이덴티티 */}
                <section>
                    <Link href="/planners/app/identity" className="inline-block text-[10px] font-semibold uppercase tracking-widest text-neutral-400 hover:text-[#0F766E] transition-colors mb-2">
                        퍼스널 아이덴티티 →
                    </Link>
                    {vision ? (
                        <div className="space-y-1">
                            {vision.split("\n").filter(Boolean).map((line, i) => (
                                <p key={i} className={`text-neutral-800 leading-snug ${i === 0 ? "text-sm font-medium" : "text-xs text-neutral-500"}`}>{line}</p>
                            ))}
                            {mission && <p className="text-xs text-neutral-400 mt-0.5">{mission.split("\n")[0]}</p>}
                        </div>
                    ) : (
                        <p className="text-xs text-neutral-300 italic">비전을 입력해보세요</p>
                    )}
                </section>

                {/* 연간 목표 */}
                {yearlyTheme && (
                    <section>
                        <Link href={`/planners/app/yearly?year=${now.getFullYear()}`} className="inline-block text-[10px] font-semibold uppercase tracking-widest text-neutral-400 hover:text-[#0F766E] transition-colors mb-2">
                            연간 목표 →
                        </Link>
                        <Link href={`/planners/app/yearly?year=${now.getFullYear()}`} className="block">
                            <p className="text-sm font-medium text-neutral-800 hover:text-[#0F766E] transition-colors">{yearlyTheme}</p>
                        </Link>
                    </section>
                )}

                {/* 프로젝트 + 템플릿 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">프로젝트</p>
                            <Link href="/planners/app/projects" className="text-[10px] text-[#0F766E] hover:underline">전체 →</Link>
                        </div>
                        {projects.length === 0 ? (
                            <div className="space-y-1.5">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-[11px] text-neutral-300 font-mono w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                                        <span className="flex-1 border-b border-neutral-100 pb-0.5" />
                                    </div>
                                ))}
                                <Link href="/planners/app/projects" className="mt-2 inline-block text-[10px] text-[#0F766E] hover:underline">+ 만들기</Link>
                            </div>
                        ) : (
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
                        )}
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">템플릿</p>
                            <Link href="/planners/app/templates" className="text-[10px] text-[#0F766E] hover:underline">전체 →</Link>
                        </div>
                        {userRole && roleTemplates.length > 0 ? (
                            <>
                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <UserCircle2 className="h-3.5 w-3.5 text-teal-600" />
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
                        ) : (
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
                        )}
                    </section>
                </div>
            </div>

        </div>
    );
}
