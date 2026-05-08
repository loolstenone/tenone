"use client";

// 마이버스 소셜 피드 — 팔로잉 / 탐색 두 모드

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Users as UsersIcon, MapPin, Compass, Globe, RefreshCw, Loader2, UserPlus } from "lucide-react";
import { DOMAINS, type DomainKey } from "@/lib/myverse/domains";
import { ReportBlockMenu } from "./ReportBlockMenu";

interface FeedMoment {
    id: string;
    member_id: string;
    date: string;
    domain: DomainKey | null;
    sub_tags: string[] | null;
    media_type: "image" | "video";
    media_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    happened_at: string | null;
    location: string | null;
    with_whom: string | null;
    activity: string | null;
    created_at: string;
}

interface FeedMember {
    id: string;
    name: string | null;
    handle: string | null;
    avatar_url: string | null;
}

interface FeedItem {
    moment: FeedMoment;
    member: FeedMember | null;
    reactions_count: number;
    comments_count: number;
    my_reaction: string | null;
}

interface SuggestedUser {
    id: string;
    name: string | null;
    handle: string | null;
    avatar_url: string | null;
    bio: string | null;
    public_count: number;
}

type Mode = "following" | "discover";

export function SocialFeedView() {
    const [mode, setMode] = useState<Mode>("following");
    const [items, setItems] = useState<FeedItem[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [suggested, setSuggested] = useState<SuggestedUser[]>([]);
    const [openComments, setOpenComments] = useState<string | null>(null);
    const [meId, setMeId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/myverse/me").then(r => r.ok ? r.json() : null).then(d => setMeId(d?.member?.id ?? null)).catch(() => {});
    }, []);

    const load = useCallback(async (reset: boolean) => {
        setLoading(true);
        try {
            const c = reset ? null : cursor;
            const url = `/api/myverse/social/feed?mode=${mode}${c ? `&cursor=${encodeURIComponent(c)}` : ""}`;
            const res = await fetch(url);
            if (!res.ok) return;
            const d = await res.json();
            setItems(prev => reset ? d.items : [...prev, ...d.items]);
            setCursor(d.next_cursor);
            setHasMore(!!d.next_cursor);
        } finally {
            setLoading(false);
        }
    }, [mode, cursor]);

    useEffect(() => {
        load(true);
        // 추천 친구 로드 (팔로잉 탭에서만)
        if (mode === "following") {
            fetch("/api/myverse/social/suggested")
                .then(r => r.json())
                .then(d => setSuggested(d.users ?? []))
                .catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
            {/* 헤더 */}
            <div className="mb-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-1">
                    <Compass className="h-3.5 w-3.5" />
                    FEED
                </div>
                <h1 className="text-3xl font-semibold text-neutral-900">피드</h1>
                <p className="text-sm text-neutral-500 mt-1">
                    팔로우한 사람들의 공개 흔적이 모입니다
                </p>
            </div>

            {/* 모드 토글 */}
            <div className="flex border-b border-neutral-200 mb-5">
                <button
                    onClick={() => setMode("following")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        mode === "following"
                            ? "border-[#6366F1] text-[#6366F1]"
                            : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                >
                    팔로잉
                </button>
                <button
                    onClick={() => setMode("discover")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        mode === "discover"
                            ? "border-[#6366F1] text-[#6366F1]"
                            : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                >
                    탐색
                </button>
                <button
                    onClick={() => load(true)}
                    title="새로고침"
                    className="ml-auto px-3 text-neutral-400 hover:text-[#6366F1]"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* 추천 친구 (팔로잉 탭이 비어 있거나 항상 노출) */}
            {mode === "following" && suggested.length > 0 && items.length < 3 && (
                <section className="mb-6">
                    <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1">
                        <UserPlus className="h-3 w-3" />
                        추천 사용자
                    </h2>
                    <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                        {suggested.map(u => (
                            <Link
                                key={u.id}
                                href={`/myverse/v/${u.handle}`}
                                className="shrink-0 w-32 bg-white border border-neutral-200 rounded-xl p-3 hover:border-[#6366F1] transition-colors"
                            >
                                <div className="h-12 w-12 rounded-full mx-auto mb-2 overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center">
                                    {u.avatar_url ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white text-sm font-semibold">{u.name?.[0] ?? "?"}</span>
                                    )}
                                </div>
                                <div className="text-xs font-medium text-neutral-900 text-center truncate">{u.name}</div>
                                <div className="text-[10px] text-neutral-500 text-center truncate">@{u.handle}</div>
                                <div className="text-[10px] text-[#6366F1] text-center mt-1">공개 흔적 {u.public_count}</div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* 피드 */}
            {items.length === 0 && !loading ? (
                <EmptyFeed mode={mode} onSwitch={() => setMode("discover")} />
            ) : (
                <div className="space-y-5">
                    {items.map(it => (
                        <FeedItemCard
                            key={it.moment.id}
                            item={it}
                            meId={meId}
                            commentsOpen={openComments === it.moment.id}
                            onToggleComments={() => setOpenComments(openComments === it.moment.id ? null : it.moment.id)}
                            onChange={() => load(true)}
                            onBlocked={() => load(true)}
                        />
                    ))}
                </div>
            )}

            {hasMore && items.length > 0 && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => load(false)}
                        disabled={loading}
                        className="px-4 py-2 bg-white border border-neutral-200 hover:border-[#6366F1] hover:text-[#6366F1] text-neutral-700 text-xs rounded-lg disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                        더 보기
                    </button>
                </div>
            )}
        </div>
    );
}

function EmptyFeed({ mode, onSwitch }: { mode: Mode; onSwitch: () => void }) {
    return (
        <div className="border border-dashed border-neutral-300 rounded-xl py-14 px-6 text-center">
            <div className="h-12 w-12 rounded-full bg-[#6366F1]/10 flex items-center justify-center mx-auto mb-3">
                <Compass className="h-5 w-5 text-[#6366F1]" />
            </div>
            {mode === "following" ? (
                <>
                    <h3 className="text-base font-medium text-neutral-800 mb-1">아직 팔로잉이 없어요</h3>
                    <p className="text-sm text-neutral-500 mb-4">
                        다른 사용자의 Verse 페이지를 방문하거나 탐색에서 둘러보세요
                    </p>
                    <button
                        onClick={onSwitch}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg text-xs font-medium"
                    >
                        <Compass className="h-3.5 w-3.5" />
                        탐색 둘러보기
                    </button>
                </>
            ) : (
                <>
                    <h3 className="text-base font-medium text-neutral-800 mb-1">아직 공개된 흔적이 없어요</h3>
                    <p className="text-sm text-neutral-500">
                        흔적을 공개로 토글하면 다른 사용자의 피드에 등장합니다
                    </p>
                </>
            )}
        </div>
    );
}

function FeedItemCard({ item, meId, commentsOpen, onToggleComments, onChange, onBlocked }: {
    item: FeedItem;
    meId: string | null;
    commentsOpen: boolean;
    onToggleComments: () => void;
    onChange: () => void;
    onBlocked: () => void;
}) {
    const { moment, member } = item;
    const isMine = !!meId && moment.member_id === meId;
    const [reactions, setReactions] = useState(item.reactions_count);
    const [myReaction, setMyReaction] = useState<string | null>(item.my_reaction);
    const domainMeta = moment.domain ? DOMAINS[moment.domain] : null;
    const dateLabel = new Date(moment.created_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

    async function toggleReact() {
        const next = myReaction ? null : "heart";
        setMyReaction(next);
        setReactions(r => r + (next ? 1 : -1));
        if (next) {
            await fetch(`/api/myverse/moments/${moment.id}/react`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "heart" }) });
        } else {
            await fetch(`/api/myverse/moments/${moment.id}/react?type=heart`, { method: "DELETE" });
        }
    }

    return (
        <article className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {/* 헤더 */}
            <div className="flex items-center gap-2 p-3">
                <Link href={`/myverse/v/${member?.handle}`} className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center shrink-0">
                    {member?.avatar_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-white text-xs font-semibold">{member?.name?.[0] ?? "?"}</span>
                    )}
                </Link>
                <div className="flex-1 min-w-0">
                    <Link href={`/myverse/v/${member?.handle}`} className="block">
                        <div className="text-sm font-medium text-neutral-900 truncate">{member?.name ?? "—"}</div>
                        <div className="text-[10px] text-neutral-500 truncate">@{member?.handle} · {dateLabel}</div>
                    </Link>
                </div>
                {domainMeta && (
                    <span
                        className="text-[10px] font-medium text-white px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: domainMeta.color_hex }}
                    >
                        {domainMeta.label_ko}
                    </span>
                )}
            </div>

            {/* 미디어 */}
            <div className="relative bg-neutral-100">
                {moment.media_type === "image" ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={moment.media_url}
                        alt={moment.caption || ""}
                        className="w-full max-h-[600px] object-contain bg-black/5"
                        loading="lazy"
                    />
                ) : (
                    <video src={moment.media_url} className="w-full max-h-[600px]" controls playsInline />
                )}
            </div>

            {/* 액션 + 본문 */}
            <div className="p-3 space-y-2">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleReact}
                        className="inline-flex items-center gap-1 text-sm text-neutral-700 hover:text-rose-500 transition-colors"
                    >
                        <Heart className={`h-5 w-5 ${myReaction ? "fill-rose-500 text-rose-500" : ""}`} />
                        {reactions > 0 && <span className="text-xs tabular-nums">{reactions}</span>}
                    </button>
                    <button
                        onClick={onToggleComments}
                        className="inline-flex items-center gap-1 text-sm text-neutral-700 hover:text-[#6366F1] transition-colors"
                    >
                        <MessageCircle className="h-5 w-5" />
                        {item.comments_count > 0 && <span className="text-xs tabular-nums">{item.comments_count}</span>}
                    </button>
                </div>

                {moment.caption && (
                    <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                        {moment.caption}
                    </p>
                )}

                {(moment.location || moment.with_whom || moment.activity) && (
                    <div className="flex flex-wrap gap-2 text-[11px] text-neutral-500">
                        {moment.location && <span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{moment.location}</span>}
                        {moment.with_whom && <span className="inline-flex items-center gap-0.5"><UsersIcon className="h-2.5 w-2.5" />{moment.with_whom}</span>}
                        {moment.activity && <span>· {moment.activity}</span>}
                    </div>
                )}

                {moment.sub_tags && moment.sub_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                        {moment.sub_tags.slice(0, 5).map(t => (
                            <span key={t} className="text-[10px] text-neutral-500">#{t}</span>
                        ))}
                    </div>
                )}

                {commentsOpen && (
                    <CommentsSection momentId={moment.id} onChange={onChange} />
                )}

                {!isMine && (
                    <div className="pt-1 flex justify-end">
                        <ReportBlockMenu
                            momentId={moment.id}
                            authorId={moment.member_id}
                            authorName={member?.name ?? null}
                            isMine={false}
                            onBlocked={onBlocked}
                        />
                    </div>
                )}
            </div>
        </article>
    );
}

