'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UniverseUtilityBar } from '@/components/UniverseUtilityBar';

export default function SmarCommHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center text-xl tracking-[-0.03em]">
          <span className="font-light text-text">Smar</span>
          <span className="font-semibold text-text">Comm</span>
          <span className="font-semibold text-text">.</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#process" className="text-[13px] font-medium text-text-sub transition-colors hover:text-text">서비스</Link>
          <Link href="/blog" className="text-[13px] font-medium text-text-sub transition-colors hover:text-text">블로그</Link>
          <Link href="/pricing" className="text-[13px] font-medium text-text-sub transition-colors hover:text-text">요금제</Link>
          <UniverseUtilityBar config={{ aboutPath: '/about', profilePath: '/dashboard/profile', workspacePath: '/dashboard', workspaceLabel: '워크스페이스', signupPath: '/signup', accentColor: '#171717' }} />
        </nav>

        <button onClick={() => setMenuOpen(!menuOpen)} className="text-text-sub md:hidden">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-white px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/#process" className="text-sm text-text-sub" onClick={() => setMenuOpen(false)}>서비스</Link>
            <Link href="/blog" className="text-sm text-text-sub" onClick={() => setMenuOpen(false)}>블로그</Link>
            <Link href="/pricing" className="text-sm text-text-sub" onClick={() => setMenuOpen(false)}>요금제</Link>
            <Link href={isAuthenticated ? '/dashboard' : '/'} className="text-sm text-text-sub" onClick={() => setMenuOpen(false)}>워크스페이스</Link>
            {isAuthenticated ? (
              <Link href="/dashboard/profile" className="text-sm text-text-sub" onClick={() => setMenuOpen(false)}>마이페이지</Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-text-sub" onClick={() => setMenuOpen(false)}>로그인</Link>
                <Link href="/signup" className="mt-1 rounded-full bg-text px-4 py-2.5 text-center text-sm font-semibold text-white" onClick={() => setMenuOpen(false)}>무료 가입</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
