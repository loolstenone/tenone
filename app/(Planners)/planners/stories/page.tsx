import type { Metadata } from "next";
import { BoardPage } from "@/components/board";

export const metadata: Metadata = {
    title: "이야기",
    description: "플래너·템플릿을 써 본 이야기, 나만의 사용법, 기획하며 배운 것.",
};

// 통합 게시판 ums_posts (site planners · board stories) — 회원 글쓰기, 인트라 /intra/ums/planners/stories
export default function PlannersStoriesPage() {
    return (
        <BoardPage
            site="planners"
            board="stories"
            title="이야기"
            description="플래너·템플릿을 써 본 이야기, 나만의 사용법, 기획하며 배운 것을 나눠 주세요."
            accentColor="#0F766E"
            showWriteButton={true}
        />
    );
}
