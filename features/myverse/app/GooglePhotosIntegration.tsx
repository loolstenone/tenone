"use client";

// Google Photos 연결 관리 — 연결 / 해제 / 동기화

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw, Unplug, Check, AlertCircle } from "lucide-react";

interface Integration {
    provider: string;
    connected_at: string;
    last_sync_at: string | null;
    last_sync_count: number;
    raw_profile: { email?: string; name?: string } | null;
}

export function GooglePhotosIntegration() {
    const searchParams = useSearchParams();
    const [integration, setIntegration] = useState<Integration | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch("/api/myverse/integrations/google-photos/status");
            if (res.ok) {
                const d = await res.json();
                setIntegration(d.integration);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        const connected = searchParams.get("connected");
        const error = searchParams.get("error");
        if (connected === "google_photos") setToast({ type: "ok", msg: "Google Photos 연결 완료" });
        if (error) setToast({ type: "err", msg: `연결 실패: ${error}` });
    }, [searchParams]);

    async function sync() {
        setSyncing(true);
        setToast(null);
        try {
            const res = await fetch("/api/myverse/integrations/google-photos/sync", { method: "POST" });
            const d = await res.json();
            if (!res.ok) {
                setToast({ type: "err", msg: `동기화 실패: ${d.error || res.status}` });
                return;
            }
            setToast({ type: "ok", msg: `${d.imported}건 가져옴 · ${d.skipped}건 건너뜀` });
            await load();
        } finally {
            setSyncing(false);
        }
    }

    async function disconnect() {
        if (!confirm("Google Photos 연결을 해제할까요? 이미 가져온 사진은 그대로 남습니다.")) return;
        setDisconnecting(true);
        try {
            await fetch("/api/myverse/integrations/google-photos/disconnect", { method: "POST" });
            setIntegration(null);
            setToast({ type: "ok", msg: "연결 해제됨" });
        } finally {
            setDisconnecting(false);
        }
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-400 via-rose-400 to-blue-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-lg">📷</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Google Photos</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            구글 포토에서 최근 사진을 자동으로 흔적에 가져옵니다 (읽기 전용)
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
                    <div className="text-xs text-neutral-600 space-y-1 mb-4 bg-neutral-50 rounded-lg p-3">
                        <div>계정: <span className="font-medium">{integration.raw_profile?.email ?? "—"}</span></div>
                        <div>연결: {new Date(integration.connected_at).toLocaleDateString("ko-KR")}</div>
                        {integration.last_sync_at && (
                            <div>마지막 동기화: {new Date(integration.last_sync_at).toLocaleString("ko-KR")} · {integration.last_sync_count}건</div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={sync}
                            disabled={syncing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium rounded-lg disabled:opacity-50"
                        >
                            {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                            지금 동기화 (최근 50건)
                        </button>
                        <button
                            onClick={disconnect}
                            disabled={disconnecting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 hover:border-rose-300 text-neutral-600 hover:text-rose-600 text-xs font-medium rounded-lg disabled:opacity-50"
                        >
                            <Unplug className="h-3 w-3" />
                            연결 해제
                        </button>
                    </div>
                </>
            ) : (
                <a
                    href="/api/myverse/integrations/google-photos/connect"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-300 hover:border-[#6366F1] hover:text-[#6366F1] text-neutral-700 text-xs font-medium rounded-lg transition-colors"
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
