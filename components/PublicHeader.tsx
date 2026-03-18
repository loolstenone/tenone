"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { LogOut, Building2 } from "lucide-react";

const publicNav = [
    { name: "About", href: "/about" },
    { name: "Universe", href: "/universe" },
    { name: "Brands", href: "/brands" },
    { name: "History", href: "/history" },
    { name: "Contact", href: "/contact" },
];

const intraNav = [
    { name: "Intra", href: "/intra", external: false },
    { name: "Studio", href: "/intra/studio", external: false },
    { name: "ERP", href: "/intra/erp", external: false },
    { name: "Marketing", href: "/intra/marketing", external: false },
    { name: "Wiki", href: "/intra/wiki", external: false },
];

export function PublicHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, isStaff, logout } = useAuth();
    const [showIntra, setShowIntra] = useState(false);

    const isIntraRoute = pathname.startsWith('/intra');
    const intraMode = showIntra || isIntraRoute;

    const renderNavItem = (item: { name: string; href: string; external: boolean }) => {
        if (item.external) {
            return (
                <a key={item.name} href={item.href}
                    className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                    {item.name}
                </a>
            );
        }
        return (
            <Link key={item.name} href={item.href}
                className={clsx(
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) ? "text-white" : "text-zinc-400 hover:text-white",
                    "px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-white/5"
                )}>
                {item.name}
            </Link>
        );
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
            <nav className="mx-auto max-w-7xl px-6 lg:px-8 flex h-14 items-center justify-between">
                <Logo variant="horizontal" size="sm" />

                <div className="hidden md:flex items-center gap-1">
                    {intraMode && isStaff ? (
                        <>
                            {intraNav.map(item => renderNavItem(item))}
                            <div className="w-px h-5 bg-zinc-800 mx-1" />
                            <button onClick={() => { setShowIntra(false); router.push('/'); }}
                                className="px-3 py-1.5 text-xs text-zinc-500 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                                ← 홈페이지
                            </button>
                        </>
                    ) : (
                        <>
                            {publicNav.map(item => renderNavItem({ ...item, external: false }))}
                        </>
                    )}

                    <div className="w-px h-5 bg-zinc-800 mx-1" />

                    {!isLoading && isAuthenticated && user ? (
                        <div className="flex items-center gap-1">
                            {isStaff && !intraMode && (
                                <button onClick={() => { setShowIntra(true); router.push('/intra'); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-400 border border-indigo-500/30 rounded-full hover:bg-indigo-500/10 transition-colors mr-1">
                                    <Building2 className="h-3.5 w-3.5" />
                                    Intra
                                </button>
                            )}
                            <Link href="/profile"
                                className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                                <div className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                                    {user.avatarInitials}
                                </div>
                                <span className="text-sm max-w-[80px] truncate">{user.name}</span>
                            </Link>
                            <button onClick={() => { logout(); router.push('/'); }}
                                className="p-1.5 text-zinc-500 hover:text-white rounded-md hover:bg-white/5 transition-colors" title="로그아웃">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : !isLoading ? (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors">로그인</Link>
                            <Link href="/signup" className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors">회원가입</Link>
                        </div>
                    ) : null}
                </div>
            </nav>
        </header>
    );
}
