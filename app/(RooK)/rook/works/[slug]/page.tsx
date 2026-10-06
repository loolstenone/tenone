import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getRookPost, getRookPosts } from "@/lib/supabase/rook";
import { RooKPostBody } from "@/features/rook/RooKPostBody";
import { ROOK_GREEN, RooKWorkCard, formatRookDate } from "@/features/rook/RooKUI";

export const revalidate = 600;

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getRookPost("works", slug);
    if (!post) return { title: "Works" };
    return {
        title: post.title,
        description: post.summary ?? undefined,
        openGraph: { title: post.title, description: post.summary ?? undefined, images: post.image ? [post.image] : [] },
    };
}

export default async function RooKWorkDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getRookPost("works", slug);
    if (!post) notFound();
    const more = (await getRookPosts("works", { category: post.category ?? undefined, limit: 7 }))
        .filter(p => p.id !== post.id).slice(0, 6);

    return (
        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
            <Link href="/rook/works" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black">
                <ChevronLeft className="h-4 w-4" /> Works
            </Link>
            <header className="mt-6 border-b border-neutral-200 pb-6">
                {post.category && (
                    <Link href={`/rook/works?category=${encodeURIComponent(post.category)}`}
                        className="text-sm font-semibold tracking-wide" style={{ color: ROOK_GREEN }}>{post.category}</Link>
                )}
                <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight break-keep">{post.title}</h1>
                <p className="mt-3 text-sm text-neutral-500">{formatRookDate(post.publishedAt)}</p>
            </header>
            <div className="mt-8">
                <RooKPostBody content={post.body} />
            </div>

            {more.length > 0 && (
                <section className="mt-20 border-t border-neutral-200 pt-10">
                    <h2 className="mb-6 text-xl font-bold">More {post.category ?? "Works"}</h2>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                        {more.map(w => <RooKWorkCard key={w.id} post={w} />)}
                    </div>
                </section>
            )}
        </article>
    );
}
