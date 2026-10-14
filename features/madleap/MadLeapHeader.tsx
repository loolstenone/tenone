"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { siteHeaderNav } from "@/lib/brand-site-menus";

// 헤더 메뉴 = lib/brand-site-menus.ts (사이트·인트라·현황 SSOT, §1.9.5) — 메뉴 이름·순서는 거기서 고친다
const navItems = siteHeaderNav("madleap");

export function MadLeapHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/madleap") return pathname === "/madleap" || pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                {/* Left Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/madleap"
                        className={clsx(
                            "text-sm font-medium transition-colors",
                            isActive("/madleap")
                                ? "text-neutral-900 underline underline-offset-4"
                                : "text-neutral-500 hover:text-neutral-900"
                        )}
                    >
                        홈
                    </Link>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "text-sm font-medium transition-colors",
                                isActive(item.href)
                                    ? "text-neutral-900 underline underline-offset-4"
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Center Logo */}
                <Link href="/madleap" className="absolute left-1/2 -translate-x-1/2 flex items-center">
                    <span className="text-2xl font-black tracking-tight">
                        M<span className="relative">A</span>D
                    </span>
                    <span className="text-2xl font-light italic tracking-wide ml-1">Leap</span>
                </Link>

                {/* Right side */}
                <div className="flex items-center ml-auto">
                    <UniverseUtilityBar
                        breakpoint="md"
                        aboutPath="/madleap/about"
                        profilePath="/madleap/my"
                        accentColor="#00B8FF"
                        signupPath="/madleap/signup"
                        siteId="madleap"
                        siteName="MADLeap"
                    />
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 ml-2 text-neutral-600 hover:text-neutral-900"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

        </header>

        <UniverseMobileMenu
            aboutPath="/madleap/about"
            accentColor="#00B8FF"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="MADLeap"
            bgClass="bg-white"
            textTone="dark"
        >
            <Link
                href="/madleap"
                onClick={() => setMobileOpen(false)}
                className={clsx(
                    "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                    isActive("/madleap") ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
            >
                홈
            </Link>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                        "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                        isActive(item.href) ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
