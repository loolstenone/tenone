import type { Metadata } from "next";
import { getRookPosts, ROOK_CATEGORIES } from "@/lib/supabase/rook";
import { RooKArtistCard, RooKCategoryTabs, RooKSectionTitle } from "@/features/rook/RooKUI";

export const revalidate = 600;

export const metadata: Metadata = {
    title: "AI Artist",
    description: "루크 소속 인공지능 모델 — 브랜드와 콘텐츠에 최적화된 AI 아티스트",
};

export default async function RooKArtistPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const { category } = await searchParams;
    const active = category && ROOK_CATEGORIES.artist.includes(category) ? category : undefined;
    const artists = await getRookPosts("artist", { category: active });

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
            <RooKSectionTitle
                title="AI Artist"
                desc="루크 소속 인공지능 모델들입니다."
                sub="브랜드와 콘텐츠에 최적화되어 있는 인공지능 모델. 당신의 브랜드와 콘텐츠를 위해서라면 최선을 다합니다."
            />
            <RooKCategoryTabs basePath="/rook/artist" categories={ROOK_CATEGORIES.artist} active={active} />
            {artists.length === 0 ? (
                <p className="py-24 text-center text-neutral-500">등록된 아티스트가 없습니다.</p>
            ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                    {artists.map(a => <RooKArtistCard key={a.id} post={a} />)}
                </div>
            )}
        </div>
    );
}
