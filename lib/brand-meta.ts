/**
 * 브랜드 메타데이터 — 뉴스룸 피드 등에서 브랜드 배지 표시용
 */

export interface BrandMeta {
  name: string;
  color: string;        // 대표 색상 (HEX)
  textColor: string;    // 텍스트 색상 (tailwind class)
  bgColor: string;      // 배경 색상 (tailwind class)
  dotColor: string;     // 도트 색상 (tailwind class)
  url: string;          // 사이트 베이스 URL
  boardPath: string;    // 게시판 경로 (사이트 내)
}

const BRAND_META: Record<string, BrandMeta> = {
  tenone: {
    name: 'TenOne',
    color: '#171717',
    textColor: 'text-neutral-300',
    bgColor: 'bg-neutral-800',
    dotColor: 'bg-neutral-400',
    url: '',
    boardPath: '/newsroom',
  },
  madleague: {
    name: 'MADLeague',
    color: '#6366F1',
    textColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    dotColor: 'bg-indigo-500',
    url: '/madleague',
    boardPath: '/madleague/madzine',
  },
  madleap: {
    name: 'MADLeap',
    color: '#8B5CF6',
    textColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    dotColor: 'bg-violet-500',
    url: '/madleap',
    boardPath: '/madleap/community',
  },
  badak: {
    name: 'Badak',
    color: '#F59E0B',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    dotColor: 'bg-amber-500',
    url: '/badak',
    boardPath: '/badak/community',
  },
  hero: {
    name: 'HeRo',
    color: '#10B981',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    dotColor: 'bg-emerald-500',
    url: '/hero',
    boardPath: '/hero',
  },
  rook: {
    name: 'RooK',
    color: '#EC4899',
    textColor: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    dotColor: 'bg-pink-500',
    url: '/rook',
    boardPath: '/rook/board',
  },
  youinone: {
    name: 'YouInOne',
    color: '#3B82F6',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    dotColor: 'bg-blue-500',
    url: '/youinone',
    boardPath: '/youinone',
  },
  ogamja: {
    name: '0gamja',
    color: '#F97316',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    dotColor: 'bg-orange-500',
    url: '/0gamja',
    boardPath: '/0gamja',
  },
  changeup: {
    name: 'ChangeUp',
    color: '#14B8A6',
    textColor: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    dotColor: 'bg-teal-500',
    url: '/changeup',
    boardPath: '/changeup',
  },
  fwn: {
    name: 'FWN',
    color: '#A855F7',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    dotColor: 'bg-purple-500',
    url: '/fwn',
    boardPath: '/fwn',
  },
};

export function getBrandMeta(siteCode: string): BrandMeta {
  return BRAND_META[siteCode] || {
    name: siteCode,
    color: '#64748B',
    textColor: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    dotColor: 'bg-slate-500',
    url: `/${siteCode}`,
    boardPath: `/${siteCode}`,
  };
}

export function getAllBrands(): { code: string; meta: BrandMeta }[] {
  return Object.entries(BRAND_META).map(([code, meta]) => ({ code, meta }));
}
