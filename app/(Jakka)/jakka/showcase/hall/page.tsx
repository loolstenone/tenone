"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Loader2, Heart, MessageSquare, BookOpen, Trophy } from "lucide-react";
import { getHallOfFameShowcases, type JakkaShowcaseHallEntry } from "@/lib/supabase/jakka";

const MEDALS = ["🥇", "🥈", "🥉"];

function HallCard({ entry, rank }: { entry: JakkaShowcaseHallEntry; rank: number }) {
    const sc = entry.showcase;
    const href = sc.handle ? `/jakka/showcase/${sc.handle}` : `/jakka/showcase/${sc.slug ?? sc.id}`;
    const isTop3 = rank <= 3;

    return (
        <Link href={href} className="group flex gap-4 py-5 border-b border-neutral-100 hover:bg-neutral-50 transition-colors px-4 -mx-4">
            {/* 순위 */}
            <div className="w-10 shrink-0 flex items-start justify-center pt-1">
                {rank <= 3 ? (
                    <span className="text-[22px] leading-none">{MEDALS[rank - 1]}</span>
                ) : (
                    <span className="text-[15px] font-black text-neutral-300">{rank}</span>
                )}
            </div>

            {/* 커버 */}
            <div className={`relative shrink-0 bg-neutral-100 overflow-hidden ${isTop3 ? 'w-24 h-24' : 'w-16 h-16'}`}>
                {sc.cover_image ? (
                    <Image src={sc.cover_image} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="96px" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-neutral-300" />
                    </div>
                )}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
                {sc.category && (
                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-0.5">{sc.category}</p>
                )}
                <p className={`font-black tracking-tight text-neutral-900 leading-snug mb-1 ${isTop3 ? 'text-[16px]' : 'text-[14px]'}`}>
                    {sc.title}
                </p>
                {sc.location && (
                    <p className="text-[11px] text-neutral-700 mb-2">{sc.location}</p>
                )}
                <div className="flex items-center gap-3">
                    {entry.totalLikes > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-neutral-700">
                            <Heart className="h-3 w-3" />{entry.totalLikes}
                        </span>
                    )}
                    {entry.totalComments > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-neutral-700">
                            <MessageSquare className="h-3 w-3" />{entry.totalComments}
                        </span>
                    )}
                    {entry.totalGuestbook > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-neutral-700">
                            <BookOpen className="h-3 w-3" />{entry.totalGuestbook}
                        </span>
                    )}
                    <span className="text-[11px] text-neutral-500">
                        {sc.end_date.slice(0, 7).replace('-', '.')}
                    </span>
                </div>
            </div>

            {/* 인게이지먼트 스코어 */}
            {isTop3 && (
                <div className="shrink-0 text-right pt-1">
                    <p className="text-[18px] font-black text-neutral-900">{Math.round(entry.engagementScore)}</p>
                    <p className="text-[9px] text-neutral-400 uppercase tracking-wide">점수</p>
                </div>
            )}
        </Link>
    );
}

export default function HallOfFamePage() {
    const now = new Date();
    const [year, setYear] = useState<number | null>(null);
    const [month, setMonth] = useState<number | null>(null);
    const [entries, setEntries] = useState<JakkaShowcaseHallEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // 월 이동
    const curYear = year ?? now.getFullYear();
    const curMonth = month ?? now.getMonth() + 1;

    const prevMonth = () => {
        if (curMonth === 1) { setYear(curYear - 1); setMonth(12); }
        else { setYear(curYear); setMonth(curMonth - 1); }
    };

    const nextMonth = () => {
        const nextY = curMonth === 12 ? curYear + 1 : curYear;
        const nextM = curMonth === 12 ? 1 : curMonth + 1;
        const isInFuture = nextY > now.getFullYear() || (nextY === now.getFullYear() && nextM > now.getMonth() + 1);
        if (isInFuture) return;
        setYear(nextY);
        setMonth(nextM);
    };

    const isCurrentMonth = curYear === now.getFullYear() && curMonth === now.getMonth() + 1;
    const isAllTime = year === null && month === null;

    useEffect(() => {
        setLoading(true);
        getHallOfFameShowcases(20, year ?? undefined, month ?? undefined)
            .then((data) => { setEntries(data); setLoading(false); });
    }, [year, month]);

    const monthLabel = `${curYear}년 ${curMonth}월`;

    return (
        <div className="min-h-screen bg-white">
            {/* 헤더 */}
            <div className="px-5 pt-8 pb-0">
                <Link href="/jakka/showcase" className="inline-flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-neutral-900 mb-6">
                    <ArrowLeft className="h-3 w-3" /> 쇼케이스
                </Link>
            </div>

            <div className="px-5 pt-2 pb-8 border-b border-neutral-200">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <Trophy className="h-7 w-7 text-neutral-900 stroke-[2]" />
                        <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase">Hall of Fame</p>
                    </div>
                    <h1 className="text-[28px] font-black tracking-tight text-neutral-900 leading-tight mb-2">명예의 전당</h1>
                    <p className="text-[13px] text-neutral-700 leading-relaxed">
                        오프라인이 끝나도 Jakka 쇼케이스는 사라지지 않습니다.<br />
                        가장 많은 반응을 얻은 전시들이 여기 남습니다.
                    </p>
                </div>
            </div>

            {/* 월 네비게이션 */}
            <div className="max-w-2xl mx-auto px-5 pt-5 pb-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setYear(null); setMonth(null); }}
                            className={`text-[11px] font-bold px-3 py-1.5 transition-colors ${isAllTime ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:text-neutral-900'}`}
                        >
                            전체
                        </button>
                        <button
                            onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); }}
                            className={`text-[11px] font-bold px-3 py-1.5 transition-colors ${isCurrentMonth && !isAllTime ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:text-neutral-900'}`}
                        >
                            이번 달
                        </button>
                    </div>

                    {!isAllTime && (
                        <div className="flex items-center gap-3">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-neutral-100 transition-colors">
                                <ArrowLeft className="h-3.5 w-3.5 text-neutral-700" />
                            </button>
                            <span className="text-[13px] font-bold text-neutral-900 min-w-[80px] text-center">{monthLabel}</span>
                            <button
                                onClick={nextMonth}
                                disabled={isCurrentMonth}
                                className="p-1.5 hover:bg-neutral-100 transition-colors disabled:opacity-30"
                            >
                                <ArrowRight className="h-3.5 w-3.5 text-neutral-700" />
                            </button>
                        </div>
                    )}
                </div>

                {!isAllTime && (
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-4 mb-0">
                        {monthLabel}의 명예의 전당
                    </p>
                )}
            </div>

            <div className="max-w-2xl mx-auto px-5 py-4">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="py-24 text-center">
                        <Trophy className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
                        <p className="text-[15px] font-bold text-neutral-900 mb-2">
                            {isAllTime ? "아직 등록된 기록이 없습니다" : `${monthLabel}에 등록된 기록이 없습니다`}
                        </p>
                        <p className="text-[13px] text-neutral-500">쇼케이스가 종료되면 자동으로 집계됩니다.</p>
                    </div>
                ) : (
                    <div>
                        {/* Top 3 강조 */}
                        {entries.slice(0, 3).map((e, i) => (
                            <HallCard key={e.showcase.id} entry={e} rank={i + 1} />
                        ))}
                        {entries.length > 3 && (
                            <>
                                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-6 mb-2 px-0">그 외</p>
                                {entries.slice(3).map((e, i) => (
                                    <HallCard key={e.showcase.id} entry={e} rank={i + 4} />
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
