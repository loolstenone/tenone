'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { UniverseUtilityBar } from '@/components/UniverseUtilityBar';

const primaryNav = [
    { name: '솔루션', href: '/wio/solutions' },
    { name: '프레임워크', href: '/wio/framework' },
];

const moreNav = [
    { name: '도입', href: '/wio/setup' },
    { name: '평가', href: '/wio/evaluation' },
    { name: 'CRM', href: '/wio/crm' },
    { name: '마케팅', href: '/wio/marketing' },
    { name: '데이터', href: '/wio/data' },
];

const tailNav = [
    { name: '가격', href: '/wio/pricing' },
    { name: '소개', href: '/wio/about' },
    { name: '상담', href: '/wio/contact' },
];

const allNav = [...primaryNav, ...moreNav, ...tailNav];

export function WIOMarketingHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const pathname = usePathname();
    const moreRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
                setMoreOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const isMoreActive = moreNav.some(item => pathname === item.href);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F23]/80 backdrop-blur-xl border-b border-white/5">
            <nav className="mx-auto max-w-6xl px-6 flex h-14 items-center justify-between">
                <Link href="/wio" className="text-xl font-black tracking-tight">
                    <span className="text-indigo-400">W</span>IO
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-5">
                    {primaryNav.map(item => (
                        <Link key={item.href} href={item.href}
                            className={`text-sm transition-colors ${pathname === item.href ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}>
                            {item.name}
                        </Link>
                    ))}

                    {/* More dropdown */}
                    <div className="relative" ref={moreRef}>
                        <button
                            onClick={() => setMoreOpen(!moreOpen)}
                            className={`flex items-center gap-1 text-sm transition-colors ${isMoreActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                        >
                            더보기 <ChevronDown size={12} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {moreOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 rounded-lg bg-[#1A1A35] border border-white/10 shadow-xl shadow-black/40 py-1 z-50">
                                {moreNav.map(item => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMoreOpen(false)}
                                        className={`block px-4 py-2 text-sm transition-colors ${pathname === item.href ? 'text-white bg-white/5 font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {tailNav.map(item => (
                        <Link key={item.href} href={item.href}
                            className={`text-sm transition-colors ${pathname === item.href ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}>
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/wio/app" className="hidden md:inline-flex items-center gap-1 px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg font-semibold hover:bg-indigo-500 transition-colors">
                        Orbi 시작하기
                    </Link>
                    <div className="hidden md:block">
                        <UniverseUtilityBar config={{ aboutPath: '/wio/about', profilePath: '/wio/app', workspacePath: null, workspaceLabel: 'APP', signupPath: '/signup', accentColor: '#6366f1', loginPath: '/wio/login' }} />
                    </div>
                    {/* Mobile hamburger */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1 text-slate-400">
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-[#0F0F23] border-t border-white/5 px-6 py-4 space-y-1">
                    {allNav.map(item => (
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
