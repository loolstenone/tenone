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
    LayoutTemplate,
    Sparkles,
    Settings,
    Search,
    HelpCircle,
} from "lucide-react";
import type { PlannerMode, SubscriptionStatus } from "@/lib/planners/types";

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    modes: PlannerMode[];
}

const NAV: NavItem[] = [
    { href: "/planners/app/today", label: "Today", icon: Sun, modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/weekly", label: "Weekly", icon: CalendarDays, modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/monthly", label: "Monthly", icon: CalendarRange, modes: ["all_in_one"] },
    { href: "/planners/app/yearly", label: "Yearly", icon: CalendarClock, modes: ["all_in_one"] },
    { href: "/planners/app/identity", label: "Personal Identity", icon: Compass, modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/projects", label: "Projects", icon: FolderKanban, modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/templates", label: "Templates", icon: LayoutTemplate, modes: ["all_in_one"] },
    { href: "/planners/app/ai-briefing", label: "AI Briefing", icon: Sparkles, modes: ["weekly", "all_in_one"] },
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
                <Link href="/planners/app" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-[#0F766E] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PP</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-neutral-900 leading-none">Planner&apos;s Planner</p>
                        <p className="text-[10px] text-[#0F766E] uppercase tracking-widest mt-0.5">AI</p>
                    </div>
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
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                active
                                    ? "bg-[#0F766E] text-white"
                                    : "text-neutral-700 hover:bg-neutral-100"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
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
                    <span>Settings</span>
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
                    <span>Help</span>
                </Link>
                <div className="px-3 pt-2 flex items-center gap-2 flex-wrap">
                    <span className="inline-block text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                        {mode === "weekly" ? "Weekly 모드" : "All in One 모드"}
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
