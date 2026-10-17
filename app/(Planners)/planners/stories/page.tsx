import type { Metadata } from "next";
import Link from "next/link";
import { BoardPage } from "@/components/board";
import { PlannersPageHero, PLANNERS_SECTION } from "@/features/planners/PageHero";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
    title: "이야기",
    description: "플래너'스 AI와 PAD를 써 본 이야기, 나만의 사용법, 기획하며 배운 것.",
};

// 통합 게시판 ums_posts (site planners · board stories) - 회원 글쓰기, 인트라 /intra/ums/planners/stories
// 제목 띠·폭은 사이트 공통 틀(PageHero), 게시판은 목록·상세만
// PAD의 P.I 페이지 11장이 이 주소로 온다 (2026-10-18 핸드오프) → '쓰는 법' 글을 맨 위에 먼저 (글이 있을 때만)
export const revalidate = 600;

const HOW_TO = "쓰는 법";

async function howToPosts() {
    const db = createAdminClient();
    const { data: site } = await db.from("ums_sites").select("id").eq("slug", "planners").maybeSingle();
    if (!site) return [];
    const { data: board } = await db.from("ums_boards").select("id").eq("site_id", site.id).eq("slug", "stories").maybeSingle();
    if (!board) return [];
    const { data } = await db.from("ums_posts")
        .select("id, title, summary")
        .eq("board_id", board.id).eq("category_id", HOW_TO).eq("status", "published")
        .order("is_pinned", { ascending: false }).order("published_at", { ascending: false })
        .limit(3);
    return (data ?? []) as { id: string; title: string; summary: string | null }[];
}

export default async function PlannersStoriesPage() {
    const howTo = await howToPosts();
    return (
        <>
            <PlannersPageHero
                eyebrow="이야기"
                title="쓰는 사람들의 이야기"
                description="플래너'스 AI와 PAD를 써 본 이야기, 나만의 사용법, 기획하며 배운 것을 나눠 주세요. 궁금한 점은 '질문'에 남기면 운영진이 답합니다."
            />
            {howTo.length > 0 && (
                <section className={`${PLANNERS_SECTION} !pb-0 !pt-0`}>
                    <p className="text-sm font-bold text-[#0F766E]">처음이라면, 쓰는 법부터</p>
                    <div className="mt-6 grid gap-px bg-neutral-200 md:grid-cols-3">
                        {howTo.map((p) => (
                            <Link key={p.id} href={`/planners/stories?postId=${p.id}`} className="bg-neutral-50 p-8 hover:bg-white">
                                <p className="break-keep text-lg font-bold">{p.title}</p>
                                {p.summary && <p className="mt-2 line-clamp-2 break-keep text-sm text-neutral-600">{p.summary}</p>}
                            </Link>
                        ))}
                    </div>
                </section>
            )}
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
