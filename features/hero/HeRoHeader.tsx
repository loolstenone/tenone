"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";

const navItems = [
    { name: "HIT 검사", href: "/hero/hit" },
    { name: "AI 상담", href: "/hero/coaching/ai" },
    { name: "커리어 코칭", href: "/hero/coaching" },
    { name: "커리어 로드맵", href: "/hero/career" },
    { name: "이력서", href: "/hero/resume" },
];

export function HeRoHeader() {
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
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center">
                {/* Logo */}
                <Link href="/hero" className="flex items-center shrink-0 mr-10">
                    <Image
                        src="/hero-logo-wide.png"
                        alt="HeRo"
                        width={80}
                        height={40}
                        className="h-9 w-auto"
                        priority
                    />
                </Link>

                {/* Desktop Nav — 로고와 분리 */}
                <div className="hidden lg:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-sm font-medium transition-colors whitespace-nowrap",
                                isActive(item.href)
                                    ? "text-[#E53935]"
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side — 우측 끝 */}
                <div className="hidden lg:flex items-center ml-auto">
                    <UniverseUtilityBar
                        aboutPath="/hero/about"
                        profilePath="/hero/my"
                        accentColor="#E53935"
                        signupPath="/signup"
                    />
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden ml-auto p-2 text-neutral-500 hover:text-neutral-900"
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
                                "block text-sm font-medium transition-colors py-1",
                                isActive(item.href)
                                    ? "text-[#E53935]"
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <Link
                        href="/hero/about"
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm font-medium text-neutral-500 hover:text-neutral-900 py-1"
                    >
                        About
                    </Link>
                    <div className="pt-4 mt-4 border-t border-neutral-200 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/hero/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm px-4 py-1.5 bg-[#E53935] text-white hover:bg-red-700 rounded">가입</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
        </>
    );
}
