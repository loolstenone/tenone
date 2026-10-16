import type { Metadata } from 'next';
import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { MZ_DISPLAY, MZ_KICKER, MZ_RULE, MZ_SERIF, formatMzDate } from '@/features/madleague/MadzineUI';
import { CONTEST_CATEGORIES, getContestPosts } from '@/lib/supabase/madleague-contest';

export const revalidate = 600;

export const metadata: Metadata = {
    title: '공모전/프로젝트',
    description: '마케팅·광고 공모전과 대학생 프로젝트 소식',
};

/** MADzine 하위 — 공모전/프로젝트 (옛 madleague.net/pinboard 이전, 공통 게시판 board 'contest') */
export default async function ContestListPage({ searchParams }: { searchParams: Promise<{ category?: string; idx?: string }> }) {
    const { category, idx } = await searchParams;
    // 옛 아임웹 주소 ?idx=N&bmode=view → 이전 글 slug mp-N
    if (idx && /^\d+$/.test(idx)) permanentRedirect(`/madleague/madzine/contest/mp-${idx}`);
    const active = category && (CONTEST_CATEGORIES as readonly string[]).includes(category) ? category : undefined;
    const posts = await getContestPosts({ category: active });

    return (
        <div className="bg-black text-white min-h-screen">
            <header className="mx-auto max-w-7xl px-6">
                <div className={`flex items-center justify-between border-b ${MZ_RULE} py-4 ${MZ_KICKER} text-neutral-500`}>
                    <Link href="/madleague/madzine" className="hover:text-white transition">MADzine</Link>
                    <span>{posts.length} Posts</span>
                </div>
                <div className="py-14 sm:py-20 text-center">
                    <h1 className={`text-5xl sm:text-7xl font-black tracking-tight ${MZ_SERIF}`}>공모전/프로젝트</h1>
                    <p className={`mt-6 text-lg text-neutral-400 ${MZ_SERIF}`}>마케팅·광고 공모전과 대학생 프로젝트 소식</p>
                </div>
            </header>

            <nav className={`border-y ${MZ_RULE}`}>
                <div className="mx-auto max-w-7xl px-6 py-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
                    {[{ label: '전체', value: undefined }, ...CONTEST_CATEGORIES.map(c => ({ label: c, value: c }))].map(c => {
                        const on = active === c.value;
                        return (
                            <Link key={c.label} href={c.value ? `/madleague/madzine/contest?category=${encodeURIComponent(c.value)}` : '/madleague/madzine/contest'}
                                className={`${MZ_KICKER} pb-1 border-b transition ${on ? 'text-white border-[#EC1D25]' : 'text-neutral-500 border-transparent hover:text-white'}`}>
                                {c.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <section className="mx-auto max-w-7xl px-6 pt-10 pb-24">
                {posts.length === 0 ? (
                    <p className="py-32 text-center text-neutral-500">올라온 소식이 없습니다.</p>
                ) : (
                    <ol className={`border-t ${MZ_RULE}`}>
                        {posts.map((p, i) => (
                            <li key={p.id} className={`border-b ${MZ_RULE}`}>
                                <Link href={`/madleague/madzine/contest/${p.slug}`} className="group flex items-center gap-4 sm:gap-6 py-5">
                                    <span className={`w-9 sm:w-12 shrink-0 text-2xl italic text-neutral-600 group-hover:text-[#EC1D25] transition ${MZ_DISPLAY}`}>
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span className="w-20 sm:w-28 aspect-[4/3] shrink-0 overflow-hidden bg-neutral-900">
                                        {p.image && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                                        )}
                                    </span>
                                    <span className={`hidden sm:block w-20 shrink-0 ${MZ_KICKER} text-[#EC1D25]`}>{p.category}</span>
                                    <span className={`flex-1 min-w-0 text-lg leading-snug text-white group-hover:text-[#EC1D25] transition ${MZ_SERIF}`}>
                                        <span className={`sm:hidden block mb-1 ${MZ_KICKER} text-[#EC1D25]`}>{p.category}</span>
                                        {p.title}
                                    </span>
                                    <span className="hidden md:block w-28 shrink-0 text-xs text-neutral-500 truncate">{p.authorName}</span>
                                    <span className="hidden sm:block w-28 shrink-0 text-right text-[11px] tracking-[0.2em] text-neutral-500">
                                        {p.publishedAt ? formatMzDate(p.publishedAt) : ''}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                )}
            </section>
        </div>
    );
}
