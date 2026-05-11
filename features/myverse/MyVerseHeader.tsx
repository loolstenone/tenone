"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { loginHref } from "@/lib/login-href";

const PREFIX = '/myverse';
// Home(logo) + 브랜드 스토리(철학+About 통합) + 가격
// 우상단 유틸리티 바의 About은 /myverse/story 와 같은 페이지를 가리킴 (브랜드 nav와 SSOT 통일)
const navItems = [
    { name: "브랜드 스토리", href: `${PREFIX}/story` },
    { name: "가격", href: `${PREFIX}/pricing` },
];

export function MyVerseHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100">
            <nav className="w-full px-4 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href={PREFIX} className="flex items-center gap-2 shrink-0">
                    <span className="text-neutral-900 font-bold text-lg tracking-tight lowercase">myverse</span>
                    <span className="text-neutral-400 text-xs hidden sm:inline">Personal OS</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "px-3 py-1.5 text-sm font-medium transition-colors rounded",
                                isActive(item.href)
                                    ? "text-neutral-900 bg-neutral-100"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right: (비인증 시만) 가입 CTA + UniverseUtilityBar + Mobile toggle
                    인증 시 앱 진입은 우측 WORK 드롭다운(UniverseUtilityBar)이 SSOT — 중복 노출 금지 */}
                <div className="flex items-center gap-2 shrink-0">
                    {!isAuthenticated && (
                        <Link
                            href="/myverse/login"
                            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full transition-colors"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Myverse 시작하기
                        </Link>
                    )}
                    <div className="hidden md:flex">
                        <UniverseUtilityBar
                            aboutPath="/myverse/story"
                            profilePath="/myverse/my"
                            signupPath="/signup"
                            accentColor="#6366f1"
                            searchPlaceholder="Myverse 검색"
                            siteId="myverse"
                            siteName="Myverse"
                            hideAbout
                            hideWorkspaces
                        />
                    </div>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="flex md:hidden p-2 text-neutral-500 hover:text-neutral-900"
                        aria-label="메뉴"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

        </header>

        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="Myverse"
            bgClass="bg-white"
            textTone="dark"
            footer={
                isAuthenticated ? (
                    <Link
                        href="/myverse/my"
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm text-neutral-500 hover:text-neutral-900"
                    >
                        마이페이지
                    </Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link
                            href={loginHref(pathname)}
                            onClick={() => setMobileOpen(false)}
                            className="text-sm text-neutral-500 hover:text-neutral-900"
                        >
                            로그인
                        </Link>
                        <Link
                            href="/signup"
                            onClick={() => setMobileOpen(false)}
                            className="text-sm text-neutral-500 hover:text-neutral-900"
                        >
                            가입
                        </Link>
                    </div>
                )
            }
        >
            {/* 앱 진입 CTA */}
            <Link
                href={isAuthenticated ? "/myverse/app" : "/myverse/login"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg mb-3 hover:bg-indigo-700 transition-colors"
            >
                <Sparkles className="h-4 w-4" />
                {isAuthenticated ? "내 Myverse 열기" : "Myverse 시작하기"}
            </Link>

            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                        "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                        isActive(item.href) ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
