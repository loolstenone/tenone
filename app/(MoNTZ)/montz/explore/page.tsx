"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { getAllCreators, type MontzCreator, type MontzCreatorType, type MontzAvailability } from "@/lib/supabase/montz";
import { PageHeader } from "@/features/jakka/PageHeader";

const TYPE_TABS: { key: "all" | MontzCreatorType; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "model", label: "모델" },
    { key: "actor", label: "배우" },
    { key: "both", label: "모델·배우" },
];

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
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 px-1.5 py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${AVAIL_DOT[creator.availability_status]}`} />
                    <span className="text-[10px] font-bold text-neutral-900">{AVAIL_LABEL[creator.availability_status]}</span>
                </div>
                <div className="absolute top-2 right-2 bg-neutral-900/80 px-1.5 py-0.5">
                    <span className="text-[10px] font-bold text-white">{TYPE_LABEL[creator.type]}</span>
                </div>
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

export default function MontzExplorePage() {
    const [creators, setCreators] = useState<MontzCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState<"all" | MontzCreatorType>("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        setLoading(true);
        getAllCreators(
            activeType === "all" ? undefined : activeType,
        ).then((data) => { setCreators(data); setLoading(false); });
    }, [activeType]);

    const filtered = search
        ? creators.filter(
            (c) =>
                c.display_name.includes(search) ||
                c.handle.includes(search) ||
                (c.bio ?? "").includes(search),
        )
        : creators;

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                eyebrow="Explore"
                title="탐색"
                subtitle="모델·배우 크리에이터를 찾아보세요."
            />

            {/* Search */}
            <div className="px-5 pt-4 pb-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="이름, 핸들, 전문 분야 검색"
                        className="w-full border border-neutral-300 pl-8 pr-3 py-2 text-[13px] placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
                    />
                </div>
            </div>

            {/* Type Tabs */}
            <div className="sticky top-[44px] md:top-0 z-10 bg-white border-b border-neutral-200 px-5 py-2.5">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                    {TYPE_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveType(tab.key)}
                            className={`shrink-0 text-[12px] font-bold px-3 py-1.5 border transition-colors ${
                                activeType === tab.key
                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                    : "border-neutral-300 text-neutral-500 hover:border-neutral-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="px-5 py-5">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-[13px] text-neutral-500">
                        크리에이터가 없습니다.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map((c) => <CreatorCard key={c.id} creator={c} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
