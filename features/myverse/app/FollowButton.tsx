"use client";

// 팔로우 / 언팔로우 버튼 — Verse 페이지에 임베드

import { useEffect, useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

interface Props {
    handle: string;
}

interface Status {
    is_following: boolean;
    is_self: boolean;
    followers_count: number;
    following_count: number;
}

export function FollowButton({ handle }: Props) {
    const [status, setStatus] = useState<Status | null>(null);
    const [busy, setBusy] = useState(false);

    async function load() {
        try {
            const res = await fetch(`/api/myverse/follow?handle=${encodeURIComponent(handle)}`);
            if (res.ok) setStatus(await res.json());
        } catch { /* ignore */ }
    }

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [handle]);

    async function toggle() {
        if (!status || status.is_self) return;
        setBusy(true);
        try {
            if (status.is_following) {
                await fetch(`/api/myverse/follow?handle=${encodeURIComponent(handle)}`, { method: "DELETE" });
            } else {
                await fetch("/api/myverse/follow", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ handle }),
                });
            }
            await load();
        } finally {
            setBusy(false);
        }
    }

    if (!status) {
        return <div className="h-9 w-24 bg-neutral-100 rounded-lg animate-pulse" />;
    }

    if (status.is_self) {
        return (
            <div className="text-xs text-neutral-500">
                팔로워 {status.followers_count} · 팔로잉 {status.following_count}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={toggle}
                disabled={busy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                    status.is_following
                        ? "bg-white border border-neutral-200 text-neutral-700 hover:border-rose-200 hover:text-rose-600"
                        : "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                }`}
            >
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> :
                    status.is_following ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                {status.is_following ? "팔로잉" : "팔로우"}
            </button>
            <div className="text-[11px] text-neutral-500">
                팔로워 {status.followers_count} · 팔로잉 {status.following_count}
            </div>
        </div>
    );
}
