"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { loginHref } from "@/lib/login-href";

const navItems = [
    { name: "What We Do", href: "/whatwedo" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "People", href: "/people" },
    { name: "Contact", href: "/contact" },
];

export function YouInOneHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-baseline gap-0 shrink-0">
                    <span className="text-[#171717] font-extrabold text-xl tracking-tight">
                        You
                    </span>
                    <span className="text-[#1AAD64] font-medium text-sm mx-0.5">
                        In
                    </span>
                    <span className="text-[#171717] font-extrabold text-xl tracking-tight">
                        One
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-sm font-medium transition-colors whitespace-nowrap",
                                isActive(item.href)
                                    ? "text-[#1AAD64]"
                                    : "text-neutral-400 hover:text-[#1AAD64]"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden lg:flex ml-auto items-center gap-3">
                    <UniverseUtilityBar
                        aboutPath="/youinone/about"
                        profilePath="/youinone/my"
                        accentColor="#1AAD64"
                        signupPath="/signup"
                        siteId="youinone"
                        siteName="YouInOne"
                    />
                    <Link
                        href="/alliance"
                        className="text-sm px-5 py-2 bg-[#1AAD64] text-white hover:bg-[#148B4A] transition-colors rounded"
                    >
                        Members &amp; Alliance
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden p-2 text-neutral-500 hover:text-[#1AAD64]"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-white border-t border-neutral-100 px-6 py-6 space-y-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium transition-colors",
                                isActive(item.href)
                                    ? "text-[#1AAD64]"
                                    : "text-neutral-400 hover:text-[#1AAD64]"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-[#1AAD64] flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href={loginHref(pathname)} onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-[#1AAD64]">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-[#1AAD64]">가입</Link>
                            </>
                        )}
                        <Link
                            href="/alliance"
                            onClick={() => setMobileOpen(false)}
                            className="inline-block text-sm px-5 py-2 bg-[#1AAD64] text-white hover:bg-[#148B4A] rounded transition-colors"
                        >
                            Members &amp; Alliance
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
