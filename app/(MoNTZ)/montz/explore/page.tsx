"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, BadgeCheck } from "lucide-react";
import {
    getAllCreators,
    type MontzCreator,
    type MontzCreatorType,
    type MontzGender,
    type MontzAgeGroup,
    type MontzSpecialty,
    type MontzAvailability,
} from "@/lib/supabase/montz";
import { PageHeader } from "@/features/jakka/PageHeader";

const AVAIL_LABEL: Record<MontzAvailability, string> = {
    active: "활동중", selective: "조건부", inactive: "휴식",
};
const AVAIL_DOT: Record<MontzAvailability, string> = {
    active: "bg-emerald-400", selective: "bg-amber-400", inactive: "bg-neutral-300",
};
const TYPE_LABEL = { model: "모델", actor: "배우", both: "모델·배우" };

function PillBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`shrink-0 text-[12px] font-bold px-3 py-1.5 border transition-colors ${
                active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-500 hover:border-neutral-700"
            }`}
        >
            {label}
        </button>
    );
}

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
                    <div className="absolute bottom-2 left-2 group">
                        <BadgeCheck className="h-5 w-5 drop-shadow" style={{ color: "#c8a97e" }} />
                        <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-10 pointer-events-none">
                            <div className="bg-neutral-900 text-white text-[11px] font-medium px-2.5 py-1.5 whitespace-nowrap">
                                MoNTZ가 확인한 공식 계정
                            </div>
                        </div>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="pt-2.5">
                <p className="text-[14px] font-black text-neutral-900 leading-none mb-1">{creator.display_name}</p>
                <p className="text-[11px] font-mono text-neutral-500 mb-1">@{creator.handle}</p>
                <div className="flex flex-wrap gap-1">
                    {creator.age_group && (
                        <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5">{creator.age_group}</span>
                    )}
                    {creator.specialties.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5">{s}</span>
                    ))}
                </div>
                {creator.height && (
                    <p className="text-[11px] text-neutral-700 mt-1">
                        {creator.height}cm
                        {creator.bust && ` · ${creator.bust}-${creator.waist}-${creator.hip}`}
                    </p>
                )}
            </div>
        </Link>
    );
}

type TypeFilter = "all" | MontzCreatorType;
type GenderFilter = "all" | MontzGender;
type AgeFilter = "all" | MontzAgeGroup;
type SpecialtyFilter = "all" | MontzSpecialty;

const AGE_GROUPS: MontzAgeGroup[] = ["어린이", "10대", "20~30대", "40~50대", "60대+"];
const SPECIALTIES: MontzSpecialty[] = ["전신", "부분", "피팅", "나레이터"];

export default function MontzExplorePage() {
    const [creators, setCreators] = useState<MontzCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
    const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");
    const [specialtyFilter, setSpecialtyFilter] = useState<SpecialtyFilter>("all");

    useEffect(() => {
        setLoading(true);
        getAllCreators({
            type: typeFilter === "all" ? undefined : typeFilter,
            gender: genderFilter === "all" ? undefined : genderFilter,
            ageGroup: ageFilter === "all" ? undefined : ageFilter,
            specialty: specialtyFilter === "all" ? undefined : specialtyFilter,
        }).then((data) => { setCreators(data); setLoading(false); });
    }, [typeFilter, genderFilter, ageFilter, specialtyFilter]);

    const filtered = search
        ? creators.filter((c) =>
            c.display_name.includes(search) ||
            c.handle.includes(search) ||
            (c.bio ?? "").includes(search),
        )
        : creators;

    const activeFilterCount = [
        typeFilter !== "all",
        genderFilter !== "all",
        ageFilter !== "all",
        specialtyFilter !== "all",
    ].filter(Boolean).length;

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
                        placeholder="이름, 핸들 검색"
                        className="w-full border border-neutral-300 pl-8 pr-3 py-2 text-[13px] placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="sticky top-[44px] md:top-0 z-10 bg-white border-b border-neutral-200">
                {/* 직종 */}
                <div className="px-5 pt-2.5 pb-1.5 flex gap-1.5 overflow-x-auto scrollbar-none border-b border-neutral-100">
                    {(["all", "model", "actor"] as const).map((k) => (
                        <PillBtn key={k} label={k === "all" ? "전체" : k === "model" ? "모델" : "배우"} active={typeFilter === k} onClick={() => setTypeFilter(k)} />
                    ))}
                </div>
                {/* 성별 */}
                <div className="px-5 pt-1.5 pb-1.5 flex gap-1.5 overflow-x-auto scrollbar-none border-b border-neutral-100">
                    {(["all", "female", "male"] as const).map((k) => (
                        <PillBtn key={k} label={k === "all" ? "남·여" : k === "female" ? "여자" : "남자"} active={genderFilter === k} onClick={() => setGenderFilter(k)} />
                    ))}
                </div>
                {/* 분야 */}
                <div className="px-5 pt-1.5 pb-1.5 flex gap-1.5 overflow-x-auto scrollbar-none border-b border-neutral-100">
                    <PillBtn label="전체" active={specialtyFilter === "all"} onClick={() => setSpecialtyFilter("all")} />
                    {SPECIALTIES.map((s) => (
                        <PillBtn key={s} label={s} active={specialtyFilter === s} onClick={() => setSpecialtyFilter(s)} />
                    ))}
                </div>
                {/* 연령대 */}
                <div className="px-5 pt-1.5 pb-2.5 flex gap-1.5 overflow-x-auto scrollbar-none">
                    <PillBtn label="전 연령" active={ageFilter === "all"} onClick={() => setAgeFilter("all")} />
                    {AGE_GROUPS.map((a) => (
                        <PillBtn key={a} label={a} active={ageFilter === a} onClick={() => setAgeFilter(a)} />
                    ))}
                </div>
            </div>

            {/* Result count */}
            {!loading && (
                <div className="px-5 pt-3 pb-1 flex items-center justify-between">
                    <p className="text-[11px] text-neutral-500">
                        {filtered.length}명
                        {activeFilterCount > 0 && <span className="ml-1 text-neutral-400">· 필터 {activeFilterCount}개 적용 중</span>}
                    </p>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => { setTypeFilter("all"); setGenderFilter("all"); setAgeFilter("all"); setSpecialtyFilter("all"); }}
                            className="text-[11px] text-neutral-500 hover:text-neutral-900 underline"
                        >
                            필터 초기화
                        </button>
                    )}
                </div>
            )}

            {/* Grid */}
            <div className="px-5 py-4">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-[14px] text-neutral-900 font-bold mb-2">
                            {search.trim()
                                ? `“${search}”에 맞는 크리에이터가 없습니다`
                                : activeFilterCount > 0
                                    ? "조건에 맞는 크리에이터가 없습니다"
                                    : "아직 등록된 크리에이터가 없습니다"}
                        </p>
                        <p className="text-[12px] text-neutral-500 mb-5 leading-relaxed">
                            {search.trim() || activeFilterCount > 0
                                ? "필터를 줄이거나 검색어를 다시 확인해 주세요."
                                : "MoNTZ에 모델·배우가 등록되면 이곳에 표시됩니다."}
                        </p>
                        {(search.trim() || activeFilterCount > 0) && (
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setTypeFilter("all");
                                    setGenderFilter("all");
                                    setAgeFilter("all");
                                    setSpecialtyFilter("all");
                                }}
                                className="text-[12px] font-bold text-neutral-900 border border-neutral-900 px-5 py-2 hover:bg-neutral-900 hover:text-white transition-colors"
                            >
                                전체 보기
                            </button>
                        )}
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
