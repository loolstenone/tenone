"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";

const navItems = [
    { name: "프로그램", href: "/programs" },
    { name: "투자", href: "/invest" },
    { name: "스타트업", href: "/startups" },
    { name: "커뮤니티", href: "/community" },
];

export function ChangeUpHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="shrink-0 flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-[#1AAD64]">Change</span>
                    <span className="text-xl font-black tracking-tight text-[#256EFF]">Up</span>
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
                                    ? "text-[#1AAD64] bg-[#1AAD64]/10"
                                    : "text-neutral-600 hover:text-[#1AAD64] hover:bg-neutral-50"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex ml-auto items-center">
                    <UniverseUtilityBar
                        aboutPath="/changeup/about"
                        profilePath="/changeup/my"
                        breakpoint="md"
                        accentColor="#2563EB"
                        signupPath="/changeup/signup"
                        siteId="changeup"
                        siteName="ChangeUp"
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

        </header>

        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="ChangeUp"
            bgClass="bg-white"
            textTone="dark"
            aboutPath="/changeup/about"
            accentColor="#2563EB"
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
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
