"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BadgeCheck, Loader2 } from "lucide-react";
import { getHeroCreator, getCreatorsPaged, type MontzCreator, type MontzAvailability } from "@/lib/supabase/montz";

const AVAIL_LABEL: Record<MontzAvailability, string> = {
    active: "활동중",
    selective: "조건부",
    inactive: "휴식",
};
const AVAIL_DOT: Record<MontzAvailability, string> = {
    active: "bg-emerald-400",
    selective: "bg-amber-400",
    inactive: "bg-neutral-300",
};
const TYPE_LABEL = { model: "모델", actor: "배우", both: "모델·배우" };

function GridCard({ creator }: { creator: MontzCreator }) {
    return (
        <Link href={`/montz/${creator.handle}`} className="group block">
            <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={creator.avatar_url ?? ""}
                    alt={creator.display_name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 px-1.5 py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${AVAIL_DOT[creator.availability_status]}`} />
                    <span className="text-[10px] font-bold text-neutral-900">{AVAIL_LABEL[creator.availability_status]}</span>
                </div>
                <div className="absolute top-2 right-2 bg-neutral-900/80 px-1.5 py-0.5">
                    <span className="text-[10px] font-bold text-white">{TYPE_LABEL[creator.type]}</span>
                </div>
                {creator.is_verified && (
                    <div className="absolute bottom-2 left-2">
                        <BadgeCheck className="h-4 w-4 drop-shadow" style={{ color: "#c8a97e" }} />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="pt-2">
                <p className="text-[13px] font-black text-neutral-900 leading-none mb-1">{creator.display_name}</p>
                <p className="text-[10px] font-mono text-neutral-700 mb-1">@{creator.handle}</p>
                {creator.height && (
                    <p className="text-[10px] font-bold text-neutral-900">
                        {creator.height}cm
                        {creator.bust && ` · ${creator.bust}-${creator.waist}-${creator.hip}`}
                    </p>
                )}
            </div>
        </Link>
    );
}

const GRID_PAGE_SIZE = 12;

export default function MontzHome() {
    const [heroCreator, setHeroCreator] = useState<MontzCreator | null>(null);
    const [grid, setGrid] = useState<MontzCreator[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingInit, setLoadingInit] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        Promise.all([
            getHeroCreator(),
            getCreatorsPaged(0, GRID_PAGE_SIZE),
        ]).then(([hero, { creators, hasMore: more }]) => {
            setHeroCreator(hero);
            setGrid(creators);
            setHasMore(more);
            setOffset(GRID_PAGE_SIZE);
            setLoadingInit(false);
        });
    }, []);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const { creators, hasMore: more } = await getCreatorsPaged(offset, GRID_PAGE_SIZE);
        setGrid((prev) => {
            const ids = new Set(prev.map((c) => c.id));
            return [...prev, ...creators.filter((c) => !ids.has(c.id))];
        });
        setHasMore(more);
        setOffset((prev) => prev + GRID_PAGE_SIZE);
        setLoadingMore(false);
    }, [offset, hasMore, loadingMore]);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero — 사진 꽉차게 */}
            <section className="relative w-full aspect-[3/4] sm:aspect-[3/2] overflow-hidden bg-neutral-200">
                {heroCreator?.avatar_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={heroCreator.avatar_url}
                        alt={heroCreator.display_name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                )}
                {/* 그라디언트 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* 텍스트 */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-7">
                    <p className="text-[10px] font-mono text-white/70 tracking-[0.2em] uppercase mb-2">MoNTZ</p>
                    <h1 className="text-[28px] font-black tracking-tight leading-none text-white mb-3">
                        모델 · 배우<br />포트폴리오
                    </h1>
                    <p className="text-[13px] text-white/85 leading-relaxed mb-3 max-w-md">
                        캐스팅 디렉터·에이전시는 조건 필터로 모델을 찾고, <br className="hidden sm:block" />
                        프로필 페이지에서 직접 캐스팅을 제안할 수 있습니다.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/montz/explore"
                            className="text-[12px] font-bold text-neutral-900 bg-white px-4 py-2 hover:bg-neutral-100 transition-colors"
                        >
                            크리에이터 탐색
                        </Link>
                        <Link
                            href="/montz/audition"
                            className="text-[12px] font-bold text-neutral-900 bg-[#c8a97e] px-4 py-2 hover:bg-[#d4b88c] transition-colors"
                        >
                            오디션 공고
                        </Link>
                        <Link
                            href="/montz/upload"
                            className="text-[12px] font-bold text-white border border-white/60 px-4 py-2 hover:bg-white/10 transition-colors"
                        >
                            내 작품 올리기
                        </Link>
                    </div>
                </div>
            </section>

            {/* 양방향 진입 안내 — 캐스팅 측 vs 크리에이터 측 */}
            <section className="px-5 pt-6">
                <div className="grid grid-cols-2 gap-2.5">
                    <Link
                        href="/montz/explore"
                        className="group block bg-neutral-900 text-white p-4 hover:bg-neutral-800 transition-colors"
                    >
                        <p className="text-[10px] font-mono text-[#c8a97e] tracking-[0.2em] uppercase mb-1.5">FOR CASTING</p>
                        <p className="text-[15px] font-black leading-snug mb-1">캐스팅 디렉터</p>
                        <p className="text-[12px] text-white/70 leading-snug">조건으로 모델 찾기 →</p>
                    </Link>
                    <Link
                        href="/montz/profile"
                        className="group block bg-white border border-neutral-200 text-neutral-900 p-4 hover:border-neutral-900 transition-colors"
                    >
                        <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase mb-1.5">FOR CREATOR</p>
                        <p className="text-[15px] font-black leading-snug mb-1">모델 · 배우</p>
                        <p className="text-[12px] text-neutral-700 leading-snug">프로필 등록 후 작품 업로드 →</p>
                    </Link>
                </div>
            </section>

            {/* 크리에이터 그리드 */}
            {loadingInit ? (
                <div className="flex justify-center py-20">
                    <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                </div>
            ) : (
                <section className="px-5 pt-7 pb-8">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-mono text-neutral-700 tracking-[0.2em] uppercase">활동 중인 크리에이터</p>
                        <Link href="/montz/explore"
                            className="text-[11px] font-bold text-neutral-700 hover:text-neutral-900 transition-colors">
                            전체 보기 →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {grid.map((c) => <GridCard key={c.id} creator={c} />)}
                    </div>

                    {hasMore && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="flex items-center gap-2 text-[13px] font-bold text-neutral-900 border border-neutral-900 px-6 py-2.5 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-40"
                            >
                                {loadingMore ? (
                                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> 불러오는 중</>
                                ) : "더 보기"}
                            </button>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
