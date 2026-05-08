"use client";

// Apple Health Export ZIP 업로드 — 일별 집계로 변환

import { useEffect, useRef, useState } from "react";
import { Loader2, Check, AlertCircle, Upload, Activity } from "lucide-react";

interface Health {
    last_imported_at: string | null;
    days_count: number;
}

export function AppleHealthIntegration() {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [status, setStatus] = useState<Health | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<{ imported: number; total: number } | null>(null);
    const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

    async function load() {
        const res = await fetch("/api/myverse/integrations/apple-health/status");
        if (res.ok) setStatus(await res.json());
    }

    useEffect(() => { load(); }, []);

    async function upload(file: File) {
        setUploading(true);
        setToast(null);
        setProgress({ imported: 0, total: 1 });
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch("/api/myverse/integrations/apple-health/import", {
                method: "POST",
                body: form,
            });
            const d = await res.json();
            if (!res.ok) {
                setToast({ type: "err", msg: `임포트 실패: ${d.error || res.status}` });
                return;
            }
            setProgress({ imported: d.imported, total: d.total_days });
            setToast({ type: "ok", msg: `${d.imported}일 분량 가져옴` });
            await load();
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(null), 3000);
        }
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-400 via-pink-500 to-orange-400 flex items-center justify-center shrink-0">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Apple Health</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            iOS 건강 앱의 활동·수면·심박 데이터를 일별 집계로 가져옵니다
                        </p>
                    </div>
                </div>
                {status && status.days_count > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700">
                        <Check className="h-2.5 w-2.5" />
                        {status.days_count}일 연동
                    </span>
                )}
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-3 text-[11px] text-neutral-600 leading-relaxed">
                <strong className="text-neutral-800">사용 방법</strong><br />
                iOS 건강 앱 → 우측 상단 프로필 → 건강 데이터 모두 내보내기 → export.zip 받기 → 여기 업로드
            </div>

            {status?.last_imported_at && (
                <p className="text-xs text-neutral-500 mb-3">
                    마지막 임포트: {new Date(status.last_imported_at).toLocaleString("ko-KR")}
                </p>
            )}

            <input
                ref={fileRef}
                type="file"
                accept=".zip,.xml,application/zip,text/xml"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) upload(f);
                    e.target.value = "";
                }}
                className="hidden"
            />
            <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-300 hover:border-[#6366F1] hover:text-[#6366F1] text-neutral-700 text-xs font-medium rounded-lg disabled:opacity-50"
            >
                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                {uploading ? "임포트 중…" : "Export ZIP 업로드"}
            </button>

            {progress && (
                <p className="mt-2 text-[11px] text-[#6366F1]">
                    {progress.imported}일 / {progress.total}일 처리됨
                </p>
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
