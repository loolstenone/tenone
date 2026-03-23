"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, Search } from "lucide-react";

const navItems = [
    { name: "Seoul/360°", href: "/s360" },
    { name: "Subway Line", href: "/s360/subway-line" },
    { name: "District", href: "/s360/district" },
    { name: "Station", href: "/s360/station" },
    { name: "Outside Seoul", href: "/s360/outside-seoul" },
];

export function Seoul360Header() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/s360") return pathname === "/s360";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#3D3D3D]">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href="/s360" className="shrink-0 flex items-center gap-1">
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

                {/* Search icon */}
                <div className="hidden lg:flex items-center">
                    <button className="text-neutral-300 hover:text-white p-2">
                        <Search className="h-4 w-4" />
                    </button>
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
                </div>
            )}
        </header>
    );
}
