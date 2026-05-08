"use client";

import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { CoverRender } from "./CoverRender";

interface Cover {
    id: string;
    key: string;
    label: string;
    description: string | null;
    pattern: 'solid' | 'gradient' | 'grid' | 'dot' | 'paper' | 'line' | 'stripe' | 'circle';
    primary_color: string;
    accent_color: string | null;
    emoji: string | null;
}

export function CoverPicker({
    open,
    onClose,
    currentCoverId,
    onSelect,
}: {
    open: boolean;
    onClose: () => void;
    currentCoverId?: string | null;
    onSelect: (cover: Cover) => void;
}) {
    const [covers, setCovers] = useState<Cover[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || covers.length > 0) return;
        setLoading(true);
        fetch("/api/myverse/covers").then(async (r) => {
            if (r.ok) {
                const d = await r.json();
                setCovers(d.covers || []);
            }
            setLoading(false);
        });
    }, [open, covers.length]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                    <h3 className="font-serif text-xl text-neutral-900">프로젝트 Cover 선택</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-6">
                    {loading ? (
                        <p className="text-center text-neutral-400 text-sm py-8">로딩 중…</p>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {covers.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => { onSelect(c); onClose(); }}
                                    className={`relative p-2 rounded-lg transition-all ${
                                        currentCoverId === c.key
                                            ? "bg-[#6366F1]/10 ring-2 ring-[#6366F1]"
                                            : "hover:bg-neutral-50"
                                    }`}
                                >
                                    <div className="flex justify-center">
                                        <CoverRender cover={c} size="md" />
                                    </div>
                                    <p className="text-[10px] text-neutral-600 text-center mt-2 truncate">{c.label}</p>
                                    {currentCoverId === c.key && (
                                        <Check className="absolute top-1 right-1 h-4 w-4 text-[#6366F1]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
