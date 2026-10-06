import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRookPost } from "@/lib/supabase/rook";
import { RooKPostDetail } from "@/features/rook/RooKPostDetail";

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

export default async function RooKAIArtistDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getRookPost("artist", slug);
    if (!post) notFound();
    return <RooKPostDetail board="artist" post={post} />;
}
