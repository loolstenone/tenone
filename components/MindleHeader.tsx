"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, Share2, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

const navItems = [
    { name: "TRENDS", href: "/mindle/trends" },
    { name: "REPORTS", href: "/mindle/reports" },
    { name: "DATA", href: "/mindle/data" },
    { name: "REFERENCES", href: "/mindle/references" },
    { name: "NEWSLETTER", href: "/mindle/newsletter" },
];

export function MindleHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [shareToast, setShareToast] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const pathname = usePathname();

    const handleLogout = async () => { await logout(); window.location.reload(); };

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        if (navigator.share) {
            try { await navigator.share({ title: "Mindle", url }); } catch {}
        } else {
            await navigator.clipboard.writeText(url);
            setShareToast(true);
            setTimeout(() => setShareToast(false), 2000);
        }
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-neutral-800/50 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-12 items-center">
                {/* Logo */}
                <Link href="/mindle" className="shrink-0 text-xl font-black tracking-tight mr-8">
                    <span className="text-[#F5C518]">M</span><span className="text-white">indle</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-[12px] font-bold tracking-wider transition-colors ${
                                pathname?.startsWith(item.href)
                                    ? "text-[#F5C518]"
                                    : "text-neutral-300 hover:text-white"
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Right side utilities */}
                <div className="hidden md:flex items-center gap-5 ml-auto">
                    <Link href="/mindle/about" className="text-[11px] font-semibold tracking-wider text-neutral-400 hover:text-white transition-colors">
                        ABOUT
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <Link href="/mindle/my" className="text-[11px] font-semibold tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
                                <User className="h-3 w-3" /> {user?.name?.toUpperCase() || "MY"}
                            </Link>
                            <button onClick={handleLogout} className="text-[11px] font-semibold tracking-wider text-neutral-500 hover:text-red-400 transition-colors">
                                LOG OUT
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setLoginOpen(true)} className="text-[11px] font-semibold tracking-wider text-neutral-400 hover:text-white transition-colors">
                            LOG IN
                        </button>
                    )}
                    <button onClick={handleShare} className="text-neutral-400 hover:text-white transition-colors" title="Share">
                        <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setSearchOpen(!searchOpen)} className="text-neutral-400 hover:text-white transition-colors" title="Search">
                        <Search className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Mobile hamburger */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-neutral-400 ml-auto">
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Search bar (expandable) */}
            {searchOpen && (
                <div className="border-b border-neutral-800/50 bg-[#111]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center gap-3">
                            <Search className="h-4 w-4 text-neutral-500 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search trends, reports, keywords..."
                                autoFocus
                                className="flex-1 bg-transparent text-white text-sm placeholder-neutral-600 focus:outline-none"
                            />
                            <button onClick={() => setSearchOpen(false)} className="text-neutral-500 hover:text-white">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-[#0A0A0A] border-t border-neutral-800/50 px-6 py-4 space-y-3">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                            className={`block text-sm font-bold tracking-wider py-2 ${pathname?.startsWith(item.href) ? "text-[#F5C518]" : "text-neutral-400"}`}>
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-3 mt-3 border-t border-neutral-800/50 space-y-2">
                        <Link href="/mindle/about" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-400 py-1">About</Link>
                        <button onClick={() => { setMobileOpen(false); handleShare(); }} className="block text-sm text-neutral-400 py-1">
                            <Share2 className="h-3.5 w-3.5 inline mr-1.5" />Share
                        </button>
                        {isAuthenticated ? (
                            <>
                                <Link href="/mindle/my" onClick={() => setMobileOpen(false)} className="block text-sm text-neutral-400 py-1"><User className="h-3.5 w-3.5 inline mr-1" />My Page</Link>
                                <button onClick={handleLogout} className="text-sm text-neutral-500 py-1"><LogOut className="h-3.5 w-3.5 inline mr-1" />Logout</button>
                            </>
                        ) : (
                            <button onClick={() => { setMobileOpen(false); setLoginOpen(true); }} className="text-sm text-neutral-400 py-1">Login</button>
                        )}
                    </div>
                </div>
            )}
        </header>

        {/* Share toast */}
        {shareToast && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg shadow-lg">
                Link copied!
            </div>
        )}

        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor="#F5C518" />
        </>
    );
}
