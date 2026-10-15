"use client";

import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";

interface Role { id: string; member_id: string; role: string; context: Record<string, unknown> | null; valid_from: string; member?: { name: string | null } | null; }

// 심사는 서버 API에서 — 회원 역할 테이블은 브라우저에서 쓸 수 없다(RLS), 역할 이력 규칙은 DB가 강제
export default function YouInOneApplicationsPage() {
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState<Role[]>([]);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/intra/youinone/applications")
            .then(r => r.json())
            .then(j => { if (j.error) setError(j.error); setPending((j.applications ?? []) as Role[]); })
            .catch(() => setError("신청 목록을 불러오지 못했습니다."))
            .finally(() => setLoading(false));
    }, []);

    const decide = async (id: string, action: "approve" | "reject") => {
        setError("");
        setBusy(id);
        try {
            const r = await fetch("/api/intra/youinone/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) { setError(j.error || "처리하지 못했습니다. 다시 시도해 주세요."); return; }
            setPending(prev => prev.filter(x => x.id !== id));
        } finally {
            setBusy(null);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-lg font-bold">심사 관리</h1>
                <p className="text-sm text-neutral-400 mt-0.5">YouInOne 크루 신청 심사 · 승인</p>
            </div>
            <div className="border border-neutral-200 rounded-lg p-4 mb-6">
                <p className="text-xs text-neutral-400 mb-1">심사 대기</p>
                <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
            </div>
            {error && <p role="alert" className="mb-4 px-3 py-2 text-xs text-red-600 border border-red-200 bg-red-50 rounded">{error}</p>}
            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : pending.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <ClipboardList className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">대기 중인 신청 없음</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pending.map(r => (
                        <div key={r.id} className="border border-neutral-200 rounded-lg p-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-neutral-800">{r.member?.name ?? `회원 ID: ${r.member_id.slice(0, 8)}…`}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">신청일: {new Date(r.valid_from).toLocaleDateString("ko-KR")}</p>
                                {r.context && <p className="text-xs text-neutral-500 mt-1">{JSON.stringify(r.context)}</p>}
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => decide(r.id, "approve")} disabled={busy !== null}
                                    className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition disabled:opacity-50">승인</button>
                                <button onClick={() => decide(r.id, "reject")} disabled={busy !== null}
                                    className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 transition disabled:opacity-50">거절</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
