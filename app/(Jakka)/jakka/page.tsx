"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Share2, Loader2 } from "lucide-react";
import { getCreators, getRecentWorks, getActiveNotices, toggleLike, isLiked, type JakkaCreator, type JakkaWork, type JakkaNotice } from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";

function NoticeCard({ notice }: { notice: JakkaNotice }) {
    return (
        <div className="border-b border-neutral-100 py-5 px-5 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase border border-neutral-300 px-1.5 py-0.5">
                            {notice.type}
                        </span>
                        <span className="text-[11px] text-neutral-500">{notice.deadline}</span>
                    </div>
                    <p className="text-[16px] font-semibold text-neutral-900 mb-0.5">{notice.company}</p>
                    <p className="text-[13px] text-neutral-600 mb-2.5">{notice.role}</p>
                    <div className="flex gap-1.5 flex-wrap">
                        {notice.tags.map((t) => (
                            <span key={t} className="text-[11px] text-neutral-600 bg-white border border-neutral-300 px-2 py-0.5">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-600 mt-1 shrink-0" />
            </div>
        </div>
    );
}

function HeroActions({ creator, userId }: { creator: JakkaCreator; userId?: string }) {
    const workId = creator.featured_work?.id ?? null;
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        if (!userId || !workId) return;
        isLiked(userId, workId).then(setLiked);
    }, [userId, workId]);

    async function handleLike() {
        if (!userId || !workId) return;
        const now = await toggleLike(userId, workId);
        setLiked(now);
    }

    const likeCount = (creator.featured_work?.likes_count ?? 0) + (liked ? 1 : 0);

    return (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
            {workId && (
                <button onClick={handleLike} className="flex flex-col items-center gap-0.5 text-white">
                    <Heart className={`h-6 w-6 transition-all ${liked ? "fill-red-400 stroke-red-400" : "stroke-white/90"}`} />
                    <span className="text-[10px] opacity-80">{likeCount}</span>
                </button>
            )}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = typeof window !== "undefined" ? `${window.location.origin}/jakka/${creator.handle}` : "";
                    if (navigator.share) {
                        navigator.share({ title: creator.display_name, url }).catch(() => {});
                    } else {
                        navigator.clipboard?.writeText(url);
                    }
                }}
                className="flex flex-col items-center gap-0.5 text-white"
            >
                <Share2 className="h-5 w-5 stroke-white/90" />
                <span className="text-[10px] opacity-80">공유</span>
            </button>
        </div>
    );
}

const PEEK_VARIANTS = [
    { box: "right-0 top-0 h-full w-[110px]", gradient: "bg-gradient-to-r from-white via-white/30 to-transparent", offset: "translateX(8px)" },
    { box: "right-0 top-0 w-[150px] h-[60%]", gradient: "bg-gradient-to-bl from-transparent via-white/40 to-white", offset: "translate(8px,-4px)" },
    { box: "right-0 bottom-0 w-[150px] h-[65%]", gradient: "bg-gradient-to-tl from-transparent via-white/40 to-white", offset: "translate(8px,4px)" },
    { box: "right-0 top-0 w-[120px] h-full", gradient: "bg-gradient-to-b from-white/10 via-white/40 to-white", offset: "translateY(-6px)" },
] as const;

function CreatorCard({ creator, index = 0 }: { creator: JakkaCreator; index?: number }) {
    const [hovered, setHovered] = useState(false);
    const [isHoverDevice, setIsHoverDevice] = useState(true);

    useEffect(() => {
        setIsHoverDevice(window.matchMedia("(hover: hover)").matches);
    }, []);

    const previewImage = creator.featured_work?.images?.[0] ?? null;
    const variant = PEEK_VARIANTS[index % PEEK_VARIANTS.length];
    const imgOpacity = hovered ? 1 : isHoverDevice ? 0.32 : 0.55;
    const imgTransform = hovered ? "translate(0,0)" : isHoverDevice ? variant.offset : "translate(0,0)";

    return (
        <Link
            href={`/jakka/${creator.handle}`}
            className="group relative block border-b border-neutral-100 py-6 px-5 overflow-hidden transition-colors hover:bg-neutral-50"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {previewImage && (
                <div
                    className={`absolute pointer-events-none ${variant.box}`}
                    style={{
                        opacity: imgOpacity,
                        transform: imgTransform,
                        transition: "opacity 0.4s ease, transform 0.4s ease",
                    }}
                >
                    <Image src={previewImage} alt="" fill className="object-cover" sizes="150px" />
                    <div className={`absolute inset-0 ${variant.gradient}`} />
                </div>
            )}

            <div className="relative z-10 pr-28">
                <div className="flex items-baseline gap-2.5 mb-1">
                    <span className="text-[18px] font-bold tracking-tight text-neutral-900">{creator.display_name}</span>
                    <span className="text-[13px] text-neutral-600 font-mono">{creator.handle}</span>
                </div>
                <p className="text-[13px] text-neutral-700 mb-3">
                    {[creator.field, creator.year_level, creator.school].filter(Boolean).join(" · ")}
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[12px] font-medium text-neutral-700 bg-neutral-100 px-2.5 py-1">
                        {creator.status}
                    </span>
                    {creator.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[12px] text-neutral-600">#{tag}</span>
                    ))}
                </div>
            </div>
        </Link>
    );
}

