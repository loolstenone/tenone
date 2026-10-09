"use client";

/**
 * 계정 컨트롤 — 전 유니버스 우측 상단 공통 (2026-10-10 일관성 통일)
 *   순서: 알림 → 아바타 → 로그아웃(텍스트). 브랜드 사이트(UniverseUtilityBar) · 인트라(IntraHeader) · 인스타형 레이아웃이 같은 부품을 쓴다
 *   색은 부모 글자색(currentColor)을 따른다 — 밝은·어두운 헤더 모두 그대로 쓴다
 */
import { useEffect, useState } from "react";
import Image from "next/image";
import { Bell, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { CrossSiteLink } from "@/components/CrossSiteLink";

interface NotificationItem { id: string; title: string; body?: string; href?: string; created_at: string; read?: boolean; }

/** 알림 🔔 — 본인 알림만 (/api/notifications). 열면 새로고침 + 배지 지움 */
export function NotificationBell({ align = "right" }: { align?: "right" | "left" }) {
    const { isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [unread, setUnread] = useState(0);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch("/api/notifications", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setItems(data.notifications ?? []);
                setUnread(data.unread ?? 0);
            }
        } catch { /* 알림 실패는 화면을 막지 않는다 */
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isAuthenticated) load();
    }, [isAuthenticated]);

    useEffect(() => {
        if (!open) return;
        load().then(() => {
            // 목록 강조는 남기고 배지만 지운다
            fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
            setUnread(0);
        });
        const close = () => setOpen(false);
        const t = setTimeout(() => window.addEventListener("click", close), 0);
        return () => { clearTimeout(t); window.removeEventListener("click", close); };
    }, [open]);

    if (!isAuthenticated) return null;

    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(o => !o)}
                className="relative flex items-center opacity-60 hover:opacity-100 transition-opacity"
                title={`알림${unread > 0 ? ` (${unread})` : ""}`}
            >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1.5 h-3.5 min-w-[14px] px-1 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>
            {open && (
                <div className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-80 bg-white text-neutral-900 rounded-lg shadow-xl border border-neutral-200 overflow-hidden z-50`}>
                    <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-neutral-500">알림</span>
                        {items.some(n => !n.read) && <span className="text-[10px] text-rose-500 font-semibold">{items.filter(n => !n.read).length} 새 알림</span>}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {loading && items.length === 0 ? (
                            <div className="px-4 py-8 text-center text-xs text-neutral-400">불러오는 중…</div>
                        ) : items.length === 0 ? (
                            <div className="px-4 py-10 text-center text-xs text-neutral-400">새 알림이 없습니다</div>
                        ) : items.map(n => (
                            <CrossSiteLink
                                key={n.id}
                                href={n.href || "#"}
                                onClick={() => setOpen(false)}
                                className={`block px-3 py-2.5 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors ${n.read ? "" : "bg-rose-50/30"}`}
                            >
                                <div className="text-sm font-medium text-neutral-900 truncate">{n.title}</div>
                                {n.body && <div className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.body}</div>}
                                <div className="text-[10px] text-neutral-400 mt-1">{new Date(n.created_at).toLocaleString("ko-KR")}</div>
                            </CrossSiteLink>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/** 아바타 — 이미지만 (없으면 이니셜 1글자). 이름 텍스트는 노출하지 않는다 (§1.9.2) */
export function AccountAvatar() {
    const { user } = useAuth();
    return user?.avatarUrl ? (
        <Image src={user.avatarUrl} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover ring-1 ring-current/20" />
    ) : (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-current/15 ring-1 ring-current/20 text-[11px] font-bold">
            <span className="opacity-90">{user?.name?.charAt(0) ?? <User className="h-3.5 w-3.5" />}</span>
        </span>
    );
}

/** 로그아웃 — 텍스트 (2026-10-10 아이콘 → 텍스트) */
export function LogoutButton({ onLogout }: { onLogout?: () => void | Promise<void> }) {
    const { logout } = useAuth();
    return (
        <button
            onClick={() => (onLogout ? onLogout() : logout())}
            className="text-[11px] font-semibold tracking-wider whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity"
        >
            로그아웃
        </button>
    );
}
