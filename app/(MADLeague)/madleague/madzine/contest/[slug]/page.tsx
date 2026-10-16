import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { MadzineArticleBody } from '@/features/madleague/MadzineArticleBody';
import { MZ_KICKER, MZ_RULE, MZ_SERIF, formatMzDate } from '@/features/madleague/MadzineUI';
import { getContestPost } from '@/lib/supabase/madleague-contest';

export const revalidate = 600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = await getContestPost((await params).slug);
    if (!post) return { title: '글을 찾을 수 없습니다' };
    return {
        title: post.title,
        description: post.summary ?? undefined,
        openGraph: { title: post.title, description: post.summary ?? undefined, ...(post.image ? { images: [post.image] } : {}) },
    };
}

/** 공모전/프로젝트 글 — 본문은 이전한 HTML (MadzineArticleBody가 정화·YouTube만 허용) */
export default async function ContestPostPage({ params }: Props) {
    const slug = (await params).slug;
    const post = await getContestPost(slug);
    // 옛 아임웹 글 중 옮기지 않은 글(채용 공고 등) → 목록
    if (!post) { if (slug.startsWith('mp-')) permanentRedirect('/madleague/madzine/contest'); notFound(); }

    return (
        <article className="bg-black text-white min-h-screen">
            <div className={`border-b ${MZ_RULE}`}>
                <div className={`mx-auto max-w-7xl px-6 py-4 ${MZ_KICKER} text-neutral-500`}>
                    <Link href="/madleague/madzine/contest" className="inline-flex items-center gap-1 hover:text-white transition">
                        <ChevronLeft className="h-3.5 w-3.5" /> 공모전/프로젝트
                    </Link>
                </div>
            </div>
            <header className="mx-auto max-w-3xl px-6 pt-16 sm:pt-24 pb-10 text-center">
                <Link href={`/madleague/madzine/contest?category=${encodeURIComponent(post.category ?? '')}`} className={`${MZ_KICKER} text-[#EC1D25]`}>{post.category}</Link>
                <h1 className={`mt-6 text-3xl sm:text-5xl font-black leading-[1.2] tracking-tight ${MZ_SERIF}`}>{post.title}</h1>
                <div className={`mt-10 mx-auto max-w-xl flex items-center justify-center gap-4 border-y ${MZ_RULE} py-4 text-[11px] tracking-[0.2em] text-neutral-500`}>
                    {post.authorName && <span>{post.authorName}</span>}
                    {post.authorName && post.publishedAt && <span className="text-neutral-700">·</span>}
                    {post.publishedAt && <span>{formatMzDate(post.publishedAt)}</span>}
                </div>
            </header>
            <div className="mx-auto max-w-2xl px-6 pb-24">
                {(post.deadline || post.link) && (
                    <dl className={`mb-12 grid gap-3 border-b ${MZ_RULE} pb-8 text-sm`}>
                        {post.deadline && (
                            <div className="flex gap-6"><dt className="w-20 shrink-0 text-neutral-500">접수 마감</dt><dd className="text-white">{post.deadline.replace(/-/g, '.')}</dd></div>
                        )}
                        {post.link && (
                            <div className="flex gap-6"><dt className="w-20 shrink-0 text-neutral-500">자세히</dt>
                                <dd className="min-w-0"><a href={post.link} target="_blank" rel="noopener noreferrer nofollow" className="text-white underline underline-offset-4 break-all hover:text-[#EC1D25]">{post.link}</a></dd>
                            </div>
                        )}
                    </dl>
                )}
                <MadzineArticleBody content={post.body} />
                <div className={`mt-16 pt-8 border-t ${MZ_RULE}`}>
                    <Link href="/madleague/madzine/contest" className="text-sm text-neutral-400 hover:text-white underline underline-offset-4">목록으로</Link>
                </div>
            </div>
        </article>
    );
}
