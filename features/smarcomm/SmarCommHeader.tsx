'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UniverseUtilityBar } from '@/components/UniverseUtilityBar';
import { UniverseMobileMenu } from '@/components/UniverseMobileMenu';
import { loginHref } from '@/lib/login-href';

export default function SmarCommHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href={currentPath.startsWith('/smarcomm') ? '/smarcomm' : '/'} className="flex items-center text-xl tracking-[-0.03em]">
          <span className="font-light text-text">Smar</span>
          <span className="font-semibold text-text">Comm</span>
          <span className="font-semibold text-text">.</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#process" className="text-[13px] font-medium text-text-sub transition-colors hover:text-text">서비스</Link>
          <Link href="/blog" className="text-[13px] font-medium text-text-sub transition-colors hover:text-text">블로그</Link>
          <Link href="/pricing" className="text-[13px] font-medium text-text-sub transition-colors hover:text-text">요금제</Link>
          <UniverseUtilityBar
            aboutPath="/about"
            profilePath="/smarcomm/dashboard/profile"
            workspacePath="/smarcomm/dashboard"
            workspaceLabel="워크스페이스"
            signupPath="/signup"
            accentColor="#171717"
            siteId="smarcomm"
            siteName="SmarComm"
          />
        </nav>

        <button onClick={() => setMenuOpen(!menuOpen)} className="text-text-sub md:hidden">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

    </header>

    <UniverseMobileMenu
      open={menuOpen}
      onClose={() => setMenuOpen(false)}
      brandName="SmarComm"
      bgClass="bg-white"
      textTone="dark"
      footer={
        isAuthenticated ? (
          <Link href="/smarcomm/dashboard/profile" onClick={() => setMenuOpen(false)} className="block text-sm text-neutral-600 hover:text-neutral-900">마이페이지</Link>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href={loginHref(currentPath)} onClick={() => setMenuOpen(false)} className="text-sm text-neutral-600 hover:text-neutral-900">로그인</Link>
            <Link href="/signup" onClick={() => setMenuOpen(false)} className="rounded-full bg-neutral-900 px-4 py-2.5 text-center text-sm font-semibold text-white">무료 가입</Link>
          </div>
        )
      }
    >
      <Link href="/#process" onClick={() => setMenuOpen(false)} className="block rounded-lg px-4 py-2.5 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">서비스</Link>
      <Link href="/blog" onClick={() => setMenuOpen(false)} className="block rounded-lg px-4 py-2.5 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">블로그</Link>
      <Link href="/pricing" onClick={() => setMenuOpen(false)} className="block rounded-lg px-4 py-2.5 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">요금제</Link>
      <Link href={isAuthenticated ? '/smarcomm/dashboard' : '/'} onClick={() => setMenuOpen(false)} className="block rounded-lg px-4 py-2.5 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">워크스페이스</Link>
    </UniverseMobileMenu>
    </>
  );
}
