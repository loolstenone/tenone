"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Search, Settings, HelpCircle, Sparkles, Download,
    Menu, Maximize, Minimize, MessageSquarePlus,
} from "lucide-react";
import type { PlannerMode, SubscriptionStatus, CustomMenuKey } from "@/lib/myverse/types";
import { LANE_PATHS, type LaneKey } from "@/lib/myverse/domains";
import { InstallButton } from "./InstallButton";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";

// ── 5 Lane SSOT 1차 네비 (세션 119 IA 정리) ───────────────────
//  오늘 / 기록 / AI / 연결 + 도구 + 커뮤니티 (외부)
const TABS = [
    // 핵심 4 lane
    { key: "today",     label: "오늘",     href: "/myverse/app/today" },
    { key: "record",    label: "기록",     href: "/myverse/app/traces" },
    { key: "ai",        label: "AI",       href: "/myverse/app/ask" },
    { key: "connect",   label: "연결",     href: "/myverse/app/feed" },
    // 도구 lane
    { key: "projects",  label: "프로젝트", href: "/myverse/app/projects" },
    { key: "canvas",    label: "캔버스",   href: "/myverse/app/canvas" },
    { key: "templates", label: "템플릿",   href: "/myverse/app/templates" },
    { key: "personal",  label: "퍼스널",   href: "/myverse/app/personal" },
    { key: "community", label: "커뮤니티", href: "/myverse/community", external: true },
] as const;

