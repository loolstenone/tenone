'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UniverseUtilityBar } from '@/components/UniverseUtilityBar';

const navItems = [
  { name: '서비스', href: '/brandgravity/services' },
  { name: 'Life Mark', href: '/brandgravity/lifemark' },
  { name: '요금', href: '/brandgravity/pricing' },
];

export default function BrandGravityHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5">
      <nav className="mx-auto max-w-6xl px-6 flex h-14 items-center justify-between">
        {/* Left: Logo */}
        <Link href="/brandgravity" className="flex items-center text-xl tracking-tight">
          <span className="font-light text-white">Brand</span>
          <span className="font-bold text-amber-500">Gravity</span>
        </Link>

        {/* Center: Nav (desktop) */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors ${
                pathname === item.href
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right: CTA + UtilityBar (desktop) */}
        <div className="flex items-center gap-3">
          <Link
            href="/brandgravity/apply"
            className="hidden md:inline-flex items-center px-4 py-1.5 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition-colors"
          >
            신청하기
          </Link>
          <div className="hidden md:block">
            <UniverseUtilityBar
              aboutPath="/brandgravity/about"
              profilePath="/brandgravity/my"
              workspacePath={null}
              signupPath="/signup"
              accentColor="#f59e0b"
              siteId="brandgravity"
              siteName="Brand Gravity"
            />
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1 text-neutral-400">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-white/5 px-6 py-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm py-2 ${
                pathname === item.href ? 'text-white font-semibold' : 'text-neutral-400'
              }`}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href={isAuthenticated ? '/brandgravity/my' : '/login'}
            onClick={() => setMenuOpen(false)}
            className="block text-center mt-3 px-4 py-2.5 bg-amber-500 text-black text-sm rounded-lg font-bold"
          >
            {isAuthenticated ? '마이페이지' : '시작하기'}
          </Link>
        </div>
      )}
    </header>
  );
}
