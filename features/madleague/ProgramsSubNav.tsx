'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 프로그램 하위 메뉴 — programs/* 레이아웃과 /madleague/hero가 같이 쓴다
// 이름·순서 = 헤더 '프로그램' 하위 메뉴와 같게 — 경쟁 PT는 헤더 단독 메뉴라 여기서 뺀다 (2026-10-07 결정, 중복 표시 방지)
const PROGRAMS = [
  { name: '크리에이지',       href: '/madleague/programs/creazy' },
  { name: '댐 파티',          href: '/madleague/programs/dam' },
  { name: '아이디어 무브먼트', href: '/madleague/programs/im' },
  { name: '히어로',           href: '/madleague/hero' },
  { name: 'RooKie',          href: '/madleague/programs/rookie' },
  { name: "Planner's",       href: '/madleague/programs/planners' },
  { name: 'PJT',             href: '/madleague/programs/project' },
  { name: '마케톤',           href: '/madleague/programs/markethon' },
  { name: '인사이트 투어링',   href: '/madleague/programs/insight-touring' },
];

export function ProgramsSubNav() {
  const pathname = usePathname();
  // 경쟁 PT는 헤더 단독 메뉴 — 그 페이지에는 프로그램 탭 줄을 띄우지 않는다
  if (pathname?.startsWith('/madleague/programs/competition')) return null;
  return (
    <div className="sticky top-16 z-40 bg-neutral-950 border-b border-neutral-800">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {PROGRAMS.map((p) => {
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
                {p.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
