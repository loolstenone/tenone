"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { loginHref } from "@/lib/login-href";
import { siteHeaderNav } from "@/lib/brand-site-menus";

// 헤더 메뉴 이름·순서 SSOT = lib/brand-site-menus.ts — 인트라 MAD League 메뉴도 같은 정의를 쓴다 (CLAUDE.md §1.9.5)
const navItems = siteHeaderNav("madleague");
const programItems = navItems.find(i => i.href === "/madleague/programs")?.dropdown ?? [];

export function MadLeagueHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const { isAuthenticated } = useAuth();

    // 가장 길게 일치하는 메뉴 하나만 활성 (경쟁 PT /programs/competition ⊂ 프로그램 /programs)
    const activeHref = navItems
        .map(i => i.href)
        .filter(h => pathname.startsWith(h))
        .sort((a, b) => b.length - a.length)[0];
    const isActive = (href: string) => href === activeHref;

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-900">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center gap-8">
                {/* Logo */}
                <Link href="/madleague" className="shrink-0">
                    {logoError ? (
                        <span className="text-white font-extrabold text-lg tracking-tight">MAD LEAGUE</span>
                    ) : (
                        <Image
                            src="/logos/madleague/madleague-circle-sq.png"
                            alt="MAD League"
                            width={120}
                            height={36}
                            className="object-contain h-9 w-auto"
                            onError={() => setLogoError(true)}
                        />
                    )}
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-sm font-medium transition-colors whitespace-nowrap",
                                isActive(item.href) ? "text-white" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden lg:flex ml-auto">
                    <UniverseUtilityBar
                        aboutPath="/madleague/about"
                        profilePath="/madleague/my"
                        accentColor="#EC1D25"
                        signupPath="/madleague/signup"
                        siteId="madleague"
                        siteName="MAD League"
                        hideWorkspaces={true}
                    />
                </div>

                {/* Mobile spacer */}
                <div className="lg:hidden ml-auto" />

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden p-2 text-neutral-400 hover:text-white"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

        </header>

        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="MAD League"
            bgClass="bg-neutral-900"
            textTone="light"
            footer={
                isAuthenticated ? (
                    <Link href="/madleague/my" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-300 hover:text-white">마이페이지</Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href={loginHref(pathname)} onClick={() => setMobileOpen(false)} className="text-sm text-neutral-300 hover:text-white">로그인</Link>
                        <Link href="/madleague/signup" onClick={() => setMobileOpen(false)} className="text-sm px-4 py-1.5 bg-[#EC1D25] text-white rounded">가입</Link>
                    </div>
                )
            }
        >
            <div className="text-[10px] font-bold tracking-widest text-[#EC1D25] px-4 mb-2">PROGRAMS</div>
            {programItems.map((p) => (
                <Link
                    key={p.href}
                    href={p.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition pl-6"
                >
                    {p.name}
                </Link>
            ))}
            <div className="my-2 border-t border-white/10" />
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                        "block px-4 py-2.5 text-base font-medium transition-colors",
                        isActive(item.href) ? "bg-white/10 text-white" : "text-neutral-300 hover:bg-white/5 hover:text-white"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
