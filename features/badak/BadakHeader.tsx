"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { Menu, X, User, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { LoginModal } from "@/components/LoginModal";

const PREFIX = '/badak';
const navItems = [
    { name: "모임", href: `${PREFIX}/groups` },
    { name: "커뮤니티", href: `${PREFIX}/community` },
    { name: "스토리", href: `${PREFIX}/story` },
    // { name: "니즈 탐색", href: `${PREFIX}/explore` }, // 실제 니즈 데이터 축적 후 오픈
    { name: "모임 개설", href: `${PREFIX}/groups/create` },
    { name: "바닥장 신청", href: `${PREFIX}/apply` },
];

export function BadakHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginTab, setLoginTab] = useState<"login" | "signup">("login");
    const { isAuthenticated, user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) { setUnreadCount(0); return; }
        const fetchUnread = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            try {
                const res = await fetch('/api/badak/notifications?unread=true&limit=50', {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                if (!res.ok) return;
                const json = await res.json();
                setUnreadCount(json.notifications?.length ?? 0);
            } catch { /* silent */ }
        };
        fetchUnread();
    }, [isAuthenticated]);

    const openLogin = (tab: "login" | "signup" = "login") => {
        setLoginTab(tab);
        setMobileOpen(false);
        setLoginOpen(true);
    };

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        if (pathname !== href && !pathname.startsWith(href + '/')) return false;
        // 나보다 더 구체적인 nav 항목이 현재 경로에 매칭되면 나는 비활성
        return !navItems.some(
            item => item.href !== href && item.href.startsWith(href) &&
                (pathname === item.href || pathname.startsWith(item.href + '/'))
        );
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-[9997] bg-[#1a1a2e] text-white">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href={PREFIX} className="shrink-0 flex items-center">
                    <span className="text-[18px] font-black tracking-tight">Badak</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1 ml-10">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "px-3 py-1.5 text-sm font-medium transition-colors rounded",
                                isActive(item.href)
                                    ? "text-white bg-white/10"
                                    : "text-neutral-300 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden md:flex items-center gap-1 ml-auto">
                    {isAuthenticated && (
                        <Link
                            href={`${PREFIX}/my?tab=notifications`}
                            className="relative p-2 text-neutral-300 hover:text-white transition-colors"
                            aria-label="알림"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    )}
                    <UniverseUtilityBar
                        aboutPath="/badak/about"
                        profilePath="/badak/my"
                        accentColor="#1a1a2e"
                        signupPath="/signup"
                        siteId="badak"
                        siteName="바닥"
                    />
                </div>

                {/* Mobile: 알림 + 프로필 + 햄버거 */}
                <div className="md:hidden flex items-center gap-1">
                    {isAuthenticated && (
                        <Link
                            href={`${PREFIX}/my?tab=notifications`}
                            className="relative p-1.5 text-neutral-300 hover:text-white"
                            aria-label="알림"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    )}
                    {isAuthenticated ? (
                        <Link href={`${PREFIX}/my`} className="p-1.5">
                            {user?.avatarUrl ? (
                                <Image src={user.avatarUrl} alt={user.name || ''} width={28} height={28}
                                    className="h-7 w-7 rounded-full object-cover" />
                            ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                                    style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
                                    {user?.name?.charAt(0) ?? '?'}
                                </div>
                            )}
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => openLogin("login")}
                            className="p-2 text-neutral-300 hover:text-white"
                            aria-label="로그인"
                        >
                            <User className="h-5 w-5" />
                        </button>
                    )}
                    <button
                        onClick={() => { if (!hasOpened) setHasOpened(true); setMobileOpen(!mobileOpen); }}
                        className="p-2 text-neutral-300 hover:text-white"
                        aria-label="메뉴 열기"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>
        </header>

        {/* 모바일 우측 슬라이드 패널 */}
        {/* 배경 오버레이 — z-[9998]: 클라우드 버블(max ~100)보다 훨씬 위 */}
        <div
            className={clsx(
                "fixed inset-0 z-[9998] md:hidden transition-opacity duration-300",
                mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setMobileOpen(false)}
        />
        {/* 패널 */}
        <div
            className={clsx(
                "fixed top-0 right-0 bottom-0 z-[9999] md:hidden w-64 flex flex-col",
                hasOpened && "transition-transform duration-300 ease-out",
                mobileOpen ? "translate-x-0" : "translate-x-full"
            )}
            style={{ background: '#12122a', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        >
            {/* 패널 헤더 */}
            <div className="flex h-14 items-center justify-between px-5 border-b border-white/8">
                <span className="text-sm font-bold text-white/60">메뉴</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 text-white/40 hover:text-white">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* 네비 링크 */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                            "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive(item.href)
                                ? "bg-amber-400/10 text-amber-400"
                                : "text-neutral-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* 하단 */}
            <div className="border-t border-white/8 px-4 py-4">
                {isAuthenticated ? (
                    <Link
                        href={`${PREFIX}/my`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
                    >
                        {user?.avatarUrl ? (
                            <Image src={user.avatarUrl} alt={user.name || ''} width={28} height={28}
                                className="h-7 w-7 rounded-full object-cover shrink-0" />
                        ) : (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                                style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
                                {user?.name?.charAt(0) ?? '?'}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="truncate font-medium text-white/80">{user?.name ?? '마이페이지'}</div>
                            <div className="truncate text-[11px] text-white/35">{user?.email}</div>
                        </div>
                    </Link>
                ) : (
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => openLogin("login")}
                            className="rounded-lg border border-white/10 px-4 py-2 text-center text-sm text-white/50 hover:text-white"
                        >
                            로그인
                        </button>
                        <button
                            type="button"
                            onClick={() => openLogin("signup")}
                            className="rounded-lg border-none px-4 py-2 text-center text-sm font-semibold"
                            style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
                        >
                            가입하기
                        </button>
                    </div>
                )}
            </div>
        </div>

        <LoginModal
            isOpen={loginOpen}
            onClose={() => setLoginOpen(false)}
            accentColor="#1a1a2e"
            defaultTab={loginTab}
        />
        </>
    );
}
