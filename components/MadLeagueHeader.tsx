"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";

const navItems = [
    { name: "홈", href: "/m" },
    { name: "경쟁 PT", href: "/m/pt" },
    { name: "프로그램", href: "/m/program" },
    { name: "매드 진", href: "/m/madzine" },
    { name: "히어로", href: "/m/hero" },
    { name: "활동인증서", href: "/m/certificate" },
    { name: "매드 리거", href: "/m/leaguer" },
    { name: "About", href: "/m/about" },
];

export function MadLeagueHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/m") return pathname === "/m";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-900">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/m" className="flex items-center gap-1 shrink-0">
                    <span className="bg-[#D32F2F] text-white font-extrabold text-lg px-2 py-0.5 tracking-tight">
                        MAD
                    </span>
                    <span className="text-white font-bold text-lg tracking-tight">
                        LEAGUE
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
                <div className="hidden lg:flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                        LOGIN
                    </Link>
                    <Link
                        href="/signup"
                        className="text-sm px-4 py-1.5 bg-[#D32F2F] text-white hover:bg-[#B71C1C] transition-colors rounded"
                    >
                        JOIN
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden p-2 text-neutral-400 hover:text-white"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-neutral-900 border-t border-neutral-800 px-6 py-6 space-y-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium transition-colors",
                                isActive(item.href)
                                    ? "text-white"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-neutral-800 flex items-center gap-4">
                        <Link
                            href="/login"
                            onClick={() => setMobileOpen(false)}
                            className="text-sm text-neutral-400 hover:text-white"
                        >
                            LOGIN
                        </Link>
                        <Link
                            href="/signup"
                            onClick={() => setMobileOpen(false)}
                            className="text-sm px-4 py-1.5 bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded"
                        >
                            JOIN
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
