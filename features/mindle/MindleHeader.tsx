"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";

const navItems = [
    { name: "트렌드", href: "/mindle/trends" },
    { name: "리포트", href: "/mindle/reports" },
    { name: "데이터", href: "/mindle/data" },
    { name: "레퍼런스", href: "/mindle/references" },
    { name: "뉴스레터", href: "/mindle/newsletter" },
];

export function MindleHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
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
                        signupPath="/mindle/signup"
                        searchPlaceholder="Search trends, reports, keywords..."
                        siteId="mindle"
                        siteName="Mindle"
                    />
                </div>

                {/* Mobile hamburger */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-neutral-400 ml-auto">
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

        </header>

        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="Mindle"
            bgClass="bg-[#0A0A0A]"
            textTone="light"
        >
            {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className={clsx(
                        "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                        pathname?.startsWith(item.href) ? "bg-[#F5C518]/10 text-[#F5C518]" : "text-neutral-300 hover:bg-white/5 hover:text-white"
                    )}>
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
