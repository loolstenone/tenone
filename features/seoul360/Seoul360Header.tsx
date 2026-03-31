"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";

const navItems = [
    { name: "Seoul/360°", href: "/" },
    { name: "Subway Line", href: "/subway-line" },
    { name: "District", href: "/district" },
    { name: "Station", href: "/station" },
    { name: "Outside Seoul", href: "/outside-seoul" },
];

export function Seoul360Header() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#3D3D3D]">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="shrink-0 flex items-center gap-1">
                    <span className="bg-white text-[#3D3D3D] text-xs font-bold px-1.5 py-0.5 rounded-sm">
                        Seoul
                    </span>
                    <span className="text-white font-light text-lg tracking-tight">
                        /360°
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
                                    ? "text-white border-b-2 border-[#F5C518]"
                                    : "text-neutral-300 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden lg:flex ml-auto">
                    <UniverseUtilityBar
                        aboutPath="/seoul360/about"
                        profilePath="/seoul360/my"
                        accentColor="#1a1a2e"
                        signupPath="/signup"
                    />
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden p-2 text-neutral-300 hover:text-white"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-[#3D3D3D] border-t border-neutral-600 px-6 py-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium py-2 transition-colors",
                                isActive(item.href)
                                    ? "text-white"
                                    : "text-neutral-300 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-2 mt-2 border-t border-neutral-600 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-300 hover:text-white flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-300 hover:text-white">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-300 hover:text-white">가입</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
        </>
    );
}
