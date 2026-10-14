"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";

const navItems = [
    { name: "뚜르 드 문래", href: "/mullaesian#tour" },
    { name: "갤러리 문래", href: "/mullaesian#gallery" },
    { name: "문래 꼬뮨", href: "/mullaesian#commune" },
];

export function MullaesianHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
            <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="shrink-0 flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight text-neutral-900">
                        문래<span className="text-[#007BBF]">지앙</span>
                    </span>
                    <span className="text-xs text-neutral-400 hidden sm:inline">Mullaesian</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-[#007BBF] transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex ml-auto items-center">
                    <UniverseUtilityBar
                        hideAbout
                        aboutPath="/mullaesian/about"
                        profilePath="/mullaesian/my"
                        breakpoint="md"
                        accentColor="#1a1a2e"
                        signupPath="/mullaesian/signup"
                        siteId="mullaesian"
                        siteName="Mullaesian"
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
            brandName="Mullaesian"
            bgClass="bg-white"
            textTone="dark"
            accentColor="#1a1a2e"
        >
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-2.5 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-[#007BBF] transition-colors"
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
