import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { BoardWidget } from "@/components/board";
import { getRookPosts } from "@/lib/supabase/rook";
import {
    ROOK_ASSETS, ROOK_GREEN, ROOK_HERO_VIDEO, ROOK_MODEL_VIDEO,
    RooKArtistCard, RooKBackgroundVideo, RooKSectionTitle, RooKWorkCard,
} from "@/features/rook/RooKUI";

export const revalidate = 600;

/** 대표작 — 홈 상단 "스토리 보기" (원본 사이트와 동일) */
const HERO_WORK_SLUG = "rk-167504890";

export default async function RooKHomePage() {
    const [works, artists] = await Promise.all([
        getRookPosts("works", { limit: 12 }),
        getRookPosts("artist", { limit: 15 }),
    ]);

    return (
        <div className="bg-white text-neutral-900">
            {/* Hero — 배경 영상 */}
            <section className="relative h-[70vh] min-h-[420px] overflow-hidden bg-black">
                <RooKBackgroundVideo videoId={ROOK_HERO_VIDEO} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold tracking-[0.2em]" style={{ color: ROOK_GREEN }}>AI CREATOR</p>
                    <h1 className="mt-3 text-4xl md:text-6xl font-bold text-white tracking-tight break-keep">
                        밈에서 영화까지
                    </h1>
                    <p className="mt-3 max-w-xl text-base md:text-lg text-white/80 break-keep">
                        루크의 창작 영역에는 경계가 없습니다. 하고 싶은 것이라면 무엇이든 도전합니다.
                    </p>
                    <Link
                        href={`/rook/works/${HERO_WORK_SLUG}`}
                        className="mt-6 inline-flex w-fit items-center gap-2 border border-white px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
                    >
                        <Play className="h-4 w-4 fill-current" /> 비열한 저잣거리 스토리 보기
                    </Link>
                </div>
            </section>

            {/* Works */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
                <RooKSectionTitle
                    title="Works"
                    desc="루크가 작업한 제작물입니다."
                    sub="밈에서 영화까지, 루크의 창작 영역에는 경계가 없습니다. 하고 싶은 것이라면 무엇이든 도전합니다."
                />
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {works.map(w => <RooKWorkCard key={w.id} post={w} />)}
                </div>
                <div className="mt-10 text-center">
                    <Link href="/rook/works" className="inline-flex items-center gap-2 border border-black px-6 py-2.5 text-sm font-semibold hover:bg-black hover:text-white transition-colors">
                        전체 작품 보기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* Free board */}
            <section className="border-t border-neutral-200">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <RooKSectionTitle
                        title="Free board"
                        desc="누구나 작성할 수 있는 자랑게시판입니다."
                        sub="성공작도 망작도 괜찮습니다. 공유를 통해 성장하고 웃기도 합니다."
                    />
                    <BoardWidget site="rook" board="freeboard" limit={6} layout="card" columns={3}
                        accentColor={ROOK_GREEN} moreHref="/rook/freeboard" postPathPrefix="/rook/freeboard" />
                    <Link href="/rook/freeboard" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:underline">
                        자유게시판 가기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* AI Artist */}
            <section className="border-t border-neutral-200">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
                    <RooKSectionTitle
                        title="AI Artist"
                        desc="루크 소속 인공지능 모델들입니다."
                        sub="당신의 브랜드와 콘텐츠를 위해서라면 최선을 다합니다."
                    />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                        {artists.map(a => <RooKArtistCard key={a.id} post={a} />)}
                    </div>
                </div>
            </section>

            {/* AI Model 배너 */}
            <section className="relative overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ROOK_ASSETS.modelBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
                <RooKBackgroundVideo videoId={ROOK_MODEL_VIDEO} className="opacity-70" />
                <div className="relative mx-auto max-w-7xl px-4 py-24 text-center text-white sm:px-6 lg:px-8 md:py-32">
                    <p className="text-sm md:text-base text-white/80">브랜드에 최적화된 인공지능 모델</p>
                    <p className="mt-3 text-5xl md:text-7xl font-bold tracking-tight">RooK</p>
                    <p className="mt-1 text-2xl md:text-3xl font-light tracking-[0.3em]">AI Model</p>
                    <Link href="/rook/artist" className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                        style={{ backgroundColor: ROOK_GREEN }}>
                        모델 확인 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* RooKie */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
                <div className="grid items-center gap-10 md:grid-cols-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ROOK_ASSETS.homeRookie} alt="RooKie" loading="lazy" className="w-full" />
                    <div>
                        <p className="text-sm font-semibold tracking-[0.2em]" style={{ color: ROOK_GREEN }}>ROOKIE</p>
                        <p className="mt-4 text-xl md:text-2xl font-semibold leading-relaxed break-keep">
                            인공지능 크리에이터 루크에서<br />
                            함께 연구하고 창작 활동을 할 루키들을<br />
                            수시로 모집하고 있습니다.
                        </p>
                        <p className="mt-3 text-neutral-600">많은 분들의 관심과 도전 부탁드립니다.</p>
                        <Link href="/rook/rookie" className="mt-8 inline-flex items-center gap-2 bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors">
                            RooKie 확인하기 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
