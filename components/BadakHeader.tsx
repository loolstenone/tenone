"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";

const navItems = [
    { name: "히어로", href: "/bk/hero" },
    { name: "바카데미", href: "/bk/bacademy" },
    { name: "콘텐츠", href: "/bk/contents" },
    { name: "바닥 상회", href: "/bk/shop" },
    { name: "커뮤니티", href: "/bk/community" },
    { name: "바닥이란", href: "/bk/about" },
];

export function BadakHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/bk") return pathname === "/bk";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e] text-white">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href="/bk" className="shrink-0 flex items-center gap-3">
                    <span className="text-xl font-black leading-none tracking-tight">
                        <span className="block text-[11px]">Ba</span>
                        <span className="block text-[11px]">dak</span>
                    </span>
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
                                    ? "text-white bg-white/10"
                                    : "text-neutral-300 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm text-neutral-300 hover:text-white transition-colors"
                    >
                        로그인
                    </Link>
                    <Link
                        href="/signup"
                        className="text-sm text-neutral-300 hover:text-white transition-colors"
                    >
                        닉네임 가입
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 text-neutral-300 hover:text-white"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-[#1a1a2e] border-t border-white/10 px-6 py-6 space-y-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium transition-colors py-2",
                                isActive(item.href)
                                    ? "text-white"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-4">
                        <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white">
                            로그인
                        </Link>
                        <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white">
                            닉네임 가입
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
