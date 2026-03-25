"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, Search, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
    { name: "포트폴리오", href: "/jk" },
    { name: "소개", href: "/jk/about" },
];

export function JakkaHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/jk") return pathname === "/jk";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white">
            <div className="border-b border-neutral-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                    {/* 로고 */}
                    <Link href="/jk" className="shrink-0">
                        <span
                            className="text-sm font-semibold tracking-[0.3em] text-neutral-900 border border-neutral-900 px-2.5 py-1"
                        >
                            JAKKA
                        </span>
                    </Link>

                    {/* 데스크탑 네비게이션 */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "text-sm transition-colors",
                                    isActive(item.href)
                                        ? "text-neutral-900 font-medium"
                                        : "text-neutral-500 hover:text-neutral-900"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <button className="p-1.5 text-neutral-500 hover:text-neutral-900 transition-colors">
                            <Search className="h-4 w-4" />
                        </button>
                        {isAuthenticated ? (
                            <Link href="/jk/my" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                                <User className="h-4 w-4" /> {user?.name || "마이"}
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">로그인</Link>
                                <Link href="/signup" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">가입</Link>
                            </>
                        )}
                    </nav>

                    {/* 모바일 메뉴 토글 */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-neutral-500 hover:text-neutral-900"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* 모바일 메뉴 */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-b border-neutral-200 px-6 py-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm transition-colors py-2",
                                isActive(item.href)
                                    ? "text-neutral-900 font-medium"
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-2 mt-2 border-t border-neutral-200 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/jk/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900">가입</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
