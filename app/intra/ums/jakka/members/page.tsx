"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ExternalLink, ImageIcon, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { JakkaCreator } from "@/lib/supabase/jakka";

interface CreatorRow extends Omit<JakkaCreator, "featured_work"> {
    featured_work?: { images: string[] } | null;
}

type FilterType = "전체" | "재학 중" | "졸업" | "재직 중" | "프리랜서" | "취업 준비 중" | "구직 중";
const FILTERS: FilterType[] = ["전체", "재학 중", "졸업", "재직 중", "프리랜서", "취업 준비 중", "구직 중"];

export default function JakkaMembersPage() {
    const [creators, setCreators] = useState<CreatorRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("전체");

    useEffect(() => {
        createClient()
            .from("jakka_creators")
            .select("*, featured_work:jakka_works!featured_work_id(images)")
            .order("created_at", { ascending: false })
            .then(({ data }) => {
                setCreators((data as CreatorRow[]) ?? []);
                setLoading(false);
            });
    }, []);

    const filtered = creators.filter(c => {
        const matchSearch = !search ||
            c.display_name.toLowerCase().includes(search.toLowerCase()) ||
            c.handle.toLowerCase().includes(search.toLowerCase()) ||
            (c.field ?? "").includes(search) ||
            (c.school ?? "").includes(search);
        const matchFilter = filter === "전체" || c.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">회원 관리</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">JAKKA 창작자 프로필 · 현황 관리</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">전체 창작자</p>
                    <p className="text-2xl font-bold">{creators.length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">공개 프로필</p>
                    <p className="text-2xl font-bold">{creators.filter(c => c.is_public).length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">총 작업 수</p>
                    <p className="text-2xl font-bold">{creators.reduce((sum, c) => sum + (c.works_count ?? 0), 0)}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="이름, 핸들, 분야, 학교 검색"
                        className="w-full border border-neutral-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-neutral-400" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {FILTERS.map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`text-xs px-2.5 py-1 border rounded transition ${filter === f ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
                <div className="flex items-center gap-3 px-4 py-2 border-b border-neutral-200 bg-neutral-50">
                    <div className="w-9 shrink-0" />
                    <span className="flex-1 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">창작자</span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest shrink-0 w-28 text-right">상태 / 작업</span>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-sm text-neutral-400">불러오는 중…</div>
                ) : filtered.length === 0 ? (
                    <div className="py-12 text-center">
                        <Users className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                        <p className="text-sm text-neutral-400">창작자가 없습니다</p>
                    </div>
                ) : (
                    filtered.map(c => {
                        const thumb = c.featured_work?.images?.[0] ?? null;
                        return (
                            <div key={c.id} className="flex items-center gap-3 py-3 px-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors group">
                                <div className="w-9 h-9 shrink-0 bg-neutral-100 overflow-hidden rounded">
                                    {thumb ? (
                                        <Image src={thumb} alt="" width={36} height={36} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-3.5 h-3.5 text-neutral-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-semibold text-neutral-900 truncate">{c.display_name}</span>
                                        <span className="text-[11px] text-neutral-400 font-mono shrink-0">{c.handle}</span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                                        {[c.field, c.year_level, c.school].filter(Boolean).join(" · ")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {c.status && (
                                        <span className="text-[10px] text-neutral-500 border border-neutral-200 px-1.5 py-0.5 rounded bg-white">{c.status}</span>
                                    )}
                                    <span className="text-[11px] text-neutral-400 w-10 text-right">{c.works_count}작업</span>
                                    <Link href={`/jakka/${c.handle.replace("@", "")}`} target="_blank"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-700" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}

                {!loading && (
                    <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50 text-xs text-neutral-400">
                        {filtered.length}명 / 전체 {creators.length}명
                    </div>
                )}
            </div>
        </div>
    );
}
