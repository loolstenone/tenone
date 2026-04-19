"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ExternalLink, Megaphone, Users, ImageIcon } from "lucide-react";
import { PageHeader, StatCard } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";
import type { JakkaCreator } from "@/lib/supabase/jakka";

interface CreatorRow extends Omit<JakkaCreator, "featured_work"> {
    featured_work?: { images: string[] } | null;
}

type FilterType = "전체" | "재학 중" | "졸업" | "재직 중" | "프리랜서" | "취업 준비 중" | "구직 중";

const FILTERS: FilterType[] = ["전체", "재학 중", "졸업", "재직 중", "프리랜서", "취업 준비 중", "구직 중"];

function CreatorBadge({ creator }: { creator: CreatorRow }) {
    const thumb = creator.featured_work?.images?.[0] ?? null;
    return (
        <div className="flex items-center gap-3 py-3 px-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors group">
            {/* 뱃지 이미지 */}
            <div className="w-9 h-9 shrink-0 bg-neutral-100 overflow-hidden">
                {thumb ? (
                    <Image src={thumb} alt="" width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-3.5 h-3.5 text-neutral-300" />
                    </div>
                )}
            </div>

            {/* 텍스트 정보 */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold text-neutral-900 truncate">
                        {creator.display_name}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono shrink-0">
                        {creator.handle}
                    </span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {[creator.field, creator.year_level, creator.school].filter(Boolean).join(" · ")}
                </p>
            </div>

            {/* 상태 + 작업 수 */}
            <div className="flex items-center gap-2 shrink-0">
                {creator.status && (
                    <span className="text-[10px] text-neutral-500 border border-neutral-200 px-1.5 py-0.5 bg-white">
                        {creator.status}
                    </span>
                )}
                <span className="text-[11px] text-neutral-400 w-10 text-right">
                    {creator.works_count}작업
                </span>
                <Link
                    href={`/jakka/${creator.handle.replace("@", "")}`}
                    target="_blank"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-700" />
                </Link>
            </div>
        </div>
    );
}

export default function JakkaIntraPage() {
    const [creators, setCreators] = useState<CreatorRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("전체");
    const [noticeCount, setNoticeCount] = useState(0);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        const supabase = createClient();
        const [{ data: c }, { count: nc }] = await Promise.all([
            supabase
                .from("jakka_creators")
                .select("*, featured_work:jakka_works!featured_work_id(images)")
                .order("created_at", { ascending: false }),
            supabase
                .from("jakka_notices")
                .select("*", { count: "exact", head: true })
                .eq("is_active", true),
        ]);
        setCreators((c as CreatorRow[]) ?? []);
        setNoticeCount(nc ?? 0);
        setLoading(false);
    }

    const filtered = creators.filter((c) => {
        const matchSearch =
            !search ||
            c.display_name.toLowerCase().includes(search.toLowerCase()) ||
            c.handle.toLowerCase().includes(search.toLowerCase()) ||
            (c.field ?? "").includes(search) ||
            (c.school ?? "").includes(search);
        const matchFilter = filter === "전체" || c.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <div className="p-6 max-w-3xl">
            <PageHeader title="JAKKA" description="창작자 네트워크 관리">
                <Link
                    href="/intra/ums/jakka/notices"
                    className="flex items-center gap-1.5 text-[12px] text-neutral-600 border border-neutral-200 px-3 py-1.5 hover:border-neutral-400 transition-colors"
                >
                    <Megaphone className="w-3.5 h-3.5" />
                    광고 관리
                </Link>
            </PageHeader>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <StatCard
                    label="전체 창작자"
                    value={loading ? "—" : creators.length}
                    icon={<Users className="w-4 h-4 text-neutral-400" />}
                />
                <StatCard
                    label="공개 창작자"
                    value={loading ? "—" : creators.filter((c) => c.is_public).length}
                />
                <StatCard
                    label="활성 공고"
                    value={loading ? "—" : noticeCount}
                    icon={<Megaphone className="w-4 h-4 text-neutral-400" />}
                    href="/intra/ums/jakka/notices"
                />
            </div>

            {/* 검색 + 필터 */}
            <div className="flex flex-col gap-2 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="이름, 핸들, 분야, 학교 검색"
                        className="w-full border border-neutral-200 pl-8 pr-3 py-2 text-[13px] placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`text-[11px] px-2.5 py-1 border transition-colors ${
                                filter === f
                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                    : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* 창작자 목록 */}
            <div className="border border-neutral-200 bg-white">
                <div className="flex items-center gap-3 px-4 py-2 border-b border-neutral-200 bg-neutral-50">
                    <div className="w-9 shrink-0" />
                    <span className="flex-1 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">창작자</span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest shrink-0 w-28 text-right">상태 / 작업</span>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-[13px] text-neutral-400">불러오는 중…</div>
                ) : filtered.length === 0 ? (
                    <div className="py-12 text-center text-[13px] text-neutral-400">창작자가 없습니다</div>
                ) : (
                    filtered.map((c) => <CreatorBadge key={c.id} creator={c} />)
                )}

                {!loading && (
                    <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50 text-[11px] text-neutral-400">
                        {filtered.length}명 / 전체 {creators.length}명
                    </div>
                )}
            </div>
        </div>
    );
}
