"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
    { name: "서비스", href: "/dm/services" },
    { name: "네트워크", href: "/dm/network" },
    { name: "인사이트", href: "/dm/insights" },
    { name: "이벤트", href: "/dm/events" },
    { name: "About", href: "/dm/about" },
];

export function DomoHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/dm") return pathname === "/dm";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#2D1B2E] text-white">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href="/dm" className="shrink-0 flex items-center gap-2">
                    <span className="text-lg font-bold tracking-tight text-white">
                        Domo
                    </span>
                    <span className="text-[10px] text-white/50 hidden sm:inline">도모하다</span>
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
                    {isAuthenticated ? (
                        <Link href="/dm/my" className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors">
                            <User className="h-4 w-4" /> {user?.name || "마이"}
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm text-neutral-300 hover:text-white transition-colors">로그인</Link>
                            <Link href="/signup" className="text-sm bg-[#7F1146] hover:bg-[#5C0C33] px-4 py-1.5 rounded transition-colors">멤버 가입</Link>
                        </>
                    )}
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
                <div className="md:hidden bg-[#2D1B2E] border-t border-white/10 px-6 py-6 space-y-3">
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
                        {isAuthenticated ? (
                            <Link href="/dm/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white">멤버 가입</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