export function AppTopNav({
    userName,
    avatarUrl,
    subscriptionStatus = "free",
    // 하위 호환 — 렌더에 사용하지 않음
    mode: _mode,
    showTimeTracking: _showTimeTracking,
    customMenus: _customMenus,
}: {
    userName?: string;
    avatarUrl?: string;
    subscriptionStatus?: SubscriptionStatus;
    mode?: PlannerMode;
    showTimeTracking?: boolean;
    customMenus?: CustomMenuKey[];
}) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        function onChange() { setIsFullscreen(!!document.fullscreenElement); }
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    useEffect(() => { setMenuOpen(false); }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    // 캔버스 편집 화면에서는 네비 숨김
    if (/^\/myverse\/app\/canvas\/.+/.test(pathname)) return null;

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
            else if (document.exitFullscreen) await document.exitFullscreen();
        } catch (e) {
            console.warn("fullscreen toggle failed", e);
        }
    }

    const tabCls = (active: boolean) =>
        `px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            active
                ? "bg-[#6366F1] text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        }`;

    const iconCls = (active: boolean) =>
        `p-1.5 rounded transition-colors ${active
            ? "bg-neutral-100 text-neutral-900"
            : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"}`;

    const currentLabel = TABS.find(t => {
        const lanePaths = LANE_PATHS[t.key as LaneKey];
        return lanePaths
            ? lanePaths.some(p => pathname === p || pathname.startsWith(p + "/"))
            : (pathname === t.href || pathname.startsWith(t.href + "/"));
    })?.label ?? "";

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 flex items-center h-12 px-3 gap-2 shrink-0">
            {/* Brand */}
            <Link href="/myverse/app" className="flex items-center gap-1.5 mr-1 shrink-0">
                <Image src="/Myverse_logo_black.png" alt="Myverse" width={24} height={24} className="shrink-0" />
                <span className="hidden sm:inline font-sans font-semibold text-sm text-neutral-900 tracking-tight whitespace-nowrap">
                    Myverse
                </span>
            </Link>

            <div className="hidden md:block w-px h-4 bg-neutral-200 shrink-0" />

            {/* ── 데스크톱 탭 ─────────────────────────────── */}
            <nav
                className="hidden md:flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {TABS.map((tab) => {
                    const lanePaths = LANE_PATHS[tab.key as LaneKey];
                    const active = !("external" in tab && tab.external) && (
                        lanePaths
                            ? lanePaths.some(p => pathname === p || pathname.startsWith(p + "/"))
                            : (pathname === tab.href || pathname.startsWith(tab.href + "/"))
                    );
                    return (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            target={"external" in tab && tab.external ? "_blank" : undefined}
                            rel={"external" in tab && tab.external ? "noopener" : undefined}
                            className={tabCls(active)}
                        >
                            {tab.label}
                            {"external" in tab && tab.external && (
                                <span className="ml-0.5 text-[9px] opacity-50">↗</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* 모바일: 현재 페이지명 */}
            <div className="flex md:hidden flex-1 min-w-0 items-center">
                <span className="text-xs font-medium text-neutral-700 truncate">{currentLabel}</span>
            </div>

            {/* ── 데스크톱 우측 아이콘 ─────────────────────── */}
            <div className="hidden md:flex items-center gap-0.5 shrink-0 pl-2 ml-1 border-l border-neutral-100">
                {subscriptionStatus !== "active" && (
                    <Link
                        href="/myverse/purchase"
                        className="flex items-center gap-1 px-2 py-1 mr-1 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white rounded text-[10px] font-medium hover:opacity-90 transition-opacity"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>구독</span>
                    </Link>
                )}

                <InstallButton className="p-1.5 rounded text-[#6366F1] hover:bg-[#6366F1]/10 transition-colors inline-flex" title="앱 설치">
                    <Download className="h-4 w-4" />
                </InstallButton>

                <Link href="/myverse/app/search" className={iconCls(pathname === "/myverse/app/search")} title="검색">
                    <Search className="h-4 w-4" />
                </Link>

                <Link href="/myverse/app/help" className={iconCls(pathname.startsWith("/myverse/app/help"))} title="도움말">
                    <HelpCircle className="h-4 w-4" />
                </Link>

                <Link href="/myverse/app/settings" className={iconCls(pathname.startsWith("/myverse/app/settings"))} title="설정">
                    <Settings className="h-4 w-4" />
                </Link>

                <button
                    type="button"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "전체화면 종료 (Esc)" : "전체화면"}
                    className="p-1.5 rounded text-neutral-400 hover:text-[#6366F1] hover:bg-[#6366F1]/10 transition-colors"
                >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>

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
                            <span className="h-full w-full bg-[#6366F1]/10 flex items-center justify-center text-[10px] font-bold text-[#6366F1]">
                                {userName[0]}
                            </span>
                        )}
                    </Link>
                )}
            </div>

            {/* ── 모바일 우측 — 아바타 + 햄버거 ──────────── */}
            <div className="md:hidden flex items-center gap-1.5 shrink-0 pl-1 ml-auto border-l border-neutral-100">
                {userName && (
                    <Link href="/profile" className="h-7 w-7 rounded-full shrink-0 overflow-hidden hover:opacity-80 transition-opacity">
                        {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                        ) : (
                            <span className="h-full w-full bg-[#6366F1]/10 flex items-center justify-center text-[10px] font-bold text-[#6366F1]">
                                {userName[0]}
                            </span>
                        )}
                    </Link>
                )}
                <button
                    type="button"
                    onClick={() => setMenuOpen(o => !o)}
                    aria-label="메뉴"
                    className="p-1.5 rounded text-neutral-600 hover:bg-neutral-100"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* 모바일 햄버거 메뉴 */}
            <UniverseMobileMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                brandName="Myverse App"
                brandNode={<span className="font-sans font-semibold text-neutral-900 tracking-tight">Myverse</span>}
                bgClass="bg-white"
                textTone="dark"
            >
                <div className="py-1">
                    {TABS.map((tab) => {
                        const lanePaths = LANE_PATHS[tab.key as LaneKey];
                        const active = !("external" in tab && tab.external) && (
                            lanePaths
                                ? lanePaths.some(p => pathname === p || pathname.startsWith(p + "/"))
                                : (pathname === tab.href || pathname.startsWith(tab.href + "/"))
                        );
                        return (
                            <Link
                                key={tab.key}
                                href={tab.href}
                                target={"external" in tab && tab.external ? "_blank" : undefined}
                                rel={"external" in tab && tab.external ? "noopener" : undefined}
                                onClick={() => !("external" in tab && tab.external) && setMenuOpen(false)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                    active ? "bg-[#6366F1] text-white font-medium" : "text-neutral-700 hover:bg-neutral-100"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {"external" in tab && tab.external && <span className="text-[9px] opacity-50">↗</span>}
                            </Link>
                        );
                    })}
                </div>

                <div className="h-px bg-neutral-100 my-1" />

                {subscriptionStatus !== "active" && (
                    <Link
                        href="/myverse/purchase"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[#6366F1] bg-[#6366F1]/5 hover:bg-[#6366F1]/10"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span className="flex-1">구독</span>
                        <span className="text-[10px] text-[#6366F1]/60">AI 무제한</span>
                    </Link>
                )}
                <InstallButton className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left">
                    <Download className="h-4 w-4 text-[#6366F1]" />
                    <span>앱 설치</span>
                </InstallButton>
                <Link href="/myverse/app/search" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100">
                    <Search className="h-4 w-4 text-neutral-400" />
                    <span>검색</span>
                </Link>
                <Link href="/myverse/app/help" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100">
                    <HelpCircle className="h-4 w-4 text-neutral-400" />
                    <span>도움말</span>
                </Link>
                <Link href="/myverse/app/settings" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100">
                    <Settings className="h-4 w-4 text-neutral-400" />
                    <span>설정</span>
                </Link>
                <div className="h-px bg-neutral-100 my-1" />
                <button
                    onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent("myverse-feedback-open")); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100"
                >
                    <MessageSquarePlus className="h-4 w-4 text-neutral-400" />
                    <span>피드백 보내기</span>
                </button>
            </UniverseMobileMenu>
        </header>
    );
}
