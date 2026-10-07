import type { RookBoard, RookPost } from "@/lib/supabase/rook";
import { RooKPostBody } from "@/features/rook/RooKPostBody";
import { RooKContainer, rookCategoryColor } from "@/features/rook/RooKUI";
import { RooKStaffPostButton } from "@/features/rook/RooKStaffPostButton";

/** 원본 상세: 950px 한 단 — 카테고리(색) + 제목 20px → 본문. 사이드·추천 영역 없음 */
export function RooKPostDetail({ board, post }: { board: RookBoard; post: RookPost }) {
    return (
        <RooKContainer className="py-12 md:py-16">
            <article className="md:px-[15px]">
                <h1 className="text-[20px] leading-snug break-keep">
                    {post.category && <span className="mr-2" style={{ color: rookCategoryColor(board, post.category) }}>{post.category}</span>}
                    <span className="text-black">{post.title}</span>
                </h1>
                <div className="mt-3 empty:hidden"><RooKStaffPostButton board={board} postId={post.id} /></div>
                <div className="mt-8 text-[16px]">
                    <RooKPostBody content={post.body} />
                </div>
            </article>
        </RooKContainer>
    );
}
