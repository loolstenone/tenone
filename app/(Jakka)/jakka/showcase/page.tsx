"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Loader2, Plus, MapPin, Heart, Trophy, Flame, Sparkles, Clock } from "lucide-react";
import {
    getApprovedShowcases, getHotShowcases, getNewShowcases, getUpcomingShowcases,
    type JakkaShowcase,
} from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";

type TabKey = 'all' | 'hot' | 'new' | 'upcoming';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: '전체', icon: Sparkles },
    { key: 'hot', label: 'Hot', icon: Flame },
    { key: 'new', label: 'New', icon: Sparkles },
    { key: 'upcoming', label: '임박', icon: Clock },
];

function getShowcaseStatus(sc: JakkaShowcase): { label: string; style: string; isEnded: boolean } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(sc.start_date);
    const end = new Date(sc.end_date);
    end.setHours(23, 59, 59, 999);

    if (sc.status === 'ended' || today > end) return { label: "온라인", style: "bg-neutral-200 text-neutral-700", isEnded: true };
    if (today < start) {
        const diff = Math.ceil((start.getTime() - today.getTime()) / 86400000);
        return { label: diff <= 7 ? `D-${diff}` : `${sc.start_date.slice(5, 10)} 예정`, style: "bg-neutral-900 text-white", isEnded: false };
    }
    return { label: "진행 중", style: "bg-green-600 text-white", isEnded: false };
}

