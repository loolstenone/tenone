"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { siteHeaderNav } from "@/lib/brand-site-menus";
import { SearchLightNav } from "@/features/hero/SearchLightNav";

// 헤더 메뉴 = lib/brand-site-menus.ts (사이트·인트라·현황 SSOT, §1.9.5) — 메뉴 이름·순서·위치(side)는 거기서 고친다
// 순서 = 인재 서비스 → 써치 라이트(인재와 기업이 만나는 곳) → 기업 서비스, 로고 옆 왼쪽 정렬 한 줄 (2026-10-14)
const navItems = siteHeaderNav("hero");
const talentNav = navItems.filter(i => i.side === "talent");
const meetNav = navItems.filter(i => i.side === "meet");
const companyNav = navItems.filter(i => i.side === "company");

export function HeRoHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // 가장 길게 매칭되는 nav item 하나만 활성 (접두 중복 방지)
    const activeHref = navItems
        .filter((it) => pathname === it.href || pathname.startsWith(it.href + "/"))
        .sort((a, b) => b.href.length - a.href.length)[0]?.href;

    const isActive = (href: string) => activeHref === href;

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
            <nav className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex h-16 items-center">
                {/* Logo */}
                <Link href="/hero" className="flex items-center shrink-0 mr-8">
                    <Image
                        src="/hero-logo-wide.png"
                        alt="HeRo"
                        width={80}
                        height={40}
                        className="h-9 w-auto"
                        priority
                    />
                </Link>

                {/* Desktop Nav — 메뉴 9개라 1280px부터 펼친다 (그 아래는 햄버거) */}
                {/* 메뉴는 로고 옆에 왼쪽 정렬로 붙인다 — 인재 · 써치 라이트 · 기업 (2026-10-14, 가운데 벌림 폐지) */}
                <div className="hidden xl:flex items-center gap-4 2xl:gap-6 min-w-0">
                    {talentNav.map(item => <NavLink key={item.href} href={item.href} label={item.name} active={isActive(item.href)} />)}
                    <span className="flex items-center gap-2">
                        <span aria-hidden className="h-px w-3 bg-neutral-300" />
                        {meetNav.map(item => <SearchLightNav key={item.href} href={item.href} label={item.name} active={isActive(item.href)} />)}
                        <span aria-hidden className="h-px w-3 bg-neutral-300" />
                    </span>
                    {companyNav.map(item => <NavLink key={item.href} href={item.href} label={item.name} active={isActive(item.href)} />)}
                </div>

                {/* Right side — 우측 끝, 메뉴와 거리를 둔다 */}
                <div className="flex items-center ml-auto pl-4 xl:pl-10 shrink-0">
                    <UniverseUtilityBar
                        breakpoint="xl"
                        aboutPath="/hero/about"
                        profilePath="/hero/my"
                        serviceEntry={{ label: "나의 성장 기록", href: "/hero/journey" }}
                        accentColor="#E53935"
                        signupPath="/hero/signup"
                        siteId="hero"
                        siteName="HeRo"
                    />
                </div>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="xl:hidden p-2 ml-2 text-neutral-500 hover:text-neutral-900"
                    aria-label="메뉴 열기"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

        </header>

        <UniverseMobileMenu
            aboutPath="/hero/about"
            serviceEntry={{ label: "나의 성장 기록", href: "/hero/journey" }}
            accentColor="#E53935"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="HeRo"
            bgClass="bg-white"
            textTone="dark"
        >
            <MobileGroup title="나를 위한 서비스" items={talentNav} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
            <MobileGroup title="인재와 기업이 만나는 곳" items={meetNav} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
            <MobileGroup title="기업을 위한 서비스" items={companyNav} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
        </UniverseMobileMenu>

        </>
    );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
    return (
        <Link href={href} className={clsx("text-sm font-medium transition-colors whitespace-nowrap",
            active ? "text-[#E53935]" : "text-neutral-500 hover:text-neutral-900")}>
            {label}
        </Link>
    );
}

function MobileGroup({ title, items, isActive, onNavigate }: {
    title: string;
    items: { name: string; href: string }[];
    isActive: (href: string) => boolean;
    onNavigate: () => void;
}) {
    if (items.length === 0) return null;
    return (
        <div className="mt-4 first:mt-0">
            <p className="px-4 mb-1 text-xs font-semibold text-neutral-400">{title}</p>
            {items.map(item => (
                <Link key={item.href} href={item.href} onClick={onNavigate}
                    className={clsx("block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                        isActive(item.href) ? "bg-red-50 text-[#E53935]" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900")}>
                    {item.name}
                </Link>
            ))}
        </div>
    );
}
