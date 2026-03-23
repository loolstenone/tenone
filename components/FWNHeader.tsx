"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, Search } from "lucide-react";

const navItems = [
    { name: "서울", href: "/fw/category/seoul" },
    { name: "파리", href: "/fw/category/paris" },
    { name: "뉴욕", href: "/fw/category/newyork" },
    { name: "런던", href: "/fw/category/london" },
    { name: "밀라노", href: "/fw/category/milan" },
    { name: "월드", href: "/fw/category/world" },
    { name: "모델", href: "/fw/category/models" },
    { name: "브랜드", href: "/fw/category/brands" },
    { name: "스트리트 런웨이", href: "/fw/category/street" },
    { name: "About", href: "/fw/about" },
];

export function FWNHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/fw") return pathname === "/fw";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* 로고 바 */}
            <div className="bg-[#1a1a1a] border-b border-neutral-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                    <Link href="/fw" className="shrink-0">
                        <span className="text-white font-bold text-2xl tracking-tight">
                            FWN
                        </span>
                        <span className="text-neutral-400 text-xs ml-2 hidden sm:inline">패션 위크 네트워크</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-neutral-400 hover:text-white transition-colors">
                            <Search className="h-4 w-4" />
                        </button>
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

            {/* 모바일 메뉴 */}
            {mobileOpen && (
                <div className="lg:hidden bg-[#1a1a1a] border-b border-neutral-800 px-6 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block text-sm font-medium transition-colors py-2",
                                isActive(item.href)
                                    ? "text-[#00C853]"
                                    : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
