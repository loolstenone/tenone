"use client";

/**
 * Intelligence › 운영 상태 (2026-10-10) — 유니버스 자동화가 실제로 돌고 있나
 *   계산 SSOT = lib/intel/ops-health.ts (결과물 기준 판정). 대시보드 경보도 같은 결과를 쓴다
 */
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Loader2, MinusCircle, RefreshCw, XCircle } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

type OpsStatus = "ok" | "warn" | "fail" | "idle";
interface OpsItem { key: string; label: string; group: string; schedule: string; status: OpsStatus; last_success: string | null; detail: string; href?: string }
interface Health { items: OpsItem[]; summary: Record<OpsStatus, number>; checked_at: string }

const STATUS: Record<OpsStatus, { label: string; icon: typeof CheckCircle2; tone: string; row: string }> = {
    fail: { label: "멈춤", icon: XCircle, tone: "text-rose-600", row: "bg-rose-50/60" },
    warn: { label: "주의", icon: AlertCircle, tone: "text-amber-600", row: "bg-amber-50/50" },
    ok: { label: "정상", icon: CheckCircle2, tone: "text-emerald-600", row: "" },
    idle: { label: "참고", icon: MinusCircle, tone: "text-neutral-400", row: "" },
};
const ORDER: OpsStatus[] = ["fail", "warn", "ok", "idle"];

function ago(iso: string | null): string {
    if (!iso) return "기록 없음";
    const h = (Date.now() - new Date(iso).getTime()) / 3600000;
    if (h < 1) return `${Math.max(1, Math.round(h * 60))}분 전`;
    if (h < 48) return `${Math.floor(h)}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

export default function OpsHealthPage() {
    const [data, setData] = useState<Health | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true); setError("");
        const res = await fetch("/api/intra/ops-health").catch(() => null);
        if (res?.ok) setData(await res.json()); else setError("상태를 불러오지 못했습니다.");
        setLoading(false);
    }, []);
    useEffect(() => { load(); }, [load]);

    const items = data ? [...data.items].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status)) : [];
    const problems = (data?.summary.fail ?? 0) + (data?.summary.warn ?? 0);

    return (
        <div className="space-y-6">
            <PageHeader title="운영 상태" description="자동화(동기화·수집·브리핑·발송)가 실제로 결과를 내고 있는지 — 실행 여부가 아니라 결과물로 판정">
                <button onClick={load} className="flex items-center gap-1.5 rounded border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900">
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> 새로고침
                </button>
            </PageHeader>

            {data && (
                <div className={`flex items-center gap-3 rounded-lg border p-4 ${problems ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
                    {problems ? <XCircle className="h-5 w-5 text-rose-600" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    <p className="text-sm font-semibold text-neutral-900">
                        {problems ? `확인 필요 ${problems}건 — 멈춤 ${data.summary.fail} · 주의 ${data.summary.warn}` : "모든 자동화 정상"}
                    </p>
                    <span className="ml-auto text-[11px] text-neutral-500">
                        정상 {data.summary.ok} · 참고 {data.summary.idle} · {new Date(data.checked_at).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" })} 확인
                    </span>
                </div>
            )}

            {loading && !data ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>
            ) : error ? (
                <p className="text-sm text-rose-600">{error}</p>
            ) : (
                <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500">
                            <tr>
                                <th className="px-4 py-2.5">상태</th>
                                <th className="px-4 py-2.5">작업</th>
                                <th className="px-4 py-2.5">주기</th>
                                <th className="px-4 py-2.5">마지막 결과</th>
                                <th className="px-4 py-2.5">상세</th>
                                <th className="w-8" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {items.map(i => {
                                const s = STATUS[i.status];
                                return (
                                    <tr key={i.key} className={s.row}>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span className={`flex items-center gap-1.5 text-xs font-semibold ${s.tone}`}><s.icon className="h-4 w-4" />{s.label}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-neutral-900">{i.label}</p>
                                            <p className="text-[11px] text-neutral-400">{i.group}</p>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">{i.schedule}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-700">{ago(i.last_success)}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-600">{i.detail}</td>
                                        <td className="px-2 py-3">
                                            {i.href && <Link href={i.href} className="text-neutral-400 hover:text-neutral-900" aria-label={`${i.label} 상세`}><ChevronRight className="h-4 w-4" /></Link>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <p className="text-[11px] text-neutral-400">새 자동화(cron·Edge Function·동기화)를 만들면 lib/intel/ops-health.ts에 한 항목을 추가합니다. 결과물이 없는 작업은 여기서 멈춤을 알 수 없습니다.</p>
        </div>
    );
}
