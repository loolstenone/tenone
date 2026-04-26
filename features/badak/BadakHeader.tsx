"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { LoginModal } from "@/components/LoginModal";

const PREFIX = '/badak';
const navItems = [
    { name: "모임", href: `${PREFIX}/groups` },
    { name: "니즈 탐색", href: `${PREFIX}/explore` },
    { name: "커뮤니티", href: `${PREFIX}/community` },
    { name: "스토리", href: `${PREFIX}/story` },
    { name: "모임 개설", href: `${PREFIX}/groups/create` },
    { name: "바닥장 신청", href: `${PREFIX}/apply` },
];

export function BadakHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
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
                                "min-w-[72px] px-3 py-1.5 text-sm font-medium text-center transition-colors rounded",
                                isActive(item.href)
                                    ? "text-white bg-white/10"
                                    : "text-neutral-300 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side — 알림은 UniverseUtilityBar의 Bell이 전담 (중복 제거) */}
                <div className="hidden md:flex items-center gap-1 ml-auto">
                    <UniverseUtilityBar
                        aboutPath="/badak/about"
                        profilePath="/badak/my"
                        accentColor="#1a1a2e"
                        signupPath="/signup"
                        siteId="badak"
                        siteName="바닥"
                    />
                </div>

                {/* Mobile: 프로필 + 햄버거 (알림은 UniverseUtilityBar 전담) */}
                <div className="md:hidden flex items-center gap-1">
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
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 text-neutral-300 hover:text-white"
                        aria-label="메뉴 열기"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>
        </header>

        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="Badak"
            bgStyle={{ background: '#12122a' }}
            textTone="light"
            footer={
                isAuthenticated ? (
                    <Link href={`${PREFIX}/my`} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-neutral-300 hover:text-white">마이페이지</Link>
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
                            className="rounded-lg px-4 py-2 text-center text-sm font-semibold"
                            style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
                        >
                            가입하기
                        </button>
                    </div>
                )
            }
        >
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                        "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                        isActive(item.href)
                            ? "bg-amber-400/10 text-amber-400"
                            : "text-neutral-300 hover:bg-white/5 hover:text-white"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>

        <LoginModal
            isOpen={loginOpen}
            onClose={() => setLoginOpen(false)}
            accentColor="#1a1a2e"
            defaultTab={loginTab}
        />
        </>
    );
}
