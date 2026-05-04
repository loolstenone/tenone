"use client";

// Myverse 4 Pillars 사이드바 — 9 영역을 4 그룹으로 단축한 멘탈 모델
//   나(Me): BODY · 일상 · 관계
//   일(Do): 업무 · 공부
//   시간(Time): 일정 · 이동 · 여행
//   나누기(Share): Verse 통합 타임라인 · @handle 공개 페이지

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User, Briefcase, Clock, Share2,
    Heart, Coffee, Users,
    BookOpen, Calendar, Navigation, Plane,
    Orbit, AtSign, Bot, Settings, Shield, Archive,
    Sun, CalendarDays, CalendarRange, CalendarClock,
    UserSquare2, FolderKanban, Contact2, FileText, Palette, Search as SearchIcon, Timer,
    ListChecks, Hash, Sparkles, HelpCircle,
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    color?: string;
    note?: string;
}

interface PillarGroup {
    key: "me" | "do" | "time" | "planner" | "share" | "system";
    label: string;
    icon: React.ElementType;
    items: NavItem[];
}

const PILLARS: PillarGroup[] = [
    {
        key: "me",
        label: "나",
        icon: User,
        items: [
            { label: "BODY",       href: "/myverse/app/body",     icon: Heart,  color: "#10B981" },
            { label: "일상",       href: "/myverse/app/lifestyle", icon: Coffee, color: "#F59E0B" },
            { label: "관계",       href: "/myverse/app/relation", icon: Users,  color: "#EF4444" },
        ],
    },
    {
        key: "do",
        label: "일",
        icon: Briefcase,
        items: [
            { label: "업무",       href: "/myverse/app/work",  icon: Briefcase, color: "#3B82F6" },
            { label: "공부",       href: "/myverse/app/study", icon: BookOpen,  color: "#A855F7" },
        ],
    },
    {
        key: "time",
        label: "시간",
        icon: Clock,
        items: [
            { label: "일정",       href: "/myverse/app/schedule", icon: Calendar,   color: "#0F766E" },
            { label: "이동",       href: "/myverse/app/move",     icon: Navigation, color: "#6B7280" },
            { label: "여행",       href: "/myverse/app/travel",   icon: Plane,      color: "#EC4899" },
        ],
    },
    {
        key: "planner",
        label: "플래너",
        icon: CalendarDays,
        items: [
            { label: "오늘",       href: "/myverse/app/today",       icon: Sun,           color: "#6366F1" },
            { label: "주간",       href: "/myverse/app/weekly",      icon: CalendarRange, color: "#6366F1" },
            { label: "월간",       href: "/myverse/app/monthly",     icon: CalendarDays,  color: "#6366F1" },
            { label: "연간",       href: "/myverse/app/yearly",      icon: CalendarClock, color: "#6366F1" },
            { label: "퍼스널",     href: "/myverse/app/personal",    icon: UserSquare2,   color: "#6366F1" },
            { label: "프로젝트",   href: "/myverse/app/projects",    icon: FolderKanban,  color: "#6366F1" },
            { label: "업무",       href: "/myverse/app/tasks",       icon: ListChecks,    color: "#6366F1" },
            { label: "연락처",     href: "/myverse/app/contacts",    icon: Contact2,      color: "#6366F1" },
            { label: "템플릿",     href: "/myverse/app/templates",   icon: FileText,      color: "#6366F1" },
            { label: "캔버스",     href: "/myverse/app/canvas",      icon: Palette,       color: "#6366F1" },
            { label: "검색",       href: "/myverse/app/search",      icon: SearchIcon,    color: "#6366F1" },
            { label: "시간",       href: "/myverse/app/time",        icon: Timer,         color: "#6366F1" },
            { label: "인덱스",     href: "/myverse/app/index",       icon: Hash,          color: "#6366F1" },
            { label: "AI 브리핑",  href: "/myverse/app/ai-briefing", icon: Sparkles,      color: "#6366F1" },
        ],
    },
    {
        key: "share",
        label: "나누기",
        icon: Share2,
        items: [
            { label: "Verse 타임라인", href: "/myverse/app/verse",  icon: Orbit, color: "#6366F1" },
            { label: "AI 코칭",        href: "/myverse/app/coach", icon: Bot,   color: "#6366F1" },
            // @handle은 동적으로 채움
        ],
    },
    {
        key: "system",
        label: "시스템",
        icon: Settings,
        items: [
            { label: "설정",            href: "/myverse/app/settings",         icon: Settings, color: "#6B7280" },
            { label: "백업 가져오기",   href: "/myverse/app/settings/imports", icon: Archive,  color: "#6366F1" },
            { label: "사생활",          href: "/myverse/app/settings/privacy", icon: Shield,   color: "#6B7280" },
            { label: "도움말",          href: "/myverse/app/help",             icon: HelpCircle, color: "#6B7280" },
        ],
    },
];

export function MyverseSidebar({ handle }: { handle: string | null }) {
    const pathname = usePathname();

    function isActive(href: string): boolean {
        if (href === pathname) return true;
        return pathname.startsWith(href + "/");
    }

    return (
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-neutral-200 bg-white">
            <div className="flex-1 overflow-y-auto py-4">
                {PILLARS.map((pillar, idx) => (
                    <div key={pillar.key} className={idx > 0 ? "mt-4" : ""}>
                        <div className="px-4 mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-400">
                            <pillar.icon className="h-3 w-3" />
                            {pillar.label}
                        </div>
                        <ul className="space-y-px">
                            {pillar.items.map(item => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-2 px-4 py-1.5 text-sm transition-colors ${
                                                active
                                                    ? "text-[#6366F1] bg-[#6366F1]/5 font-semibold border-r-2 border-[#6366F1]"
                                                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                                            }`}
                                        >
                                            <Icon
                                                className="h-3.5 w-3.5"
                                                style={!active && item.color ? { color: item.color } : undefined}
                                            />
                                            <span className="flex-1">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}

                            {/* 나누기 그룹 — @handle 동적 노출 */}
                            {pillar.key === "share" && (
                                <li>
                                    <Link
                                        href={handle ? `/myverse/${handle}` : "/myverse/app/settings/handle"}
                                        className={`flex items-center gap-2 px-4 py-1.5 text-sm transition-colors ${
                                            handle && pathname === `/myverse/${handle}`
                                                ? "text-[#6366F1] bg-[#6366F1]/5 font-semibold border-r-2 border-[#6366F1]"
                                                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                                        }`}
                                    >
                                        <AtSign className="h-3.5 w-3.5" style={{ color: "#6366F1" }} />
                                        <span className="flex-1 font-mono">
                                            {handle ? `@${handle}` : "핸들 등록"}
                                        </span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                ))}
            </div>

            {/* 푸터 — 시간 줌 (Daily/Weekly/Monthly/Yearly) */}
            <div className="border-t border-neutral-200 px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">시간 줌</div>
                <div className="flex flex-wrap gap-1">
                    {[
                        { l: "일",   h: "/myverse/app/today" },
                        { l: "주",   h: "/myverse/app/weekly" },
                        { l: "월",   h: "/myverse/app/monthly" },
                        { l: "년",   h: "/myverse/app/yearly" },
                    ].map(z => (
                        <Link
                            key={z.h}
                            href={z.h}
                            className="px-2 py-0.5 text-[11px] rounded bg-neutral-100 text-neutral-600 hover:bg-[#6366F1]/10 hover:text-[#6366F1] transition-colors"
                        >
                            {z.l}
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
}
