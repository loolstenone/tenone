"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { brandSiteUrl } from "@/lib/domain-registry";
import { adminTitle } from "@/lib/brand-site-menus";
import { PAD_CATEGORIES, fileBadges, fileExt, formatFileSize, padPath } from "@/lib/planners/library-shared";
import { plannersApi } from "@/features/planners/admin/upload";

// 플래너'스 PAD › 상품 — 아임웹 쇼핑 › 상품 화면 기준 (상태 탭 · 검색 · 썸네일 목록 · 바로 공개 전환). 원천 planners_files
interface Row {
    id: string; category: string; title: string; year: number | null; file_name: string; file_size: number;
    thumbnail_url: string | null; images: string[]; is_published: boolean; download_count: number; legacy_badak_no: number | null;
}
type Status = "all" | "on" | "off";

export default function PlannersPadProductsPage() {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>("all");
    const [category, setCategory] = useState("all");
    const [q, setQ] = useState("");

    useEffect(() => {
        plannersApi<{ files: Row[] }>("GET").then((d) => setRows(d.files)).catch((e) => setError(e.message));
    }, []);

    const counts = useMemo(() => ({
        all: rows?.length ?? 0,
        on: rows?.filter((r) => r.is_published).length ?? 0,
        off: rows?.filter((r) => !r.is_published).length ?? 0,
    }), [rows]);

    const shown = (rows ?? [])
        .filter((r) => status === "all" || (status === "on" ? r.is_published : !r.is_published))
        .filter((r) => category === "all" || r.category === category)
        .filter((r) => !q || r.title.includes(q) || r.file_name.includes(q) || String(r.legacy_badak_no ?? "") === q);

    async function togglePublish(r: Row) {
        setRows((prev) => prev?.map((x) => (x.id === r.id ? { ...x, is_published: !x.is_published } : x)) ?? prev);
        try {
            await plannersApi("PATCH", "", { id: r.id, is_published: !r.is_published });
        } catch (e) {
            setError((e as Error).message);
            setRows((prev) => prev?.map((x) => (x.id === r.id ? { ...x, is_published: r.is_published } : x)) ?? prev);
        }
    }

    return (
        <div>
            <PageHeader title={adminTitle("/intra/ums/planners/pad", "플래너'스 PAD")} description="상품 — 사이트 플래너'스 PAD 몰에 진열되는 플래너·서식. 비공개는 사이트에 보이지 않습니다.">
                <div className="flex items-center gap-3">
                    <a href={brandSiteUrl("planners", "/planners/pad")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700">
                        <ExternalLink className="h-3.5 w-3.5" /> 사이트에서 보기
                    </a>
                    <Link href="/intra/ums/planners/pad/new" className="inline-flex items-center gap-1.5 bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700">
                        <Plus className="h-4 w-4" /> 상품 등록
                    </Link>
                </div>
            </PageHeader>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <div className="mb-4 flex gap-1 border-b border-neutral-200 text-sm">
                {([["all", "전체"], ["on", "공개"], ["off", "비공개"]] as [Status, string][]).map(([k, label]) => (
                    <button key={k} onClick={() => setStatus(k)} className={`-mb-px border-b-2 px-3 py-2 ${status === k ? "border-neutral-900 font-bold" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}>
                        {label} <span className="ml-1 rounded-full bg-neutral-100 px-1.5 text-xs text-neutral-600">{counts[k]}</span>
                    </button>
                ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-neutral-200 px-2 py-2 text-sm">
                    <option value="all">전체 분류</option>
                    {PAD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="상품명, 파일명, 옛 바닥상회 번호로 검색" className="w-full border border-neutral-200 py-2 pl-9 pr-3 text-sm focus:border-neutral-400 focus:outline-none" />
                </div>
            </div>

            {!rows ? (
                <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : shown.length === 0 ? (
                <p className="border border-neutral-200 py-16 text-center text-sm text-neutral-400">상품이 없습니다.</p>
            ) : (
                <ul className="divide-y divide-neutral-100 border border-neutral-200 bg-white">
                    {shown.map((r) => (
                        <li key={r.id} className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50">
                            <Link href={`/intra/ums/planners/pad/${r.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-neutral-100 bg-neutral-50">
                                    {r.thumbnail_url
                                        // eslint-disable-next-line @next/next/no-img-element
                                        ? <img src={r.thumbnail_url} alt="" className="h-full w-full object-contain" />
                                        : <span className="text-[10px] text-neutral-400">{fileExt(r.file_name)}</span>}
                                </span>
                                <span className="min-w-0">
                                    <span className="flex items-center gap-1.5">
                                        {fileBadges(r).map((b) => <span key={b} className="bg-neutral-900 px-1 text-[9px] font-bold text-white">{b}</span>)}
                                        <span className="truncate text-sm font-medium">{r.title}</span>
                                    </span>
                                    <span className="mt-0.5 block text-xs text-neutral-400">
                                        {r.category} · {fileExt(r.file_name)} {formatFileSize(r.file_size)} · 사진 {r.images.length}
                                        {r.legacy_badak_no ? ` · 바닥상회 #${r.legacy_badak_no}` : ""}
                                    </span>
                                </span>
                            </Link>
                            <span className="hidden w-20 text-right text-xs text-neutral-500 sm:block">{r.download_count.toLocaleString()}회 받음</span>
                            <button onClick={() => togglePublish(r)} className={`w-16 shrink-0 border px-2 py-1 text-xs ${r.is_published ? "border-[#0F766E] text-[#0F766E]" : "border-neutral-300 text-neutral-400"}`}>
                                {r.is_published ? "공개" : "비공개"}
                            </button>
                            <a href={brandSiteUrl("planners", padPath(r.id))} target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-neutral-700" aria-label="사이트에서 보기">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