function ShowcaseCard({ sc }: { sc: JakkaShowcase }) {
    const status = getShowcaseStatus(sc);
    return (
        <Link href={`/jakka/showcase/${sc.slug}`} className="group block">
            <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden mb-3">
                {sc.cover_image ? (
                    <Image
                        src={sc.cover_image}
                        alt={sc.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width:768px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[11px] font-mono text-neutral-300 tracking-widest uppercase">No Image</span>
                    </div>
                )}
                <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 tracking-wide ${status.style}`}>
                    {status.label}
                </span>
                {sc.interests_count > 0 && (
                    <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/50 text-white text-[10px] px-2 py-0.5">
                        <Heart className="h-2.5 w-2.5 fill-white" />
                        {sc.interests_count}
                    </span>
                )}
            </div>
            <div>
                {sc.category && (
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.15em] mb-1">{sc.category}</p>
                )}
                <p className="text-[15px] font-black tracking-tight leading-snug text-neutral-900 mb-1 group-hover:opacity-70 transition-opacity">
                    {sc.title}
                </p>
                {sc.subtitle && (
                    <p className="text-[12px] text-neutral-700 mb-1.5 line-clamp-1">{sc.subtitle}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-700">
                    <span>{sc.start_date.slice(0, 7).replace('-', '.')} ~ {sc.end_date.slice(5, 10).replace('-', '.')}</span>
                    {sc.location && (
                        <span className="flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {sc.location}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function ShowcaseListPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<TabKey>('all');
    const [showcases, setShowcases] = useState<JakkaShowcase[]>([]);
    const [tabData, setTabData] = useState<JakkaShowcase[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabLoading, setTabLoading] = useState(false);

    useEffect(() => {
        getApprovedShowcases(40).then((list) => { setShowcases(list); setLoading(false); });
    }, []);

    useEffect(() => {
        if (tab === 'all') return;
        setTabLoading(true);
        const fn = tab === 'hot'
            ? getHotShowcases(20)
            : tab === 'new'
            ? getNewShowcases(20)
            : getUpcomingShowcases(20);
        fn.then((data) => { setTabData(data); setTabLoading(false); });
    }, [tab]);

    const ongoing = showcases.filter((sc) => !getShowcaseStatus(sc).isEnded && new Date(sc.start_date) <= new Date());
    const upcoming = showcases.filter((sc) => !getShowcaseStatus(sc).isEnded && new Date(sc.start_date) > new Date());
    const ended = showcases.filter((sc) => getShowcaseStatus(sc).isEnded);

    return (
        <div className="min-h-screen bg-white">
            {/* 헤더 */}
            <div className="px-5 pt-8 pb-6 border-b border-neutral-200">
                <div className="max-w-3xl mx-auto flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase mb-2">Showcase</p>
                        <h1 className="text-[28px] font-black tracking-tight text-neutral-900 leading-tight mb-1">쇼케이스</h1>
                        <p className="text-[13px] text-neutral-700 leading-relaxed">
                            졸업전시 · 동호회 · 취미 전시. 작가들이 함께 만드는 공간.
                        </p>
                    </div>
                    {user && (
                        <Link
                            href="/jakka/showcase/new"
                            className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-bold bg-neutral-900 text-white px-4 py-2.5 hover:bg-neutral-700 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            신청하기
                        </Link>
                    )}
                </div>
            </div>

            {/* 탭 */}
            <div className="sticky top-0 bg-white z-10 border-b border-neutral-200">
                <div className="max-w-3xl mx-auto px-5 py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`shrink-0 text-[12px] font-bold px-3 py-1.5 border transition-colors ${
                                tab === key
                                    ? 'border-neutral-900 bg-neutral-900 text-white'
                                    : 'border-neutral-300 text-neutral-500 hover:border-neutral-700'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                    <Link
                        href="/jakka/showcase/hall"
                        className="shrink-0 ml-auto flex items-center gap-1.5 text-[12px] font-bold text-neutral-500 hover:text-neutral-900 transition-colors px-3 py-1.5 border border-transparent hover:border-neutral-300"
                    >
                        <Trophy className="h-3.5 w-3.5" />
                        전당
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
            ) : tab !== 'all' ? (
                /* 탭 필터 뷰 */
                <div className="max-w-3xl mx-auto px-5 py-8">
                    {tabLoading ? (
                        <div className="py-16 flex justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                        </div>
                    ) : tabData.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-[15px] font-bold text-neutral-900 mb-2">
                                {tab === 'hot' && "이번 달 인기 쇼케이스가 없습니다"}
                                {tab === 'new' && "최근 7일 내 새 쇼케이스가 없습니다"}
                                {tab === 'upcoming' && "곧 시작하는 전시가 없습니다"}
                            </p>
                            <p className="text-[13px] text-neutral-500">조금 후에 다시 확인해 보세요.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-[11px] font-bold text-neutral-500 tracking-[0.15em] uppercase mb-5">
                                {tab === 'hot' && `이번 달 인기 쇼케이스 · ${tabData.length}개`}
                                {tab === 'new' && `최근 7일 · ${tabData.length}개`}
                                {tab === 'upcoming' && `곧 시작해요 · ${tabData.length}개`}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                {tabData.map((sc) => <ShowcaseCard key={sc.id} sc={sc} />)}
                            </div>
                        </>
                    )}
                </div>
            ) : showcases.length === 0 ? (
                <div className="py-32 text-center px-6">
                    <p className="text-[28px] font-black text-neutral-900 mb-3">첫 쇼케이스를 열어보세요</p>
                    <p className="text-[14px] text-neutral-700 mb-8 leading-relaxed">
                        졸업전시, 동호회 전시, 그룹 작업물—<br />
                        함께하는 3명의 승인으로 공개됩니다.
                    </p>
                    {user ? (
                        <Link
                            href="/jakka/showcase/new"
                            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 text-[13px] font-bold hover:bg-neutral-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            쇼케이스 신청
                        </Link>
                    ) : (
                        <p className="text-[13px] text-neutral-500">로그인 후 신청할 수 있습니다.</p>
                    )}
                </div>
            ) : (
                <div className="max-w-3xl mx-auto px-5 py-8 space-y-12">
                    {ongoing.length > 0 && (
                        <section>
                            <p className="text-[11px] font-bold text-green-600 tracking-[0.15em] uppercase mb-4">지금 열려 있어요</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                {ongoing.map((sc) => <ShowcaseCard key={sc.id} sc={sc} />)}
                            </div>
                        </section>
                    )}
                    {upcoming.length > 0 && (
                        <section>
                            <p className="text-[11px] font-bold text-neutral-500 tracking-[0.15em] uppercase mb-4">곧 시작돼요</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                {upcoming.map((sc) => <ShowcaseCard key={sc.id} sc={sc} />)}
                            </div>
                        </section>
                    )}
                    {ended.length > 0 && (
                        <section>
                            <div className="flex items-baseline gap-2 mb-4">
                                <p className="text-[11px] font-bold text-neutral-500 tracking-[0.15em] uppercase">지난 전시 — 온라인 계속 중</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                {ended.map((sc) => <ShowcaseCard key={sc.id} sc={sc} />)}
                            </div>
                        </section>
                    )}

                    {/* 명예의 전당 */}
                    <Link
                        href="/jakka/showcase/hall"
                        className="flex items-center justify-between p-4 border border-neutral-200 hover:border-neutral-900 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Trophy className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                            <div>
                                <p className="text-[13px] font-bold text-neutral-900">명예의 전당</p>
                                <p className="text-[11px] text-neutral-500">가장 많은 반응을 얻었던 전시들</p>
                            </div>
                        </div>
                        <span className="text-[12px] text-neutral-400 group-hover:text-neutral-900">→</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
