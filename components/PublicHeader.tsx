"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/lib/theme-context";
import { PortalIcon } from "@/components/icons/PortalIcon";

const publicNav = [
    { name: "Works", href: "/works" },
    { name: "Contact", href: "/contact" },
    { name: "Newsroom", href: "/newsroom" },
    { name: "Newsletter", href: "/newsletter" },
    {
        name: "About", href: "/about",
        sub: [
            { name: "Philosophy", href: "/about?tab=philosophy" },
            { name: "Universe", href: "/about?tab=universe" },
            { name: "History", href: "/about?tab=history" },
        ]
    },
];

export function PublicHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, canAccessIntra, logout } = useAuth();
    const { isDark } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "?");

    return (
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b transition-colors duration-300"
            style={{ backgroundColor: "color-mix(in srgb, var(--tn-header-bg) 90%, transparent)", borderColor: "var(--tn-border-light, var(--tn-border))" }}>
            <nav className="mx-auto max-w-7xl px-6 lg:px-8 flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Logo variant="horizontal" size="sm" asLink={false} />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {publicNav.map(item => (
                        'sub' in item && item.sub ? (
                            <div key={item.name} className="relative group">
                                <Link href={item.href}
                                    className="text-sm tracking-wide transition-colors hover:opacity-80"
                                    style={{ color: isActive(item.href) ? "var(--tn-text)" : "var(--tn-text-muted)" }}>
                                    {item.name}
                                </Link>
                                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <div className="py-2 min-w-[160px] border rounded-lg shadow-lg"
                                        style={{ backgroundColor: "var(--tn-surface)", borderColor: "var(--tn-border)" }}>
                                        {item.sub.map(sub => (
                                            <Link key={sub.name} href={sub.href}
                                                className="block px-5 py-2 text-sm transition-colors hover:opacity-70"
                                                style={{ color: "var(--tn-text-sub)" }}>
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link key={item.name} href={item.href}
                                className="text-sm tracking-wide transition-colors hover:opacity-80"
                                style={{ color: isActive(item.href) ? "var(--tn-text)" : "var(--tn-text-muted)" }}>
                                {item.name}
                            </Link>
                        )
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden md:flex items-center gap-3">
                    {!isLoading && isAuthenticated && user ? (
                        <>
                            {/* Avatar dropdown */}
                            <div className="relative">
                                <button onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center hover:opacity-90 transition-opacity">
                                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300"
                                        style={{
                                            background: isDark
                                                ? "radial-gradient(circle at 35% 35%, #eee 0%, #ccc 60%, #aaa 100%)"
                                                : "radial-gradient(circle at 35% 35%, #555 0%, #222 60%, #111 100%)",
                                            color: isDark ? "#111" : "#fff",
                                            boxShadow: isDark
                                                ? "0 2px 6px rgba(255,255,255,0.15), inset 0 -2px 3px rgba(0,0,0,0.1)"
                                                : "0 2px 6px rgba(0,0,0,0.3), inset 0 -2px 3px rgba(0,0,0,0.2)",
                                        }}>
                                        {user.avatarInitials}
                                    </div>
                                </button>
                                {profileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                        <div className="absolute right-0 top-full mt-2 z-50 w-48 py-2 rounded-lg border"
                                            style={{ backgroundColor: "var(--tn-surface)", borderColor: "var(--tn-border)" }}>
                                            <div className="px-4 py-2 border-b" style={{ borderColor: "var(--tn-border)" }}>
                                                <p className="text-xs font-medium" style={{ color: "var(--tn-text)" }}>{user.name}</p>
                                                <p className="text-[10px]" style={{ color: "var(--tn-text-muted)" }}>{user.email}</p>
                                            </div>
                                            <Link href="/profile" onClick={() => setProfileOpen(false)}
                                                className="block px-4 py-2 text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--tn-text-sub)" }}>
                                                프로필
                                            </Link>
                                            <button onClick={() => { setProfileOpen(false); logout(); router.push('/'); }}
                                                className="block w-full text-left px-4 py-2 text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--tn-text-muted)" }}>
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* Portal */}
                            {canAccessIntra && (
                                <Link href="/intra" className="hover:opacity-70 transition-opacity" title="Intra Office">
                                    <PortalIcon direction="enter" size={36} darkBg={isDark} />
                                </Link>
                            )}
                            {/* Theme toggle */}
                            <ThemeToggle />
                        </>
                    ) : !isLoading ? (
                        <>
                            <Link href="/login" className="text-xs transition-colors hover:opacity-70" style={{ color: "var(--tn-text-sub)" }}>
                                Login
                            </Link>
                            <Link href="/signup" className="text-xs px-4 py-1.5 transition-colors" style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                                Joinup
                            </Link>
                            <ThemeToggle />
                        </>
                    ) : null}
                </div>

                {/* Mobile menu button */}
                <div className="flex md:hidden items-center gap-2">
                    <ThemeToggle />
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 transition-colors" style={{ color: "var(--tn-text)" }}>
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t px-6 py-6 space-y-4"
                    style={{ backgroundColor: "var(--tn-bg)", borderColor: "var(--tn-border)" }}>
                    {publicNav.map(item => (
                        <div key={item.name}>
                            <Link href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm transition-colors hover:opacity-70"
                                style={{ color: isActive(item.href) ? "var(--tn-text)" : "var(--tn-text-sub)" }}>
                                {item.name}
                            </Link>
                            {'sub' in item && item.sub && (
                                <div className="ml-4 mt-2 space-y-2">
                                    {item.sub.map(sub => (
                                        <Link key={sub.name} href={sub.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block text-sm transition-colors hover:opacity-70"
                                            style={{ color: "var(--tn-text-muted)" }}>
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {!isLoading && isAuthenticated && user ? (
                        <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: "var(--tn-border)" }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium"
                                    style={{
                                        background: isDark
                                            ? "radial-gradient(circle at 35% 35%, #eee 0%, #ccc 60%, #aaa 100%)"
                                            : "radial-gradient(circle at 35% 35%, #555 0%, #222 60%, #111 100%)",
                                        color: isDark ? "#111" : "#fff",
                                    }}>
                                    {user.avatarInitials}
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--tn-text)" }}>{user.name}</p>
                                    <p className="text-xs" style={{ color: "var(--tn-text-muted)" }}>{user.email}</p>
                                </div>
                            </div>
                            {canAccessIntra && (
                                <Link href="/intra" onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 text-sm transition-colors hover:opacity-70"
                                    style={{ color: "var(--tn-text-sub)" }}>
                                    <PortalIcon direction="enter" size={20} darkBg={isDark} />
                                    Intra Office
                                </Link>
                            )}
                            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm transition-colors hover:opacity-70" style={{ color: "var(--tn-text-sub)" }}>
                                프로필
                            </Link>
                            <button onClick={() => { logout(); router.push('/'); setMobileMenuOpen(false); }}
                                className="block text-sm transition-colors hover:opacity-70" style={{ color: "var(--tn-text-muted)" }}>
                                로그아웃
                            </button>
                        </div>
                    ) : !isLoading ? (
                        <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: "var(--tn-border)" }}>
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm transition-colors hover:opacity-70" style={{ color: "var(--tn-text-sub)" }}>
                                로그인
                            </Link>
                            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm font-medium transition-colors hover:opacity-70" style={{ color: "var(--tn-text)" }}>
                                회원가입
                            </Link>
                        </div>
                    ) : null}
                </div>
            )}
        </header>
    );
}
