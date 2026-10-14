"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";

const navItems = [
    { name: "What We Do", href: "/whatwedo" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "People", href: "/people" },
    { name: "Contact", href: "/contact" },
];

export function YouInOneHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
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
                <div className="flex ml-auto items-center gap-3">
                    <UniverseUtilityBar
                        breakpoint="lg"
                        hideAbout
                        aboutPath="/youinone/about"
                        profilePath="/youinone/my"
                        accentColor="#1AAD64"
                        signupPath="/youinone/signup"
                        siteId="youinone"
                        siteName="YouInOne"
                    />
                    <Link
                        href="/alliance"
                        className="hidden lg:inline-block text-sm px-5 py-2 bg-[#1AAD64] text-white hover:bg-[#148B4A] transition-colors rounded"
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

        </header>

        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="YouInOne"
            bgClass="bg-white"
            textTone="dark"
            accentColor="#1AAD64"
            cta={
                <Link
                    href="/alliance"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center text-sm px-5 py-2 bg-[#1AAD64] text-white hover:bg-[#148B4A] rounded transition-colors"
                >
                    Members &amp; Alliance
                </Link>
            }
        >
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                        "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                        isActive(item.href)
                            ? "bg-[#1AAD64]/10 text-[#1AAD64]"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-[#1AAD64]"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
