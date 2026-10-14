"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { siteHeaderNav } from "@/lib/brand-site-menus";

const PREFIX = "/badak";
// 헤더 메뉴 = lib/brand-site-menus.ts (사이트·인트라·현황 SSOT, §1.9.5) — 메뉴 이름·순서는 거기서 고친다
const navItems = siteHeaderNav("badak");

export function BadakHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

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
                <div className="flex items-center gap-1 ml-auto">
                    <UniverseUtilityBar
                        breakpoint="md"
                        aboutPath="/badak/about"
                        profilePath="/badak/my"
                        accentColor="#1a1a2e"
                        signupPath="/badak/signup"
                        siteId="badak"
                        siteName="바닥"
                    />
                </div>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 ml-2 text-neutral-300 hover:text-white"
                    aria-label="메뉴 열기"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>
        </header>

        <UniverseMobileMenu
            aboutPath="/badak/about"
            accentColor="#ffd93d"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="Badak"
            bgStyle={{ background: '#12122a' }}
            textTone="light"
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

        </>
    );
}
