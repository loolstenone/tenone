"use client";

// 비슷한 순간 — 모먼트 상세에서 의미 유사한 다른 흔적을 그리드로 보여줌.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles, Image as ImageIcon } from "lucide-react";

interface SimilarItem {
    id: string;
    date: string;
    domain: string | null;
    media_type: string;
    media_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    location: string | null;
    with_whom: string | null;
    similarity: number;
}

const DOMAIN_COLOR: Record<string, string> = {
    body: "#10B981", work: "#3B82F6", study: "#A855F7", daily: "#F59E0B",
    schedule: "#0F766E", travel: "#EC4899", move: "#6B7280", relation: "#EF4444",
};

export function SimilarMoments({ momentId, onSelect }: { momentId: string; onSelect?: (id: string) => void }) {
    const [items, setItems] = useState<SimilarItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/myverse/moments/${momentId}/similar?limit=8`);
                if (!res.ok) {
                    if (!cancelled) { setItems([]); setReason("error"); }
                    return;
                }
                const d = await res.json();
                if (cancelled) return;
                setItems(d.items ?? []);
                setReason(d.reason ?? null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [momentId]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-neutral-400 py-3">
                <Loader2 className="h-3 w-3 animate-spin" />
                비슷한 순간 찾는 중…
            </div>
        );
    }

    if (!items || items.length === 0) {
        if (reason === "no_text") {
            return (
                <div className="text-xs text-neutral-400 py-3">
                    비슷한 순간을 찾으려면 캡션·태그가 필요해.
                </div>
            );
        }
        if (reason === "embed_failed") {
            return (
                <div className="text-xs text-neutral-400 py-3">
                    지금은 비교할 수 없어. 잠시 후 다시 열어줘.
                </div>
            );
        }
        return (
            <div className="text-xs text-neutral-400 py-3">
                아직 비슷한 흔적이 없어. 더 많이 쌓이면 보여줄게.
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3 w-3 text-indigo-500" />
                <span className="text-[10px] uppercase tracking-widest text-indigo-500">비슷한 순간</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {items.map(it => {
                    const inner = (
                        <div className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-900">
                            {it.media_type === "image" && it.media_url ? (
                                <img src={it.thumbnail_url ?? it.media_url} alt=""
                                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                                    <ImageIcon className="h-5 w-5" />
                                </div>
                            )}
                            {it.domain && (
                                <span className="absolute top-1 left-1 inline-block w-1.5 h-1.5 rounded-full"
                                    style={{ background: DOMAIN_COLOR[it.domain] ?? "#aaa" }} />
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[9px] text-white/90 truncate">{it.date}</p>
                                {it.caption && <p className="text-[10px] text-white truncate">{it.caption}</p>}
                            </div>
                            <span className="absolute top-1 right-1 text-[9px] tabular-nums text-white/80 bg-black/40 rounded px-1">
                                {Math.round(it.similarity * 100)}
                            </span>
                        </div>
                    );

                    return onSelect ? (
                        <button key={it.id} onClick={() => onSelect(it.id)} className="block w-full">{inner}</button>
                    ) : (
                        <Link key={it.id} href={`/myverse/app/traces?moment=${it.id}`}>{inner}</Link>
                    );
                })}
            </div>
        </div>
    );
}
