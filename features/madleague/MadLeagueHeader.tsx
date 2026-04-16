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
    { name: "프로그램",  href: "/madleague/programs" },
    { name: "MADzine",  href: "/madleague/madzine" },
    { name: "지원하기",  href: "/madleague/apply" },
];

export function MadLeagueHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const { isAuthenticated } = useAuth();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-900">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center gap-8">
                {/* Logo */}
                <Link href="/madleague" className="shrink-0">
                    {logoError ? (
                        <span className="text-white font-extrabold text-lg tracking-tight">MAD LEAGUE</span>
                    ) : (
                        <Image
                            src="/logos/madleague/madleague-circle-sq.png"
                            alt="MAD League"
                            width={120}
                            height={36}
                            className="object-contain h-9 w-auto"
                            onError={() => setLogoError(true)}
                        />
                    )}
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-sm font-medium transition-colors whitespace-nowrap",
                                isActive(item.href) ? "text-white" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden lg:flex ml-auto">
                    <UniverseUtilityBar
                        aboutPath="/madleague/about"
                        profilePath="/madleague/my"
                        accentColor="#EC1D25"
                        signupPath="/signup"
                    />
                </div>

                {/* Mobile spacer */}
                <div className="lg:hidden ml-auto" />

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
                <div className="lg:hidden bg-neutral-900 border-t border-neutral-800 px-6 py-6 space-y-3">
                    {/* 프로그램 그룹 */}
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-2">PROGRAMS</div>
                    {programItems.map((p) => (
                        <Link
                            key={p.href}
                            href={p.href}
                            onClick={() => setMobileOpen(false)}
                            className="block text-sm font-medium text-neutral-400 hover:text-white transition pl-2"
                        >
                            {p.name}
                        </Link>
                    ))}
                    <div className="pt-2 border-t border-neutral-800" />
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium transition-colors",
                                isActive(item.href) ? "text-white" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-neutral-800 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/madleague/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-white">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm px-4 py-1.5 bg-[#EC1D25] text-white rounded">가입</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
        </>
    );
}
