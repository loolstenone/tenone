"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { LoginModal } from "@/components/LoginModal";
import { siteHeaderNav } from "@/lib/brand-site-menus";
import { SearchLightNav } from "@/features/hero/SearchLightNav";

// 헤더 메뉴 = lib/brand-site-menus.ts (사이트·인트라·현황 SSOT, §1.9.5) — 메뉴 이름·순서·위치(side)는 거기서 고친다
// 왼쪽 = 인재 서비스 · 가운데 = 써치 라이트(인재와 기업이 만나는 곳) · 오른쪽 = 기업 서비스 (2026-10-13)
const navItems = siteHeaderNav("hero");
const talentNav = navItems.filter(i => i.side === "talent");
const meetNav = navItems.filter(i => i.side === "meet");
const companyNav = navItems.filter(i => i.side === "company");

export function HeRoHeader() {
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
                <div className="hidden xl:flex items-center flex-1 min-w-0">
                    <div className="flex items-center gap-4 2xl:gap-6">
                        {talentNav.map(item => <NavLink key={item.href} href={item.href} label={item.name} active={isActive(item.href)} />)}
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-3 px-4">
                        <span aria-hidden className="h-px w-6 2xl:w-10 bg-neutral-300" />
                        {meetNav.map(item => <SearchLightNav key={item.href} href={item.href} label={item.name} active={isActive(item.href)} />)}
                        <span aria-hidden className="h-px w-6 2xl:w-10 bg-neutral-300" />
                    </div>
                    <div className="flex items-center gap-4 2xl:gap-6">
                        {companyNav.map(item => <NavLink key={item.href} href={item.href} label={item.name} active={isActive(item.href)} />)}
                    </div>
                </div>

                {/* Right side — 우측 끝 */}
                <div className="hidden xl:flex items-center pl-6 shrink-0">
                    <UniverseUtilityBar
                        aboutPath="/hero/about"
                        profilePath="/hero/my"
                        workspacePath="/hero/journey"
                        workspaceLabel="나의 성장 기록"
                        accentColor="#E53935"
                        signupPath="/hero/signup"
                        siteId="hero"
                        siteName="HeRo"
                    />
                </div>

                {/* Mobile: 프로필 + 햄버거 */}
                <div className="xl:hidden flex items-center gap-1 ml-auto">
                    {isAuthenticated ? (
                        <Link href="/hero/my" className="p-1.5">
                            {user?.avatarUrl ? (
                                <Image src={user.avatarUrl} alt={user.name || ''} width={28} height={28}
                                    className="h-7 w-7 rounded-none object-cover" />
                            ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-none bg-neutral-200 text-xs font-bold text-neutral-700">
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
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 text-neutral-500 hover:text-neutral-900"
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
            brandName="HeRo"
            bgClass="bg-white"
            textTone="dark"
            footer={
                isAuthenticated ? (
                    <Link href="/hero/my" onClick={() => setMobileOpen(false)} className="block text-sm font-normal text-neutral-700 hover:text-neutral-900">마이페이지</Link>
                ) : (
                    <div className="flex flex-col gap-2">
                        <button type="button" onClick={() => openLogin("login")}
                            className="rounded-xs border border-neutral-200 px-4 py-2 text-center text-sm text-neutral-600 hover:text-neutral-900">
                            로그인
                        </button>
                        <button type="button" onClick={() => openLogin("signup")}
                            className="rounded-xs px-4 py-2 text-center text-sm font-bold text-white"
                            style={{ backgroundColor: "#E53935" }}>
                            가입하기
                        </button>
                    </div>
                )
            }
        >
            {isAuthenticated && (
                <Link
                    href="/hero/journey"
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                        "block rounded-xs px-4 py-2.5 text-base font-bold transition-colors mb-2",
                        pathname.startsWith("/hero/journey")
                            ? "bg-[#E53935] text-white"
                            : "border border-[#E53935] text-[#E53935] hover:bg-red-50"
                    )}
                >
                    나의 성장 기록
                </Link>
            )}
            <MobileGroup title="나를 위한 서비스" items={talentNav} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
            <MobileGroup title="인재와 기업이 만나는 곳" items={meetNav} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
            <MobileGroup title="기업을 위한 서비스" items={companyNav} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
            <Link
                href="/hero/about"
                onClick={() => setMobileOpen(false)}
                className="block rounded-xs px-4 py-2.5 text-base font-normal text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            >
                About
            </Link>
        </UniverseMobileMenu>

        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor="#E53935" defaultTab={loginTab} />
        </>
    );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
    return (
        <Link href={href} className={clsx("text-sm font-normal transition-colors whitespace-nowrap",
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
            <p className="px-4 mb-1 text-xs font-bold text-neutral-400">{title}</p>
            {items.map(item => (
                <Link key={item.href} href={item.href} onClick={onNavigate}
                    className={clsx("block rounded-xs px-4 py-2.5 text-base font-normal transition-colors",
                        isActive(item.href) ? "bg-red-50 text-[#E53935]" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900")}>
                    {item.name}
                </Link>
            ))}
        </div>
    );
}
