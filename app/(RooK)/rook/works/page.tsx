import type { Metadata } from "next";
import { getRookPosts, ROOK_CATEGORIES } from "@/lib/supabase/rook";
import { RooKCategoryTabs, RooKContainer, RooKListCard, RooKMasonry } from "@/features/rook/RooKUI";

export const revalidate = 600;

export const metadata: Metadata = {
    title: "Works",
    description: "밈에서부터 광고, 영화까지 — 루크의 작업에는 경계가 없습니다.",
};

/** 원본 rook.co.kr/works: 카테고리 탭 → 가운데 문구 → 매스너리(이미지 + 카테고리·제목) */
export default async function RooKWorksPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const { category } = await searchParams;
    const active = category && ROOK_CATEGORIES.works.includes(category) ? category : undefined;
    const works = await getRookPosts("works", { category: active });

    return (
        <RooKContainer className="pt-4 pb-20">
            <RooKCategoryTabs basePath="/rook/works" categories={ROOK_CATEGORIES.works} active={active} />
            <div className="mb-10 text-center">
                <p className="text-[14px]">밈에서부터 광고, 영화까지</p>
                <p className="mt-3 text-[20px] md:text-[24px]">루크의 작업에는 경계가 없습니다.</p>
            </div>
            {works.length === 0 ? (
                <p className="py-24 text-center text-[14px] text-black/60">게시물이 없습니다.</p>
            ) : (
                <RooKMasonry items={works} keyOf={w => w.id} render={w => <RooKListCard board="works" post={w} />} />
            )}
        </RooKContainer>
    );
}
