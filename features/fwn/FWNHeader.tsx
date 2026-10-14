"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";

const navItems = [
    { name: "서울", href: "/category/seoul" },
    { name: "파리", href: "/category/paris" },
    { name: "뉴욕", href: "/category/newyork" },
    { name: "런던", href: "/category/london" },
    { name: "밀라노", href: "/category/milan" },
    { name: "월드", href: "/category/world" },
    { name: "모델", href: "/category/models" },
    { name: "브랜드", href: "/category/brands" },
    { name: "스트리트 런웨이", href: "/category/street" },
];

export function FWNHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* 로고 바 */}
            <div className="bg-[#1a1a1a] border-b border-neutral-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                    <Link href="/" className="shrink-0">
                        <span className="text-white font-bold text-2xl tracking-tight">
                            FWN
                        </span>
                        <span className="text-neutral-400 text-xs ml-2 hidden sm:inline">패션 위크 네트워크</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex ml-auto items-center">
                            <UniverseUtilityBar
                                aboutPath="/fwn/about"
                                profilePath="/fwn/my"
                                breakpoint="lg"
                                accentColor="#000000"
                                signupPath="/fwn/signup"
                                siteId="fwn"
                                siteName="FWN"
                            />
                        </div>
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden p-2 text-neutral-400 hover:text-white"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* 데스크탑 네비게이션 */}
            <nav className="hidden lg:block bg-[#252525] border-b border-neutral-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-10 items-center gap-1 overflow-x-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                                isActive(item.href)
                                    ? "text-white border-b-2 border-[#00C853]"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </nav>

        </header>

        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="FWN"
            bgClass="bg-[#1a1a1a]"
            textTone="light"
            aboutPath="/fwn/about"
            accentColor="#000000"
        >
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                        "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                        isActive(item.href)
                            ? "bg-[#00C853]/10 text-[#00C853]"
                            : "text-neutral-300 hover:bg-white/5 hover:text-white"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
