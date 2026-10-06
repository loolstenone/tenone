import Link from "next/link";
import { getRookPosts } from "@/lib/supabase/rook";
import {
    ROOK_ASSETS, ROOK_HERO_VIDEO, ROOK_MODEL_VIDEO, ROOK_OUTLINE_BUTTON,
    RooKBackgroundVideo, RooKContainer, RooKMasonry, RooKOverlayCard, RooKSectionTitle,
} from "@/features/rook/RooKUI";

export const revalidate = 600;

/** 원본 홈 구성 그대로: 배경 영상 → 스토리 버튼 → Works 12 → Free board 3 → AI Artist 15 → AI Model → RooKie */
const HERO_WORK_SLUG = "rk-167504890"; // 비열한 저잣거리 - Cohsun Cyber punk

export default async function RooKHomePage() {
    const [works, free, artists] = await Promise.all([
        getRookPosts("works", { limit: 12 }),
        getRookPosts("freeboard", { limit: 3 }),
        getRookPosts("artist", { limit: 15 }),
    ]);

    return (
        <div className="bg-white text-black">
            {/* 배경 영상 */}
            <section className="relative h-[56.25vw] max-h-[892px] min-h-[240px] overflow-hidden bg-black md:h-[calc(100vh-116px)]">
                <RooKBackgroundVideo videoId={ROOK_HERO_VIDEO} />
            </section>
            <div className="py-4 text-center">
                <Link href={`/rook/works/${HERO_WORK_SLUG}`} className={ROOK_OUTLINE_BUTTON}>▶ 비열한 저잣거리 스토리 보기</Link>
            </div>

            {/* Works */}
            <RooKContainer className="pt-16 pb-10">
                <RooKSectionTitle title="Works" desc="루크가 작업한 제작물입니다."
                    sub="밈에서 영화까지, 루크의 창작 영역에는 경계가 없습니다. 하고 싶은 것이라면 무엇이든 도전합니다." />
                <RooKMasonry items={works} keyOf={w => w.id}
                    render={w => <RooKOverlayCard href={`/rook/works/${w.slug}`} image={w.image} title={w.title} />} />
            </RooKContainer>

            {/* Free board */}
            <RooKContainer className="py-10">
                <RooKSectionTitle title="Free board" desc="누구나 작성할 수 있는 자랑게시판입니다."
                    sub="성공작도 망작도 괜찮습니다. 공유를 통해 성장하고 웃기도 합니다." />
                <RooKMasonry items={free} keyOf={p => p.id}
                    render={p => <RooKOverlayCard href={`/rook/freeboard/${p.id}`} image={p.image} title={p.title} />} />
            </RooKContainer>

            {/* AI Artist */}
            <RooKContainer className="py-10">
                <RooKSectionTitle title="AI Artist" desc="루크 소속 인공지능 모델들입니다."
                    sub="당신의 브랜드와 콘텐츠를 위해서라면 최선을 다합니다." />
                <RooKMasonry items={artists} keyOf={a => a.id}
                    render={a => <RooKOverlayCard href={`/rook/artist/${a.slug}`} image={a.image} title={a.title} />} />
            </RooKContainer>

            {/* AI Model — 배경 영상 */}
            <section className="relative mt-10 flex h-[70vh] min-h-[420px] max-h-[900px] items-center justify-center overflow-hidden bg-black text-center text-white">
                <RooKBackgroundVideo videoId={ROOK_MODEL_VIDEO} />
                <div className="relative">
                    <p className="text-[18px] md:text-[24px]">브랜드에 최적화된 인공지능 모델</p>
                    <p className="mt-4 text-[48px] md:text-[72px] font-bold leading-none">RooK</p>
                    <p className="mt-2 text-[28px] md:text-[40px] font-light">AI Model</p>
                    <Link href="/rook/artist" className="mt-8 inline-block border border-white px-8 py-2.5 text-[18px] md:text-[24px] hover:bg-white hover:text-black transition-colors">
                        모델 확인
                    </Link>
                </div>
            </section>

            {/* RooKie */}
            <RooKContainer className="py-20">
                <div className="grid items-center gap-[30px] md:grid-cols-2 md:px-[15px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ROOK_ASSETS.homeRookie} alt="I want You For Rookie" loading="lazy" className="w-full" />
                    <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ROOK_ASSETS.homeRookieLogo} alt="RooKie" loading="lazy" className="w-full max-w-[460px]" />
                        <div className="mt-8 space-y-0 text-[16px] leading-[1.5]">
                            <p>인공지능 크리에이터 루크에서</p>
                            <p>함께 연구하고 창작 활동을 할 루키들을</p>
                            <p>수시로 모집하고 있습니다.</p>
                            <p className="pt-6">많은 분들의 관심과 도전 부탁드립니다.</p>
                        </div>
                        <Link href="/rook/rookie" className={`${ROOK_OUTLINE_BUTTON} mt-10`}>RooKie 확인하기</Link>
                    </div>
                </div>
            </RooKContainer>
        </div>
    );
}
