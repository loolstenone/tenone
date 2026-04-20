"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Loader2, Calendar, MapPin,
    CheckCircle2, XCircle, Clock, Heart, Share2, Plus,
    Settings, UserPlus, Trash2, MessageSquare, BookOpen,
} from "lucide-react";
import {
    getShowcaseByIdentifier, getShowcaseApprovals, getShowcaseArtists, getShowcaseWorks,
    isInterestedInShowcase, toggleShowcaseInterest,
    getWorksByCreator, addShowcaseWork, removeShowcaseWork,
    setShowcaseHandle, isShowcaseHandleAvailable, inviteMemberByHandle, removeMember,
    getGuestbook, addGuestbookEntry, deleteGuestbookEntry,
    getShowcaseWorkComments, addShowcaseWorkComment, deleteShowcaseWorkComment,
    isShowcaseWorkLiked, toggleShowcaseWorkLike, getShowcaseActivitySummary,
    type JakkaShowcase, type JakkaShowcaseApproval,
    type JakkaShowcaseArtist, type JakkaShowcaseWork, type JakkaWork,
    type JakkaGuestbookEntry, type JakkaShowcaseWorkComment,
} from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";

// ── 유틸 ──────────────────────────────────────────────────────

function StatusBadge({ sc }: { sc: JakkaShowcase }) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(sc.start_date);
    const end = new Date(sc.end_date); end.setHours(23, 59, 59, 999);
    if (sc.status === 'ended' || today > end) return (
        <span className="text-[11px] font-bold text-neutral-500">오프라인 종료 · 온라인 계속</span>
    );
    if (today < start) {
        const diff = Math.ceil((start.getTime() - today.getTime()) / 86400000);
        return <span className="text-[11px] font-bold text-neutral-900">D-{diff}</span>;
    }
    return <span className="text-[11px] font-bold text-green-600">● 진행 중</span>;
}

// ── 참여 작가 카드 ─────────────────────────────────────────────

