'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAD_PROGRAMS } from '@/features/madleague/programs-list';

// 프로그램 하위 탭 줄 — programs/* 레이아웃이 쓴다. 이름·순서 = programs-list.ts (SSOT)
// 경쟁 PT는 헤더 단독 메뉴라 탭에서 빼고, 그 페이지에는 탭 줄도 띄우지 않는다 (2026-10-07 결정, 중복 표시 방지)
const TABS = MAD_PROGRAMS.filter((p) => p.key !== 'competition');

export function ProgramsSubNav() {
  const pathname = usePathname();
  if (pathname?.startsWith('/madleague/programs/competition')) return null;
  return (
    <div className="sticky top-16 z-40 bg-neutral-950 border-b border-neutral-800">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {TABS.map((p) => {
            const active = pathname.startsWith(p.href);
            return (
              <Link
                key={p.href}
                href={p.href}
                className={`shrink-0 px-5 py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
                  active
                    ? 'border-[#EC1D25] text-white'
                    : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-600'
                }`}
              >
                {p.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
