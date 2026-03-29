"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";

const navItems = [
    { name: "Planner's", href: "/planners" },
    { name: "Planning", href: "/planners?tab=planning" },
    { name: "Planner's Planner", href: "/planners?tab=planner-tool" },
    { name: "GPR", href: "/planners?tab=gpr" },
    { name: "Programs", href: "/planners?tab=programs" },
];

export function PlannersHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/planners") return pathname === "/planners" && !pathname.includes("?");
        return href.includes("?") ? false : pathname.startsWith(href);
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-teal-900 text-white">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href="/planners" className="shrink-0 flex items-center gap-2">
                    <span className="text-lg font-bold tracking-tight text-white">
                        Planner&apos;s
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "px-3 py-1.5 text-sm font-medium transition-colors rounded",
                                isActive(item.href)
                                    ? "text-white bg-white/10"
                                    : "text-teal-200 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden md:flex ml-auto">
                    <UniverseUtilityBar
                        aboutPath="/planners/about"
                        profilePath="/planners/my"
                        accentColor="#1a1a2e"
                        signupPath="/signup"
                    />
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden p-2 text-teal-200 hover:text-white"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-teal-950 border-t border-teal-800 px-4 py-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block px-3 py-2 text-sm rounded",
                                isActive(item.href)
                                    ? "text-white bg-white/10"
                                    : "text-teal-200 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-2 border-t border-teal-800 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/profile" onClick={() => setMobileOpen(false)} className="text-sm text-teal-200 hover:text-white flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-teal-200 hover:text-white">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-teal-200 hover:text-white">가입</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
        </>
    );
}
