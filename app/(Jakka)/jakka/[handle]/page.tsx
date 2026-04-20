"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, Loader2, Heart, User, Bookmark } from "lucide-react";
import { useParams } from "next/navigation";
import {
    getCreatorByHandle, getWorksByCreator, toggleFollow, isFollowing, toggleLike, isLiked,
    toggleBookmark, isBookmarked, getCreatorFollowers, getCreatorFollowing, getLikedWorks,
    getMyCreatorProfile,
    type JakkaCreator, type JakkaWork,
} from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";

type Section = "works" | "followers" | "following" | "likes";

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
            <div className="flex-1 bg-black/60" />
            <div className="bg-white w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-neutral-200 rounded-full" />
                </div>
                {work.images.length > 0 ? (
                    <div className="space-y-px bg-neutral-100">
                        {work.images.map((img, i) => (
                            <div key={i} className="relative w-full bg-neutral-100">
                                <Image src={img} alt={work.title} width={800} height={800} className="w-full h-auto object-cover" sizes="100vw" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-40 bg-neutral-50 flex items-center justify-center text-[13px] text-neutral-500">이미지 없음</div>
                )}
                <div className="px-4 py-4">
                    {!isOwner && userId && (
                        <button onClick={handleLike} className="flex items-center gap-1.5 mb-4">
                            <Heart className={`h-6 w-6 transition-all ${liked ? "fill-red-500 stroke-red-500" : "stroke-neutral-900"}`} />
                            {likeCount > 0 && <span className="text-[13px] font-bold text-neutral-900">{likeCount}</span>}
                        </button>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wide">{work.category}</span>
                        <span className="text-[11px] text-neutral-500">·</span>
                        <span className="text-[11px] text-neutral-600">{work.year}</span>
                        {work.is_featured && <span className="text-[11px] text-amber-500 font-bold">✦ 대표작</span>}
                    </div>
                    <p className="text-[19px] font-bold tracking-tight leading-snug mb-2">{work.title}</p>
                    {work.description && <p className="text-[14px] text-neutral-600 leading-relaxed mb-3">{work.description}</p>}
                    {work.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {work.tags.map((t) => <span key={t} className="text-[12px] text-neutral-600">#{t}</span>)}
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="w-full py-3.5 text-[13px] font-semibold text-neutral-500 border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                    닫기
                </button>
            </div>
        </div>
    );
}

function CreatorListItem({ creator, myCreatorId, onFollow }: {
    creator: JakkaCreator;
    myCreatorId: string | null;
    onFollow?: (id: string, now: boolean) => void;
}) {
    const [following, setFollowing] = useState(false);
    const avatarImg = creator.featured_work?.images?.[0] ?? null;

    useEffect(() => {
        if (!myCreatorId) return;
        isFollowing(myCreatorId, creator.id).then(setFollowing);
    }, [myCreatorId, creator.id]);

    async function handleFollow(e: React.MouseEvent) {
        e.preventDefault();
        if (!myCreatorId) return;
        const { toggleFollow } = await import("@/lib/supabase/jakka");
        const now = await toggleFollow(myCreatorId, creator.id);
        setFollowing(now);
        onFollow?.(creator.id, now);
    }

    return (
        <Link href={`/jakka/${creator.handle}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors border-b border-neutral-100">
            <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden shrink-0">
                {avatarImg ? (
                    <Image src={avatarImg} alt={creator.display_name} width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[12px] font-bold text-neutral-500">
                        {creator.display_name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-neutral-900">{creator.display_name}</p>
                <p className="text-[11px] text-neutral-500 font-mono">{creator.handle}</p>
            </div>
            {myCreatorId && (
                <button
                    onClick={handleFollow}
                    className={`shrink-0 text-[12px] font-bold px-3 py-1 border transition-colors ${
                        following ? "border-neutral-300 text-neutral-600" : "border-neutral-900 bg-neutral-900 text-white"
                    }`}
                >
                    {following ? "팔로잉" : "팔로우"}
                </button>
            )}
        </Link>
    );
}

function WorkGrid({ works, onSelect }: { works: JakkaWork[]; onSelect: (w: JakkaWork) => void }) {
    if (works.length === 0) {
        return <p className="py-16 text-center text-[13px] text-neutral-600">작품이 없습니다.</p>;
    }
    return (
        <div className="grid grid-cols-3 gap-px bg-neutral-100">
            {works.map((work) => (
                <button key={work.id} onClick={() => onSelect(work)} className="relative aspect-square bg-neutral-50 overflow-hidden group">
                    {work.images[0] ? (
                        <Image src={work.images[0]} alt={work.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[10px] text-neutral-500 font-mono">{work.category}</span>
                        </div>
                    )}
                    {work.is_featured && <span className="absolute top-1.5 right-1.5 text-amber-400 text-[12px] drop-shadow">✦</span>}
                    {work.likes_count > 0 && (
                        <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 text-white text-[10px] font-bold drop-shadow">
                            <Heart className="h-3 w-3 fill-white stroke-none" />
                            {work.likes_count}
                        </span>
                    )}
                </button>
            ))}
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
    const [bookmarked, setBookmarked] = useState(false);
    const [myCreatorId, setMyCreatorId] = useState<string | null>(null);
    const [selectedWork, setSelectedWork] = useState<JakkaWork | null>(null);

    const [section, setSection] = useState<Section>("works");
    const [followers, setFollowers] = useState<JakkaCreator[]>([]);
    const [followingList, setFollowingList] = useState<JakkaCreator[]>([]);
    const [likedWorks, setLikedWorks] = useState<JakkaWork[]>([]);
    const [sectionLoaded, setSectionLoaded] = useState<Set<Section>>(new Set(["works"]));

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
                    const [fol, bkm] = await Promise.all([
                        isFollowing(myProfile.id, c.id),
                        isBookmarked(user.authId ?? user.id, c.id),
                    ]);
                    setFollowing(fol);
                    setBookmarked(bkm);
                }
            }
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }

    async function switchSection(s: Section) {
        setSection(s);
        if (sectionLoaded.has(s) || !creator) return;
        if (s === "followers") {
            const list = await getCreatorFollowers(creator.id);
            setFollowers(list);
        } else if (s === "following") {
            const list = await getCreatorFollowing(creator.id);
            setFollowingList(list);
        } else if (s === "likes") {
            const list = await getLikedWorks(creator.user_id);
            setLikedWorks(list);
        }
        setSectionLoaded((prev) => new Set([...prev, s]));
    }

    async function handleFollow() {
        if (!myCreatorId || !creator) return;
        const now = await toggleFollow(myCreatorId, creator.id);
        setFollowing(now);
        setCreator((prev) => prev ? { ...prev, followers_count: prev.followers_count + (now ? 1 : -1) } : prev);
    }

    async function handleBookmark() {
        if (!user || !creator) return;
        const now = await toggleBookmark(user.authId ?? user.id, creator.id);
        setBookmarked(now);
        setCreator((prev) => prev ? { ...prev, bookmarks_count: prev.bookmarks_count + (now ? 1 : -1) } : prev);
    }

    const isOwner = user && creator && (user.authId ?? user.id) === creator.user_id;

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-600" /></div>;
    }
    if (notFound || !creator) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <p className="text-[15px] text-neutral-500">존재하지 않는 창작자입니다.</p>
                <Link href="/jakka" className="text-[13px] text-neutral-600 underline">홈으로</Link>
            </div>
        );
    }

    const avatarImg = creator.featured_work?.images?.[0] ?? null;

    const stats: { key: Section; label: string; value: number }[] = [
        { key: "works",     label: "게시물", value: works.length },
        { key: "followers", label: "팔로워", value: creator.followers_count },
        { key: "following", label: "팔로잉", value: creator.following_count },
        { key: "likes",     label: "좋아요", value: creator.bookmarks_count },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Back nav */}
            <div className="px-4 pt-5 pb-3">
                <Link href="/jakka" className="inline-flex items-center gap-1.5 text-[12px] text-neutral-600 hover:text-neutral-900 transition-colors">
                    <ArrowLeft className="h-3 w-3" />
                    돌아가기
                </Link>
            </div>

            {/* ── 프로필 헤더 ── */}
            <header className="px-5 pb-5">
                {/* 아바타 + 이름/핸들 */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-[72px] h-[72px] rounded-full bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                        {avatarImg ? (
                            <Image src={avatarImg} alt={creator.display_name} width={72} height={72} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="h-7 w-7 text-neutral-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <p className="text-[18px] font-black tracking-tight leading-tight text-neutral-900">{creator.display_name}</p>
                        <p className="text-[12px] font-mono text-neutral-500 mb-2">{creator.handle}</p>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-[11px] font-bold text-neutral-900 border border-neutral-900 px-2 py-0.5">{creator.status}</span>
                            {creator.field && (
                                <span className="text-[11px] text-neutral-700 font-medium border border-neutral-300 px-2 py-0.5">
                                    {creator.field}{creator.year_level ? ` · ${creator.year_level}` : ""}
                                </span>
                            )}
                            {creator.school && (
                                <span className="text-[11px] text-neutral-700 font-medium border border-neutral-300 px-2 py-0.5">{creator.school}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 통계 */}
                <div className="flex justify-between mb-4 border-y border-neutral-100 py-3">
                    {stats.map(({ key, label, value }) => (
                        <button key={key} onClick={() => switchSection(key)} className="flex-1 text-center group py-0.5">
                            <p className={`text-[20px] font-black leading-none transition-colors ${section === key ? "text-neutral-900" : "text-neutral-700 group-hover:text-neutral-900"}`}>
                                {value}
                            </p>
                            <p className={`text-[11px] mt-1 transition-colors ${section === key ? "text-neutral-900 font-bold" : "text-neutral-500"}`}>
                                {label}
                            </p>
                            <div className={`mx-auto mt-1.5 h-[2px] w-4 transition-colors ${section === key ? "bg-neutral-900" : "bg-transparent"}`} />
                        </button>
                    ))}
                </div>

                {creator.statement && (
                    <p className="text-[14px] font-bold text-neutral-900 mb-1 leading-snug">"{creator.statement}"</p>
                )}
                {creator.bio && (
                    <p className="text-[13px] text-neutral-700 leading-relaxed mb-2">{creator.bio}</p>
                )}
                {creator.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {creator.tags.map((tag) => <span key={tag} className="text-[11px] text-neutral-500">#{tag}</span>)}
                    </div>
                )}
                {creator.links.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                        {creator.links.map((link) => (
                            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[12px] font-semibold text-neutral-700 hover:text-neutral-900 transition-colors">
                                {link.label}<ExternalLink className="h-3 w-3" />
                            </a>
                        ))}
                    </div>
                )}

                {/* 팔로우 / 편집 버튼 */}
                {!isOwner && myCreatorId ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleFollow}
                            className={`flex-1 py-2 text-[13px] font-bold border transition-colors ${
                                following ? "border-neutral-300 text-neutral-700 hover:bg-neutral-50" : "border-neutral-900 bg-neutral-900 text-white hover:opacity-80"
                            }`}
                        >
                            {following ? "팔로잉" : "팔로우"}
                        </button>
                        <button
                            onClick={handleBookmark}
                            className={`px-4 py-2 border transition-colors ${
                                bookmarked ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                            }`}
                        >
                            <Bookmark className={`h-4 w-4 transition-all ${bookmarked ? "fill-white stroke-white" : ""}`} />
                        </button>
                    </div>
                ) : isOwner ? (
                    <Link href="/jakka/settings" className="block w-full py-2 text-center text-[13px] font-bold border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors">
                        프로필 편집
                    </Link>
                ) : null}
            </header>

            {/* ── 헤더↔그리드 구분선 ── */}
            <div className="border-t border-neutral-200" />

            {/* ── 섹션 콘텐츠 ── */}
            <section className="pb-20">
                {section === "works" && <WorkGrid works={works} onSelect={setSelectedWork} />}

                {section === "followers" && (
                    followers.length === 0
                        ? <p className="py-16 text-center text-[13px] text-neutral-600">팔로워가 없습니다.</p>
                        : followers.map((c) => <CreatorListItem key={c.id} creator={c} myCreatorId={myCreatorId} />)
                )}

                {section === "following" && (
                    followingList.length === 0
                        ? <p className="py-16 text-center text-[13px] text-neutral-600">팔로잉하는 작가가 없습니다.</p>
                        : followingList.map((c) => <CreatorListItem key={c.id} creator={c} myCreatorId={myCreatorId} />)
                )}

                {section === "likes" && (
                    <WorkGrid works={likedWorks} onSelect={setSelectedWork} />
                )}
            </section>

            {selectedWork && (
                <WorkSheet work={selectedWork} onClose={() => setSelectedWork(null)} isOwner={!!isOwner} userId={user?.authId ?? user?.id} />
            )}
        </div>
    );
}