export default function JakkaPage() {
    const { user } = useAuth();
    const [creators, setCreators] = useState<JakkaCreator[]>([]);
    const [recentWorks, setRecentWorks] = useState<(JakkaWork & { creator: JakkaCreator })[]>([]);
    const [notices, setNotices] = useState<JakkaNotice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getCreators(20), getRecentWorks(5), getActiveNotices()]).then(([c, w, n]) => {
            setCreators(c);
            setRecentWorks(w);
            setNotices(n);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
            </div>
        );
    }

    const todayCreator = creators[0] ?? null;
    const newFaces = creators.slice(1);
    const featuredWork = recentWorks[0] ?? null;
    const gridWorks = recentWorks.slice(1);

    if (!todayCreator) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-[15px] font-medium">아직 등록된 창작자가 없습니다.</p>
                <Link href="/jakka/profile" className="text-[13px] text-neutral-600 underline">
                    첫 번째 창작자가 되어보세요
                </Link>
            </div>
        );
    }

    // 창작자 목록에 공고 카드 삽입 (5번째마다)
    const NOTICE_INTERVAL = 5;
    const feedItems: Array<{ type: "creator"; data: JakkaCreator } | { type: "notice"; data: JakkaNotice }> = [];
    let noticeIndex = 0;
    newFaces.forEach((creator, i) => {
        feedItems.push({ type: "creator", data: creator });
        if ((i + 1) % NOTICE_INTERVAL === 0 && noticeIndex < notices.length) {
            feedItems.push({ type: "notice", data: notices[noticeIndex++] });
        }
    });

    return (
        <div className="min-h-screen bg-white">
            {/* ── 히어로 (레이블 없이 — 노출 자체가 추천) ── */}
            <section className="border-b border-neutral-300">
                <div className="relative aspect-square bg-neutral-100">
                    {(() => {
                        const heroImg = todayCreator.featured_work?.images?.[0] ?? null;
                        return (
                            <Link href={`/jakka/${todayCreator.handle}`} className="block absolute inset-0">
                                {heroImg ? (
                                    <Image src={heroImg} alt="" fill priority className="object-cover" sizes="100vw" />
                                ) : (
                                    <div className="w-full h-full bg-neutral-200" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-5 pb-16 text-white">
                                    <p className="text-[10px] font-mono opacity-70 mb-1">{todayCreator.handle}</p>
                                    <h2 className="text-[26px] font-bold tracking-tight leading-none mb-1.5">
                                        {todayCreator.display_name}
                                    </h2>
                                    <p className="text-[12px] opacity-80 mb-2">
                                        {[todayCreator.field, todayCreator.year_level, todayCreator.school].filter(Boolean).join(" · ")}
                                    </p>
                                    {todayCreator.statement && (
                                        <p className="text-[13px] opacity-85 leading-relaxed mb-3 max-w-[280px]">
                                            {todayCreator.statement}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {todayCreator.tags.slice(0, 3).map((tag) => (
                                            <span key={tag} className="text-[10px] border border-white/50 px-2 py-0.5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        );
                    })()}

                    <HeroActions creator={todayCreator} userId={user?.authId ?? user?.id} />
                </div>
            </section>

            {/* ── 창작자 + 공고 피드 ── */}
            {feedItems.length > 0 && (
                <section className="border-b border-neutral-300">
                    <div className="h-3" />
                    {feedItems.map((item, i) =>
                        item.type === "creator"
                            ? <CreatorCard key={item.data.id} creator={item.data} index={i} />
                            : <NoticeCard key={item.data.id} notice={item.data} />
                    )}
                </section>
            )}

            {/* ── 이번 주 작업 ── */}
            {recentWorks.length > 0 && (
                <section className="px-4 pt-5 pb-10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono text-neutral-600 tracking-[0.2em] uppercase">
                            이번 주 작업
                        </span>
                        <Link
                            href="/jakka/explore"
                            className="flex items-center gap-1 text-[11px] text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            전체 보기 <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {featuredWork && featuredWork.images[0] && (
                        <Link
                            href={`/jakka/${featuredWork.creator.handle}`}
                            className="block relative aspect-[4/3] bg-neutral-100 mb-2 overflow-hidden group"
                        >
                            <Image
                                src={featuredWork.images[0]}
                                alt=""
                                fill
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                sizes="100vw"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
                                <p className="text-[10px] font-mono opacity-70">
                                    {featuredWork.creator.handle} · {featuredWork.category}
                                </p>
                                <p className="text-[15px] font-semibold">{featuredWork.title}</p>
                            </div>
                        </Link>
                    )}

                    {gridWorks.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {gridWorks.map((work) => (
                                work.images[0] && (
                                    <Link
                                        key={work.id}
                                        href={`/jakka/${work.creator.handle}`}
                                        className="block relative aspect-square bg-neutral-100 overflow-hidden group"
                                    >
                                        <Image
                                            src={work.images[0]}
                                            alt=""
                                            fill
                                            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                            sizes="50vw"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white">
                                            <p className="text-[9px] font-mono opacity-70">{work.category}</p>
                                            <p className="text-[12px] font-medium leading-tight">{work.title}</p>
                                        </div>
                                    </Link>
                                )
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
