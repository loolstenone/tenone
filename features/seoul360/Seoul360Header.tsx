"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";

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
                <div className="flex ml-auto items-center">
                    <UniverseUtilityBar
                        hideAbout
                        aboutPath="/seoul360/about"
                        profilePath="/seoul360/my"
                        breakpoint="lg"
                        accentColor="#1a1a2e"
                        signupPath="/seoul360/signup"
                        siteId="seoul360"
                        siteName="Seoul360"
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

        </header>

        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="Seoul/360°"
            bgClass="bg-[#3D3D3D]"
            textTone="light"
            accentColor="#1a1a2e"
        >
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                        "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                        isActive(item.href) ? "bg-white/10 text-white" : "text-neutral-300 hover:bg-white/5 hover:text-white"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
