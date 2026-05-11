"use client";

// Google Calendar 연결 관리 — 읽기 + 쓰기 (이벤트 생성/수정/삭제 API 사용)

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw, Unplug, Check, AlertCircle, Calendar } from "lucide-react";

interface Integration {
    id: string;
    provider: string;
    status: string;
    external_email: string | null;
    external_name: string | null;
    last_sync_at: string | null;
}

export function GoogleCalendarIntegration() {
    const searchParams = useSearchParams();
    const [integration, setIntegration] = useState<Integration | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/myverse/integrations");
            if (res.ok) {
                const d = await res.json();
                const integ = (d.integrations as Integration[] | undefined)?.find(
                    i => i.provider === "google_calendar" && i.status === "active"
                ) ?? null;
                setIntegration(integ);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
        const connected = searchParams.get("connected");
        const error = searchParams.get("error");
        if (connected === "google_calendar") setToast({ type: "ok", msg: "Google 캘린더 연결 완료" });
        if (error) setToast({ type: "err", msg: `연결 실패: ${error}` });
    }, [searchParams, load]);

    async function sync() {
        setSyncing(true);
        setToast(null);
        try {
            const res = await fetch("/api/myverse/integrations/google/sync", { method: "POST" });
            const d = await res.json();
            if (!res.ok) {
                setToast({ type: "err", msg: `동기화 실패: ${d.error || res.status}` });
                return;
            }
            setToast({ type: "ok", msg: `${d.synced}건 일정 가져옴` });
            await load();
        } finally {
            setSyncing(false);
        }
    }

    async function disconnect() {
        if (!confirm("캘린더 연결을 해제할까요?")) return;
        setDisconnecting(true);
        try {
            await fetch("/api/myverse/integrations", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider: "google_calendar" }),
            });
            setIntegration(null);
            setToast({ type: "ok", msg: "연결 해제됨" });
        } finally {
            setDisconnecting(false);
        }
    }

    return (
        <div className="bg-white myverse-dark:bg-[#0D0D15] border border-neutral-200 myverse-dark:border-white/8 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900 myverse-dark:text-neutral-100">Google 캘린더</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            구글 캘린더 일정을 가져오고, Myverse에서 만든 일정도 캘린더에 자동 저장됩니다 (양방향)
                        </p>
                    </div>
                </div>
                {integration && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700">
                        <Check className="h-2.5 w-2.5" />
                        연결됨
                    </span>
                )}
            </div>

            {loading ? (
                <p className="text-xs text-neutral-400 italic">불러오는 중…</p>
            ) : integration ? (
                <>
                    <div className="text-xs text-neutral-600 myverse-dark:text-neutral-400 space-y-1 mb-4 bg-neutral-50 myverse-dark:bg-white/5 rounded-lg p-3">
                        <div>계정: <span className="font-medium">{integration.external_email ?? "—"}</span></div>
                        {integration.last_sync_at && (
                            <div>마지막 동기화: {new Date(integration.last_sync_at).toLocaleString("ko-KR")}</div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={sync}
                            disabled={syncing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium rounded-lg disabled:opacity-50"
                        >
                            {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                            지금 동기화
                        </button>
                        <button
                            onClick={disconnect}
                            disabled={disconnecting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white myverse-dark:bg-white/5 border border-neutral-200 myverse-dark:border-white/8 hover:border-rose-300 text-neutral-600 myverse-dark:text-neutral-400 hover:text-rose-600 text-xs font-medium rounded-lg disabled:opacity-50"
                        >
                            <Unplug className="h-3 w-3" />
                            연결 해제
                        </button>
                    </div>
                </>
            ) : (
                <a
                    href="/api/myverse/integrations/google/connect"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white myverse-dark:bg-white/5 border border-neutral-300 myverse-dark:border-white/10 hover:border-[#6366F1] hover:text-[#6366F1] text-neutral-700 myverse-dark:text-neutral-300 text-xs font-medium rounded-lg transition-colors"
                >
                    Google 계정으로 연결
                </a>
            )}

            {toast && (
                <div className={`mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 ${
                    toast.type === "ok"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                        : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}>
                    {toast.type === "ok" ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
