"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Settings, HelpCircle, Sparkles, Download, Menu, Maximize, Minimize, PenLine, LayoutTemplate, MessageSquarePlus } from "lucide-react";
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

const TABS: Tab[] = [
    { href: "/planners/app/index",       label: "인덱스",       modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/daily",       label: "일간",        modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/weekly",      label: "주간",        modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/monthly",     label: "월간",        modes: ["all_in_one"] },
    { href: "/planners/app/yearly",      label: "연간",        modes: ["all_in_one"] },
    { href: "/planners/app/projects",    label: "프로젝트",    modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/canvas",      label: "캔버스",      modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/contacts",    label: "연락처",      modes: ["weekly", "all_in_one"] },
    { href: "/planners/app/identity",    label: "아이덴티티",  modes: ["weekly", "all_in_one"] },
    { href: "/planners/community",       label: "커뮤니티",    modes: ["weekly", "all_in_one"], external: true },
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
    if (/^\/planners\/app\/canvas\/.+/.test(pathname)) return null;
    const visibleTabs = TABS.filter((t) => t.modes.includes(mode));
    const [menuOpen, setMenuOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPenMode, setIsPenMode] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("pp-pen-mode") === "1";
    });

    // 브라우저 전체화면 상태 동기화
    useEffect(() => {
        function onChange() { setIsFullscreen(!!document.fullscreenElement); }
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (e) {
            console.warn("fullscreen toggle failed", e);
        }
    }

    // 펜 전용 모드 — capture phase 터치 차단 (팜 리젝션)
    useEffect(() => {
        if (!isPenMode) return;
        const block = (e: PointerEvent) => {
            if (e.pointerType === "touch") e.stopImmediatePropagation();
        };
        document.addEventListener("pointerdown", block, { capture: true });
        document.addEventListener("pointermove", block, { capture: true });
        return () => {
            document.removeEventListener("pointerdown", block, { capture: true });
            document.removeEventListener("pointermove", block, { capture: true });
        };
    }, [isPenMode]);

    function togglePenMode() {
        const next = !isPenMode;
        setIsPenMode(next);
        localStorage.setItem("pp-pen-mode", next ? "1" : "0");
        window.dispatchEvent(new CustomEvent("pp-pen-mode", { detail: { enabled: next } }));
    }

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
            {/* Brand — 모바일: 아이콘만, sm+: 전체 텍스트 */}
            <Link href="/planners/app" className="flex items-center gap-1.5 mr-1 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/planners-icon-192.png" alt="" aria-hidden="true" className="w-6 h-6 rounded shrink-0" />
                <span className="hidden sm:inline font-serif text-sm text-neutral-900 whitespace-nowrap">
                    Planner&apos;s Planner<sup className="text-[8px] font-sans font-bold text-[#0F766E] ml-0.5 align-super">AI</sup>
                </span>
            </Link>

            <div className="hidden md:block w-px h-4 bg-neutral-200 shrink-0" />

            {/* Tabs — 데스크톱만 (모바일은 햄버거 메뉴 전담) */}
            <nav
                className="hidden md:flex items-center gap-1 flex-1 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden"
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

            {/* 모바일: 현재 페이지명 표시 (탭 nav 대신) */}
            <div className="flex md:hidden flex-1 min-w-0 items-center">
                <span className="text-xs font-medium text-neutral-700 truncate">
                    {visibleTabs.find(t => {
                        const p = t.href.split("?")[0];
                        return pathname === p || pathname.startsWith(p + "/");
                    })?.label ?? ""}
                </span>
            </div>

            {/* ── 데스크톱 우측 액션 ────────────────── */}
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

                {/* 펜 전용 모드 — 손바닥 터치 차단 (팜 리젝션) */}
                <button
                    type="button"
                    onClick={togglePenMode}
                    title={isPenMode ? "펜 전용 모드 해제" : "펜 전용 모드 (손 터치 차단)"}
                    className={`p-1.5 rounded transition-colors ${
                        isPenMode
                            ? "bg-[#0F766E]/15 text-[#0F766E]"
                            : "text-neutral-400 hover:text-[#0F766E] hover:bg-[#0F766E]/10"
                    }`}
                >
                    <PenLine className="h-4 w-4" />
                </button>

                {/* 전체화면 토글 — 주소창·탭 숨김 */}
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "전체화면 종료 (Esc)" : "전체화면 (주소창·탭 숨김)"}
                    className="p-1.5 rounded text-neutral-400 hover:text-[#0F766E] hover:bg-[#0F766E]/10 transition-colors"
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
                            <span className="h-full w-full bg-[#0F766E]/10 flex items-center justify-center text-[10px] font-bold text-[#0F766E]">
                                {userName[0]}
                            </span>
                        )}
                    </Link>
                )}
            </div>

            {/* ── 모바일 우측 — 아바타 + 햄버거 ─────────────────────── */}
            <div className="md:hidden flex items-center gap-1.5 shrink-0 pl-1 ml-auto border-l border-neutral-100">
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
                    <Menu className="h-5 w-5" />
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
                {/* 네비게이션 메뉴 전체 */}
                <div className="pb-1">
                    {visibleTabs.map((tab) => {
                        const hrefPath = tab.href.split("?")[0];
                        const active = !tab.external && (pathname === hrefPath || pathname.startsWith(hrefPath + "/"));
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                target={tab.external ? "_blank" : undefined}
                                rel={tab.external ? "noopener" : undefined}
                                onClick={() => !tab.external && setMenuOpen(false)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                    active
                                        ? "bg-[#0F766E] text-white font-medium"
                                        : "text-neutral-700 hover:bg-neutral-50"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.external && <span className="text-[9px] opacity-50">↗</span>}
                            </Link>
                        );
                    })}
                </div>

                {/* 구분선 */}
                <div className="h-px bg-neutral-100 my-1" />

                {/* 유틸리티 */}
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
                <div className="h-px bg-neutral-100 my-1" />
                <Link
                    href="/planners/app/templates"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50"
                >
                    <LayoutTemplate className="h-4 w-4 text-neutral-400" />
                    <span>템플릿</span>
                </Link>
                <div className="h-px bg-neutral-100 my-1" />
                <button
                    onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent("planners-feedback-open")); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50"
                >
                    <MessageSquarePlus className="h-4 w-4 text-neutral-400" />
                    <span>피드백 보내기</span>
                </button>
            </UniverseMobileMenu>
        </header>
    );
}
