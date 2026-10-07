import { permanentRedirect, redirect } from "next/navigation";
import { getRookPost } from "@/lib/supabase/rook";

/**
 * 게시판 위젯 링크(/rook/freeboard/{id}) → 게시판 상세(?postId=)
 * 옛 아임웹 글(rk-{idx}, /freeboard/?idx= 에서 넘어옴)은 slug로 찾아 실제 글 id로 보낸다
 */
export default async function RooKFreeBoardPostRedirect({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (/^rk-\d+$/.test(id)) {
        const post = await getRookPost("freeboard", id);
        permanentRedirect(post ? `/rook/freeboard?postId=${post.id}` : "/rook/freeboard");
    }
    redirect(`/rook/freeboard?postId=${encodeURIComponent(id)}`);
}
