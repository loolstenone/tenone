'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { UniverseUtilityBar } from '@/components/UniverseUtilityBar';

const navItems = [
    { name: '솔루션', href: '/wio/solutions' },
    { name: '프레임워크', href: '/wio/framework' },
    { name: '가격', href: '/wio/pricing' },
    { name: '소개', href: '/wio/about' },
    { name: '상담', href: '/wio/contact' },
];

export function WIOMarketingHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F23]/80 backdrop-blur-xl border-b border-white/5">
            <nav className="mx-auto max-w-6xl px-6 flex h-14 items-center justify-between">
                <Link href="/wio" className="text-xl font-black tracking-tight">
                    <span className="text-indigo-400">W</span>IO
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href}
                            className={`text-sm transition-colors ${pathname === item.href ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}>
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:block">
                        <UniverseUtilityBar config={{ aboutPath: '/wio/about', profilePath: '/wio/app', workspacePath: '/wio/app', workspaceLabel: 'APP', signupPath: '/wio/login', accentColor: '#6366f1' }} />
                    </div>
                    {/* Mobile hamburger */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1 text-slate-400">
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-[#0F0F23] border-t border-white/5 px-6 py-4 space-y-3">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                            className={`block text-sm py-2 ${pathname === item.href ? 'text-white font-semibold' : 'text-slate-400'}`}>
                            {item.name}
                        </Link>
                    ))}
                    <Link href="/wio/login" onClick={() => setMobileOpen(false)}
                        className="block text-center mt-3 px-4 py-2.5 bg-indigo-600 text-white text-sm rounded-lg font-semibold">
                        시작하기
                    </Link>
                </div>
            )}
        </header>
    );
}
