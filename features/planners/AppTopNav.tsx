"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Settings, HelpCircle, Sparkles, Download } from "lucide-react";
import type { PlannerMode, SubscriptionStatus } from "@/lib/planners/types";


interface Tab {
    href: string;
    label: string;
    modes: PlannerMode[];
    activePath?: string;
}

// Order/labels MUST match AppSidebar.tsx NAV. Single source of truth for menu order.
const TABS: Tab[] = [
    { href: "/planners/app/index",       label: "Index",       modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/daily",       label: "Today",       modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/weekly",      label: "Weekly",      modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/monthly",     label: "Monthly",     modes: ["all_in_one"] },
    { href: "/planners/app/yearly",      label: "Yearly",      modes: ["all_in_one"] },
    { href: "/planners/app/identity",    label: "P.I",         modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/projects",    label: "Project",     modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/contacts",    label: "Contact",     modes: ["weekly", "all_in_one"] },
    // Templates / AI Briefing 은 메인 메뉴에서 제외 — 각 본문에서 서브 메뉴 링크로 제공
];

export function AppTopNav({
    mode,
    userName,
    avatarUrl,
    subscriptionStatus = "free",
}: {
    mode: PlannerMode;
    userName?: string;
    avatarUrl?: string;
    subscriptionStatus?: SubscriptionStatus;
}) {
    const pathname = usePathname();
    const visibleTabs = TABS.filter((t) => t.modes.includes(mode));

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 flex items-center h-12 px-3 gap-2 shrink-0">
            {/* Brand */}
            <Link href="/planners/app" className="flex items-center gap-1.5 mr-1 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/planners-icon-192.png" alt="" aria-hidden="true" className="w-6 h-6 rounded shrink-0" />
                <span className="text-xs font-semibold font-sans text-neutral-800 tracking-tight whitespace-nowrap">
                    Planner&apos;s Planner<sup className="text-[8px] font-bold text-[#0F766E] ml-0.5">AI</sup>
                </span>
            </Link>

            <div className="w-px h-4 bg-neutral-200 shrink-0" />

            {/* Tabs — 가로 스크롤 가능, 스크롤바 시각적으로 숨김 */}
            <nav
                className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {visibleTabs.map((tab) => {
                    const hrefPath = tab.href.split("?")[0];
                    const active =
                        pathname === hrefPath ||
                        pathname.startsWith(hrefPath + "/");
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                                active
                                    ? "bg-[#0F766E] text-white"
                                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                            }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Right actions — 탭과 시각적 분리 */}
            <div className="flex items-center gap-0.5 shrink-0 pl-2 ml-1 border-l border-neutral-100">
                {subscriptionStatus !== "active" && (
                    <Link
                        href="/planners/purchase"
                        className="flex items-center gap-1 px-2 py-1 mr-1 bg-gradient-to-br from-[#0F766E] to-[#0d5e56] text-white rounded text-[10px] font-medium hover:opacity-90 transition-opacity"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>구독</span>
                    </Link>
                )}

                <Link
                    href="/planners/install"
                    className="p-1.5 rounded text-[#0F766E] hover:bg-[#0F766E]/10 transition-colors"
                    title="앱 설치 (홈 화면에 추가)"
                >
                    <Download className="h-4 w-4" />
                </Link>

                <Link
                    href="/planners/app/search"
                    className={`p-1.5 rounded transition-colors ${
                        pathname === "/planners/app/search"
                            ? "bg-neutral-100 text-neutral-900"
                            : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                    }`}
                >
                    <Search className="h-4 w-4" />
                </Link>

                <Link
                    href="/planners/app/help"
                    className={`p-1.5 rounded transition-colors ${
                        pathname.startsWith("/planners/app/help")
                            ? "bg-neutral-100 text-neutral-900"
                            : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                    }`}
                >
                    <HelpCircle className="h-4 w-4" />
                </Link>

                <Link
                    href="/planners/app/settings"
                    className={`p-1.5 rounded transition-colors ${
                        pathname.startsWith("/planners/app/settings")
                            ? "bg-neutral-100 text-neutral-900"
                            : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                    }`}
                >
                    <Settings className="h-4 w-4" />
                </Link>

                {userName && (
                    <Link
                        href="/profile"
                        className="ml-1 h-7 w-7 rounded-full shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                        title="유니버스 프로필"
                    >
                        {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                        ) : (
                            <span className="h-full w-full bg-[#0F766E]/10 flex items-center justify-center text-[10px] font-bold text-[#0F766E]">
                                {userName[0]}
                            </span>
                        )}
                    </Link>
                )}
            </div>
        </header>
    );
}
