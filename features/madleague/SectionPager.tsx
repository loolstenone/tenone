import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { siteHeaderNav } from '@/lib/brand-site-menus';

/**
 * 섹션 하단 좌우 이동 — 프로그램 상세(이전·다음 프로그램)·매드리거 메뉴(이전·다음 메뉴) 공용 (2026-10-11)
 * 모바일도 한 줄(좌 · 가운데 · 우)로 같은 높이에 맞춘다 — 세로로 쌓으면 좌우가 어긋나 보인다
 */
export interface PagerItem { title: string; href: string }

export function SectionPager({ label, prev, next, center }: {
  label: string;                       // aria-label (예: 다른 프로그램)
  prev: PagerItem; next: PagerItem;
  center?: PagerItem;                  // 가운데 링크 (전체 프로그램 · 매드리거 홈). 없으면 빈칸으로 자리 유지
}) {
  return (
    <nav aria-label={label} className="border-t border-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-6 items-center">
        <Link href={prev.href} className="group flex items-center gap-2 sm:gap-4 text-left min-w-0">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-600 group-hover:text-[#EC1D25] transition shrink-0" />
          <span className="min-w-0">
            <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-neutral-500">이전</span>
            <span className="block mt-0.5 sm:mt-1 text-sm sm:text-xl font-bold group-hover:text-[#EC1D25] transition break-keep">{prev.title}</span>
          </span>
        </Link>
        {center
          ? <Link href={center.href} className="text-xs sm:text-sm font-bold text-neutral-400 hover:text-white transition text-center whitespace-nowrap px-1">{center.title}</Link>
          : <span aria-hidden className="w-4" />}
        <Link href={next.href} className="group flex items-center justify-end gap-2 sm:gap-4 text-right min-w-0">
          <span className="min-w-0">
            <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-neutral-500">다음</span>
            <span className="block mt-0.5 sm:mt-1 text-sm sm:text-xl font-bold group-hover:text-[#EC1D25] transition break-keep">{next.title}</span>
          </span>
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-600 group-hover:text-[#EC1D25] transition shrink-0" />
        </Link>
      </div>
    </nav>
  );
}

/** 매드리거 메뉴 순서 = 헤더 레지스트리(상위 매드리거 홈 + 하위 메뉴). 레지스트리를 바꾸면 여기도 따라온다 */
function madleaguerItems(): PagerItem[] {
  const top = siteHeaderNav('madleague').find(i => i.href === '/madleague/madleaguer');
  if (!top) return [];
  return [{ title: '매드리거 홈', href: top.href }, ...(top.dropdown ?? []).map(d => ({ title: d.name, href: d.href }))];
}

/** 매드리거 메뉴 페이지 하단 — 이전·다음 메뉴 (순환) + 가운데 매드리거 홈 */
export function MadleaguerPager({ current }: { current: string }) {
  const items = madleaguerItems();
  const idx = items.findIndex(i => i.href === current);
  if (idx < 0 || items.length < 2) return null;
  const prev = items[(idx - 1 + items.length) % items.length];
  const next = items[(idx + 1) % items.length];
  const home = items[0];
  // 가운데 홈 링크는 좌우와 겹치지 않을 때만 (홈 자체·홈 바로 옆 페이지에서는 숨김)
  const showHome = current !== home.href && prev.href !== home.href && next.href !== home.href;
  return <SectionPager label="매드리거 메뉴" prev={prev} next={next} center={showHome ? home : undefined} />;
}
