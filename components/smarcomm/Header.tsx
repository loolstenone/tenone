'use client';

import Link from 'next/link';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const currentPath = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const initial = (user?.email || user?.name || '?').charAt(0).toUpperCase();

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
          <Link href="/workspace" className="text-[13px] font-medium text-text-sub transition-colors hover:text-text">워크스페이스</Link>

          {isAuthenticated && user ? (
            <div ref={profileRef} className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:bg-surface">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-text text-xs font-bold text-white">{initial}</div>
                <span className="text-xs text-text-sub max-w-[120px] truncate">{user.email}</span>
                <ChevronDown size={12} className="text-text-muted" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-white py-2 shadow-lg">
                  <div className="border-b border-border px-4 py-2">
                    <div className="text-sm font-medium text-text">{user.email}</div>
                    <div className="text-xs text-text-muted">Free 플랜</div>
                  </div>
                  <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-text-sub hover:bg-surface hover:text-text" onClick={() => setProfileOpen(false)}>워크스페이스</Link>
                  <Link href="/dashboard/profile" className="block px-4 py-2.5 text-sm text-text-sub hover:bg-surface hover:text-text" onClick={() => setProfileOpen(false)}>마이페이지</Link>
                  <div className="border-t border-border mt-1 pt-1">
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text-muted hover:bg-surface hover:text-text">
                      <LogOut size={14} /> 로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href={`/login?redirect=${encodeURIComponent(currentPath)}`} className="text-[13px] font-medium text-text-sub transition-colors hover:text-text">로그인</Link>
              <Link href="/signup" className="rounded-full bg-text px-5 py-2 text-[13px] font-semibold text-white transition-all hover:bg-accent-sub">무료 가입</Link>
            </>
          )}
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
            <Link href="/workspace" className="text-sm text-text-sub" onClick={() => setMenuOpen(false)}>워크스페이스</Link>
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 border-t border-border pt-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-text text-sm font-bold text-white">{initial}</div>
                  <div>
                    <div className="text-sm font-medium text-text">{user.email}</div>
                    <div className="text-xs text-text-muted">Free 플랜</div>
                  </div>
                </div>
                <Link href="/dashboard/profile" className="text-sm text-text-sub" onClick={() => setMenuOpen(false)}>마이페이지</Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-text-muted"><LogOut size={14} /> 로그아웃</button>
              </>
            ) : (
              <>
                <Link href={`/login?redirect=${encodeURIComponent(currentPath)}`} className="text-sm text-text-sub" onClick={() => setMenuOpen(false)}>로그인</Link>
                <Link href="/signup" className="mt-1 rounded-full bg-text px-4 py-2.5 text-center text-sm font-semibold text-white" onClick={() => setMenuOpen(false)}>무료 가입</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
