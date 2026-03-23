"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, Orbit } from "lucide-react";

const navItems = [
    { name: "About", href: "/mv#about" },
    { name: "Core Values", href: "/mv#values" },
    { name: "Agent", href: "/mv#agent" },
    { name: "Roadmap", href: "/mv#roadmap" },
];

export function MyVerseHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        const base = href.split("#")[0];
        if (base === "/mv") return pathname === "/mv";
        return pathname.startsWith(base);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0D17]/95 backdrop-blur-md border-b border-white/5">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href="/mv" className="shrink-0 flex items-center gap-2">
                    <Orbit className="h-5 w-5 text-indigo-400" />
                    <span className="text-white font-semibold text-lg tracking-tight">
                        My <span className="text-indigo-400">Universe</span>
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
                                    ? "text-white bg-white/10"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden lg:flex items-center">
                    <Link
                        href="/mv#waitlist"
                        className="text-sm font-medium px-4 py-1.5 rounded-full bg-indigo-500 text-white hover:bg-indigo-400 transition-colors"
                    >
                        Get Early Access
                    </Link>
                </div>

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
                <div className="lg:hidden bg-[#0B0D17] border-t border-white/5 px-6 py-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium py-2 transition-colors",
                                isActive(item.href)
                                    ? "text-white"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <Link
                        href="/mv#waitlist"
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm font-medium py-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        Get Early Access
                    </Link>
                </div>
            )}
        </header>
    );
}
