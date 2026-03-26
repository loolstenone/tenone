"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { TrendHunterLogo } from "@/components/TrendHunterLogo";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";

const navItems = [
    { name: "Weekly", href: "/trendhunter/weekly" },
    { name: "Signals", href: "/trendhunter/signals" },
    { name: "References", href: "/trendhunter/references" },
    { name: "Opportunities", href: "/trendhunter/opportunities" },
];

export function TrendHunterHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-800/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <Link href="/trendhunter" className="shrink-0 flex items-center">
                    <span className="hidden sm:inline"><TrendHunterLogo size="sm" variant="dark" /></span>
                    <span className="sm:hidden"><TrendHunterLogo size="sm" variant="dark" showText={false} /></span>
                </Link>

                {/* 데스크탑 네비게이션 */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-sm font-mono transition-colors ${
                                pathname === item.href
                                    ? "text-[#00FF88]"
                                    : "text-neutral-400 hover:text-[#00FF88]"
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <UniverseUtilityBar
                        aboutPath="/trendhunter/about"
                        profilePath="/trendhunter/my"
                        accentColor="#F5C518"
                        signupPath="/signup"
                    />
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
                            className={`block text-sm font-mono transition-colors py-2 ${
                                pathname === item.href
                                    ? "text-[#00FF88]"
                                    : "text-neutral-400 hover:text-[#00FF88]"
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-2 mt-2 border-t border-neutral-800/50 flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                            <Link href="/trendhunter/my" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-[#00FF88] flex items-center gap-2">
                                <User className="h-4 w-4" /> 마이페이지
                            </Link>
                            <button onClick={async () => { await logout(); window.location.reload(); }} className="text-sm text-neutral-500 hover:text-red-400 flex items-center gap-2">
                                <LogOut className="h-3.5 w-3.5" /> 로그아웃
                            </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-[#00FF88]">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-400 hover:text-[#00FF88]">가입</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>

        </>
    );
}
