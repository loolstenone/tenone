'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { MAD_PROGRAMS } from '@/features/madleague/programs-list';
import { siteHeaderNav } from '@/lib/brand-site-menus';

/**
 * 섹션 하위 탭 줄 — 헤더 바로 아래 고정. 브랜드 레이아웃이 한 번 렌더하고 경로로 어느 섹션인지 판단한다 (2026-10-11 통일)
 *   프로그램: programs/* (이름·순서 = programs-list.ts). 경쟁 PT는 헤더 단독 메뉴라 탭에서 빼고 그 페이지엔 탭 줄 없음 (2026-10-07)
 *   매드리거: 매드리거 홈·동아리·공동 모집·매드리거 등록·인증서 발급 (순서 = 헤더 레지스트리 매드리거 상위+하위 — SectionPager와 같은 원천)
 * 모바일·PC 같은 모양 — 섹션마다 생김새가 다르면 사용자가 "지금 어디 안에 있는지"를 잃는다
 * 탭이 화면보다 길면: 활성 탭을 보이는 곳으로 자동 스크롤 + 양끝 페이드·화살표로 "더 있음"을 표시 (2026-10-11 — 스크롤만 되고 표시가 없어 뒤 메뉴를 못 찾던 문제)
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
  return section ? <TabStrip key={section.tabs[0]?.href} tabs={section.tabs} active={section.active} /> : null;
}

function TabStrip({ tabs, active }: { tabs: Tab[]; active: string | null }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdge({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  // 활성 탭을 보이는 곳으로 (페이지 이동마다) + 가장자리 상태 갱신
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const a = el.querySelector<HTMLElement>('[data-active="true"]');
    if (a) {
      const target = a.offsetLeft - (el.clientWidth - a.offsetWidth) / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: 'auto' });
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, measure]);

  const nudge = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * Math.round((scroller.current.clientWidth || 300) * 0.7), behavior: 'smooth' });

  return (
    <div className="sticky top-16 z-40 bg-neutral-950 border-b border-neutral-800">
      <div className="relative mx-auto max-w-7xl px-6">
        {/* 양끝 페이드 + 화살표 — 넘치는 쪽에만 */}
        {edge.left && (
          <button type="button" aria-label="이전 메뉴 보기" onClick={() => nudge(-1)}
            className="absolute left-0 top-0 z-10 flex h-full w-14 items-center justify-start pl-1 bg-neutral-950 text-neutral-400 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {edge.right && (
          <button type="button" aria-label="다음 메뉴 보기" onClick={() => nudge(1)}
            className="absolute right-0 top-0 z-10 flex h-full w-14 items-center justify-end pr-1 bg-neutral-950 text-neutral-400 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <div ref={scroller} onScroll={measure} className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {tabs.map((t) => {
            const isActive = t.href === active;
            return (
              <Link
                key={t.href}
                href={t.href}
                data-active={isActive}
                className={`shrink-0 px-5 py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
                  isActive
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
