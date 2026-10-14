import type { Metadata } from "next";
import { BoardPage } from "@/components/board";
import { PlannersPageHero, PLANNERS_SECTION } from "@/features/planners/PageHero";

export const metadata: Metadata = {
    title: "이야기",
    description: "플래너'스 AI와 PAD를 써 본 이야기, 나만의 사용법, 기획하며 배운 것.",
};

// 통합 게시판 ums_posts (site planners · board stories) — 회원 글쓰기, 인트라 /intra/ums/planners/stories
// 제목 띠·폭은 사이트 공통 틀(PageHero), 게시판은 목록·상세만
export default function PlannersStoriesPage() {
    return (
        <>
            <PlannersPageHero
                eyebrow="이야기"
                title="쓰는 사람들의 이야기"
                description="플래너'스 AI와 PAD를 써 본 이야기, 나만의 사용법, 기획하며 배운 것을 나눠 주세요. 궁금한 점은 '질문'에 남기면 운영진이 답합니다."
            />
            <div className={PLANNERS_SECTION}>
                <BoardPage
                    site="planners"
                    board="stories"
                    title="이야기"
                    accentColor="#0F766E"
                    showWriteButton={true}
                    containerClassName=""
                    hideTitle
                />
            </div>
        </>
    );
}
