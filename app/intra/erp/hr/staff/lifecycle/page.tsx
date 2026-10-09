"use client";

/**
 * ERP › HR › 입·퇴사 (2026-10-10) — 입사 진행 상태와 퇴사 처리
 *   상태 SSOT: tenone_staff_profiles.status · 처리: /api/intra/staff · /api/intra/staff/offboard (인사 담당 또는 마스터)
 */
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { STAFF_STATUS_LABEL, presetOf } from "@/lib/staff-presets";

interface Row {
    member_id: string; employee_id: string | null; department: string | null; position: string | null;
    employment_type: string | null; hire_date: string | null; status: string; preset: string | null;
    invited_at: string | null; left_at: string | null; members: { name: string; email: string };
}

const TONE: Record<string, string> = {
    invited: "bg-amber-100 text-amber-800", onboarding: "bg-sky-100 text-sky-800",
    active: "bg-emerald-100 text-emerald-800", offboarded: "bg-neutral-100 text-neutral-500",
};

export default function StaffLifecyclePage() {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [canManage, setCanManage] = useState(false);
    const [target, setTarget] = useState<Row | null>(null);
    const [leftAt, setLeftAt] = useState(new Date().toISOString().slice(0, 10));
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");

    const load = useCallback(async () => {
        const res = await fetch("/api/intra/staff").catch(() => null);
        const d = await res?.json().catch(() => null);
        setRows(d?.staff ?? []); setCanManage(!!d?.canManage);
    }, []);
    useEffect(() => { load(); }, [load]);

    const offboard = async () => {
        if (!target) return;
        setBusy(true); setMsg("");
        const res = await fetch("/api/intra/staff/offboard", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId: target.member_id, leftAt }),
        }).catch(() => null);
        const d = await res?.json().catch(() => null);
        setMsg(res?.ok ? `${target.members.name} 퇴사 처리 완료 — 권한 ${d.revoked}개 회수` : d?.error ?? "처리하지 못했습니다.");
        setTarget(null); setBusy(false); load();
    };

    return (
        <div className="space-y-6">
            <PageHeader title="입·퇴사" description="입사 초대 → 첫 로그인 확인 → 재직 → 퇴사(권한 즉시 회수). 인사 기록은 퇴직 후 3년 보관 후 파기">
                {canManage && (
                    <Link href="/intra/erp/hr/staff/register" className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 text-xs text-white">
                        <UserPlus className="h-3.5 w-3.5" /> 구성원 등록
                    </Link>
                )}
            </PageHeader>

            {msg && <p className="text-sm text-neutral-700">{msg}</p>}
            {!rows ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500">
                            <tr>
                                <th className="px-4 py-2.5">이름</th><th className="px-4 py-2.5">부서 · 직위</th><th className="px-4 py-2.5">권한 묶음</th>
                                <th className="px-4 py-2.5">입사일</th><th className="px-4 py-2.5">상태</th><th className="px-4 py-2.5" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {rows.map(r => (
                                <tr key={r.member_id}>
                                    <td className="px-4 py-3"><p className="font-medium text-neutral-900">{r.members.name}</p><p className="text-[11px] text-neutral-400">{r.members.email}</p></td>
                                    <td className="px-4 py-3 text-xs text-neutral-600">{[r.department, r.position].filter(Boolean).join(" · ") || "-"}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-600">{presetOf(r.preset ?? "")?.label ?? "-"}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-600">{r.hire_date ?? "-"}{r.left_at && <span className="block text-neutral-400">퇴사 {r.left_at}</span>}</td>
                                    <td className="px-4 py-3"><span className={`rounded px-1.5 py-0.5 text-[11px] ${TONE[r.status] ?? ""}`}>{STAFF_STATUS_LABEL[r.status] ?? r.status}</span></td>
                                    <td className="px-4 py-3 text-right">
                                        {canManage && r.status !== "offboarded" && (
                                            <button onClick={() => setTarget(r)} className="text-xs text-rose-600 hover:underline">퇴사 처리</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {target && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => !busy && setTarget(null)}>
                    <div className="w-full max-w-sm space-y-3 bg-white p-5" onClick={e => e.stopPropagation()}>
                        <p className="text-sm font-semibold text-neutral-900">{target.members.name} 퇴사 처리</p>
                        <p className="text-xs text-neutral-600">직원·모듈·브랜드·직무 권한을 모두 회수하고 일반 회원으로 남깁니다. 인트라 접속은 즉시 막힙니다. 되돌리려면 다시 입사 등록해야 합니다.</p>
                        <label className="block text-xs text-neutral-500">퇴사일
                            <input type="date" value={leftAt} onChange={e => setLeftAt(e.target.value)} className="mt-1 w-full border border-neutral-200 px-3 py-2 text-sm" />
                        </label>
                        <div className="flex justify-end gap-2 pt-1">
                            <button onClick={() => setTarget(null)} disabled={busy} className="px-3 py-1.5 text-xs text-neutral-600">취소</button>
                            <button onClick={offboard} disabled={busy} className="flex items-center gap-1.5 bg-rose-600 px-3 py-1.5 text-xs text-white">
                                {busy && <Loader2 className="h-3 w-3 animate-spin" />} 퇴사 처리
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
