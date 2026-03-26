"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

const navItems = [
    { name: "타우니티란", href: "/#about" },
    { name: "우리 동네", href: "/#town" },
    { name: "함께 해요", href: "/#together" },
    { name: "이야기", href: "/#stories" },
];

export function TownityHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
            <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <Link href="/" className="shrink-0 flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight text-neutral-900">
                        타우<span className="text-[#10B981]">니티</span>
                    </span>
                    <span className="text-xs text-neutral-400 hidden sm:inline">Townity</span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-[#10B981] transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden md:flex items-center gap-3">
                    {isAuthenticated ? (
                        <Link href="/my" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#10B981] transition-colors">
                            <User className="h-4 w-4" /> {user?.name || "마이"}
                        </Link>
                    ) : (
                        <>
                            <button onClick={() => setLoginOpen(true)} className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">로그인</button>
                            <Link href="/signup" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">가입</Link>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-neutral-200 px-6 py-6 space-y-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="block text-sm font-medium text-neutral-500 hover:text-[#10B981] transition-colors py-2"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-neutral-200 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-2">
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

        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor="#10B981" />
        </>
    );
}
