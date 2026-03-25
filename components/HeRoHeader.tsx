"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
    { name: "HIT 프로그램", href: "/hr/hit" },
    { name: "커리어", href: "/hr/career" },
    { name: "멘토링", href: "/hr/mentor" },
    { name: "브랜딩", href: "/hr/branding" },
    { name: "이력서", href: "/hr/resume" },
    { name: "About", href: "/hr/about" },
];

export function HeRoHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/hr") return pathname === "/hr";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/hr" className="flex items-center shrink-0">
                    <span className="text-2xl font-extrabold tracking-tight">
                        <span className="text-amber-500">He</span>
                        <span className="text-neutral-900">Ro</span>
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
                                    ? "text-amber-600"
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden lg:flex items-center gap-3">
                    {isAuthenticated ? (
                        <Link href="/hr/my" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                            <User className="h-4 w-4" /> {user?.name || "마이"}
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">LOGIN</Link>
                            <Link href="/signup" className="text-sm px-4 py-1.5 bg-amber-500 text-white hover:bg-amber-600 transition-colors rounded">JOIN</Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden p-2 text-neutral-500 hover:text-neutral-900"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-white border-t border-neutral-200 px-6 py-6 space-y-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium transition-colors",
                                isActive(item.href)
                                    ? "text-amber-600"
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-neutral-200 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/hr/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900">LOGIN</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm px-4 py-1.5 bg-amber-500 text-white hover:bg-amber-600 rounded">JOIN</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
