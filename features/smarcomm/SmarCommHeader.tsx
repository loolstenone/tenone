'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { UniverseUtilityBar } from '@/components/UniverseUtilityBar';
import { UniverseMobileMenu } from '@/components/UniverseMobileMenu';

export default function SmarCommHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = usePathname();

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href={currentPath.startsWith('/smarcomm') ? '/smarcomm' : '/'} className="flex items-center text-xl tracking-[-0.03em]">
          <span className="font-light text-text">Smar</span>
          <span className="font-semibold text-text">Comm</span>
          <span className="font-semibold text-text">.</span>
        </Link>

        <nav className="flex items-center gap-6">
          {/* TODO(2026-10-14): 사이트 메뉴 — lib/brand-site-menus.ts 등록 후 메인 메뉴로 */}
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/smarcomm#process" className="text-[13px] font-medium text-text-sub transition-colors hover:text-text">서비스</Link>
            <Link href="/smarcomm/blog" className="text-[13px] font-medium text-text-sub transition-colors hover:text-text">블로그</Link>
            <Link href="/smarcomm/pricing" className="text-[13px] font-medium text-text-sub transition-colors hover:text-text">요금제</Link>
          </div>
          <UniverseUtilityBar
            hideAbout
            breakpoint="md"
            aboutPath="/smarcomm/about"
            profilePath="/smarcomm/dashboard/profile"
            signupPath="/smarcomm/signup"
            accentColor="#171717"
            serviceEntry={{ label: "워크스페이스", href: "/smarcomm/dashboard" }}
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
      accentColor="#171717"
      serviceEntry={{ label: "워크스페이스", href: "/smarcomm/dashboard" }}
    >
      <Link href="/smarcomm#process" onClick={() => setMenuOpen(false)} className="block rounded-lg px-4 py-2.5 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">서비스</Link>
      <Link href="/smarcomm/blog" onClick={() => setMenuOpen(false)} className="block rounded-lg px-4 py-2.5 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">블로그</Link>
      <Link href="/smarcomm/pricing" onClick={() => setMenuOpen(false)} className="block rounded-lg px-4 py-2.5 text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">요금제</Link>
    </UniverseMobileMenu>
    </>
  );
}
