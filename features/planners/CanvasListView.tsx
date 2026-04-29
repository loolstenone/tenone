"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Pencil, Trash2, ImageIcon } from "lucide-react";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { ConfirmSheet } from "./ConfirmSheet";

interface CanvasRow {
    id: string;
    title: string;
    thumbnail_url: string | null;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
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
                    <h1 className="font-serif text-3xl text-neutral-900">캔버스</h1>
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
                            className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-[#0F766E] transition-colors"
                        >
                            {/* Thumbnail */}
                            <div className="aspect-[4/3] bg-neutral-50 border-b border-neutral-100 flex items-center justify-center">
                                {row.thumbnail_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={row.thumbnail_url} alt={row.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Pencil className="h-8 w-8 text-neutral-300 group-hover:text-[#0F766E]/40 transition-colors" />
                                )}
                            </div>
                            {/* Footer */}
                            <div className="px-4 py-3 flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-[#0F766E]">{row.title}</p>
                                    <p className="text-[11px] text-neutral-400 mt-0.5">
                                        {new Date(row.updated_at).toLocaleDateString("ko-KR")}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteId(row.id); }}
                                    className="text-neutral-300 hover:text-rose-500 transition-colors shrink-0"
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
