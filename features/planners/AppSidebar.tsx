"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Compass,
    Sun,
    CalendarDays,
    CalendarRange,
    CalendarClock,
    FolderKanban,
    Sparkles,
    Settings,
    Search,
    HelpCircle,
    Users,
    LayoutGrid,
    Download,
    Pencil,
    MessageCircle,
} from "lucide-react";
import type { PlannerMode, SubscriptionStatus } from "@/lib/planners/types";
import { InstallButton } from "./InstallButton";

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    modes: PlannerMode[];
    external?: boolean;
}

// Order/labels MUST match AppTopNav.tsx TABS. Single source of truth for menu order.
const NAV: NavItem[] = [
    { href: "/planners/app/index",       label: "홈",          icon: LayoutGrid,      modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/daily",       label: "오늘",        icon: Sun,             modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/weekly",      label: "주간",        icon: CalendarDays,    modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/monthly",     label: "월간",        icon: CalendarRange,   modes: ["all_in_one"] },
    { href: "/planners/app/yearly",      label: "연간",        icon: CalendarClock,   modes: ["all_in_one"] },
    { href: "/planners/app/identity",    label: "아이덴티티",  icon: Compass,         modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/projects",    label: "프로젝트",    icon: FolderKanban,    modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/canvas",      label: "캔버스",      icon: Pencil,          modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/contacts",    label: "연락처",      icon: Users,           modes: ["weekly", "all_in_one"] },
    { href: "/planners/community",       label: "커뮤니티",    icon: MessageCircle,   modes: ["weekly", "all_in_one"], external: true },
    // 템플릿 / AI 브리핑 은 메인 메뉴에서 제외 — 각 본문에서 서브 메뉴 링크로 제공
];

export function AppSidebar({
    mode,
    userName,
    subscriptionStatus = 'free',
    subscriptionExpires,
}: {
    mode: PlannerMode;
    userName?: string;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionExpires?: string | null;
}) {
    const pathname = usePathname();
    const visibleNav = NAV.filter((n) => n.modes.includes(mode));

    return (
        <aside className="w-60 shrink-0 bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0">
            {/* Brand */}
            <div className="px-5 py-5 border-b border-neutral-100">
                <Link href="/planners/app" className="inline-flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/planners-icon-192.png" alt="" aria-hidden="true" className="w-8 h-8 rounded-md shrink-0" />
                    <span className="inline-flex items-baseline gap-1">
                        <span className="text-base font-bold text-neutral-900 leading-none">Planner&apos;s Planner</span>
                        <sup className="text-[10px] font-semibold text-[#0F766E] tracking-widest">AI</sup>
                    </span>
                </Link>
                {userName && (
                    <p className="text-xs text-neutral-500 mt-3">안녕하세요, {userName}님</p>
                )}
            </div>

            {/* Search */}
            <div className="px-3 pt-3">
                <Link
                    href="/planners/app/search"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-500 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                    <Search className="h-3.5 w-3.5" />
                    <span>검색…</span>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                {visibleNav.map((item) => {
                    const active = !item.external && (pathname === item.href || pathname.startsWith(item.href + "/"));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener" : undefined}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                active
                                    ? "bg-[#0F766E] text-white"
                                    : "text-neutral-700 hover:bg-neutral-100"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{item.label}</span>
                            {item.external && <span className="text-[10px] text-neutral-400">↗</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-3 pb-4 pt-2 border-t border-neutral-100 space-y-1">
                <Link
                    href="/planners/app/settings"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        pathname.startsWith("/planners/app/settings")
                            ? "bg-neutral-100 text-neutral-900"
                            : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                >
                    <Settings className="h-4 w-4" />
                    <span>설정</span>
                </Link>
                <Link
                    href="/planners/app/help"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        pathname.startsWith("/planners/app/help")
                            ? "bg-neutral-100 text-neutral-900"
                            : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                >
                    <HelpCircle className="h-4 w-4" />
                    <span>도움말</span>
                </Link>
                <InstallButton
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#0F766E] hover:bg-[#0F766E]/5 transition-colors"
                >
                    <Download className="h-4 w-4" />
                    <span>앱 설치</span>
                </InstallButton>
                <div className="px-3 pt-2 flex items-center gap-2 flex-wrap">
                    <span className="inline-block text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                        {mode === "weekly" ? "주간" : "올인원"}
                    </span>
                    {subscriptionStatus === 'active' && (
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-[#0F766E]/10 text-[#0F766E] rounded">
                            활성
                        </span>
                    )}
                </div>

                {subscriptionStatus !== 'active' && (
                    <Link
                        href="/planners/purchase"
                        className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-[#0F766E] to-[#0d5e56] text-white rounded-lg text-xs hover:opacity-90 transition-opacity"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>1년 구독 시작</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}
