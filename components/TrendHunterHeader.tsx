"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
    { name: "About", href: "/th#about" },
    { name: "Services", href: "/th#services" },
    { name: "Process", href: "/th#process" },
    { name: "Contact", href: "/th#contact" },
];

export function TrendHunterHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-800/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <Link href="/th" className="shrink-0 flex items-center gap-2">
                    <span className="text-[#00FF88] font-mono font-bold text-xl tracking-tight">
                        T.H
                    </span>
                    <span className="text-white font-light text-sm hidden sm:inline">
                        Trend Hunter
                    </span>
                </Link>

                {/* 데스크탑 네비게이션 */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm text-neutral-400 hover:text-[#00FF88] transition-colors font-mono"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* 모바일 메뉴 버튼 */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 text-neutral-400 hover:text-[#00FF88]"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* 모바일 메뉴 */}
            {mobileOpen && (
                <div className="md:hidden bg-[#0A0A0A] border-t border-neutral-800/50 px-6 py-4 space-y-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="block text-sm font-mono text-neutral-400 hover:text-[#00FF88] transition-colors py-2"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
