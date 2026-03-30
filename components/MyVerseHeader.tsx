"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MyVerseHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const scrollToCTA = () => {
        document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
        setMobileOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100">
            <nav className="mx-auto max-w-6xl px-5 flex h-14 items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-neutral-900 font-bold text-lg tracking-tight">Myverse</span>
                    <span className="text-neutral-400 text-xs hidden sm:inline">Personal Blackbox</span>
                </div>
                <button onClick={scrollToCTA}
                    className="hidden sm:inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition">
                    Personal Blackbox 신청
                </button>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-2 text-neutral-500">
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>
            {mobileOpen && (
                <div className="sm:hidden bg-white border-t border-neutral-100 px-5 py-4">
                    <button onClick={scrollToCTA} className="text-sm font-semibold text-indigo-600">Personal Blackbox 신청</button>
                </div>
            )}
        </header>
    );
}
