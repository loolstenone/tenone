"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { loginHref } from "@/lib/login-href";

const navItems = [
    { name: "포트폴리오", href: "/" },
    { name: "소개", href: "/about" },
];

export function JakkaHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white">
            <div className="border-b border-neutral-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                    {/* 로고 */}
                    <Link href="/" className="shrink-0">
                        <span
                            className="text-sm font-semibold tracking-[0.3em] text-neutral-900 border border-neutral-900 px-2.5 py-1"
                        >
                            JAKKA
                        </span>
                    </Link>

                    {/* 데스크탑 네비게이션 */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "text-sm transition-colors",
                                    isActive(item.href)
                                        ? "text-neutral-900 font-medium"
                                        : "text-neutral-500 hover:text-neutral-900"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <UniverseUtilityBar
                            aboutPath="/jakka/about"
                            profilePath="/jakka/my"
                            accentColor="#1a1a2e"
                            signupPath="/jakka/signup"
                            siteId="jakka"
                            siteName="Jakka"
                        />
                    </nav>

                    {/* 모바일 메뉴 토글 */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-neutral-500 hover:text-neutral-900"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

        </header>

        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="JAKKA"
            bgClass="bg-white"
            textTone="dark"
            footer={
                isAuthenticated ? (
                    <Link href="/jakka/my" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-600 hover:text-neutral-900">마이페이지</Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href={loginHref(pathname)} onClick={() => setMobileOpen(false)} className="text-sm text-neutral-600 hover:text-neutral-900">로그인</Link>
                        <Link href="/jakka/signup" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-600 hover:text-neutral-900">가입</Link>
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
                        "block rounded-lg px-4 py-2.5 text-base transition-colors",
                        isActive(item.href)
                            ? "bg-neutral-100 text-neutral-900 font-medium"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
