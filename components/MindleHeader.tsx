"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";

const navItems = [
    { name: "TRENDS", href: "/mindle/trends" },
    { name: "REPORTS", href: "/mindle/reports" },
    { name: "DATA", href: "/mindle/data" },
    { name: "REFERENCES", href: "/mindle/references" },
    { name: "NEWSLETTER", href: "/mindle/newsletter" },
];

export function MindleHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-neutral-800/50 backdrop-blur-md text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-12 items-center">
                {/* Logo */}
                <Link href="/mindle" className="shrink-0 text-xl font-black tracking-tight mr-8">
                    <span className="text-[#F5C518]">M</span>indle
                </Link>

                {/* Desktop nav */}
                <nav className="hidden lg:flex items-center gap-4">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}
                            className={`text-[12px] font-bold tracking-wider transition-colors ${
                                pathname?.startsWith(item.href) ? "text-[#F5C518]" : "text-neutral-300 hover:text-white"
                            }`}>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Right: Utility Bar */}
                <div className="hidden lg:flex ml-auto">
                    <UniverseUtilityBar
                        aboutPath="/mindle/about"
                        profilePath="/mindle/my"
                        adminPath="/mindle/admin"
                        adminEmails={["cheonil@tenone.biz", "tenone@tenone.biz", "admin@tenone.biz"]}
                        accentColor="#F5C518"
                        signupPath="/signup"
                        searchPlaceholder="Search trends, reports, keywords..."
                    />
                </div>

                {/* Mobile hamburger */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-neutral-400 ml-auto">
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-[#0A0A0A] border-t border-neutral-800/50 px-6 py-4 space-y-3">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                            className={`block text-sm font-bold tracking-wider py-2 ${pathname?.startsWith(item.href) ? "text-[#F5C518]" : "text-neutral-400"}`}>
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
