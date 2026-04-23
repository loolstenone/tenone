"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { LoginModal } from "@/components/LoginModal";
import { loginHref } from "@/lib/login-href";

const navItems = [
    { name: "HIT 검사", href: "/hero/hit" },
    { name: "AI 상담", href: "/hero/coaching/ai" },
    { name: "커리어 코칭", href: "/hero/coaching" },
    { name: "탤런트 에이전시", href: "/hero/talent-agent" },
    { name: "요금 안내", href: "/hero/pricing" },
    { name: "써치 라이트", href: "/hero/search-light" },
];

export function HeRoHeader() {
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

    // 가장 길게 매칭되는 nav item 하나만 활성 (접두 중복 방지)
    const activeHref = navItems
        .filter((it) => pathname === it.href || pathname.startsWith(it.href + "/"))
        .sort((a, b) => b.href.length - a.href.length)[0]?.href;

    const isActive = (href: string) => activeHref === href;

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center">
                {/* Logo */}
                <Link href="/hero" className="flex items-center shrink-0 mr-10">
                    <Image
                        src="/hero-logo-wide.png"
                        alt="HeRo"
                        width={80}
                        height={40}
                        className="h-9 w-auto"
                        priority
                    />
                </Link>

                {/* Desktop Nav — 로고와 분리 */}
                <div className="hidden lg:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-sm font-medium transition-colors whitespace-nowrap",
                                isActive(item.href)
                                    ? "text-[#E53935]"
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    {isAuthenticated && (
                        <Link
                            href="/hero/company"
                            className={clsx(
                                "text-sm font-medium transition-colors whitespace-nowrap",
                                pathname.startsWith("/hero/company")
                                    ? "text-[#E53935]"
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            기업 허브
                        </Link>
                    )}
                </div>

                {/* Right side — 우측 끝 */}
                <div className="hidden lg:flex items-center ml-auto">
                    <UniverseUtilityBar
                        aboutPath="/hero/about"
                        profilePath="/hero/my"
                        workspacePath="/hero/journey"
                        workspaceLabel="Journey"
                        accentColor="#E53935"
                        signupPath="/signup"
                    />
                </div>

                {/* Mobile: 프로필 + 햄버거 */}
                <div className="lg:hidden flex items-center gap-1 ml-auto">
                    {isAuthenticated ? (
                        <Link href="/hero/my" className="p-1.5">
                            {user?.avatarUrl ? (
                                <Image src={user.avatarUrl} alt={user.name || ''} width={28} height={28}
                                    className="h-7 w-7 rounded-full object-cover" />
                            ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700">
                                    {user?.name?.charAt(0) ?? '?'}
                                </div>
                            )}
                        </Link>
                    ) : (
                        <button type="button" onClick={() => openLogin("login")} className="p-2 text-neutral-500 hover:text-neutral-900" aria-label="로그인">
                            <User className="h-5 w-5" />
                        </button>
                    )}
                    <button
                        onClick={() => { if (!hasOpened) setHasOpened(true); setMobileOpen(!mobileOpen); }}
                        className="p-2 text-neutral-500 hover:text-neutral-900"
                        aria-label="메뉴 열기"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
        </header>

        {/* 배경 오버레이 */}
        <div
            className={clsx(
                "fixed inset-0 z-[9998] lg:hidden transition-opacity duration-300",
                mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setMobileOpen(false)}
        />

        {/* 우측 슬라이드 패널 */}
        <div
            className={clsx(
                "fixed top-0 right-0 bottom-0 z-[9999] lg:hidden w-64 bg-white flex flex-col shadow-xl",
                hasOpened && "transition-transform duration-300 ease-out",
                mobileOpen ? "translate-x-0" : "translate-x-full"
            )}
        >
            {/* 패널 헤더 */}
            <div className="flex h-16 items-center justify-between px-5 border-b border-neutral-100">
                <span className="text-sm font-semibold text-neutral-400">메뉴</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 text-neutral-400 hover:text-neutral-900">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* 네비 링크 */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {isAuthenticated && (
                    <Link
                        href="/hero/journey"
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                            "flex items-center rounded-lg px-4 py-3 text-base font-bold transition-colors mb-2",
                            pathname.startsWith("/hero/journey")
                                ? "bg-[#E53935] text-white"
                                : "border border-[#E53935] text-[#E53935] hover:bg-red-50"
                        )}
                    >
                        나의 Journey
                    </Link>
                )}
                {isAuthenticated && (
                    <Link
                        href="/hero/company"
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                            "flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors mb-1",
                            pathname.startsWith("/hero/company")
                                ? "bg-red-50 text-[#E53935]"
                                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                        )}
                    >
                        기업 허브
                    </Link>
                )}
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                            "flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors",
                            isActive(item.href)
                                ? "bg-red-50 text-[#E53935]"
                                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                        )}
                    >
                        {item.name}
                    </Link>
                ))}
                <Link
                    href="/hero/about"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center rounded-lg px-4 py-3 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                >
                    About
                </Link>
            </nav>

            {/* 하단 */}
            <div className="border-t border-neutral-100 px-3 py-4">
                {isAuthenticated ? (
                    <Link
                        href="/hero/my"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    >
                        {user?.avatarUrl ? (
                            <Image src={user.avatarUrl} alt={user.name || ''} width={28} height={28}
                                className="h-7 w-7 rounded-full object-cover shrink-0" />
                        ) : (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700">
                                {user?.name?.charAt(0) ?? '?'}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="truncate font-medium text-neutral-800">{user?.name ?? '마이페이지'}</div>
                            <div className="truncate text-[11px] text-neutral-400">{user?.email}</div>
                        </div>
                    </Link>
                ) : (
                    <div className="flex flex-col gap-2">
                        <button type="button" onClick={() => openLogin("login")}
                            className="rounded-lg border border-neutral-200 px-4 py-2 text-center text-sm text-neutral-600 hover:text-neutral-900">
                            로그인
                        </button>
                        <button type="button" onClick={() => openLogin("signup")}
                            className="rounded-lg px-4 py-2 text-center text-sm font-semibold text-white"
                            style={{ backgroundColor: "#E53935" }}>
                            가입하기
                        </button>
                    </div>
                )}
            </div>
        </div>

        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor="#E53935" defaultTab={loginTab} />
        </>
    );
}
