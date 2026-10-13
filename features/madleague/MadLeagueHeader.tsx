"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { loginHref } from "@/lib/login-href";
import { siteHeaderNav } from "@/lib/brand-site-menus";

// 헤더 메뉴 이름·순서 SSOT = lib/brand-site-menus.ts — 인트라 MAD League 메뉴도 같은 정의를 쓴다 (CLAUDE.md §1.9.5)
// 하위 메뉴(dropdown)도 레지스트리 그대로 — 데스크톱은 한 번에 하나만 펼침(openMenu 상태, 2026-10-11 두 메뉴 겹침 수정), 모바일은 상위 메뉴 아래 들여쓰기
// 상위 메뉴 이름 자체가 그 영역의 홈(프로그램 → 전체 프로그램, 매드리거 → 매드리거 홈) — 하위에 '홈'·'전체' 항목을 따로 두지 않는다
const navItems = siteHeaderNav("madleague");

export function MadLeagueHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    useEffect(() => { setOpenMenu(null); }, [pathname]);
    const { isAuthenticated } = useAuth();

    // 가장 길게 일치하는 메뉴 하나만 활성 (경쟁 PT /programs/competition ⊂ 프로그램 /programs)
    // 하위 메뉴 주소(예: /madleague/clubs ∈ 매드리거)에 있으면 상위 메뉴를 활성
    const activeHref = navItems
        .flatMap(i => [i.href, ...(i.dropdown ?? []).map(d => d.href)].map(h => ({ h, owner: i.href })))
        .filter(({ h }) => pathname.startsWith(h))
        .sort((a, b) => b.h.length - a.h.length)[0]?.owner;
    const isActive = (href: string) => href === activeHref;

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-900">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center gap-8">
                {/* Logo */}
                <Link href="/madleague" className="shrink-0">
                    {logoError ? (
                        <span className="text-white font-bold text-lg tracking-tight">MAD LEAGUE</span>
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
                    {navItems.map((item) => {
                        const opened = openMenu === item.href;
                        return (
                        <div key={item.href} className="relative"
                            onMouseEnter={() => setOpenMenu(item.dropdown ? item.href : null)}
                            onMouseLeave={() => setOpenMenu(null)}
                            onFocus={() => setOpenMenu(item.dropdown ? item.href : null)}
                            onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpenMenu(null); }}
                        >
                            <Link
                                href={item.href}
                                aria-haspopup={item.dropdown ? "menu" : undefined}
                                aria-expanded={item.dropdown ? opened : undefined}
                                className={clsx(
                                    "flex h-16 items-center gap-1 text-sm font-normal transition-colors whitespace-nowrap",
                                    isActive(item.href) || opened ? "text-white" : "text-neutral-400 hover:text-white"
                                )}
                            >
                                {item.name}
                                {item.dropdown && <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform", opened && "rotate-180")} />}
                            </Link>
                            {item.dropdown && opened && (
                                <div className="absolute left-0 top-full min-w-44 border border-neutral-800 bg-neutral-900 py-2">
                                    {item.dropdown.map(d => (
                                        <Link key={d.href} href={d.href}
                                            className={clsx("block px-4 py-2 text-sm whitespace-nowrap hover:bg-white/5 hover:text-white",
                                                pathname === d.href ? "text-white" : "text-neutral-400")}>
                                            {d.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>

                {/* Right side */}
                <div className="hidden lg:flex ml-auto text-white">
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
                        <Link href="/madleague/signup" onClick={() => setMobileOpen(false)} className="text-sm px-4 py-1.5 bg-[#EC1D25] text-white">가입</Link>
                    </div>
                )
            }
        >
            {navItems.map((item) => (
                <div key={item.href}>
                    <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                            "block px-4 py-2.5 text-base font-normal transition-colors",
                            isActive(item.href) ? "bg-white/10 text-white" : "text-neutral-300 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        {item.name}
                    </Link>
                    {item.dropdown?.filter(d => d.href !== item.href).map(d => (
                        <Link
                            key={d.href}
                            href={d.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 pl-8 pr-4 text-sm font-normal text-neutral-400 hover:bg-white/5 hover:text-white transition"
                        >
                            {d.name}
                        </Link>
                    ))}
                </div>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
