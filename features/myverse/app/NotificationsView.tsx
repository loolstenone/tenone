"use client";

// 마이버스 알림 — 팔로우/리액션/댓글/답글

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, UserPlus, Heart, MessageCircle, Reply, Check } from "lucide-react";

interface Notification {
    id: string;
    actor_id: string;
    type: "follow" | "reaction" | "comment" | "reply";
    moment_id: string | null;
    comment_id: string | null;
    read_at: string | null;
    created_at: string;
    actor: { id: string; name: string | null; handle: string | null; avatar_url: string | null } | null;
}

const ICONS = {
    follow: UserPlus,
    reaction: Heart,
    comment: MessageCircle,
    reply: Reply,
};

const LABELS = {
    follow: "님이 팔로우했어요",
    reaction: "님이 흔적에 하트를 남겼어요",
    comment: "님이 흔적에 댓글을 달았어요",
    reply: "님이 댓글에 답글을 달았어요",
};

function relativeTime(iso: string): string {
    const ago = (Date.now() - new Date(iso).getTime()) / 1000;
    if (ago < 60) return "방금";
    if (ago < 3600) return `${Math.floor(ago / 60)}분 전`;
    if (ago < 86400) return `${Math.floor(ago / 3600)}시간 전`;
    if (ago < 86400 * 7) return `${Math.floor(ago / 86400)}일 전`;
    return new Date(iso).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

export function NotificationsView() {
    const [notifs, setNotifs] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch("/api/myverse/notifications");
            if (res.ok) {
                const d = await res.json();
                setNotifs(d.notifications ?? []);
            }
        } finally {
            setLoading(false);
        }
    }

    async function markAllRead() {
        await fetch("/api/myverse/notifications", { method: "POST" });
        await load();
    }

    useEffect(() => { load(); }, []);

    const unread = notifs.filter(n => !n.read_at);

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
            <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-1">
                        <Bell className="h-3.5 w-3.5" />
                        NOTIFICATIONS
                    </div>
                    <h1 className="text-3xl font-semibold text-neutral-900">알림</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        {unread.length > 0 ? `${unread.length}개의 새 알림` : "모두 확인했어요"}
                    </p>
                </div>
                {unread.length > 0 && (
                    <button
                        onClick={markAllRead}
                        className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-200 hover:border-[#6366F1] text-neutral-700 hover:text-[#6366F1] text-xs font-medium rounded-lg"
                    >
                        <Check className="h-3 w-3" />
                        모두 읽음
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />)}
                </div>
            ) : notifs.length === 0 ? (
                <div className="border border-dashed border-neutral-300 rounded-xl py-14 px-6 text-center">
                    <Bell className="h-6 w-6 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-600">아직 알림이 없어요</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {notifs.map(n => {
                        const Icon = ICONS[n.type];
                        const link = n.moment_id
                            ? `/myverse/v/${n.actor?.handle}`        // moment 페이지 없으니 일단 액터 페이지로
                            : `/myverse/v/${n.actor?.handle}`;
                        return (
                            <Link
                                key={n.id}
                                href={link}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                    n.read_at ? "hover:bg-neutral-50" : "bg-[#6366F1]/5 hover:bg-[#6366F1]/10"
                                }`}
                            >
                                <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center shrink-0">
                                    {n.actor?.avatar_url ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={n.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white text-xs font-semibold">{n.actor?.name?.[0] ?? "?"}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-neutral-800">
                                        <span className="font-medium">{n.actor?.name ?? "—"}</span>
                                        <span className="text-neutral-600">{LABELS[n.type]}</span>
                                    </p>
                                    <p className="text-[11px] text-neutral-400">{relativeTime(n.created_at)}</p>
                                </div>
                                <Icon className="h-4 w-4 text-neutral-400 shrink-0" />
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
