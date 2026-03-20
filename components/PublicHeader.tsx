"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { LogOut, Menu, X } from "lucide-react";

const publicNav = [
    { name: "Works", href: "/works" },
    { name: "Contact", href: "/contact" },
    { name: "Newsroom", href: "/newsroom" },
    {
        name: "About", href: "/about",
        sub: [
            { name: "Philosophy", href: "/about?tab=philosophy" },
            { name: "Universe", href: "/about?tab=universe" },
            { name: "History", href: "/about?tab=history" },
        ]
    },
];

export function PublicHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, isStaff, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-neutral-100">
            <nav className="mx-auto max-w-7xl px-6 lg:px-8 flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Logo variant="horizontal" size="sm" asLink={false} />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {publicNav.map(item => (
                        'sub' in item && item.sub ? (
                            <div key={item.name} className="relative group">
                                <Link href={item.href}
                                    className={clsx(
                                        pathname === item.href || pathname.startsWith(item.href) ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-900",
                                        "text-sm tracking-wide transition-colors"
                                    )}>
                                    {item.name}
                                </Link>
                                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <div className="bg-white border border-neutral-100 shadow-lg py-2 min-w-[160px]">
                                        {item.sub.map(sub => (
                                            <Link key={sub.name} href={sub.href}
                                                className="block px-5 py-2 text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors">
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link key={item.name} href={item.href}
                                className={clsx(
                                    pathname === item.href ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-900",
                                    "text-sm tracking-wide transition-colors"
                                )}>
                                {item.name}
                            </Link>
                        )
                    ))}

                </div>

                {/* Right side */}
                <div className="hidden md:flex items-center gap-4">
                    {!isLoading && isAuthenticated && user ? (
                        <div className="flex items-center gap-3">
                            {isStaff && (
                                <Link href="/intra" className="text-xs tracking-wide text-neutral-400 hover:text-neutral-900 transition-colors">
                                    Intra
                                </Link>
                            )}
                            <Link href="/profile" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                                <div className="h-7 w-7 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-medium">
                                    {user.avatarInitials}
                                </div>
                            </Link>
                            <button onClick={() => { logout(); router.push('/'); }}
                                className="p-1.5 text-neutral-300 hover:text-neutral-900 transition-colors" title="로그아웃">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : !isLoading ? (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors">
                                Log in
                            </Link>
                            <Link href="/signup" className="text-sm px-4 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                                Sign up
                            </Link>
                        </div>
                    ) : null}
                </div>

                {/* Mobile menu button */}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-neutral-100 px-6 py-6 space-y-4">
                    {publicNav.map(item => (
                        <div key={item.name}>
                            <Link href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm text-neutral-600 hover:text-neutral-900">
                                {item.name}
                            </Link>
                            {'sub' in item && item.sub && (
                                <div className="ml-4 mt-2 space-y-2">
                                    {item.sub.map(sub => (
                                        <Link key={sub.name} href={sub.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block text-sm text-neutral-400 hover:text-neutral-900">
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {!isLoading && !isAuthenticated && (
                        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm text-neutral-400 hover:text-neutral-900">
                                Log in
                            </Link>
                            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm text-neutral-900 font-medium hover:underline">
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
