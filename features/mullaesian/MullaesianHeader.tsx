"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { loginHref } from "@/lib/login-href";

const navItems = [
    { name: "뚜르 드 문래", href: "/mullaesian#tour" },
    { name: "갤러리 문래", href: "/mullaesian#gallery" },
    { name: "문래 꼬뮨", href: "/mullaesian#commune" },
];

export function MullaesianHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
            <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="shrink-0 flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight text-neutral-900">
                        문래<span className="text-[#007BBF]">지앙</span>
                    </span>
                    <span className="text-xs text-neutral-400 hidden sm:inline">Mullaesian</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-[#007BBF] transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden md:flex ml-auto">
                    <UniverseUtilityBar
                        hideAbout
                        aboutPath="/mullaesian/about"
                        profilePath="/mullaesian/my"
                        accentColor="#1a1a2e"
                        signupPath="/mullaesian/signup"
                        siteId="mullaesian"
                        siteName="Mullaesian"
                    />
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

        </header>

        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="Mullaesian"
            bgClass="bg-white"
            textTone="dark"
            footer={
                isAuthenticated ? (
                    <Link href="/mullaesian/my" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-600 hover:text-neutral-900">마이페이지</Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href={loginHref(pathname)} onClick={() => setMobileOpen(false)} className="text-sm text-neutral-600 hover:text-neutral-900">로그인</Link>
                        <Link href="/mullaesian/signup" onClick={() => setMobileOpen(false)} className="text-sm text-neutral-600 hover:text-neutral-900">가입</Link>
                    </div>
                )
            }
        >
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-2.5 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-[#007BBF] transition-colors"
                >
                    {item.name}
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
