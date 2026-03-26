"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

const navItems = [
    { name: "트렌드", href: "/mindle/trends" },
    { name: "리포트", href: "/mindle/reports" },
    { name: "데이터", href: "/mindle/data" },
    { name: "레퍼런스", href: "/mindle/references" },
];

export function MindleHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const pathname = usePathname();
    const isHome = pathname === "/mindle" || pathname === "/";

    const handleLogout = async () => { await logout(); window.location.reload(); };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-800/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {!isHome && (
                    <Link href="/mindle" className="shrink-0 text-lg font-bold tracking-tight">
                        <span className="text-[#F5C518]">Mindle</span> <span className="text-white text-sm font-normal">Whole See</span>
                    </Link>
                )}

                <nav className="hidden md:flex items-center gap-7">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-[13px] font-medium transition-colors ${
                                pathname?.startsWith(item.href)
                                    ? "text-[#F5C518]"
                                    : "text-neutral-400 hover:text-white"
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}

                    {isAuthenticated ? (
                        <div className="flex items-center gap-3 ml-2">
                            <Link href="/mindle/my" className="flex items-center gap-1.5 text-[13px] text-neutral-400 hover:text-white transition-colors">
                                <User className="h-3.5 w-3.5" /> {user?.name || "마이"}
                            </Link>
                            <button onClick={handleLogout} className="text-neutral-500 hover:text-red-400 transition-colors">
                                <LogOut className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 ml-2">
                            <button onClick={() => setLoginOpen(true)} className="text-[13px] text-neutral-400 hover:text-white transition-colors">로그인</button>
                            <Link href="/signup" className="text-[13px] px-4 py-1.5 rounded-full bg-[#F5C518] text-black font-semibold hover:bg-[#E5B616] transition-colors">가입</Link>
                        </div>
                    )}
                </nav>

                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-neutral-400">
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {mobileOpen && (
                <div className="md:hidden bg-[#0A0A0A] border-t border-neutral-800/50 px-6 py-4 space-y-3">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                            className={`block text-sm py-2 ${pathname?.startsWith(item.href) ? "text-[#F5C518]" : "text-neutral-400"}`}>
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-2 mt-2 border-t border-neutral-800/50 space-y-2">
                        {isAuthenticated ? (
                            <>
                                <Link href="/mindle/my" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-400"><User className="h-3.5 w-3.5 inline mr-1" />마이페이지</Link>
                                <button onClick={handleLogout} className="text-sm text-neutral-500"><LogOut className="h-3.5 w-3.5 inline mr-1" />로그아웃</button>
                            </>
                        ) : (
                            <button onClick={() => { setMobileOpen(false); setLoginOpen(true); }} className="text-sm text-neutral-400">로그인</button>
                        )}
                    </div>
                </div>
            )}
        </header>

        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor="#F5C518" />
        </>
    );
}
