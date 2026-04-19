"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, Loader2, Heart, User } from "lucide-react";
import { useParams } from "next/navigation";
import {
    getCreatorByHandle, getWorksByCreator, toggleFollow, isFollowing, toggleLike, isLiked,
    getMyCreatorProfile,
    type JakkaCreator, type JakkaWork,
} from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";

function WorkSheet({ work, onClose, isOwner, userId }: {
    work: JakkaWork;
    onClose: () => void;
    isOwner: boolean;
    userId?: string;
}) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(work.likes_count);

    useEffect(() => {
        if (!userId) return;
        isLiked(userId, work.id).then(setLiked);
    }, [userId, work.id]);

    async function handleLike(e: React.MouseEvent) {
        e.stopPropagation();
        if (!userId) return;
        const now = await toggleLike(userId, work.id);
        setLiked(now);
        setLikeCount((c) => c + (now ? 1 : -1));
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
            {/* Dim */}
            <div className="flex-1 bg-black/60" />

            {/* Sheet */}
            <div
                className="bg-white w-full max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-neutral-200 rounded-full" />
                </div>

                {/* Images */}
                {work.images.length > 0 ? (
                    <div className="space-y-px bg-neutral-100">
                        {work.images.map((img, i) => (
                            <div key={i} className="relative w-full bg-neutral-100">
                                <Image
                                    src={img}
                                    alt={work.title}
                                    width={800}
                                    height={800}
                                    className="w-full h-auto object-cover"
                                    sizes="100vw"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-40 bg-neutral-50 flex items-center justify-center text-[13px] text-neutral-300">
                        이미지 없음
                    </div>
                )}

                {/* Actions + Info */}
                <div className="px-4 py-4">
                    {!isOwner && userId && (
                        <button onClick={handleLike} className="flex items-center gap-1.5 mb-4">
                            <Heart className={`h-6 w-6 transition-all ${liked ? "fill-red-500 stroke-red-500" : "stroke-neutral-900"}`} />
                            {likeCount > 0 && (
                                <span className="text-[13px] font-bold text-neutral-900">{likeCount}</span>
                            )}
                        </button>
                    )}

                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wide">{work.category}</span>
                        <span className="text-[11px] text-neutral-300">·</span>
                        <span className="text-[11px] text-neutral-400">{work.year}</span>
                        {work.is_featured && (
                            <span className="text-[11px] text-amber-500 font-bold">✦ 대표작</span>
                        )}
                    </div>
                    <p className="text-[19px] font-bold tracking-tight leading-snug mb-2">{work.title}</p>
                    {work.description && (
                        <p className="text-[14px] text-neutral-600 leading-relaxed mb-3">{work.description}</p>
                    )}
                    {work.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {work.tags.map((t) => (
                                <span key={t} className="text-[12px] text-neutral-400">#{t}</span>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3.5 text-[13px] font-semibold text-neutral-500 border-t border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                    닫기
                </button>
            </div>
        </div>
    );
}

export default function PortfolioPage() {
    const params = useParams();
    const rawHandle = params.handle as string;
    const handle = rawHandle.startsWith("%40") ? rawHandle.replace("%40", "@") : rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;

    const { user } = useAuth();
    const [creator, setCreator] = useState<JakkaCreator | null>(null);
    const [works, setWorks] = useState<JakkaWork[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [following, setFollowing] = useState(false);
    const [myCreatorId, setMyCreatorId] = useState<string | null>(null);
    const [selectedWork, setSelectedWork] = useState<JakkaWork | null>(null);

    useEffect(() => { loadData(); }, [handle]);

    async function loadData() {
        setLoading(true);
        try {
            const c = await getCreatorByHandle(handle);
            if (!c) { setNotFound(true); setLoading(false); return; }
            const w = await getWorksByCreator(c.id);
            setCreator(c);
            setWorks(w);
            if (user) {
                const myProfile = await getMyCreatorProfile(user.authId ?? user.id);
                if (myProfile) {
                    setMyCreatorId(myProfile.id);
                    const fol = await isFollowing(myProfile.id, c.id);
                    setFollowing(fol);
                }
            }
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }

    async function handleFollow() {
        if (!myCreatorId || !creator) return;
        const now = await toggleFollow(myCreatorId, creator.id);
        setFollowing(now);
        setCreator((prev) => prev ? {
            ...prev,
            followers_count: prev.followers_count + (now ? 1 : -1),
        } : prev);
    }

    const isOwner = user && creator && (user.authId ?? user.id) === creator.user_id;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (notFound || !creator) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <p className="text-[15px] text-neutral-500">존재하지 않는 창작자입니다.</p>
                <Link href="/jakka" className="text-[13px] text-neutral-400 underline">홈으로</Link>
            </div>
        );
    }

    const avatarImg = creator.featured_work?.images?.[0] ?? null;

    return (
        <div className="min-h-screen bg-white">
            {/* Back nav */}
            <div className="px-4 pt-5 pb-3">
                <Link href="/jakka" className="inline-flex items-center gap-1.5 text-[12px] text-neutral-400 hover:text-neutral-900 transition-colors">
                    <ArrowLeft className="h-3 w-3" />
                    돌아가기
                </Link>
            </div>

            {/* ── 프로필 헤더 ── */}
            <header className="px-5 pb-5 border-b border-neutral-100">

                {/* 아바타 + 스탯 */}
                <div className="flex items-center gap-5 mb-4">
                    <div className="w-20 h-20 rounded-full bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                        {avatarImg ? (
                            <Image src={avatarImg} alt={creator.display_name} width={80} height={80} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="h-8 w-8 text-neutral-300" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-1 justify-around">
                        <div className="text-center">
                            <p className="text-[20px] font-black leading-none">{works.length}</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">게시물</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[20px] font-black leading-none">{creator.followers_count}</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">팔로워</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[20px] font-black leading-none">{creator.following_count}</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">팔로잉</p>
                        </div>
                    </div>
                </div>

                {/* 이름 + 핸들 */}
                <p className="text-[17px] font-black tracking-tight leading-tight">{creator.display_name}</p>
                <p className="text-[12px] text-neutral-400 font-mono mb-2">{creator.handle}</p>

                {/* 뱃지 */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <span className="text-[12px] font-bold border border-neutral-900 px-2.5 py-0.5">
                        {creator.status}
                    </span>
                    {creator.field && (
                        <span className="text-[12px] text-neutral-600 font-medium border border-neutral-200 px-2.5 py-0.5">
                            {creator.field}{creator.year_level ? ` · ${creator.year_level}` : ""}
                        </span>
                    )}
                    {creator.school && (
                        <span className="text-[12px] text-neutral-600 font-medium border border-neutral-200 px-2.5 py-0.5">
                            {creator.school}
                        </span>
                    )}
                </div>

                {/* Statement */}
                {creator.statement && (
                    <p className="text-[14px] font-bold text-neutral-900 mb-1 leading-snug">
                        "{creator.statement}"
                    </p>
                )}

                {/* Bio */}
                {creator.bio && (
                    <p className="text-[13px] text-neutral-500 leading-relaxed mb-2">{creator.bio}</p>
                )}

                {/* 태그 */}
                {creator.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {creator.tags.map((tag) => (
                            <span key={tag} className="text-[11px] text-neutral-400">#{tag}</span>
                        ))}
                    </div>
                )}

                {/* 링크 */}
                {creator.links.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                        {creator.links.map((link) => (
                            <a
                                key={link.label}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[12px] font-semibold text-neutral-700 hover:text-neutral-900 transition-colors"
                            >
                                {link.label}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        ))}
                    </div>
                )}

                {/* 팔로우 / 편집 버튼 */}
                {!isOwner && myCreatorId ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleFollow}
                            className={`flex-1 py-1.5 text-[13px] font-bold border transition-colors ${
                                following
                                    ? "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                                    : "border-neutral-900 bg-neutral-900 text-white hover:opacity-80"
                            }`}
                        >
                            {following ? "팔로잉" : "팔로우"}
                        </button>
                        <button className="flex-1 py-1.5 text-[13px] font-bold border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors">
                            메시지
                        </button>
                    </div>
                ) : isOwner ? (
                    <Link
                        href="/jakka/settings"
                        className="block w-full py-1.5 text-center text-[13px] font-bold border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                        프로필 편집
                    </Link>
                ) : null}
            </header>

            {/* ── 작업 그리드 ── */}
            <section className="pb-20">
                {works.length === 0 ? (
                    <p className="py-16 text-center text-[13px] text-neutral-400">업로드된 작업이 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-3 gap-px bg-neutral-100">
                        {works.map((work) => (
                            <button
                                key={work.id}
                                onClick={() => setSelectedWork(work)}
                                className="relative aspect-square bg-neutral-50 overflow-hidden group"
                            >
                                {work.images[0] ? (
                                    <Image
                                        src={work.images[0]}
                                        alt={work.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                        <span className="text-[10px] text-neutral-300 font-mono">{work.category}</span>
                                    </div>
                                )}
                                {work.is_featured && (
                                    <span className="absolute top-1.5 right-1.5 text-amber-400 text-[12px] drop-shadow">✦</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* 작업 상세 시트 */}
            {selectedWork && (
                <WorkSheet
                    work={selectedWork}
                    onClose={() => setSelectedWork(null)}
                    isOwner={!!isOwner}
                    userId={user?.authId ?? user?.id}
                />
            )}
        </div>
    );
}
