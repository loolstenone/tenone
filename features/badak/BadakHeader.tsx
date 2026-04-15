"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { LoginModal } from "@/components/LoginModal";

const PREFIX = '/badak';
const navItems = [
    { name: "모임", href: `${PREFIX}/groups` },
    { name: "커뮤니티", href: `${PREFIX}/community` },
    { name: "스토리", href: `${PREFIX}/story` },
    { name: "니즈 탐색", href: `${PREFIX}/explore` },
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

    const openLogin = (tab: "login" | "signup" = "login") => {
        setLoginTab(tab);
        setMobileOpen(false);
        setLoginOpen(true);
    };

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
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
                <div className="hidden md:flex ml-auto">
                    <UniverseUtilityBar
                        aboutPath="/badak/about"
                        profilePath="/badak/my"
                        accentColor="#1a1a2e"
                        signupPath="/signup"
                    />
                </div>

                {/* Mobile: 프로필 + 햄버거 */}
                <div className="md:hidden flex items-center gap-1">
                    {isAuthenticated ? (
                        <Link href={`${PREFIX}/my`} className="p-2 text-neutral-300 hover:text-white">
                            <User className="h-5 w-5" />
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
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:bg-white/5 hover:text-white"
                    >
                        <User className="h-4 w-4" /> 마이페이지
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
