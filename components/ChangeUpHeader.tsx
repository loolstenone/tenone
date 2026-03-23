"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";

const navItems = [
    { name: "프로그램", href: "/cu/programs" },
    { name: "투자", href: "/cu/invest" },
    { name: "스타트업", href: "/cu/startups" },
    { name: "커뮤니티", href: "/cu/community" },
    { name: "About", href: "/cu/about" },
];

export function ChangeUpHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/cu") return pathname === "/cu";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href="/cu" className="shrink-0 flex items-center gap-2">
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
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        로그인
                    </Link>
                    <Link
                        href="/signup"
                        className="text-sm bg-[#1AAD64] text-white px-4 py-1.5 rounded-full hover:bg-[#148F52] transition-colors"
                    >
                        시작하기
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-neutral-100 px-6 py-6 space-y-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium transition-colors py-2",
                                isActive(item.href)
                                    ? "text-[#1AAD64]"
                                    : "text-neutral-500 hover:text-neutral-900"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center gap-4">
                        <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-900">
                            로그인
                        </Link>
                        <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm bg-[#1AAD64] text-white px-4 py-1.5 rounded-full">
                            시작하기
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
