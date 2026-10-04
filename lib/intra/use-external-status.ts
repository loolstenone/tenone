"use client";

import { useEffect, useState } from "react";
import type { ExternalStatus } from "@/types/external-status";

/** 인트라 외부 리소스 실시간 현황 (직원 전용 API, 세션 쿠키로 인증) */
export function useExternalStatus() {
    const [data, setData] = useState<ExternalStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/intra/external/status", { cache: "no-store" })
            .then(async res => {
                if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? "권한이 없습니다" : `현황 조회 실패 (${res.status})`);
                return res.json() as Promise<ExternalStatus>;
            })
            .then(d => { if (!cancelled) setData(d); })
            .catch((e: Error) => { if (!cancelled) setError(e.message); });
        return () => { cancelled = true; };
    }, []);

    return { data, error, loading: !data && !error };
}

export function formatKst(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
