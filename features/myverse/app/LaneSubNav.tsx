"use client";

// Lane 공통 2차 네비게이션 — AI / 연결 lane 안에서 탭 전환.
// SSOT: lib/myverse/domains.ts 의 LANES.

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SubTab {
    key: string;
    label: string;
    href: string;
}

export const AI_LANE_TABS: SubTab[] = [
    { key: "ask",      label: "묻기",     href: "/myverse/app/ask" },
    { key: "coach",    label: "코치",     href: "/myverse/app/coach" },
    { key: "diary",    label: "일기",     href: "/myverse/app/diary" },
    { key: "insights", label: "인사이트", href: "/myverse/app/insights" },
    { key: "capsules", label: "캡슐",     href: "/myverse/app/capsules" },
];

// 기록 lane — 흔적 타임라인 + 시간 줌 (일간은 lane "오늘"이 담당)
export const RECORD_LANE_TABS: SubTab[] = [
    { key: "traces",  label: "흔적", href: "/myverse/app/traces" },
    { key: "weekly",  label: "주간", href: "/myverse/app/weekly" },
    { key: "monthly", label: "월간", href: "/myverse/app/monthly" },
    { key: "yearly",  label: "연간", href: "/myverse/app/yearly" },
];

export const CONNECT_LANE_TABS: SubTab[] = [
    { key: "feed",          label: "피드",   href: "/myverse/app/feed" },
    { key: "dm",            label: "DM",     href: "/myverse/app/dm" },
    { key: "verse",         label: "Verse",  href: "/myverse/app/verse" },
    { key: "notifications", label: "알림",   href: "/myverse/app/notifications" },
];

export const WORK_LANE_TABS: SubTab[] = [
    { key: "projects",  label: "프로젝트", href: "/myverse/app/projects" },
    { key: "tasks",     label: "할 일",    href: "/myverse/app/tasks" },
    { key: "canvas",    label: "캔버스",   href: "/myverse/app/canvas" },
    { key: "templates", label: "템플릿",   href: "/myverse/app/templates" },
    { key: "contacts",  label: "연락처",   href: "/myverse/app/contacts" },
    { key: "personal",  label: "퍼스널",   href: "/myverse/app/personal" },
];

export function LaneSubNav({ tabs, accent = "#6366F1" }: { tabs: SubTab[]; accent?: string }) {
    const pathname = usePathname();

    return (
        <nav className="border-b border-neutral-200 bg-white myverse-dark:bg-[#0D0D15] myverse-dark:border-white/8 px-4 sm:px-6">
            <div className="flex gap-0 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                {tabs.map(t => {
                    const active = pathname === t.href || pathname.startsWith(t.href + "/");
                    return (
                        <Link
                            key={t.key}
                            href={t.href}
                            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                                active
                                    ? "text-neutral-900 myverse-dark:text-white"
                                    : "border-transparent text-neutral-400 myverse-dark:text-neutral-500 hover:text-neutral-700 myverse-dark:hover:text-neutral-300"
                            }`}
                            style={active ? { borderBottomColor: accent, color: accent } : undefined}
                        >
                            {t.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
