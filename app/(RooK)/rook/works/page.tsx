import type { Metadata } from "next";
import { getRookPosts, ROOK_CATEGORIES } from "@/lib/supabase/rook";
import { RooKCategoryTabs, RooKSectionTitle, RooKWorkCard } from "@/features/rook/RooKUI";

export const revalidate = 600;

export const metadata: Metadata = {
    title: "Works",
    description: "루크가 작업한 제작물 — 밈에서 영화까지, AI로 만든 음악·영상·광고·아트워크",
};

export default async function RooKWorksPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const { category } = await searchParams;
    const active = category && ROOK_CATEGORIES.works.includes(category) ? category : undefined;
    const works = await getRookPosts("works", { category: active });

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
            <RooKSectionTitle
                title="Works"
                desc="루크가 작업한 제작물입니다."
                sub="밈에서 영화까지, 루크의 창작 영역에는 경계가 없습니다. 하고 싶은 것이라면 무엇이든 도전합니다."
            />
            <RooKCategoryTabs basePath="/rook/works" categories={ROOK_CATEGORIES.works} active={active} />
            {works.length === 0 ? (
                <p className="py-24 text-center text-neutral-500">작품이 없습니다.</p>
            ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {works.map(w => <RooKWorkCard key={w.id} post={w} />)}
                </div>
            )}
        </div>
    );
}