function ArtistCard({ artist, canRemove, onRemove }: {
    artist: JakkaShowcaseArtist;
    canRemove?: boolean;
    onRemove?: () => void;
}) {
    const c = artist.creator;
    if (!c) return null;
    return (
        <div className="relative flex flex-col items-center gap-2 group w-16">
            <Link href={`/jakka/${c.handle}`}>
                <div className="w-14 h-14 rounded-full bg-neutral-200 overflow-hidden border border-neutral-200 group-hover:border-neutral-400 transition-colors">
                    {c.featured_work?.images?.[0] ? (
                        <Image src={c.featured_work.images[0]} alt="" width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[16px] font-black text-neutral-500">
                            {c.display_name.charAt(0)}
                        </div>
                    )}
                </div>
            </Link>
            <div className="text-center">
                <p className="text-[11px] font-bold text-neutral-900 leading-tight truncate w-16">{c.display_name}</p>
                {artist.role === 'admin' && (
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">관리자</p>
                )}
            </div>
            {canRemove && artist.role !== 'admin' && (
                <button
                    onClick={onRemove}
                    className="absolute -top-1 -right-1 bg-neutral-200 hover:bg-red-100 text-neutral-600 hover:text-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

// ── 작품 카드 (좋아요 + 댓글) ──────────────────────────────────

function WorkCard({ sw, showcaseId, userId, canRemove, onRemove }: {
    sw: JakkaShowcaseWork;
    showcaseId: string;
    userId: string | null;
    canRemove?: boolean;
    onRemove?: () => void;
}) {
    const w = sw.work;
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [comments, setComments] = useState<JakkaShowcaseWorkComment[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    useEffect(() => {
        if (!userId || !w) return;
        isShowcaseWorkLiked(showcaseId, w.id, userId).then(setLiked);
    }, [showcaseId, userId, w]);

    const loadComments = useCallback(async () => {
        if (!w || commentsLoaded) return;
        const data = await getShowcaseWorkComments(showcaseId, w.id);
        setComments(data);
        setLikeCount(0); // will be fetched separately if needed
        setCommentsLoaded(true);
    }, [showcaseId, w, commentsLoaded]);

    const handleToggleComments = () => {
        if (!showComments) loadComments();
        setShowComments((v) => !v);
    };

    const handleLike = async () => {
        if (!userId || !w) return;
        const now = await toggleShowcaseWorkLike(showcaseId, w.id, userId);
        setLiked(now);
        setLikeCount((p) => now ? p + 1 : Math.max(0, p - 1));
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !w || !commentText.trim()) return;
        // author info injected server-side ideally; here we use cached user
        const ok = await addShowcaseWorkComment({
            showcaseId, workId: w.id, userId,
            authorName: "나", comment: commentText.trim(),
        });
        if (ok) {
            setCommentText("");
            const fresh = await getShowcaseWorkComments(showcaseId, w.id);
            setComments(fresh);
        }
    };

    if (!w) return null;

    return (
        <div className="group relative">
            <div className="relative aspect-square bg-neutral-100 overflow-hidden">
                {w.images?.[0] ? (
                    <Image src={w.images[0]} alt={w.title} fill className="object-cover" sizes="200px" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[11px] text-neutral-400">{w.title}</div>
                )}
                {canRemove && (
                    <button
                        onClick={onRemove}
                        className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <XCircle className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
            <div className="pt-1.5 pb-2">
                <p className="text-[12px] font-bold text-neutral-900 truncate">{w.title}</p>
                <div className="flex items-center gap-3 mt-1">
                    <button onClick={handleLike} className={`flex items-center gap-1 text-[11px] ${liked ? "text-neutral-900" : "text-neutral-400"}`}>
                        <Heart className={`h-3.5 w-3.5 ${liked ? "fill-neutral-900" : ""}`} />
                        {likeCount > 0 && likeCount}
                    </button>
                    <button onClick={handleToggleComments} className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {comments.length > 0 && comments.length}
                    </button>
                </div>
            </div>
            {showComments && (
                <div className="border-t border-neutral-100 pt-2 space-y-2">
                    {comments.map((c) => (
                        <div key={c.id} className="text-[11px]">
                            <span className="font-bold text-neutral-700">{c.author_handle ?? c.author_name}</span>
                            <span className="text-neutral-600 ml-1">{c.comment}</span>
                        </div>
                    ))}
                    {userId && (
                        <form onSubmit={handleComment} className="flex gap-1.5">
                            <input
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="댓글..."
                                className="flex-1 text-[11px] border-b border-neutral-300 focus:border-neutral-900 outline-none py-0.5 bg-transparent"
                            />
                            <button type="submit" className="text-[10px] font-bold text-neutral-700">등록</button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

// ── 방명록 ────────────────────────────────────────────────────

function Guestbook({ showcaseId, userId, userName, userHandle, userAvatar }: {
    showcaseId: string;
    userId: string | null;
    userName?: string;
    userHandle?: string;
    userAvatar?: string;
}) {
    const [entries, setEntries] = useState<JakkaGuestbookEntry[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getGuestbook(showcaseId).then((data) => { setEntries(data); setLoading(false); });
    }, [showcaseId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !text.trim() || !userName) return;
        const ok = await addGuestbookEntry({
            showcaseId, userId,
            authorName: userName,
            authorHandle: userHandle,
            authorAvatar: userAvatar,
            message: text.trim(),
        });
        if (ok) {
            setText("");
            const fresh = await getGuestbook(showcaseId);
            setEntries(fresh);
        }
    };

    const handleDelete = async (id: string) => {
        if (!userId) return;
        await deleteGuestbookEntry(id, userId);
        setEntries((prev) => prev.filter((e) => e.id !== id));
    };

    return (
        <section>
            <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 stroke-[1.5] text-neutral-500" />
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em]">
                    방명록 {entries.length > 0 && `(${entries.length})`}
                </p>
            </div>

            {userId ? (
                <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="감사했습니다, 작품이 좋았어요 — 한마디 남겨주세요"
                        maxLength={200}
                        className="flex-1 px-3 py-2 text-[13px] border border-neutral-300 focus:border-neutral-900 outline-none"
                    />
                    <button type="submit" className="px-4 py-2 text-[12px] font-bold bg-neutral-900 text-white hover:bg-neutral-700 shrink-0">
                        남기기
                    </button>
                </form>
            ) : (
                <p className="text-[12px] text-neutral-400 mb-4">로그인 후 방명록을 남길 수 있습니다.</p>
            )}

            {loading ? (
                <div className="py-6 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-neutral-400" /></div>
            ) : entries.length === 0 ? (
                <p className="text-[13px] text-neutral-400 py-4">아직 방명록이 없습니다. 첫 번째로 남겨보세요.</p>
            ) : (
                <ul className="space-y-3">
                    {entries.map((e) => (
                        <li key={e.id} className="flex gap-3 group">
                            <div className="w-7 h-7 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                                {e.author_avatar ? (
                                    <Image src={e.author_avatar} alt="" width={28} height={28} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-neutral-500">
                                        {e.author_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-[12px] font-bold text-neutral-900">
                                        {e.author_handle ?? e.author_name}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">
                                        {new Date(e.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-[13px] text-neutral-700 leading-snug mt-0.5">{e.message}</p>
                            </div>
                            {userId === e.user_id && (
                                <button onClick={() => handleDelete(e.id)} className="opacity-0 group-hover:opacity-100 p-1 text-neutral-300 hover:text-red-500 transition-all shrink-0">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

// ── 관리자 패널 ───────────────────────────────────────────────

function AdminPanel({ showcase, artists, onRefresh }: {
    showcase: JakkaShowcase;
    artists: JakkaShowcaseArtist[];
    onRefresh: () => void;
}) {
    const { user } = useAuth();
    const [inviteHandle, setInviteHandle] = useState("");
    const [handleInput, setHandleInput] = useState(showcase.handle?.replace('@', '') ?? "");
    const [handleMsg, setHandleMsg] = useState("");
    const [inviteMsg, setInviteMsg] = useState("");
    const [open, setOpen] = useState(false);

    const uid = user ? (user.authId ?? user.id) : null;

    const handleSetHandle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uid || !handleInput.trim()) return;
        const avail = await isShowcaseHandleAvailable(handleInput.trim());
        if (!avail && `@${handleInput.trim()}` !== showcase.handle) {
            setHandleMsg("이미 사용 중인 핸들입니다."); return;
        }
        const result = await setShowcaseHandle(showcase.id, uid, handleInput.trim());
        setHandleMsg(result.ok ? "저장됐습니다!" : (result.error ?? "실패"));
        if (result.ok) onRefresh();
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteHandle.trim()) return;
        const result = await inviteMemberByHandle(showcase.id, inviteHandle.trim());
        setInviteMsg(result.ok ? `${inviteHandle} 추가됐습니다!` : (result.error ?? "실패"));
        if (result.ok) { setInviteHandle(""); onRefresh(); }
    };

    const handleRemoveMember = async (creatorId: string) => {
        await removeMember(showcase.id, creatorId);
        onRefresh();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 hover:text-neutral-900"
            >
                <Settings className="h-3.5 w-3.5" />
                관리
            </button>

            {open && (
                <div className="absolute right-0 top-7 z-50 w-72 bg-white border border-neutral-200 shadow-lg p-5 space-y-6">
                    {/* 핸들 설정 */}
                    <div>
                        <p className="text-[11px] font-bold text-neutral-900 mb-2">쇼케이스 핸들</p>
                        <form onSubmit={handleSetHandle} className="flex gap-2">
                            <div className="flex-1 flex border border-neutral-300 focus-within:border-neutral-900">
                                <span className="px-2 text-[12px] text-neutral-400 flex items-center border-r border-neutral-200">@</span>
                                <input
                                    value={handleInput}
                                    onChange={(e) => { setHandleInput(e.target.value); setHandleMsg(""); }}
                                    placeholder="handle"
                                    className="flex-1 px-2 py-1.5 text-[12px] outline-none"
                                />
                            </div>
                            <button type="submit" className="px-3 py-1.5 text-[11px] font-bold bg-neutral-900 text-white">저장</button>
                        </form>
                        {handleMsg && <p className="text-[11px] mt-1 text-neutral-500">{handleMsg}</p>}
                        {showcase.handle && (
                            <p className="text-[10px] text-neutral-400 mt-1">
                                URL: jakka.kr/showcase/{showcase.handle}
                            </p>
                        )}
                    </div>

                    {/* 멤버 초대 */}
                    <div>
                        <p className="text-[11px] font-bold text-neutral-900 mb-2">멤버 초대</p>
                        <form onSubmit={handleInvite} className="flex gap-2">
                            <input
                                value={inviteHandle}
                                onChange={(e) => { setInviteHandle(e.target.value); setInviteMsg(""); }}
                                placeholder="@handle"
                                className="flex-1 px-2 py-1.5 text-[12px] border border-neutral-300 focus:border-neutral-900 outline-none"
                            />
                            <button type="submit" className="px-3 py-1.5 text-[11px] font-bold border border-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors">
                                <UserPlus className="h-3.5 w-3.5" />
                            </button>
                        </form>
                        {inviteMsg && <p className="text-[11px] mt-1 text-neutral-500">{inviteMsg}</p>}
                    </div>

                    {/* 멤버 목록 */}
                    <div>
                        <p className="text-[11px] font-bold text-neutral-900 mb-2">멤버 ({artists.length})</p>
                        <ul className="space-y-1.5">
                            {artists.map((a) => (
                                <li key={a.id} className="flex items-center justify-between gap-2">
                                    <span className="text-[12px] text-neutral-700 truncate">
                                        {a.creator?.display_name ?? a.creator_id}
                                        {a.role === 'admin' && <span className="ml-1 text-[9px] text-neutral-400">관리자</span>}
                                    </span>
                                    {a.role !== 'admin' && (
                                        <button onClick={() => handleRemoveMember(a.creator_id)} className="text-neutral-300 hover:text-red-500 shrink-0">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── 메인 페이지 ───────────────────────────────────────────────

export default function ShowcaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { user } = useAuth();

    const [showcase, setShowcase] = useState<JakkaShowcase | null>(null);
    const [approvals, setApprovals] = useState<JakkaShowcaseApproval[]>([]);
    const [artists, setArtists] = useState<JakkaShowcaseArtist[]>([]);
    const [showcaseWorks, setShowcaseWorks] = useState<JakkaShowcaseWork[]>([]);
    const [activity, setActivity] = useState({ totalLikes: 0, totalComments: 0, totalGuestbook: 0 });
    const [loading, setLoading] = useState(true);
    const [interested, setInterested] = useState(false);
    const [interestCount, setInterestCount] = useState(0);
    const [interestLoading, setInterestLoading] = useState(false);
    const [addWorkOpen, setAddWorkOpen] = useState(false);
    const [myWorks, setMyWorks] = useState<JakkaWork[]>([]);

    const uid = user ? (user.authId ?? user.id) : null;

    const load = useCallback(async () => {
        const sc = await getShowcaseByIdentifier(slug);
        if (!sc) { setLoading(false); return; }

        // handle이 있고 현재 URL이 slug면 handle URL로 리다이렉트
        if (sc.handle && !slug.startsWith('@')) {
            router.replace(`/jakka/showcase/${sc.handle}`);
            return;
        }

        setShowcase(sc);
        setInterestCount(sc.interests_count ?? 0);
        const [appr, arts, works, act] = await Promise.all([
            getShowcaseApprovals(sc.id),
            getShowcaseArtists(sc.id),
            getShowcaseWorks(sc.id),
            getShowcaseActivitySummary(sc.id),
        ]);
        setApprovals(appr);
        setArtists(arts);
        setShowcaseWorks(works);
        setActivity(act);

        if (uid) {
            const already = await isInterestedInShowcase(uid, sc.id);
            setInterested(already);
        }
        setLoading(false);
    }, [slug, uid, router]);

    useEffect(() => { load(); }, [load]);

    const handleInterest = useCallback(async () => {
        if (!uid || !showcase) return;
        setInterestLoading(true);
        const now = await toggleShowcaseInterest(uid, showcase.id);
        setInterested(now);
        setInterestCount((p) => now ? p + 1 : Math.max(0, p - 1));
        setInterestLoading(false);
    }, [uid, showcase]);

    const handleShare = useCallback(async () => {
        if (!showcase) return;
        const url = window.location.href;
        if (navigator.share) await navigator.share({ title: showcase.title, url });
        else { await navigator.clipboard.writeText(url); alert("링크가 복사되었습니다."); }
    }, [showcase]);

    const openAddWork = useCallback(async () => {
        if (!uid || !showcase) return;
        const myArtist = artists.find((a) => a.creator?.user_id === uid);
        if (!myArtist) return;
        const works = await getWorksByCreator(myArtist.creator_id);
        const alreadyIds = new Set(showcaseWorks.map((sw) => sw.work_id));
        setMyWorks(works.filter((w) => !alreadyIds.has(w.id)));
        setAddWorkOpen(true);
    }, [uid, showcase, artists, showcaseWorks]);

    const handleAddWork = useCallback(async (work: JakkaWork) => {
        if (!showcase || !uid) return;
        await addShowcaseWork(showcase.id, work.id, uid);
        setAddWorkOpen(false);
        const updated = await getShowcaseWorks(showcase.id);
        setShowcaseWorks(updated);
    }, [showcase, uid]);

    const handleRemoveWork = useCallback(async (sw: JakkaShowcaseWork) => {
        if (!showcase) return;
        await removeShowcaseWork(showcase.id, sw.work_id);
        setShowcaseWorks((prev) => prev.filter((w) => w.id !== sw.id));
    }, [showcase]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
    );
    if (!showcase) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-[15px] text-neutral-500">존재하지 않는 쇼케이스입니다.</p>
            <Link href="/jakka/showcase" className="text-[13px] text-neutral-600 underline">목록으로</Link>
        </div>
    );

    const isAdmin = uid === showcase.admin_user_id;
    const isParticipant = artists.some((a) => a.creator?.user_id === uid);
    const canManageWorks = isAdmin || isParticipant;

    return (
        <div className="min-h-screen bg-white">
            <div className="px-4 pt-5 pb-3">
                <Link href="/jakka/showcase" className="inline-flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-neutral-900">
                    <ArrowLeft className="h-3 w-3" /> 쇼케이스
                </Link>
            </div>

            {/* 히어로 */}
            {showcase.cover_image ? (
                <div className="relative aspect-[21/9] md:aspect-[3/1] bg-neutral-900 overflow-hidden">
                    <Image src={showcase.cover_image} alt="" fill className="object-cover opacity-90" sizes="100vw" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 max-w-3xl mx-auto">
                        {showcase.category && <p className="text-[10px] font-mono text-white/70 uppercase tracking-[0.2em] mb-2">{showcase.category}</p>}
                        <h1 className="text-[26px] md:text-[34px] font-black tracking-tight text-white leading-tight">{showcase.title}</h1>
                        {showcase.subtitle && <p className="text-[14px] text-white/80 mt-1">{showcase.subtitle}</p>}
                        {showcase.handle && (
                            <p className="text-[11px] font-mono text-white/50 mt-1">jakka.kr/showcase/{showcase.handle}</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="px-5 pb-4 max-w-3xl mx-auto">
                    {showcase.category && <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-2">{showcase.category}</p>}
                    <h1 className="text-[28px] font-black tracking-tight text-neutral-900 leading-tight">{showcase.title}</h1>
                    {showcase.subtitle && <p className="text-[15px] text-neutral-700 mt-1">{showcase.subtitle}</p>}
                    {showcase.handle && <p className="text-[11px] font-mono text-neutral-400 mt-1">jakka.kr/showcase/{showcase.handle}</p>}
                </div>
            )}

            {/* 오프라인 종료 배너 */}
            {(() => {
                const today = new Date(); today.setHours(0,0,0,0);
                const end = new Date(showcase.end_date); end.setHours(23,59,59,999);
                const isOfflineEnded = showcase.status === 'ended' || today > end;
                return isOfflineEnded ? (
                    <div className="bg-neutral-50 border-b border-neutral-200 px-5 py-3 text-center">
                        <p className="text-[12px] text-neutral-700">
                            오프라인 전시는 종료되었습니다. <strong className="text-neutral-900">Jakka에서 작품과 방명록은 계속 남아 있습니다.</strong>
                        </p>
                    </div>
                ) : null;
            })()}

            <article className="max-w-3xl mx-auto px-5 py-7 space-y-10">

                {/* 메타 + 액션 */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                    <div className="flex flex-wrap items-center gap-4 text-[13px] text-neutral-900">
                        <StatusBadge sc={showcase} />
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-neutral-500" />{showcase.start_date} ~ {showcase.end_date}</span>
                        {showcase.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-neutral-500" />{showcase.location}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && <AdminPanel showcase={showcase} artists={artists} onRefresh={load} />}
                        <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-neutral-900 border border-neutral-300 hover:border-neutral-900 transition-colors">
                            <Share2 className="h-3.5 w-3.5" />공유
                        </button>
                        {user && (
                            <button
                                onClick={handleInterest}
                                disabled={interestLoading}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold border transition-colors ${interested ? "bg-neutral-900 text-white border-neutral-900" : "text-neutral-900 border-neutral-900 hover:bg-neutral-900 hover:text-white"}`}
                            >
                                <Heart className={`h-3.5 w-3.5 ${interested ? "fill-white" : ""}`} />
                                관심있어요 {interestCount > 0 && interestCount}
                            </button>
                        )}
                    </div>
                </div>

                {/* 활동 요약 */}
                {(activity.totalLikes + activity.totalComments + activity.totalGuestbook) > 0 && (
                    <div className="flex gap-6 text-center py-4 border-b border-neutral-100">
                        {activity.totalLikes > 0 && (
                            <div><p className="text-[20px] font-black text-neutral-900">{activity.totalLikes}</p><p className="text-[10px] text-neutral-400 mt-0.5">작품 좋아요</p></div>
                        )}
                        {activity.totalComments > 0 && (
                            <div><p className="text-[20px] font-black text-neutral-900">{activity.totalComments}</p><p className="text-[10px] text-neutral-400 mt-0.5">댓글</p></div>
                        )}
                        {activity.totalGuestbook > 0 && (
                            <div><p className="text-[20px] font-black text-neutral-900">{activity.totalGuestbook}</p><p className="text-[10px] text-neutral-400 mt-0.5">방명록</p></div>
                        )}
                        {interestCount > 0 && (
                            <div><p className="text-[20px] font-black text-neutral-900">{interestCount}</p><p className="text-[10px] text-neutral-400 mt-0.5">관심</p></div>
                        )}
                    </div>
                )}

                {/* 참여 작가 */}
                {artists.length > 0 && (
                    <section>
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-5">참여 작가</p>
                        <div className="flex flex-wrap gap-5">
                            {artists.map((a) => (
                                <ArtistCard
                                    key={a.id} artist={a}
                                    canRemove={isAdmin}
                                    onRemove={() => removeMember(showcase.id, a.creator_id).then(load)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 소개 */}
                <section>
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-4">소개</p>
                    <p className="text-[15px] leading-[1.9] text-neutral-900 whitespace-pre-wrap">{showcase.description}</p>
                </section>

                {/* 전시 작품 */}
                {(() => {
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const start = new Date(showcase.start_date);
                    const isComingSoon = showcase.publish_mode === 'scheduled' && today < start && !isAdmin;
                    const daysUntil = Math.ceil((start.getTime() - today.getTime()) / 86400000);

                    if (isComingSoon) {
                        return (
                            <section>
                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-4">전시 작품</p>
                                <div className="border border-dashed border-neutral-200 py-14 flex flex-col items-center gap-3 text-center">
                                    <p className="text-[32px] font-black text-neutral-900 tracking-tight">Coming Soon</p>
                                    <p className="text-[14px] text-neutral-700">
                                        전시 시작 <strong className="text-neutral-900">D-{daysUntil}</strong>에 공개됩니다
                                    </p>
                                    <p className="text-[12px] text-neutral-400">
                                        {showcase.start_date.replace(/-/g, '.')} 부터 작품을 만날 수 있어요
                                    </p>
                                </div>
                            </section>
                        );
                    }

                    return (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em]">
                                    전시 작품 {showcaseWorks.length > 0 && `(${showcaseWorks.length})`}
                                </p>
                                {canManageWorks && (
                                    <button onClick={openAddWork} className="flex items-center gap-1 text-[11px] font-bold text-neutral-700 hover:text-neutral-900">
                                        <Plus className="h-3.5 w-3.5" />내 작품 추가
                                    </button>
                                )}
                            </div>
                            {showcaseWorks.length === 0 ? (
                                <div className="py-10 border border-dashed border-neutral-200 flex flex-col items-center gap-2">
                                    <p className="text-[13px] text-neutral-400">아직 등록된 작품이 없습니다.</p>
                                    {canManageWorks && <button onClick={openAddWork} className="text-[12px] font-bold underline">내 작품 추가하기</button>}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {showcaseWorks.map((sw) => (
                                        <WorkCard
                                            key={sw.id} sw={sw}
                                            showcaseId={showcase.id}
                                            userId={uid}
                                            canRemove={canManageWorks}
                                            onRemove={() => handleRemoveWork(sw)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    );
                })()}

                {/* 방명록 */}
                <Guestbook
                    showcaseId={showcase.id}
                    userId={uid}
                    userName={user?.name ?? undefined}
                    userHandle={undefined}
                    userAvatar={user?.avatarUrl ?? undefined}
                />

                {/* 승인 현황 (대표자 전용) */}
                {isAdmin && showcase.status !== 'approved' && (
                    <section className="p-4 border border-neutral-200 bg-neutral-50">
                        <p className="text-[12px] font-bold mb-3">
                            승인 현황 ({showcase.approval_count}/3)
                            {showcase.status === 'rejected' && <span className="ml-2 text-red-500">· 반려됨</span>}
                            {showcase.status === 'pending' && <span className="ml-2 text-amber-500">· 대기 중</span>}
                        </p>
                        <ul className="space-y-2">
                            {approvals.map((a) => (
                                <li key={a.id} className="flex items-center gap-2 text-[12px]">
                                    {a.status === 'approved' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                    {a.status === 'rejected' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                                    {a.status === 'pending' && <Clock className="h-3.5 w-3.5 text-neutral-400" />}
                                    <span className="flex-1 text-neutral-700">{a.approver_email}</span>
                                    <span className="text-[10px] text-neutral-500">{a.status}</span>
                                </li>
                            ))}
                        </ul>
                        {showcase.status === 'pending' && (
                            <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed">
                                승인 요청 메일이 각 작가에게 발송되었습니다.<br />메일을 받지 못한 경우 스팸함을 확인해 주세요.
                            </p>
                        )}
                    </section>
                )}
            </article>

            {/* 작품 추가 모달 */}
            {addWorkOpen && (
                <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setAddWorkOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg max-h-[70vh] flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 shrink-0">
                            <p className="text-[13px] font-bold">전시할 작품 선택</p>
                            <button onClick={() => setAddWorkOpen(false)} className="text-[12px] text-neutral-500 hover:text-neutral-900">닫기</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {myWorks.length === 0 ? (
                                <p className="text-center text-[13px] text-neutral-500 py-8">추가할 수 있는 작품이 없습니다.</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {myWorks.map((w) => (
                                        <button key={w.id} onClick={() => handleAddWork(w)} className="group relative aspect-square bg-neutral-100 overflow-hidden">
                                            {w.images?.[0] ? (
                                                <Image src={w.images[0]} alt={w.title} fill className="object-cover" sizes="150px" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">{w.title}</div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <Plus className="h-6 w-6 text-white" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
