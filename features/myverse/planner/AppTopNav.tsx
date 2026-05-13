"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    Search, Settings, HelpCircle, Sparkles, Download,
    Menu, Maximize, Minimize, MessageSquarePlus, LogOut, Bell,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import type { SubscriptionStatus, CustomMenuKey } from "@/lib/myverse/types";
import { InstallButton } from "./InstallButton";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";

const BASE = "/myverse/app";

// 모바일 햄버거 메뉴용 INSIDE/OUTSIDE 구조
const MOBILE_SECTIONS = [
    {
        section: "INSIDE",
        groups: [
            { label: "ENGINE", items: [
                { key: "today",     label: "오늘",     href: `${BASE}/daily` },
                { key: "projects",  label: "프로젝트", href: `${BASE}/projects` },
                { key: "canvas",    label: "캔버스",   href: `${BASE}/canvas` },
                { key: "templates", label: "템플릿",   href: `${BASE}/templates` },
                { key: "contacts",  label: "연락처",   href: `${BASE}/contacts` },
            ]},
            { label: "PERSONAL", items: [
                { key: "personal",  label: "비전하우스", href: `${BASE}/personal` },
                { key: "resume",    label: "이력서",    href: `${BASE}/personal/resume` },
                { key: "portfolio", label: "포트폴리오", href: `${BASE}/portfolio` },
            ]},
            { label: "BLACKBOX", items: [
                { key: "traces",   label: "흔적",     href: `${BASE}/traces` },
                { key: "capsules", label: "타임캡슐", href: `${BASE}/capsules` },
                { key: "insights", label: "인사이트", href: `${BASE}/insights` },
            ]},
            { label: "MUKKI", items: [
                { key: "ask",   label: "무끼", href: `${BASE}/ask` },
                { key: "diary", label: "일기", href: `${BASE}/diary` },
                { key: "coach", label: "코치", href: `${BASE}/coach` },
            ]},
        ],
    },
    {
        section: "OUTSIDE",
        groups: [
            { label: null, items: [
                { key: "feed",    label: "피드",   href: `${BASE}/feed` },
                { key: "profile", label: "프로필", href: `${BASE}/profile` },
                { key: "card",    label: "명함",   href: `${BASE}/card` },
            ]},
        ],
    },
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
    mode?: string;
    showTimeTracking?: boolean;
    customMenus?: CustomMenuKey[];
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [unread, setUnread] = useState(0);
    const avatarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onChange() { setIsFullscreen(!!document.fullscreenElement); }
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    // 알림 unread 카운트 — 60초 폴링 + pathname 변경 시 재조회
    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const r = await fetch("/api/myverse/notifications", { cache: "no-store" });
                if (!r.ok) return;
                const d = await r.json();
                if (!cancelled) setUnread(Number(d.unread_count ?? 0));
            } catch { /* noop */ }
        }
        load();
        const t = setInterval(load, 60_000);
        return () => { cancelled = true; clearInterval(t); };
    }, [pathname]);

    useEffect(() => { setMenuOpen(false); setAvatarOpen(false); }, [pathname]);

    // 아바타 드롭다운 외부 클릭 닫기
    useEffect(() => {
        if (!avatarOpen) return;
        const handler = (e: MouseEvent) => {
            if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
                setAvatarOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [avatarOpen]);

    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    async function handleLogout() {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        await supabase.auth.signOut();
        router.push("/myverse");
    }

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

    const iconCls = (active: boolean) =>
        `p-1.5 rounded transition-colors ${active
            ? "bg-neutral-100 text-neutral-900"
            : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"}`;

    // 현재 페이지 라벨 — 모바일 헤더용
    const allMobileItems = MOBILE_SECTIONS.flatMap(s => s.groups.flatMap(g => g.items));
    const currentLabel = allMobileItems.find(it =>
        pathname === it.href || pathname.startsWith(it.href + "/")
    )?.label ?? "";

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white myverse-dark:bg-[#0D0D15] border-b border-neutral-200 myverse-dark:border-white/8 flex items-center h-12 px-3 gap-2 shrink-0">
            {/* Brand */}
            <Link href="/myverse/app/daily" className="flex items-center gap-1.5 mr-1 shrink-0">
                <Image src="/Myverse_logo_black.png" alt="Myverse" width={24} height={24} className="shrink-0" />
                <span className="hidden sm:inline font-sans font-semibold text-sm text-neutral-900 myverse-dark:text-neutral-100 tracking-tight whitespace-nowrap">
                    Myverse
                </span>
            </Link>

            <div className="hidden md:block w-px h-4 bg-neutral-200 myverse-dark:bg-white/8 shrink-0" />

            {/* 데스크톱: 사이드바가 네비를 담당 — 가운데는 비워둠 (flex spacer) */}
            <div className="hidden md:flex flex-1" />

            {/* 모바일: 현재 페이지명 */}
            <div className="flex md:hidden flex-1 min-w-0 items-center">
                <span className="text-xs font-medium text-neutral-700 truncate">{currentLabel}</span>
            </div>

            {/* ── 데스크톱 우측 아이콘 ─────────────────────── */}
            <div className="hidden md:flex items-center gap-0.5 shrink-0 pl-2 ml-1 border-l border-neutral-100 myverse-dark:border-white/8">
                {subscriptionStatus !== "active" && (
                    <Link
                        href="/myverse/purchase"
                        className="flex items-center gap-1 px-2 py-1 mr-1 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white rounded text-[10px] font-medium hover:opacity-90 transition-opacity"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>구독</span>
                    </Link>
                )}

                <Link href="/myverse/app/search" className={iconCls(pathname === "/myverse/app/search")} title="검색">
                    <Search className="h-4 w-4" />
                </Link>

                <button
                    type="button"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "전체화면 종료 (Esc)" : "전체화면"}
                    className="p-1.5 rounded text-neutral-400 hover:text-[#6366F1] hover:bg-[#6366F1]/10 transition-colors"
                >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>

                {/* 아바타 — 드롭다운 메뉴 트리거 */}
                {userName && (
                    <div ref={avatarRef} className="relative ml-1">
                        <button
                            type="button"
                            onClick={() => setAvatarOpen(o => !o)}
                            className="relative h-7 w-7 rounded-full shrink-0 overflow-hidden hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#6366F1]/40"
                            title="메뉴"
                        >
                            {avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                            ) : (
                                <span className="h-full w-full bg-[#6366F1]/10 flex items-center justify-center text-[10px] font-bold text-[#6366F1]">
                                    {userName[0]}
                                </span>
                            )}
                            {unread > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                                    {unread > 99 ? "99+" : unread}
                                </span>
                            )}
                        </button>

                        {avatarOpen && (
                            <div className="absolute right-0 top-9 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-50">
                                {/* 사용자명 */}
                                <div className="px-3 py-2 border-b border-neutral-100">
                                    <p className="text-[11px] font-semibold text-neutral-800 truncate">{userName}</p>
                                </div>

                                <div className="py-1">
                                    <Link
                                        href="/myverse/app/notifications"
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                    >
                                        <Bell className="h-4 w-4 text-neutral-400 shrink-0" />
                                        <span className="flex-1">알림</span>
                                        {unread > 0 && (
                                            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                                                {unread > 99 ? "99+" : unread}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        href="/myverse/app/settings"
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                    >
                                        <Settings className="h-4 w-4 text-neutral-400 shrink-0" />
                                        <span>설정</span>
                                    </Link>
                                    <Link
                                        href="/myverse/app/help"
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                    >
                                        <HelpCircle className="h-4 w-4 text-neutral-400 shrink-0" />
                                        <span>도움말</span>
                                    </Link>
                                    <InstallButton className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors w-full text-left">
                                        <Download className="h-4 w-4 text-neutral-400 shrink-0" />
                                        <span>앱 설치</span>
                                    </InstallButton>
                                </div>

                                <div className="h-px bg-neutral-100 mx-2 my-1" />

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors w-full"
                                >
                                    <LogOut className="h-4 w-4 shrink-0" />
                                    <span>로그아웃</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── 모바일 우측 — 아바타 + 햄버거 ──────────── */}
            <div className="md:hidden flex items-center gap-1.5 shrink-0 pl-1 ml-auto border-l border-neutral-100">
                {userName && (
                    <Link
                        href="/myverse/app/notifications"
                        title={unread > 0 ? `미확인 알림 ${unread}건` : "알림"}
                        className="relative h-7 w-7 rounded-full shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                    >
                        {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                        ) : (
                            <span className="h-full w-full bg-[#6366F1]/10 flex items-center justify-center text-[10px] font-bold text-[#6366F1]">
                                {userName[0]}
                            </span>
                        )}
                        {unread > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                                {unread > 99 ? "99+" : unread}
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
                brandName="Myverse"
                brandNode={<span className="font-sans font-semibold text-neutral-900 tracking-tight">myverse</span>}
                bgClass="bg-white"
                textTone="dark"
            >
                <div className="py-1">
                    {MOBILE_SECTIONS.map((section, si) => (
                        <div key={section.section} className={si > 0 ? "mt-2 pt-2 border-t border-neutral-100" : ""}>
                            <div className="px-3 pb-1">
                                <span className="text-[9px] font-semibold tracking-widest text-neutral-400 uppercase">
                                    {section.section}
                                </span>
                            </div>
                            {section.groups.map((group, gi) => (
                                <div key={gi} className={gi > 0 ? "mt-1.5" : ""}>
                                    {group.label && (
                                        <div className="px-3 py-1">
                                            <span className="text-[9px] font-medium tracking-wider text-neutral-300 uppercase">
                                                {group.label}
                                            </span>
                                        </div>
                                    )}
                                    {group.items.map(item => {
                                        const active = pathname === item.href || pathname.startsWith(item.href + "/");
                                        return (
                                            <Link
                                                key={item.key}
                                                href={item.href}
                                                onClick={() => setMenuOpen(false)}
                                                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    active
                                                        ? "bg-[#6366F1]/10 text-[#6366F1] font-medium"
                                                        : "text-neutral-700 hover:bg-neutral-100"
                                                }`}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ))}
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
