"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { siteHeaderNav } from "@/lib/brand-site-menus";
import { isPlannersAppPath } from "@/features/planners/app/nav";

// 메뉴 SSOT = lib/brand-site-menus.ts (CLAUDE.md §1.9.5)
const navItems = siteHeaderNav("planners");

export function PlannersHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // 플래너'스 AI 앱(/planners/app)은 자체 상단 바를 쓴다
    if (isPlannersAppPath(pathname)) return null;

    // planners.tenone.biz는 prefix 없이 접속 → /projects 와 /planners/projects 모두 활성 처리
    const isActive = (href: string) => {
        const path = pathname.startsWith("/planners") ? pathname : `/planners${pathname === "/" ? "" : pathname}`;
        // 참여 확인서는 기획자 과정 아래 (lib/brand-site-menus.ts location) · 기획이란은 유틸리티바 About
        if (href === "/planners/projects" && path.startsWith("/planners/certificate")) return true;
        return path.startsWith(href);
    };

    return (
        <>
        <header className="sticky top-0 z-50">
            <nav className="relative flex h-[64px] md:h-[84px] items-center justify-between bg-[#134E4A] px-6 md:px-16">
                <Link href="/planners" className="shrink-0" aria-label="Planner's 홈">
                    {/* 공식 로고 (흰색) — 원본 public/brands/planners/logo-{white,black}.png */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brands/planners/logo-white.png" alt="Planner's" width={1074} height={258} className="h-6 w-auto md:h-8" />
                </Link>

                <div className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-[30px]">
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

                <div className="flex items-center ml-auto text-white">{/* 어두운 헤더 · 유틸리티 바는 currentColor를 쓰므로 흰색 지정 */}
                    <UniverseUtilityBar
                        breakpoint="xl"
                        aboutPath="/planners/about"
                        profilePath="/planners/my"
                        accentColor="#14B8A6"
                        siteId="planners"
                        siteName="Planner's"
                        serviceEntry={{ label: "내 플래너", href: "/planners/app" }}
                    />
                </div>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="xl:hidden p-2 ml-2 text-teal-100 hover:text-white"
                    aria-label="메뉴"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>
        </header>

        <UniverseMobileMenu
            serviceEntry={{ label: "내 플래너", href: "/planners/app" }}
            aboutPath="/planners/about"
            accentColor="#14B8A6"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="Planner's"
            bgClass="bg-[#134E4A]"
            textTone="light"
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
