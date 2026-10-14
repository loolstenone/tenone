import { redirect } from "next/navigation";

/** 게시판 위젯 링크(/planners/stories/{id}) → 게시판 상세(?postId=) */
export default async function PlannersStoryRedirect({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/planners/stories?postId=${encodeURIComponent(id)}`);
}
