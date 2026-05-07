"use client";

// Myverse 4 Pillars 사이드바 — 9 영역을 4 그룹으로 단축한 멘탈 모델
//   나(Me): BODY · 일상 · 관계
//   일(Do): 업무 · 공부
//   시간(Time): 일정 · 이동 · 여행
//   나누기(Share): Verse 통합 타임라인 · @handle 공개 페이지
//
// 9 영역 SSOT: lib/myverse/domains.ts (DOMAINS · PILLARS · app_href)

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
    type LucideIcon,
} from "lucide-react";
import { DOMAINS, PILLARS, type DomainKey, type PillarKey } from "@/lib/myverse/domains";

// ── 아이콘 맵 (icon_name → Lucide component) ──────────────────
const DOMAIN_ICON_MAP: Record<DomainKey, LucideIcon> = {
    body:     Heart,
    daily:    Coffee,
    relation: Users,
    work:     Briefcase,
    study:    BookOpen,
    schedule: Calendar,
    move:     Navigation,
    travel:   Plane,
};

const PILLAR_ICON_MAP: Record<PillarKey, LucideIcon> = {
    me:    User,
    do:    Briefcase,
    time:  Clock,
    share: Share2,
};

// ── 플래너·나누기·시스템 — 9영역 SSOT 밖의 앱 전용 항목 ──────
interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    color?: string;
    note?: string;
}

interface LocalGroup {
    key: string;
    label: string;
    icon: LucideIcon;
    items: NavItem[];
}

const LOCAL_GROUPS: LocalGroup[] = [
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
            // @handle은 아래에서 동적으로 렌더
        ],
    },
    {
        key: "system",
        label: "시스템",
        icon: Settings,
        items: [
            { label: "설정",            href: "/myverse/app/settings",         icon: Settings,   color: "#6B7280" },
            { label: "백업 가져오기",   href: "/myverse/app/settings/imports", icon: Archive,    color: "#6366F1" },
            { label: "사생활",          href: "/myverse/app/settings/privacy", icon: Shield,     color: "#6B7280" },
            { label: "도움말",          href: "/myverse/app/help",             icon: HelpCircle, color: "#6B7280" },
        ],
    },
];

// ── 공통 NavLink ───────────────────────────────────────────────
function NavLink({
    href,
    icon: Icon,
    label,
    color,
    active,
}: {
    href: string;
    icon: LucideIcon;
    label: string;
    color?: string;
    active: boolean;
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm transition-colors ${
                active
                    ? "text-[#6366F1] bg-[#6366F1]/5 font-semibold border-r-2 border-[#6366F1]"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
        >
            <Icon
                className="h-3.5 w-3.5"
                style={!active && color ? { color } : undefined}
            />
            <span className="flex-1">{label}</span>
        </Link>
    );
}

// ── 섹션 헤더 ─────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
    return (
        <div className="px-4 mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-400">
            <Icon className="h-3 w-3" />
            {label}
        </div>
    );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export function MyverseSidebar({ handle }: { handle: string | null }) {
    const pathname = usePathname();

    function isActive(href: string): boolean {
        if (href === pathname) return true;
        return pathname.startsWith(href + "/");
    }

    // SSOT 기반 9영역 pillar 그룹 (me / do / time)
    const domainPillars = PILLARS.filter(p => p.domains && p.domains.length > 0);

    return (
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-neutral-200 bg-white">
            <div className="flex-1 overflow-y-auto py-4">

                {/* ── 9영역 (SSOT) ── */}
                {domainPillars.map((pillar, idx) => (
                    <div key={pillar.key} className={idx > 0 ? "mt-4" : ""}>
                        <SectionHeader
                            icon={PILLAR_ICON_MAP[pillar.key]}
                            label={pillar.label_ko}
                        />
                        <ul className="space-y-px">
                            {(pillar.domains ?? []).map(domainKey => {
                                const domain = DOMAINS[domainKey];
                                const active = isActive(domain.app_href);
                                return (
                                    <li key={domainKey}>
                                        <NavLink
                                            href={domain.app_href}
                                            icon={DOMAIN_ICON_MAP[domainKey]}
                                            label={domain.label_ko}
                                            color={domain.color_hex}
                                            active={active}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}

                {/* ── 플래너·나누기·시스템 (앱 전용) ── */}
                {LOCAL_GROUPS.map(group => (
                    <div key={group.key} className="mt-4">
                        <SectionHeader icon={group.icon} label={group.label} />
                        <ul className="space-y-px">
                            {group.items.map(item => (
                                <li key={item.href}>
                                    <NavLink
                                        href={item.href}
                                        icon={item.icon}
                                        label={item.label}
                                        color={item.color}
                                        active={isActive(item.href)}
                                    />
                                </li>
                            ))}

                            {/* 나누기 그룹 — @handle 동적 노출 */}
                            {group.key === "share" && (
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
                        { l: "일", h: "/myverse/app/today" },
                        { l: "주", h: "/myverse/app/weekly" },
                        { l: "월", h: "/myverse/app/monthly" },
                        { l: "년", h: "/myverse/app/yearly" },
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
