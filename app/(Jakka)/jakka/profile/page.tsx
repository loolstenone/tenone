"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings, Share2, Check, Link as LinkIcon, ExternalLink, Plus, Star, Globe, Loader2, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { currentLoginHref } from "@/lib/login-href";
import {
    getMyCreatorProfile, getWorksByCreator, updateCreatorProfile, createCreatorProfile,
    isHandleAvailable, generateHandle,
    getFollowingFeed, getFollowersFeed, getLikedWorks,
    type JakkaCreator, type JakkaWork,
} from "@/lib/supabase/jakka";
import { useRouter } from "next/navigation";

type MySection = "posts" | "following" | "followers" | "likes";

function OnboardingForm({ userId, email, onCreated }: { userId: string; email: string; onCreated: (c: JakkaCreator) => void }) {
    const [handle, setHandle] = useState(() => generateHandle(email));
    const [displayName, setDisplayName] = useState("");
    const [checking, setChecking] = useState(false);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function checkHandle(h: string) {
        setChecking(true);
        const ok = await isHandleAvailable(h, userId);
        setAvailable(ok);
        setChecking(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!displayName.trim() || available === false) return;
        setSubmitting(true);
        const creator = await createCreatorProfile({ userId, email, handle, displayName: displayName.trim() });
        setSubmitting(false);
        if (creator) onCreated(creator);
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
            <div className="w-full max-w-[400px]">
                <h2 className="text-[22px] font-bold mb-1">JAKKA 프로필 만들기</h2>
                <p className="text-[13px] text-neutral-600 mb-8">창작자 핸들과 이름을 설정해 주세요.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <p className="text-[11px] font-mono text-neutral-600 tracking-widest uppercase mb-2">핸들</p>
                        <input
                            value={handle}
                            onChange={(e) => {
                                const v = e.target.value.startsWith("@") ? e.target.value : `@${e.target.value}`;
                                setHandle(v);
                                setAvailable(null);
                            }}
                            onBlur={() => checkHandle(handle)}
                            className="w-full border border-neutral-300 px-3 py-2.5 text-[15px] text-neutral-900 focus:outline-none focus:border-neutral-900"
                        />
                        {checking && <p className="text-[11px] text-neutral-500 mt-1">확인 중...</p>}
                        {available === true && <p className="text-[11px] text-green-600 mt-1">사용 가능한 핸들입니다.</p>}
                        {available === false && <p className="text-[11px] text-red-500 mt-1">이미 사용 중인 핸들입니다.</p>}
                    </div>
                    <div>
                        <p className="text-[11px] font-mono text-neutral-600 tracking-widest uppercase mb-2">이름</p>
                        <input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="표시될 이름"
                            className="w-full border border-neutral-300 px-3 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting || available === false || !displayName.trim()}
                        className="w-full py-3 bg-neutral-900 text-white text-[13px] font-semibold disabled:opacity-40 hover:opacity-80 transition-opacity"
                    >
                        {submitting ? "생성 중..." : "프로필 만들기"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function JakkaProfilePage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [creator, setCreator] = useState<JakkaCreator | null>(null);
    const [works, setWorks] = useState<JakkaWork[]>([]);
    const [loading, setLoading] = useState(true);
    const [noProfile, setNoProfile] = useState(false);

    const [section, setSection] = useState<MySection>("posts");
    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);
    const [featuredWorkId, setFeaturedWorkId] = useState<string | null>(null);
    const [followingFeed, setFollowingFeed] = useState<JakkaWork[]>([]);
    const [followersFeed, setFollowersFeed] = useState<JakkaWork[]>([]);
    const [likedWorks, setLikedWorks] = useState<JakkaWork[]>([]);
    const [sectionLoaded, setSectionLoaded] = useState<Set<MySection>>(new Set(["posts"]));

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || !user) { router.push(currentLoginHref()); return; }
        loadProfile();
    }, [authLoading, isAuthenticated, user]);

    async function loadProfile() {
        if (!user) return;
        setLoading(true);
        try {
            const authId = user.authId;
            if (!authId) { setNoProfile(true); setLoading(false); return; }

            let c = await getMyCreatorProfile(authId);
            if (!c) {
                const handle = generateHandle(user.email);
                c = await createCreatorProfile({
                    userId: authId,
                    email: user.email,
                    handle,
                    displayName: user.name || handle.replace('@', ''),
                });
            }
            if (!c) { setNoProfile(true); setLoading(false); return; }
            const w = await getWorksByCreator(c.id);
            setCreator(c);
            setWorks(w);
            setFeaturedWorkId(c.featured_work_id);
        } catch {
            setNoProfile(true);
        } finally {
            setLoading(false);
        }
    }

    async function switchSection(s: MySection) {
        setSection(s);
        if (sectionLoaded.has(s) || !creator) return;
        if (s === "following") {
            const feed = await getFollowingFeed(creator.id);
            setFollowingFeed(feed);
        } else if (s === "followers") {
            const feed = await getFollowersFeed(creator.id);
            setFollowersFeed(feed);
        } else if (s === "likes") {
            const liked = await getLikedWorks(user?.authId ?? user?.id ?? "");
            setLikedWorks(liked);
        }
        setSectionLoaded((prev) => new Set([...prev, s]));
    }

    async function setFeatured(workId: string) {
        if (!user?.authId || !creator) return;
        const newId = featuredWorkId === workId ? null : workId;
        setFeaturedWorkId(newId);
        await updateCreatorProfile(user.authId, { featured_work_id: newId });
        setCreator((prev) => prev ? { ...prev, featured_work_id: newId } : prev);
    }

    function copyLink() {
        if (!creator) return;
        navigator.clipboard.writeText(`https://jakka.tenone.biz/${creator.handle}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function nativeShare() {
        if (!creator) return;
        const url = `https://jakka.tenone.biz/${creator.handle}`;
        if (navigator.share) {
            navigator.share({ title: `JAKKA — ${creator.display_name}`, url });
        } else {
            copyLink();
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
            </div>
        );
    }

    if (noProfile && user) {
        return <OnboardingForm userId={user.authId ?? user.id} email={user.email} onCreated={(c) => { setCreator(c); setNoProfile(false); }} />;
    }

    if (!creator) return null;

    const featuredWork = works.find((w) => w.id === featuredWorkId);
    const shareUrl = `jakka.tenone.biz/${creator.handle}`;

    return (
        <>
        {/* Share Sheet */}
        {showShare && (
            <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowShare(false)} />
                <div className="relative w-full max-w-[420px] bg-white rounded-t-2xl md:rounded-2xl p-5 pb-8 md:pb-5 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[15px] font-semibold">포트폴리오 공유</p>
                        <button onClick={() => setShowShare(false)} className="text-neutral-600 hover:text-neutral-900 text-[13px]">닫기</button>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-300 px-3 py-2.5 rounded-lg mb-4">
                        <LinkIcon className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
                        <span className="text-[13px] text-neutral-700 flex-1 truncate">{shareUrl}</span>
                        <button
                            onClick={copyLink}
                            className={`text-[12px] font-semibold shrink-0 transition-colors flex items-center gap-1 ${copied ? "text-green-600" : "text-neutral-900 hover:opacity-70"}`}
                        >
                            {copied ? <><Check className="h-3.5 w-3.5" /> 복사됨</> : "복사"}
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: "링크 복사", icon: "🔗", action: copyLink },
                            { label: "카카오톡", icon: "💬", action: nativeShare },
                            { label: "인스타그램", icon: "📸", action: nativeShare },
                            { label: "더 보기", icon: "⋯", action: nativeShare },
                        ].map((item) => (
                            <button key={item.label} onClick={item.action} className="flex flex-col items-center gap-1.5 group">
                                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-[20px] group-hover:bg-neutral-200 transition-colors">
                                    {item.icon}
                                </div>
                                <span className="text-[10px] text-neutral-600">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* ── 프로필 헤더 ── */}
        <div className="relative px-4 pt-6 pb-5 md:px-8 md:pt-8 border-b border-neutral-100 overflow-hidden">
            {featuredWork && featuredWork.images[0] && (
                <div className="absolute inset-0">
                    <Image src={featuredWork.images[0]} alt="" fill className="object-cover opacity-20" sizes="100vw" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white" />
                </div>
            )}
            <div className="relative z-10">
            <div className="flex items-start gap-5 md:gap-8 mb-5">
                <div className="shrink-0">
                    <div className="w-[72px] h-[72px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden bg-neutral-200">
                        {user?.avatarUrl ? (
                            <Image src={user.avatarUrl} alt="profile" width={100} height={100} className="object-cover w-full h-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[28px] font-black text-neutral-700 bg-neutral-100">
                                {creator.display_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                    <h1 className="text-[22px] font-black tracking-tight leading-none mb-1.5 text-neutral-900">{creator.display_name}</h1>
                    <div className="flex items-center gap-2 flex-wrap mb-2.5">
                        <p className="text-[12px] font-mono font-semibold text-neutral-500">{creator.handle}</p>
                        <Link href="/profile" className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-neutral-600 hover:text-neutral-700 transition-colors">
                            <Globe className="h-3 w-3" />
                            Universe
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {creator.status && (
                            <span className="text-[11px] font-bold text-neutral-900 border border-neutral-900 px-2.5 py-0.5">
                                {creator.status}
                            </span>
                        )}
                        {(creator.field || creator.year_level || creator.school) && (
                            <span className="text-[11px] font-semibold text-neutral-600 border border-neutral-300 px-2.5 py-0.5">
                                {[creator.field, creator.year_level, creator.school].filter(Boolean).join(" · ")}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 통계 탭 */}
            <div className="flex justify-between mb-4 border-y border-neutral-100 py-3">
                {([
                    { key: "posts" as MySection,     label: "게시물", value: creator.works_count },
                    { key: "followers" as MySection, label: "팔로워", value: creator.followers_count },
                    { key: "following" as MySection, label: "팔로잉", value: creator.following_count },
                    { key: "likes" as MySection,     label: "좋아요", value: works.reduce((s, w) => s + w.likes_count, 0) },
                ] as const).map(({ key, label, value }) => (
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
                <p className="text-[14px] font-bold text-neutral-900 mb-1 leading-snug">
                    "{creator.statement}"
                </p>
            )}

            {creator.bio && (
                <p className="text-[13px] text-neutral-700 leading-relaxed mb-2">{creator.bio}</p>
            )}

            {creator.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {creator.tags.map((tag) => (
                        <span key={tag} className="text-[11px] text-neutral-500">#{tag}</span>
                    ))}
                </div>
            )}

            {creator.links.length > 0 && (
                <div className="flex gap-4 mb-5">
                    {creator.links.map((link) => (
                        <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[12px] font-semibold text-neutral-700 hover:text-neutral-900 transition-colors">
                            {link.label}
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    ))}
                </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2">
                <Link href="/jakka/upload"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-bold bg-neutral-900 text-white hover:opacity-80 transition-opacity">
                    <Plus className="h-3.5 w-3.5" />
                    작업 올리기
                </Link>
                <button onClick={() => setShowShare(true)}
                    className="p-2 border border-neutral-300 hover:border-neutral-600 transition-colors text-neutral-600">
                    <Share2 className="h-3.5 w-3.5" />
                </button>
                <Link href="/jakka/settings"
                    className="p-2 border border-neutral-300 hover:border-neutral-600 transition-colors text-neutral-600">
                    <Settings className="h-3.5 w-3.5" />
                </Link>
            </div>
        </div>
        </div>

        <div className="border-t border-neutral-200 mt-1" />

        {/* ── 게시물 탭 ── */}
        {section === "posts" && (
            works.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-[14px] font-semibold text-neutral-600 mb-1.5">아직 업로드한 작업이 없습니다.</p>
                    <p className="text-[12px] text-neutral-600 mb-6">첫 번째 작업을 올려보세요.</p>
                    <Link href="/jakka/upload"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold bg-neutral-900 text-white hover:opacity-80 transition-opacity">
                        <Plus className="h-3.5 w-3.5" />
                        첫 작업 올리기
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-px bg-neutral-100">
                    {works.map((work) => (
                        <div key={work.id} className="relative aspect-square bg-neutral-50 overflow-hidden group cursor-pointer">
                            {work.images[0] ? (
                                <Image
                                    src={work.images[0]}
                                    alt={work.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="33vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-[10px] text-neutral-500 font-mono">{work.category}</span>
                                </div>
                            )}
                            <button
                                onClick={() => setFeatured(work.id)}
                                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <Star className={`h-4 w-4 drop-shadow-md ${featuredWorkId === work.id ? "fill-amber-400 stroke-amber-400" : "stroke-white fill-black/40"}`} />
                            </button>
                            {featuredWorkId === work.id && (
                                <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-amber-400 text-white px-1.5 py-0.5 font-bold z-10">대표작</span>
                            )}
                            {work.likes_count > 0 && (
                                <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 text-white text-[10px] font-bold drop-shadow">
                                    <Heart className="h-3 w-3 fill-white stroke-none" />
                                    {work.likes_count}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )
        )}

        {/* ── 팔로잉 탭 — 내가 팔로잉하는 사람들의 작품 ── */}
        {section === "following" && (
            followingFeed.length === 0 ? (
                <div className="py-20 text-center text-neutral-600">
                    <p className="text-[14px] font-semibold mb-1">팔로잉 피드가 없습니다.</p>
                    <p className="text-[12px]">작가를 팔로우하면 여기에 작품이 나타납니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-px bg-neutral-100">
                    {followingFeed.map((work) => (
                        <Link key={work.id} href={`/jakka/${(work as { jakka_creators?: { handle: string } }).jakka_creators?.handle ?? ""}`} className="relative aspect-square bg-neutral-50 overflow-hidden group block">
                            {work.images[0] ? (
                                <Image src={work.images[0]} alt={work.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-[10px] text-neutral-500 font-mono">{work.category}</span>
                                </div>
                            )}
                            {work.likes_count > 0 && (
                                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 text-white text-[10px] font-bold drop-shadow">
                                    <Heart className="h-3 w-3 fill-white stroke-none" />{work.likes_count}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )
        )}

        {/* ── 팔로워 탭 — 나를 팔로우하는 사람들의 작품 ── */}
        {section === "followers" && (
            followersFeed.length === 0 ? (
                <div className="py-20 text-center text-neutral-600">
                    <p className="text-[14px] font-semibold mb-1">팔로워 피드가 없습니다.</p>
                    <p className="text-[12px]">나를 팔로우한 작가들의 작품이 나타납니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-px bg-neutral-100">
                    {followersFeed.map((work) => (
                        <Link key={work.id} href={`/jakka/${(work as { jakka_creators?: { handle: string } }).jakka_creators?.handle ?? ""}`} className="relative aspect-square bg-neutral-50 overflow-hidden group block">
                            {work.images[0] ? (
                                <Image src={work.images[0]} alt={work.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-[10px] text-neutral-500 font-mono">{work.category}</span>
                                </div>
                            )}
                            {work.likes_count > 0 && (
                                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 text-white text-[10px] font-bold drop-shadow">
                                    <Heart className="h-3 w-3 fill-white stroke-none" />{work.likes_count}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )
        )}

        {/* ── 좋아요 탭 — 내가 좋아요 누른 작품 ── */}
        {section === "likes" && (
            likedWorks.length === 0 ? (
                <div className="py-20 text-center text-neutral-600">
                    <p className="text-[14px] font-semibold mb-1">좋아요한 작품이 없습니다.</p>
                    <p className="text-[12px]">작품에 ♥를 누르면 여기에 모입니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-px bg-neutral-100 pb-20">
                    {likedWorks.map((work) => (
                        <button key={work.id} className="relative aspect-square bg-neutral-50 overflow-hidden group">
                            {work.images[0] ? (
                                <Image src={work.images[0]} alt={work.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-[10px] text-neutral-500 font-mono">{work.category}</span>
                                </div>
                            )}
                            <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 text-white text-[10px] font-bold drop-shadow">
                                <Heart className="h-3 w-3 fill-red-400 stroke-none" />{work.likes_count}
                            </span>
                        </button>
                    ))}
                </div>
            )
        )}
        </>
    );
}
