"use client";

import { useState } from "react";
import { CrossSiteLink } from "@/components/CrossSiteLink";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/lib/theme-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";


type NavItem = { name: string; href: string; sub?: { name: string; href: string }[] };

const publicNav: NavItem[] = [
    { name: "Works", href: "/works" },
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/about" },
];

export function PublicHeader() {
    const pathname = usePathname();
    const { isDark } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "?");

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b transition-colors duration-300"
            style={{ backgroundColor: "color-mix(in srgb, var(--tn-header-bg) 90%, transparent)", borderColor: "var(--tn-border-light, var(--tn-border))" }}>
            <nav className="mx-auto max-w-7xl px-6 lg:px-8 flex h-16 items-center justify-between">
                <CrossSiteLink href="/" className="flex items-center"
                    onClick={(e) => {
                        // 이미 홈이면 Link가 아무 일도 안 함 → 맨 위로
                        // 계정 관리(account.tenone.biz)의 "/"는 홈이 아니다 — www.tenone.biz로 이동 (CrossSiteLink가 절대 주소로 바꿈)
                        if (pathname !== "/" || window.location.hostname === "account.tenone.biz") return;
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}>
                    <Logo variant="horizontal" size="sm" asLink={false} />
                </CrossSiteLink>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {publicNav.map(item => (
                        'sub' in item && item.sub ? (
                            <div key={item.name} className="relative group">
                                <CrossSiteLink href={item.href}
                                    className="text-sm tracking-wide transition-colors hover:opacity-80"
                                    style={{ color: isActive(item.href) ? "var(--tn-text)" : "var(--tn-text-muted)" }}>
                                    {item.name}
                                </CrossSiteLink>
                                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <div className="py-2 min-w-[160px] border rounded-lg shadow-lg"
                                        style={{ backgroundColor: "var(--tn-surface)", borderColor: "var(--tn-border)" }}>
                                        {item.sub.map(sub => (
                                            <CrossSiteLink key={sub.name} href={sub.href}
                                                className="block px-5 py-2 text-sm transition-colors hover:opacity-70"
                                                style={{ color: "var(--tn-text-sub)" }}>
                                                {sub.name}
                                            </CrossSiteLink>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <CrossSiteLink key={item.name} href={item.href}
                                className="text-sm tracking-wide transition-colors hover:opacity-80"
                                style={{ color: isActive(item.href) ? "var(--tn-text)" : "var(--tn-text-muted)" }}>
                                {item.name}
                            </CrossSiteLink>
                        )
                    ))}
                </div>

                {/* Right side — 유틸리티바가 데스크톱·모바일을 같이 그린다 (§1.9.2) */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <UniverseUtilityBar
                        breakpoint="md"
                        aboutPath="/about"
                        hideAbout={true}
                        profilePath="/my"
                        accentColor={isDark ? '#fff' : '#000'}
                        siteId="tenone"
                        siteName="Ten:One"
                    />
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2.5 transition-colors" style={{ color: "var(--tn-text)" }} aria-label="메뉴 열기">
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

        </header>

        <UniverseMobileMenu
            accentColor={isDark ? '#fff' : '#000'}
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            brandName="Ten:One"
            bgStyle={{ background: "var(--tn-bg)" }}
            textTone={isDark ? "light" : "dark"}
        >
            {publicNav.map(item => (
                <div key={item.name}>
                    <CrossSiteLink href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-lg px-4 py-2.5 text-base font-medium transition-colors hover:opacity-70"
                        style={{ color: isActive(item.href) ? "var(--tn-text)" : "var(--tn-text-sub)" }}>
                        {item.name}
                    </CrossSiteLink>
                    {'sub' in item && item.sub && (
                        <div className="ml-4 mt-1 space-y-1">
                            {item.sub.map(sub => (
                                <CrossSiteLink key={sub.name} href={sub.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-1.5 text-sm transition-colors hover:opacity-70"
                                    style={{ color: "var(--tn-text-muted)" }}>
                                    {sub.name}
                                </CrossSiteLink>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
