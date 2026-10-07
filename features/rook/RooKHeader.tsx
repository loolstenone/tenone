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
import { ROOK_ASSETS } from "@/features/rook/RooKUI";

// 메뉴 = 원본 www.rook.co.kr과 동일 (Home · Works · Artist · Free board * · RooKie · About, 대문자 표시)
const navItems = [
    { name: "Home", href: "/rook" },
    { name: "Works", href: "/rook/works" },
    { name: "Artist", href: "/rook/artist" },
    { name: "Free board *", href: "/rook/freeboard" },
    { name: "RooKie", href: "/rook/rookie" },
    { name: "About", href: "/rook/about" },
];

export function RooKHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const isActive = (href: string) => {
        // rook.co.kr·rook.tenone.biz는 prefix 없이 접속 → /works 와 /rook/works 모두 활성 처리
        const path = pathname.startsWith("/rook") ? pathname : `/rook${pathname === "/" ? "" : pathname}`;
        if (href === "/rook") return path === "/rook" || path === "/rook/home";
        return path.startsWith(href);
    };

    return (
        <>
        <header className="sticky top-0 z-50">
            {/* 상단 띠 배너 (원본과 동일) */}
            <Link href="/rook/rookie" className="flex h-[38px] items-center justify-center bg-white text-[14px] md:text-[16px] text-[#222] hover:underline">
                함께 연구하고 작업할 루키 모집 중
            </Link>
            <nav className="relative flex h-[60px] md:h-[78px] items-center justify-between bg-black px-4 md:px-[35px]">
                {/* Logo */}
                <Link href="/rook" className="shrink-0" aria-label="RooK 홈">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ROOK_ASSETS.logo} alt="RooK" className="h-[26px] md:h-[34px] w-auto" />
                </Link>

                {/* Desktop Nav — 가운데 */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-[30px]">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-[14px] uppercase transition-colors whitespace-nowrap",
                                isActive(item.href)
                                    ? "text-white"
                                    : "text-white/50 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden lg:flex ml-auto">
                    <UniverseUtilityBar
                        hideAbout // 메뉴에 About이 이미 있음 (원본과 동일)
                        aboutPath="/rook/about"
                        profilePath="/rook/my"
                        accentColor="#00d255"
                        signupPath="/rook/signup"
                        siteId="rook"
                        siteName="RooK"
                    />
                </div>

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
            brandName="RooK"
            bgClass="bg-black"
            textTone="light"
            footer={
                isAuthenticated ? (
                    <Link href="/rook/my" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-300 hover:text-white">마이페이지</Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href={loginHref(pathname)} onClick={() => setMobileOpen(false)} className="text-sm text-neutral-300 hover:text-white">로그인</Link>
                        <Link href="/rook/signup" onClick={() => setMobileOpen(false)} className="text-sm px-4 py-1.5 bg-[#00d255] text-black font-semibold hover:bg-[#00b347]">가입</Link>
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
                        "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
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
