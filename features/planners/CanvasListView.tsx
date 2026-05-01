"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Pencil, Trash2, ImageIcon, CalendarDays, FolderOpen, Layers } from "lucide-react";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { ConfirmSheet } from "./ConfirmSheet";

type CanvasOrigin =
    | { type: "daily"; date: string }
    | { type: "project"; projectId: string; projectTitle: string }
    | { type: "standalone" };

interface CanvasRow {
    id: string;
    title: string;
    thumbnail_url: string | null;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    origin: CanvasOrigin;
}

function OriginBadge({ origin }: { origin: CanvasOrigin }) {
    if (origin.type === "daily") {
        const parts = origin.date.split("-");
        const label = `${parts[0]}.${parts[1]}.${parts[2]}`;
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-600 border border-sky-100">
                <CalendarDays className="h-2.5 w-2.5" />
                {label}
            </span>
        );
    }
    if (origin.type === "project") {
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-600 border border-violet-100 max-w-[120px] truncate">
                <FolderOpen className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{origin.projectTitle}</span>
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-50 text-neutral-400 border border-neutral-100">
            <Layers className="h-2.5 w-2.5" />
            독립
        </span>
    );
}

export function CanvasListView() {
    const router = useRouter();
    const [rows, setRows] = useState<CanvasRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        const res = await fetch("/api/planners/canvases", { cache: "no-store" });
        if (res.ok) {
            const d = await res.json();
            setRows(d.canvases ?? []);
        }
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    async function createNew() {
        setCreating(true);
        try {
            const res = await fetch("/api/planners/canvases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "새 캔버스" }),
            });
            if (res.ok) {
                const d = await res.json();
                router.push(`/planners/app/canvas/${d.canvas.id}`);
            }
        } finally {
            setCreating(false);
        }
    }

    async function remove(id: string) {
        await fetch(`/api/planners/canvases/${id}`, { method: "DELETE" });
        setRows(prev => prev.filter(r => r.id !== id));
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Pencil className="h-6 w-6 text-[#0F766E]" />
                    <h1 className="font-serif text-2xl md:text-3xl text-neutral-900">캔버스</h1>
                </div>
                <PlannersUtilityLinks />
            </div>

            <p className="text-sm text-neutral-500 mb-6">
                펜·도형·텍스트·화살표를 자유롭게. Apple Pencil · S Pen · 마우스 모두 지원합니다.
            </p>

            {/* New */}
            <button
                onClick={createNew}
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-4 mb-6 border-2 border-dashed border-neutral-300 rounded-xl text-sm text-neutral-500 hover:border-[#0F766E] hover:text-[#0F766E] hover:bg-[#0F766E]/5 transition-colors disabled:opacity-50"
            >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? "캔버스 생성 중…" : "새 캔버스 만들기"}
            </button>

            {/* List */}
            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중…
                </div>
            ) : rows.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-neutral-300 mb-3" />
                    <p className="text-neutral-500">아직 캔버스가 없습니다.</p>
                    <p className="text-xs text-neutral-400 mt-1">위 버튼으로 첫 캔버스를 만들어 보세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rows.map(row => (
                        <Link
                            key={row.id}
                            href={`/planners/app/canvas/${row.id}`}
                            className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-[#0F766E] hover:shadow-sm transition-all"
                        >
                            {/* Thumbnail */}
                            <div className="aspect-[4/3] bg-neutral-50 border-b border-neutral-100 relative overflow-hidden">
                                {row.thumbnail_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={row.thumbnail_url} alt={row.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                        {/* 격자 패턴 미리보기 배경 */}
                                        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <pattern id={`grid-${row.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0F766E" strokeWidth="0.5" />
                                                </pattern>
                                            </defs>
                                            <rect width="100%" height="100%" fill={`url(#grid-${row.id})`} />
                                        </svg>
                                        <Pencil className="h-7 w-7 text-neutral-200 group-hover:text-[#0F766E]/30 transition-colors relative z-10" />
                                        <span className="text-[10px] text-neutral-300 group-hover:text-[#0F766E]/40 transition-colors relative z-10">미리보기 없음</span>
                                    </div>
                                )}
                            </div>
                            {/* Footer */}
                            <div className="px-3 py-2.5 flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-[#0F766E] leading-snug">{row.title}</p>
                                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                        <OriginBadge origin={row.origin ?? { type: "standalone" }} />
                                        <span className="text-[10px] text-neutral-300">
                                            {new Date(row.updated_at).toLocaleDateString("ko-KR")}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteId(row.id); }}
                                    className="text-neutral-300 hover:text-rose-500 transition-colors shrink-0 mt-0.5"
                                    title="삭제"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            <ConfirmSheet
                open={!!confirmDeleteId}
                message="이 캔버스를 삭제할까요?"
                onConfirm={() => { const id = confirmDeleteId!; setConfirmDeleteId(null); remove(id); }}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}
