"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Orbit } from "lucide-react";

export function MyVerseHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Logo */}
                <Link href="/myverse" className="shrink-0 flex items-center gap-2">
                    <Orbit className="h-5 w-5 text-indigo-600" />
                    <span className="text-neutral-900 font-bold text-lg tracking-tight">
                        Myverse
                    </span>
                </Link>

                {/* Right side */}
                <div className="hidden sm:flex items-center gap-4">
                    <Link href="/myverse/contact"
                        className="text-sm font-semibold px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition">
                        Early Access
                    </Link>
                </div>

                {/* Mobile */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-2 text-neutral-500">
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {mobileOpen && (
                <div className="sm:hidden bg-white border-t border-neutral-100 px-6 py-4 space-y-3">
                    <Link href="/myverse/contact" onClick={() => setMobileOpen(false)}
                        className="block text-sm font-semibold text-indigo-600">
                        Early Access 신청
                    </Link>
                </div>
            )}
        </header>
    );
}
