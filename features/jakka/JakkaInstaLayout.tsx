"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Search, Bookmark, Bell, User, MoreHorizontal, Store, LogOut, X, Briefcase } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

const sidebarItems = [
    { icon: Home, label: "홈", href: "/jakka" },
    { icon: Search, label: "작가 탐색", href: "/jakka/explore" },
    { icon: Store, label: "마켓", href: "/jakka/market" },
    { icon: Bookmark, label: "저장한 작가", href: "#" },
    { icon: Briefcase, label: "WANTS", href: "/jakka/wants" },
    { icon: Bell, label: "알림", href: "#" },
    { icon: User, label: "내 포트폴리오", href: "/jakka/profile" },
];

const bottomNavItems = [
    { icon: Home, href: "/jakka" },
    { icon: Search, href: "/jakka/explore" },
    { icon: Store, href: "/jakka/market" },
    { icon: Bookmark, href: "#" },
    { icon: Briefcase, href: "/jakka/wants" },
    { icon: User, href: "/jakka/profile" },
];

const footerBrandLinks = [
    { name: "Ten:One", href: "https://tenone.biz" },
    { name: "MADLeague", href: "/madleague" },
    { name: "Badak", href: "/badak" },
    { name: "RooK", href: "/rook" },
    { name: "Myverse", href: "/myverse" },
];

function AuthSection({ compact = false }: { compact?: boolean }) {
    const { isAuthenticated, user, logout } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginTab, setLoginTab] = useState<"login" | "signup">("login");

    if (isAuthenticated) {
        return (
            <>
                <div className={`flex items-center ${compact ? "gap-2 p-1" : "gap-3 p-3"}`}>
                    <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                        {user?.avatarUrl ? (
                            <Image src={user.avatarUrl} alt={user.name || ""} width={32} height={32} className="object-cover w-full h-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[12px] font-bold text-neutral-600">
                                {user?.name?.charAt(0) ?? "U"}
                            </div>
                        )}
                    </div>
                    {!compact && (
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold truncate">{user?.name}</p>
                            <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
                        </div>
                    )}
                    <button onClick={() => logout()} className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
                <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} defaultTab={loginTab} />
            </>
        );
    }

    return (
        <>
            <div className={`flex ${compact ? "flex-col gap-1 px-2" : "flex-col gap-2 px-3"}`}>
                <button
                    onClick={() => { setLoginTab("login"); setLoginOpen(true); }}
                    className="w-full py-2 text-[12px] font-semibold border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
                >
                    로그인
                </button>
                {!compact && (
                    <button
                        onClick={() => { setLoginTab("signup"); setLoginOpen(true); }}
                        className="w-full py-2 text-[12px] font-semibold border border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                        가입하기
                    </button>
                )}
            </div>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} defaultTab={loginTab} />
        </>
    );
}

function MobileAuthButton() {
    const { isAuthenticated } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);

    if (isAuthenticated) {
        return (
            <Link href="/jakka/profile" className="p-0.5">
                <User className="h-[22px] w-[22px] stroke-[2] text-neutral-900" />
            </Link>
        );
    }

    return (
        <>
            <button
                onClick={() => setLoginOpen(true)}
                className="text-[12px] font-semibold border border-neutral-900 px-3 py-1 hover:bg-neutral-900 hover:text-white transition-colors"
            >
                로그인
            </button>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[150] flex">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative w-[280px] bg-white h-full flex flex-col shadow-xl ml-auto">
                <div className="flex items-center justify-between px-4 h-[52px] border-b border-neutral-100">
                    <span className="text-[11px] font-semibold tracking-[0.3em]">MENU</span>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-900">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="px-4 py-5 border-b border-neutral-100">
                        <AuthSection />
                    </div>

                    <nav className="px-4 py-4 space-y-1 border-b border-neutral-100">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={onClose}
                                className="flex items-center gap-3 py-2.5 text-[14px] text-neutral-700 hover:text-neutral-900"
                            >
                                <item.icon className="h-4 w-4 stroke-[1.5] text-neutral-400" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                </div>

                <div className="px-4 py-4 border-t border-neutral-100">
                    <p className="text-[10px] text-neutral-300 leading-relaxed">
                        © JAKKA. Powered by{" "}
                        <a href="https://tenone.biz" className="hover:text-neutral-500 transition-colors">
                            Ten:One™ Universe
                        </a>.
                    </p>
                </div>

            </div>
        </div>
    );
}

export function JakkaInstaLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            {/* Mobile Top Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 md:hidden">
                <div className="flex items-center justify-between px-4 h-[44px]">
                    <Link href="/jakka" className="text-sm font-semibold tracking-[0.3em] text-neutral-900 border border-neutral-900 px-2.5 py-1">
                        JAKKA
                    </Link>
                    <div className="flex items-center gap-3">
                        <Bell className="h-[22px] w-[22px] stroke-[2] text-neutral-900" />
                        <MobileAuthButton />
                        <button onClick={() => setMenuOpen(true)} className="p-0.5">
                            <MoreHorizontal className="h-[22px] w-[22px] stroke-[2] text-neutral-900" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

            {/* Desktop Left Sidebar */}
            <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-[72px] xl:w-[245px] border-r border-neutral-200 flex-col z-50 bg-white">
                <div className="px-3 xl:px-5 pt-7 pb-5">
                    <Link href="/jakka">
                        <span className="hidden xl:inline-block text-sm font-semibold tracking-[0.3em] text-neutral-900 border border-neutral-900 px-2.5 py-1">
                            JAKKA
                        </span>
                        <span className="xl:hidden inline-block text-[10px] font-semibold tracking-[0.2em] border border-neutral-900 px-1.5 py-0.5">JK</span>
                    </Link>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-neutral-100 ${isActive ? "font-bold" : ""}`}
                            >
                                <item.icon
                                    className={`h-[26px] w-[26px] shrink-0 transition-all ${isActive ? "stroke-[2.2] text-neutral-900" : "stroke-[1.5] text-neutral-600"}`}
                                />
                                <span className={`hidden xl:block text-[15px] ${isActive ? "font-semibold text-neutral-900" : "text-neutral-700"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Login / Profile */}
                <div className="px-0 xl:px-2 pb-3 border-t border-neutral-100 pt-3">
                    <div className="xl:block hidden">
                        <AuthSection />
                    </div>
                    <div className="xl:hidden flex justify-center">
                        <AuthSection compact />
                    </div>
                </div>

                {/* Copyright */}
                <div className="hidden xl:block px-5 pb-5">
                    <p className="text-[10px] text-neutral-300 leading-relaxed">
                        © JAKKA. Powered by{" "}
                        <a href="https://tenone.biz" className="hover:text-neutral-500 transition-colors">
                            Ten:One™ Universe
                        </a>.
                    </p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pt-[44px] pb-[49px] md:pt-0 md:pb-0 md:ml-[72px] xl:ml-[245px]">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 md:hidden">
                <div className="flex items-center justify-around h-[49px]">
                    {bottomNavItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={i} href={item.href} className="flex items-center justify-center p-2">
                                <item.icon
                                    className={`h-[26px] w-[26px] transition-all ${isActive ? "stroke-[2.2] fill-neutral-900" : "stroke-[1.5] text-neutral-600"}`}
                                />
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
