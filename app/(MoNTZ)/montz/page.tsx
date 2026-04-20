"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getFeaturedCreators, type MontzCreator, type MontzAvailability } from "@/lib/supabase/montz";

const AVAIL_LABEL: Record<MontzAvailability, string> = {
    active: "활동중",
    selective: "외부활동",
    inactive: "비활동",
};

const AVAIL_DOT: Record<MontzAvailability, string> = {
    active: "bg-emerald-400",
    selective: "bg-amber-400",
    inactive: "bg-neutral-300",
};

const TYPE_LABEL = { model: "모델", actor: "배우", both: "모델·배우" };

function CreatorCard({ creator }: { creator: MontzCreator }) {
    return (
        <Link href={`/montz/${creator.handle}`} className="group block">
            <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={creator.avatar_url ?? ""}
                    alt={creator.display_name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                {/* Availability */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 px-1.5 py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${AVAIL_DOT[creator.availability_status]}`} />
                    <span className="text-[10px] font-bold text-neutral-900">{AVAIL_LABEL[creator.availability_status]}</span>
                </div>
                {/* Type */}
                <div className="absolute top-2 right-2 bg-neutral-900/80 px-1.5 py-0.5">
                    <span className="text-[10px] font-bold text-white">{TYPE_LABEL[creator.type]}</span>
                </div>
                {/* Verified */}
                {creator.is_verified && (
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5" style={{ backgroundColor: "#c8a97e" }}>
                        <span className="text-[10px] font-bold text-white">인증</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="pt-2.5">
                <p className="text-[14px] font-black text-neutral-900 leading-none mb-1">{creator.display_name}</p>
                <p className="text-[11px] font-mono text-neutral-500 mb-1.5">@{creator.handle}</p>
                {creator.height && (
                    <p className="text-[11px] text-neutral-700">
                        {creator.height}cm
                        {creator.bust && ` · ${creator.bust}-${creator.waist}-${creator.hip}`}
                    </p>
                )}
            </div>
        </Link>
    );
}

export default function MontzHome() {
    const [creators, setCreators] = useState<MontzCreator[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFeaturedCreators(8).then((data) => { setCreators(data); setLoading(false); });
    }, []);

    const featured = creators.slice(0, 2);
    const grid = creators.slice(2);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="border-b border-neutral-200 px-5 pt-8 pb-7">
                <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase mb-2">MoNTZ</p>
                <h1 className="text-[32px] font-black tracking-tight leading-none text-neutral-900 mb-2">
                    모델 · 배우<br />포트폴리오
                </h1>
                <p className="text-[13px] text-neutral-700 mb-5">
                    검증된 크리에이터를 발견하고, 오디션·캐스팅 공고에 지원하세요.
                </p>
                <div className="flex gap-2">
                    <Link
                        href="/montz/explore"
                        className="text-[12px] font-bold text-white bg-neutral-900 px-4 py-2 hover:bg-neutral-700 transition-colors"
                    >
                        크리에이터 탐색
                    </Link>
                    <Link
                        href="/montz/audition"
                        className="text-[12px] font-bold text-neutral-900 border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                        오디션 보기
                    </Link>
                </div>
            </section>

            {/* Featured Creators */}
            {!loading && featured.length > 0 && (
                <section className="px-5 pt-7 pb-6 border-b border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase">이번 주 주목</p>
                        <Link href="/montz/explore" className="flex items-center gap-0.5 text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors">
                            전체 보기 <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {featured.map((c) => <CreatorCard key={c.id} creator={c} />)}
                    </div>
                </section>
            )}

            {/* All Creators Grid */}
            {!loading && grid.length > 0 && (
                <section className="px-5 pt-7 pb-8">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase">활동 중인 크리에이터</p>
                        <Link href="/montz/explore" className="flex items-center gap-0.5 text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors">
                            전체 보기 <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {grid.map((c) => <CreatorCard key={c.id} creator={c} />)}
                    </div>
                </section>
            )}

            {loading && (
                <div className="flex justify-center py-20">
                    <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
