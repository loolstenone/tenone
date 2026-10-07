import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getRookPosts, ROOK_CATEGORIES } from "@/lib/supabase/rook";
import { RooKCategoryTabs, RooKContainer, RooKListCard, RooKMasonry } from "@/features/rook/RooKUI";
import { RooKStaffPostButton } from "@/features/rook/RooKStaffPostButton";

export const revalidate = 600;

export const metadata: Metadata = {
    title: "Artist",
    description: "브랜드와 콘텐츠에 최적화되어 있는 인공지능 모델 — 루크 소속 AI 아티스트",
};

/** 원본 rook.co.kr/artist: 카테고리 탭 → 가운데 문구 → 매스너리(이미지 + 카테고리·이름) */
export default async function RooKArtistPage({ searchParams }: { searchParams: Promise<{ category?: string; idx?: string }> }) {
    const { category, idx } = await searchParams;
    // 옛 아임웹 주소 www.rook.co.kr/artist/?idx=N&bmode=view → 이전 글 slug rk-N (DNS 전환 후 외부 링크·검색 유입 보존)
    if (idx && /^\d+$/.test(idx)) permanentRedirect(`/rook/artist/rk-${idx}`);
    const active = category && ROOK_CATEGORIES.artist.includes(category) ? category : undefined;
    const artists = await getRookPosts("artist", { category: active });

    return (
        <RooKContainer className="pt-4 pb-20">
            <RooKCategoryTabs basePath="/rook/artist" categories={ROOK_CATEGORIES.artist} active={active} />
            <div className="mb-4 flex justify-end empty:hidden"><RooKStaffPostButton board="artist" /></div>
            <p className="mb-10 text-center text-[20px] md:text-[24px] break-keep">브랜드와 콘텐츠에 최적화되어 있는 인공지능 모델</p>
            {artists.length === 0 ? (
                <p className="py-24 text-center text-[14px] text-black/60">게시물이 없습니다.</p>
            ) : (
                <RooKMasonry items={artists} keyOf={a => a.id} render={a => <RooKListCard board="artist" post={a} />} />
            )}
        </RooKContainer>
    );
}
