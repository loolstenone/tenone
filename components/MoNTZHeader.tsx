"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, Search, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

const navItems = [
    { name: "MoNTZ", href: "/" },
    { name: "소개", href: "/about" },
];

export function MoNTZHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/90 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                <Link href="/" className="shrink-0">
                    <span className="text-white font-bold text-xl tracking-wider">
                        M<span className="text-[#c8a97e]">o</span>NTZ
                    </span>
                </Link>

                {/* 데스크탑 네비게이션 */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-sm font-medium transition-colors",
                                isActive(item.href)
                                    ? "text-white"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <button className="p-2 text-neutral-400 hover:text-white transition-colors">
                        <Search className="h-4 w-4" />
                    </button>
                    {isAuthenticated ? (
                        <Link href="/my" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                            <User className="h-4 w-4" /> {user?.name || "마이"}
                        </Link>
                    ) : (
                        <>
                            <button onClick={() => setLoginOpen(true)} className="text-sm text-neutral-400 hover:text-white transition-colors">로그인</button>
                            <Link href="/signup" className="text-sm text-neutral-400 hover:text-white transition-colors">가입</Link>
                        </>
                    )}
                </nav>

                {/* 모바일 메뉴 버튼 */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 text-neutral-400 hover:text-white"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* 모바일 메뉴 */}
            {mobileOpen && (
                <div className="md:hidden bg-[#1a1a1a] border-t border-neutral-800 px-6 py-4 space-y-2">
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
                    <div className="pt-2 mt-2 border-t border-neutral-800 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white">가입</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>

        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor="#c8a97e" />
        </>
    );
}
