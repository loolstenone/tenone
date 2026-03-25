"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, Search, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
    { name: "필찐감자", href: "/writers" },
    { name: "프로그램", href: "/programs" },
    { name: "About", href: "/about" },
];

export function OgamjaHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
            {/* 상단 유틸 바 */}
            <div className="bg-neutral-50 border-b border-neutral-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-8 items-center justify-between text-xs text-neutral-500">
                    <Link href="/" className="hover:text-[#F5C518] transition-colors">
                        공감자 뉴스레터 구독 신청
                    </Link>
                    <span>{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</span>
                </div>
            </div>

            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="shrink-0 flex items-center gap-2">
                    <span className="text-xl md:text-3xl">🥔</span>
                    <span className="text-xl font-bold text-neutral-900" style={{ fontFamily: "sans-serif" }}>
                        공감자
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "px-4 py-2 text-sm font-medium transition-colors rounded-full",
                                isActive(item.href)
                                    ? "text-neutral-900 bg-[#F5C518]/20 border-b-2 border-[#F5C518]"
                                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden md:flex items-center gap-3">
                    <button className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors">
                        <Search className="h-4 w-4" />
                    </button>
                    {isAuthenticated ? (
                        <Link href="/my" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                            <User className="h-4 w-4" /> {user?.name || "마이"}
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">로그인</Link>
                            <Link href="/signup" className="text-sm px-4 py-1.5 bg-[#F5C518] text-neutral-900 font-semibold hover:bg-[#D4A017] transition-colors rounded-full">회원가입</Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-neutral-200 px-6 py-6 space-y-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium transition-colors py-2",
                                isActive(item.href)
                                    ? "text-neutral-900"
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-neutral-200 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-600 hover:text-neutral-900">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm px-4 py-1.5 bg-[#F5C518] text-neutral-900 font-semibold hover:bg-[#D4A017] rounded-full">회원가입</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