function CommentsSection({ momentId, onChange }: { momentId: string; onChange: () => void }) {
    const [comments, setComments] = useState<{ id: string; body: string; created_at: string; member: { name: string; handle: string; avatar_url: string | null } | null }[]>([]);
    const [text, setText] = useState("");
    const [posting, setPosting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/myverse/moments/${momentId}/comments`)
            .then(r => r.json())
            .then(d => { setComments(d.comments ?? []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [momentId]);

    async function post() {
        if (!text.trim() || posting) return;
        setPosting(true);
        try {
            const res = await fetch(`/api/myverse/moments/${momentId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: text }),
            });
            if (res.ok) {
                setText("");
                const r = await fetch(`/api/myverse/moments/${momentId}/comments`);
                if (r.ok) { const d = await r.json(); setComments(d.comments ?? []); }
                onChange();
            }
        } finally {
            setPosting(false);
        }
    }

    return (
        <div className="border-t border-neutral-100 pt-3 mt-2 space-y-2">
            {loading ? (
                <p className="text-xs text-neutral-400 italic">불러오는 중…</p>
            ) : comments.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">첫 댓글을 남겨 보세요</p>
            ) : (
                <div className="space-y-1.5">
                    {comments.map(c => (
                        <div key={c.id} className="text-xs">
                            <span className="font-medium text-neutral-900">{c.member?.name ?? "—"}</span>
                            <span className="text-neutral-400 ml-1">@{c.member?.handle}</span>
                            <span className="text-neutral-700 ml-2">{c.body}</span>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex items-center gap-2 pt-1">
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") post(); }}
                    placeholder="댓글 달기…"
                    maxLength={500}
                    className="flex-1 text-xs bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-[#6366F1] placeholder:text-neutral-400"
                />
                <button
                    onClick={post}
                    disabled={!text.trim() || posting}
                    className="text-xs font-medium text-[#6366F1] disabled:opacity-30"
                >
                    게시
                </button>
            </div>
        </div>
    );
}
