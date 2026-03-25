"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
    { name: "WORKS", href: "/rk/works" },
    { name: "ARTIST", href: "/rk/artist" },
    { name: "FREE BOARD", href: "/rk/board" },
    { name: "ROOKIE", href: "/rk/rookie" },
    { name: "ABOUT", href: "/rk/about" },
];

export function RooKHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/rk") return pathname === "/rk";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#282828]">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/rk" className="shrink-0">
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
                <div className="hidden lg:flex items-center gap-3">
                    {isAuthenticated ? (
                        <Link href="/rk/my" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                            <User className="h-4 w-4" /> {user?.name || "마이"}
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors">로그인</Link>
                            <Link href="/signup" className="text-sm px-4 py-1.5 bg-[#00d255] text-black font-semibold hover:bg-[#00b347] transition-colors rounded">회원가입</Link>
                        </>
                    )}
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
                <div className="lg:hidden bg-[#282828] border-t border-neutral-700 px-6 py-6 space-y-3">
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
                    <div className="pt-4 mt-4 border-t border-neutral-700 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/rk/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm px-4 py-1.5 bg-[#00d255] text-black font-semibold hover:bg-[#00b347] rounded">회원가입</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
