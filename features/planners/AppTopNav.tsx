"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Settings, HelpCircle, Sparkles, Download, Menu } from "lucide-react";
import type { PlannerMode, SubscriptionStatus } from "@/lib/planners/types";
import { InstallButton } from "./InstallButton";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";


interface Tab {
    href: string;
    label: string;
    modes: PlannerMode[];
    activePath?: string;
    /** true 면 새 탭으로 외부(사이트) 열기 */
    external?: boolean;
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
    { href: "/planners/app/canvas",      label: "Canvas",      modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/contacts",    label: "Contact",     modes: ["weekly", "all_in_one"] },
    { href: "/planners/community",       label: "Community",   modes: ["weekly", "all_in_one"], external: true },
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
    const [menuOpen, setMenuOpen] = useState(false);

    // 라우트 변경 시 햄버거 메뉴 자동 닫기
    useEffect(() => { setMenuOpen(false); }, [pathname]);

    // ESC 로 닫기
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

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
                        !tab.external && (
                            pathname === hrefPath ||
                            pathname.startsWith(hrefPath + "/")
                        );
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            target={tab.external ? "_blank" : undefined}
                            rel={tab.external ? "noopener" : undefined}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                                active
                                    ? "bg-[#0F766E] text-white"
                                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                            }`}
                        >
                            {tab.label}
                            {tab.external && <span className="ml-0.5 text-[9px] opacity-50">↗</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* ── 데스크톱 우측 액션 (md 이상에만 표시) ────────────────── */}
            <div className="hidden md:flex items-center gap-0.5 shrink-0 pl-2 ml-1 border-l border-neutral-100">
                {subscriptionStatus !== "active" && (
                    <Link
                        href="/planners/purchase"
                        className="flex items-center gap-1 px-2 py-1 mr-1 bg-gradient-to-br from-[#0F766E] to-[#0d5e56] text-white rounded text-[10px] font-medium hover:opacity-90 transition-opacity"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>구독</span>
                    </Link>
                )}

                <InstallButton className="p-1.5 rounded text-[#0F766E] hover:bg-[#0F766E]/10 transition-colors inline-flex">
                    <Download className="h-4 w-4" />
                </InstallButton>

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

            {/* ── 모바일 햄버거 (md 미만) ───────────────────────────── */}
            <div className="md:hidden flex items-center gap-1 shrink-0 pl-1 ml-1 border-l border-neutral-100">
                {userName && (
                    <Link
                        href="/profile"
                        className="h-7 w-7 rounded-full shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
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
                <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="메뉴"
                    className="p-1.5 rounded text-neutral-600 hover:bg-neutral-100"
                >
                    <Menu className="h-4 w-4" />
                </button>
            </div>

            {/* 모바일 햄버거 — UniverseMobileMenu 표준 (우측 2/3 슬라이드) */}
            <UniverseMobileMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                brandName="PP AI"
                bgClass="bg-white"
                textTone="dark"
            >
                {subscriptionStatus !== "active" && (
                    <Link
                        href="/planners/purchase"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[#0F766E] bg-[#0F766E]/5 hover:bg-[#0F766E]/10"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span className="flex-1">구독</span>
                        <span className="text-[10px] text-[#0F766E]/60">PP AI 1년 무제한</span>
                    </Link>
                )}
                <InstallButton className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left">
                    <Download className="h-4 w-4 text-[#0F766E]" />
                    <span>앱 설치</span>
                </InstallButton>
                <Link
                    href="/planners/app/search"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50"
                >
                    <Search className="h-4 w-4 text-neutral-400" />
                    <span>검색</span>
                </Link>
                <Link
                    href="/planners/app/help"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50"
                >
                    <HelpCircle className="h-4 w-4 text-neutral-400" />
                    <span>도움말 / FAQ</span>
                </Link>
                <Link
                    href="/planners/app/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50"
                >
                    <Settings className="h-4 w-4 text-neutral-400" />
                    <span>설정</span>
                </Link>
            </UniverseMobileMenu>
        </header>
    );
}
