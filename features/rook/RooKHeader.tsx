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
    { name: "WORKS", href: "/works" },
    { name: "ARTIST", href: "/artist" },
    { name: "FREE BOARD", href: "/board" },
    { name: "ROOKIE", href: "/rookie" },
    { name: "ABOUT", href: "/about" },
];

export function RooKHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#282828]">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="shrink-0">
                    <span className="text-white font-bold text-2xl tracking-tight" style={{ fontFamily: 'sans-serif' }}>
                        Roo<span className="inline-block" style={{ transform: 'scaleX(-1)' }}>K</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-sm font-medium transition-colors whitespace-nowrap",
                                isActive(item.href)
                                    ? "text-white"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden lg:flex ml-auto">
                    <UniverseUtilityBar
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
            bgClass="bg-[#282828]"
            textTone="light"
            footer={
                isAuthenticated ? (
                    <Link href="/rook/my" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-300 hover:text-white">마이페이지</Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href={loginHref(pathname)} onClick={() => setMobileOpen(false)} className="text-sm text-neutral-300 hover:text-white">로그인</Link>
                        <Link href="/rook/signup" onClick={() => setMobileOpen(false)} className="text-sm px-4 py-1.5 bg-[#00d255] text-black font-semibold hover:bg-[#00b347] rounded">가입</Link>
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
