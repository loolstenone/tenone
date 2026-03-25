"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, Orbit, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
    { name: "철학", href: "/mv/philosophy" },
    { name: "서비스", href: "/mv/service" },
    { name: "기술", href: "/mv/technology" },
    { name: "로드맵", href: "/mv/roadmap" },
    { name: "팀", href: "/mv/team" },
];

export function MyVerseHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => pathname === href;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0D17]/95 backdrop-blur-md border-b border-white/5">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href="/mv" className="shrink-0 flex items-center gap-2">
                    <Orbit className="h-5 w-5 text-indigo-400" />
                    <span className="text-white font-semibold text-lg tracking-tight">
                        My <span className="text-indigo-400">Universe</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-sm font-medium px-3 py-1.5 rounded transition-colors whitespace-nowrap",
                                isActive(item.href)
                                    ? "text-white bg-white/10"
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
                        <Link href="/mv/my" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                            <User className="h-4 w-4" /> {user?.name || "마이"}
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors">로그인</Link>
                            <Link href="/signup" className="text-sm text-neutral-400 hover:text-white transition-colors">가입</Link>
                        </>
                    )}
                    <Link
                        href="/mv/contact"
                        className="text-sm font-medium px-4 py-1.5 rounded-full bg-indigo-500 text-white hover:bg-indigo-400 transition-colors"
                    >
                        Early Access
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
                <div className="lg:hidden bg-[#0B0D17] border-t border-white/5 px-6 py-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium py-2 transition-colors",
                                isActive(item.href)
                                    ? "text-white"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-2 mt-2 border-t border-white/5 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/mv/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white">가입</Link>
                            </>
                        )}
                    </div>
                    <Link
                        href="/mv/contact"
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm font-medium py-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        Early Access
                    </Link>
                </div>
            )}
        </header>
    );
}
