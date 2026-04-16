'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PROGRAMS = [
  { name: '경쟁 PT',         href: '/madleague/programs/competition' },
  { name: 'PJT',             href: '/madleague/programs/project' },
  { name: '마케톤',           href: '/madleague/programs/markethon' },
  { name: '인사이트 투어링',   href: '/madleague/programs/insight-touring' },
  { name: '아이디어 무브먼트', href: '/madleague/programs/im' },
  { name: 'DAM 파티',         href: '/madleague/programs/dam' },
];

function ProgramsSubNav() {
  const pathname = usePathname();
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

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProgramsSubNav />
      {children}
    </>
  );
}
