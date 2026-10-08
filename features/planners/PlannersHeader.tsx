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
import { siteHeaderNav } from "@/lib/brand-site-menus";

// 메뉴 SSOT = lib/brand-site-menus.ts (CLAUDE.md §1.9.5)
const navItems = siteHeaderNav("planners");

export function PlannersHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    // planners.tenone.biz는 prefix 없이 접속 → /projects 와 /planners/projects 모두 활성 처리
    const isActive = (href: string) => {
        const path = pathname.startsWith("/planners") ? pathname : `/planners${pathname === "/" ? "" : pathname}`;
        return path.startsWith(href);
    };

    return (
        <>
        <header className="sticky top-0 z-50">
            <nav className="relative flex h-[60px] md:h-[72px] items-center justify-between bg-[#134E4A] px-4 md:px-[35px]">
                <Link href="/planners" className="shrink-0 text-xl md:text-2xl font-black tracking-tight text-white" aria-label="Planner's 홈">
                    Planner&apos;s
                </Link>

                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-[30px]">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-[15px] transition-colors whitespace-nowrap",
                                isActive(item.href) ? "text-white font-semibold" : "text-white/60 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden lg:flex ml-auto text-white">{/* 어두운 헤더 — 유틸리티 바는 currentColor를 쓰므로 흰색 지정 */}
                    <UniverseUtilityBar
                        hideAbout
                        aboutPath="/planners"
                        profilePath="/planners/my"
                        accentColor="#14B8A6"
                        siteId="planners"
                        siteName="Planner's"
                    />
                </div>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden p-2 text-teal-100 hover:text-white"
                    aria-label="메뉴"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>
        </header>

        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="Planner's"
            bgClass="bg-[#134E4A]"
            textTone="light"
            footer={
                isAuthenticated ? (
                    <Link href="/planners/my" onClick={() => setMobileOpen(false)} className="block text-sm text-teal-100 hover:text-white">마이페이지</Link>
                ) : (
                    <Link href={loginHref(pathname)} onClick={() => setMobileOpen(false)} className="text-sm text-teal-100 hover:text-white">로그인</Link>
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
                        isActive(item.href) ? "bg-white/10 text-white" : "text-teal-100 hover:bg-white/5 hover:text-white"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
