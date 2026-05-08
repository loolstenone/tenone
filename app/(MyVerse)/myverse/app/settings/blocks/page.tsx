"use client";

// 차단 관리 — 내가 차단한 사용자 목록 + 해제

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserX, ArrowLeft, Loader2 } from "lucide-react";

interface BlockedMember {
    blocked_id: string;
    created_at: string;
    member: { id: string; name: string | null; handle: string | null; avatar_url: string | null } | null;
}

export default function BlocksPage() {
    const [blocks, setBlocks] = useState<BlockedMember[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const r = await fetch("/api/myverse/blocks");
            if (r.ok) {
                const d = await r.json();
                setBlocks(d.blocks ?? []);
            }
        } finally { setLoading(false); }
    }

    async function unblock(id: string) {
        const ok = confirm("차단을 해제할까요?");
        if (!ok) return;
        await fetch(`/api/myverse/blocks?blocked_id=${id}`, { method: "DELETE" });
        setBlocks(arr => arr.filter(b => b.blocked_id !== id));
    }

    useEffect(() => { void load(); }, []);

    return (
        <div className="max-w-2xl mx-auto px-6 py-8">
            <Link href="/myverse/app/settings" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 mb-3">
                <ArrowLeft className="h-3 w-3" /> 설정으로
            </Link>
            <h1 className="text-xl font-serif text-neutral-900 mb-1">차단 관리</h1>
            <p className="text-xs text-neutral-500 mb-6">차단한 사용자의 공개 흔적은 피드에 보이지 않고, 서로 메시지를 주고받을 수 없습니다.</p>

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-4 w-4 animate-spin text-neutral-300" /></div>
            ) : blocks.length === 0 ? (
                <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
                    <UserX className="h-6 w-6 text-neutral-200 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">차단한 사용자가 없습니다.</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {blocks.map(b => (
                        <li key={b.blocked_id} className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl">
                            <div className="h-9 w-9 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-xs text-neutral-500 shrink-0">
                                {b.member?.avatar_url ? (
                                    <img src={b.member.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    (b.member?.name || b.member?.handle || "?").charAt(0)
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">{b.member?.name ?? "(알 수 없음)"}</p>
                                {b.member?.handle && <p className="text-[11px] text-neutral-500 truncate">@{b.member.handle}</p>}
                            </div>
                            <button onClick={() => unblock(b.blocked_id)}
                                className="px-3 py-1.5 text-xs text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                                해제
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
