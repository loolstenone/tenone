import { permanentRedirect } from 'next/navigation';

/**
 * 옛 madleague.net/pinboard (아임웹 공모전/프로젝트) → MADzine › 공모전/프로젝트 (DNS 전환 후 외부 링크·검색 유입 보존)
 * ?idx=N&bmode=view → 이전 글 slug mp-N
 */
export default async function LegacyPinboard({ searchParams }: { searchParams: Promise<{ idx?: string }> }) {
    const { idx } = await searchParams;
    permanentRedirect(idx && /^\d+$/.test(idx) ? `/madleague/madzine/contest/mp-${idx}` : '/madleague/madzine/contest');
}
