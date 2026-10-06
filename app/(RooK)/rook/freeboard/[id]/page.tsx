import { redirect } from "next/navigation";

/** 게시판 위젯 링크(/rook/freeboard/{id}) → 게시판 상세(?postId=) */
export default async function RooKFreeBoardPostRedirect({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/rook/freeboard?postId=${encodeURIComponent(id)}`);
}
