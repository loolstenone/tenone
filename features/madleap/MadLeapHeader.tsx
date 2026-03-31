"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";

const navItems = [
    { name: "커뮤니티", href: "/community" },
    { name: "스터디 룸", href: "/study-room" },
    { name: "매드립 소개", href: "/about" },
    { name: "포트폴리오", href: "/portfolio" },
];

export function MadLeapHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                {/* Left Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/"
                        className={clsx(
                            "text-sm font-medium transition-colors",
                            pathname === "/"
                                ? "text-neutral-900 underline underline-offset-4"
                                : "text-neutral-500 hover:text-neutral-900"
                        )}
                    >
                        홈
                    </Link>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-sm font-medium transition-colors",
                                isActive(item.href)
                                    ? "text-neutral-900 underline underline-offset-4"
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Center Logo */}
                <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
                    <span className="text-2xl font-black tracking-tight">
                        M<span className="relative">A</span>D
                    </span>
                    <span className="text-2xl font-light italic tracking-wide ml-1">Leap</span>
                </Link>

                {/* Right side */}
                <div className="hidden md:flex ml-auto">
                    <UniverseUtilityBar
                        aboutPath="/madleap/about"
                        profilePath="/madleap/my"
                        accentColor="#D32F2F"
                        signupPath="/signup"
                    />
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
                    <Link
                        href="/"
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                            "block text-sm font-medium transition-colors",
                            pathname === "/" ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
                        )}
                    >
                        홈
                    </Link>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium transition-colors",
                                isActive(item.href) ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
                            )}
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
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900">Login</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
        </>
    );
}
