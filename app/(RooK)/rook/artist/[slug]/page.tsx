import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getRookPost, getRookPosts } from "@/lib/supabase/rook";
import { RooKPostBody } from "@/features/rook/RooKPostBody";
import { ROOK_GREEN, RooKArtistCard } from "@/features/rook/RooKUI";

export const revalidate = 600;

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getRookPost("artist", slug);
    if (!post) return { title: "AI Artist" };
    return {
        title: post.title,
        description: post.summary ?? undefined,
        openGraph: { title: post.title, description: post.summary ?? undefined, images: post.image ? [post.image] : [] },
    };
}

export default async function RooKArtistDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getRookPost("artist", slug);
    if (!post) notFound();
    const more = (await getRookPosts("artist", { category: post.category ?? undefined, limit: 6 }))
        .filter(p => p.id !== post.id).slice(0, 5);

    return (
        <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
            <Link href="/rook/artist" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black">
                <ChevronLeft className="h-4 w-4" /> AI Artist
            </Link>
            <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <div className="aspect-[3/4] overflow-hidden bg-neutral-100 md:sticky md:top-24 md:self-start">
                    {post.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                    )}
                </div>
                <div>
                    {post.category && (
                        <Link href={`/rook/artist?category=${encodeURIComponent(post.category)}`}
                            className="text-sm font-semibold tracking-wide" style={{ color: ROOK_GREEN }}>{post.category}</Link>
                    )}
                    <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight break-keep">{post.title}</h1>
                    <div className="mt-8">
                        <RooKPostBody content={post.body} />
                    </div>
                    <Link href="/rook/about#contact" className="mt-10 inline-flex bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors">
                        이 모델로 작업 문의하기
                    </Link>
                </div>
            </div>

            {more.length > 0 && (
                <section className="mt-20 border-t border-neutral-200 pt-10">
                    <h2 className="mb-6 text-xl font-bold">More {post.category ?? "Artist"}</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                        {more.map(a => <RooKArtistCard key={a.id} post={a} />)}
                    </div>
                </section>
            )}
        </article>
    );
}
