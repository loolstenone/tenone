"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";

const PREFIX = '/myverse';
const navItems = [
    { name: "서비스", href: `${PREFIX}/service` },
    { name: "기술", href: `${PREFIX}/technology` },
    { name: "철학", href: `${PREFIX}/philosophy` },
    { name: "팀", href: `${PREFIX}/team` },
    { name: "로드맵", href: `${PREFIX}/roadmap` },
    { name: "문의", href: `${PREFIX}/contact` },
];

export function MyVerseHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100">
            <nav className="mx-auto max-w-6xl px-5 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href={PREFIX} className="flex items-center gap-2 shrink-0">
                    <span className="text-neutral-900 font-bold text-lg tracking-tight">Myverse</span>
                    <span className="text-neutral-400 text-xs hidden sm:inline">Personal Blackbox</span>
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
                                    ? "text-neutral-900 bg-neutral-100"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right: UniverseUtilityBar + Mobile toggle */}
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex">
                        <UniverseUtilityBar
                            aboutPath="/myverse/service"
                            signupPath="/signup"
                            accentColor="#6366f1"
                            searchPlaceholder="Myverse 검색"
                        />
                    </div>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-neutral-500"
                        aria-label="메뉴"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-neutral-100 px-5 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-2 border-t border-neutral-100">
                        <UniverseUtilityBar
                            aboutPath="/myverse/service"
                            signupPath="/signup"
                            accentColor="#6366f1"
                            searchPlaceholder="Myverse 검색"
                        />
                    </div>
                </div>
            )}
        </header>
        </>
    );
}
