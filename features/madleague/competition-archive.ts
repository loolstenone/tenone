/**
 * 경쟁 PT 옛 기록 SSOT — 인트라 결과 발표(program_results) 이전 회차 (옛 사이트 madleague.net/pt 명예의 전당)
 *   - 명예의 전당(/madleague/programs/competition)과 동아리 소개 페이지 배지가 같은 데이터를 읽는다
 *   - 배지 이미지는 회차·순위별 원본(동아리 로고가 들어가 있음) — club = mad_clubs.slug
 *   - 새 회차는 여기 추가하지 않는다: 인트라에서 결과 발표 → program_results(context.club_id) → 배지 자동 생성(CompetitionBadge)
 */

export interface ArchiveAward {
  img: string;
  rank: number;
  label: string;
  /** 수상 동아리 mad_clubs.slug */
  club: string;
}

export interface ArchiveRound {
  year: number;
  round: string;
  client: string;
  desc: string;
  logo: string;
  gallery: string[];
  awards: ArchiveAward[];
}

export const COMPETITION_ARCHIVE: ArchiveRound[] = [
  {
    year: 2026,
    round: '1차',
    client: '춤추는 고래',
    desc: '여성용품(생리대, 팬티라이너) 브랜드 마케팅 전략 수립',
    logo: '/logos/madleague/dancingwhale-logo.png',
    gallery: [],
    awards: [
      { img: '/logos/madleague/26-1gold.png',   rank: 1, label: '1위', club: 'madleap' },
      { img: '/logos/madleague/26-1silver.png', rank: 2, label: '2위', club: 'madleap' },
      { img: '/logos/madleague/26-1bronze.png', rank: 3, label: '3위', club: 'madleap' },
    ],
  },
  {
    year: 2025,
    round: '2차',
    client: '리제로스',
    desc: '자연친화 스타트업 리제로스에서 개발한 배달, 포장 음식 냉매제에 대한 시장 진출 전략',
    logo: '/logos/madleague/rezerouslogo.png',
    gallery: [],
    awards: [
      { img: '/logos/madleague/25-1gold.png',   rank: 1, label: '1위', club: 'abc' },
      { img: '/logos/madleague/25-1silver.png', rank: 2, label: '2위', club: 'madleap' },
      { img: '/logos/madleague/25-1bronze.png', rank: 3, label: '3위', club: 'adlle' },
    ],
  },
  {
    year: 2025,
    round: '1차',
    client: '대성학원',
    desc: '대성학원 연간 소셜 캠페인 제안',
    logo: '/logos/madleague/daesunglogo.png',
    gallery: [],
    awards: [
      { img: '/logos/madleague/25gold.png',    rank: 1, label: '1위', club: 'abc' },
      { img: '/logos/madleague/25silver.png',  rank: 2, label: '2위', club: 'adlle' },
      { img: '/logos/madleague/25silver2.png', rank: 3, label: '3위', club: 'madleap' },
      { img: '/logos/madleague/25silver3.png', rank: 4, label: '4위', club: 'pam' },
    ],
  },
  {
    year: 2024,
    round: '',
    client: '지평주조',
    desc: '지평 막걸리 100주년을 기점으로 지역을 벗어나 전국 막걸리가 되기 위한 전략 제안',
    logo: '/logos/madleague/지평로고.png',
    gallery: [],
    awards: [
      { img: '/logos/madleague/24gold.png',   rank: 1, label: '1위', club: 'adlle' },
      { img: '/logos/madleague/24silver.png', rank: 2, label: '2위', club: 'madleap' },
      { img: '/logos/madleague/24bronze.png', rank: 3, label: '3위', club: 'pam' },
    ],
  },
];

/** 동아리 배지 1개 — 옛 기록은 원본 이미지, 새 회차는 img 없음(CompetitionBadge가 그린다) */
export interface ClubBadge {
  key: string;
  year: number;
  title: string;
  rank: number | null;
  label: string;
  img?: string;
}

/** 이 동아리의 옛 기록 배지 (최근순) */
export function archiveBadgesForClub(slug: string): ClubBadge[] {
  return COMPETITION_ARCHIVE.flatMap(r => r.awards
    .filter(a => a.club === slug)
    .map(a => ({
      key: a.img,
      year: r.year,
      title: `${r.year} ${r.client} 경쟁 PT${r.round ? ` (${r.round})` : ''}`,
      rank: a.rank,
      label: a.label,
      img: a.img,
    })));
}

/**
 * 인증서 대장(program_certificates.snapshot.group_name) 표기 → mad_clubs.slug
 * 대장은 사람이 적은 동아리명이라 표기가 섞여 있다 (ABC마케팅·매드립·부산애드마니아 등)
 */
const LEDGER_GROUP_ALIASES: Record<string, string> = {
  'abc': 'abc', 'abc마케팅': 'abc',
  'adlle': 'adlle',
  'madleap': 'madleap', '매드립': 'madleap',
  'pam': 'pam', '부산애드마니아': 'pam',
  'suzak': 'suzak', '수작': 'suzak',
  'p:ad': 'pad', 'pad': 'pad',
  'ad zone': 'adzone', 'adzone': 'adzone',
};

export function ledgerGroupToClubSlug(groupName: string | null | undefined): string | null {
  if (!groupName) return null;
  return LEDGER_GROUP_ALIASES[groupName.trim().toLowerCase()] ?? null;
}
