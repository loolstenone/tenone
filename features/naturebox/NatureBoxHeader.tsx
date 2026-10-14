"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";

const navItems = [
    { name: "자연함 이야기", href: "/naturebox#about" },
    { name: "우리 먹거리", href: "/naturebox#products" },
    { name: "정선 이야기", href: "/naturebox#jeongseon" },
    { name: "오시는 길", href: "/naturebox#visit" },
];

export function NatureBoxHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
            <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <Link href="/" className="shrink-0 flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight text-neutral-900">
                        자연<span className="text-[#6B8E23]">함</span>
                    </span>
                    <span className="text-xs text-neutral-400 hidden sm:inline">NatureBox</span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-[#6B8E23] transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex ml-auto items-center">
                    <UniverseUtilityBar
                        hideAbout
                        aboutPath="/naturebox/about"
                        profilePath="/naturebox/my"
                        breakpoint="md"
                        accentColor="#166534"
                        signupPath="/naturebox/signup"
                        siteId="naturebox"
                        siteName="NatureBox"
                    />
                </div>

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
            brandName="NatureBox"
            bgClass="bg-white"
            textTone="dark"
            accentColor="#166534"
        >
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-2.5 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-[#6B8E23] transition-colors"
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
