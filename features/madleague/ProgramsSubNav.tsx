'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAD_PROGRAMS } from '@/features/madleague/programs-list';
import { siteHeaderNav } from '@/lib/brand-site-menus';

/**
 * 섹션 하위 탭 줄 — 헤더 바로 아래 고정. 브랜드 레이아웃이 한 번 렌더하고 경로로 어느 섹션인지 판단한다 (2026-10-11 통일)
 *   프로그램: programs/* (이름·순서 = programs-list.ts). 경쟁 PT는 헤더 단독 메뉴라 탭에서 빼고 그 페이지엔 탭 줄 없음 (2026-10-07)
 *   매드리거: 매드리거 홈·동아리·공동 모집·매드리거 등록·인증서 발급 (순서 = 헤더 레지스트리 매드리거 상위+하위 — SectionPager와 같은 원천)
 * 모바일·PC 같은 모양 — 섹션마다 생김새가 다르면 사용자가 "지금 어디 안에 있는지"를 잃는다
 */
interface Tab { title: string; href: string }

const PROGRAM_TABS: Tab[] = MAD_PROGRAMS.filter((p) => p.key !== 'competition').map(p => ({ title: p.title, href: p.href }));

function madleaguerTabs(): Tab[] {
  const top = siteHeaderNav('madleague').find(i => i.href === '/madleague/madleaguer');
  if (!top) return [];
  return [{ title: '매드리거 홈', href: top.href }, ...(top.dropdown ?? []).map(d => ({ title: d.name, href: d.href }))];
}
const MADLEAGUER_TABS = madleaguerTabs();

/** 경로 → 탭 집합. 가장 길게 일치하는 탭 하나만 활성 (동아리 /clubs ⊂ 공동 모집 /clubs/recruit) */
function resolve(pathname: string): { tabs: Tab[]; active: string | null } | null {
  if (pathname.startsWith('/madleague/programs')) {
    if (pathname.startsWith('/madleague/programs/competition')) return null;
    return { tabs: PROGRAM_TABS, active: PROGRAM_TABS.filter(t => pathname.startsWith(t.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null };
  }
  // 매드리거 섹션: 탭 주소 자체 + 동아리 하위(/clubs/{slug}, /clubs/{slug}/manage …). 인증서 인쇄·진위 확인은 섹션 밖
  const hit = MADLEAGUER_TABS.filter(t => pathname === t.href || pathname.startsWith(t.href + '/')).sort((a, b) => b.href.length - a.href.length)[0];
  if (hit) return { tabs: MADLEAGUER_TABS, active: hit.href };
  return null;
}

export function ProgramsSubNav() {
  const pathname = usePathname();
  const section = resolve(pathname ?? '');
  if (!section) return null;
  return (
    <div className="sticky top-16 z-40 bg-neutral-950 border-b border-neutral-800">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {section.tabs.map((t) => {
            const active = t.href === section.active;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`shrink-0 px-5 py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
                  active
                    ? 'border-[#EC1D25] text-white'
                    : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-600'
                }`}
              >
                {t.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
