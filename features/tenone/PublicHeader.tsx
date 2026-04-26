"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/lib/theme-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";


type NavItem = { name: string; href: string; sub?: { name: string; href: string }[] };

const publicNav: NavItem[] = [
    { name: "Works", href: "/works" },
    { name: "Contact", href: "/contact" },
    { name: "Newsroom", href: "/newsroom" },
    { name: "About", href: "/about" },
];

export function PublicHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, canAccessIntra, logout } = useAuth();
    const { isDark } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "?");

    return (
        <>
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
                <div className="hidden md:flex items-center gap-2">
                    <ThemeToggle />
                    <UniverseUtilityBar
                        aboutPath="/about"
                        hideAuth={true}
                        accentColor={isDark ? '#fff' : '#000'}
                        siteId="tenone"
                        siteName="Ten:One"
                    />
                </div>

                {/* Mobile menu button */}
                <div className="flex md:hidden items-center gap-2">
                    <ThemeToggle />
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 transition-colors" style={{ color: "var(--tn-text)" }}>
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

        </header>

        <UniverseMobileMenu
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            brandName="Ten:One"
            bgStyle={{ background: "var(--tn-bg)" }}
            textTone={isDark ? "light" : "dark"}
            footer={
                !isLoading && isAuthenticated && user ? (
                    <div className="flex flex-col gap-2">
                        {canAccessIntra && (
                            <Link href="/intra" onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm transition-colors hover:opacity-70"
                                style={{ color: "var(--tn-text-sub)" }}>Intra</Link>
                        )}
                        <Link href="/profile" onClick={() => setMobileMenuOpen(false)}
                            className="block text-sm transition-colors hover:opacity-70"
                            style={{ color: "var(--tn-text-sub)" }}>프로필</Link>
                        <button onClick={() => { logout(); router.push('/'); setMobileMenuOpen(false); }}
                            className="block text-left text-sm transition-colors hover:opacity-70"
                            style={{ color: "var(--tn-text-muted)" }}>로그아웃</button>
                    </div>
                ) : null
            }
        >
            {publicNav.map(item => (
                <div key={item.name}>
                    <Link href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-lg px-4 py-2.5 text-base font-medium transition-colors hover:opacity-70"
                        style={{ color: isActive(item.href) ? "var(--tn-text)" : "var(--tn-text-sub)" }}>
                        {item.name}
                    </Link>
                    {'sub' in item && item.sub && (
                        <div className="ml-4 mt-1 space-y-1">
                            {item.sub.map(sub => (
                                <Link key={sub.name} href={sub.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-1.5 text-sm transition-colors hover:opacity-70"
                                    style={{ color: "var(--tn-text-muted)" }}>
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
