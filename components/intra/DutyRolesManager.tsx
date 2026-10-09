"use client";

/**
 * 직무 권한 표 — 직원 × 인사·급여·재무·회계 (2026-10-10)
 *   SSOT: lib/staff-duties.ts · 변경은 super_admin만 (/api/intra/duties)
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { STAFF_DUTIES } from "@/lib/staff-duties";

interface Person { member_id: string; name: string; email: string; levels: string[]; duties: string[] }

export function DutyRolesManager() {
    const [people, setPeople] = useState<Person[] | null>(null);
    const [canEdit, setCanEdit] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        const res = await fetch("/api/intra/duties").catch(() => null);
        if (!res?.ok) { setError("직무 권한을 불러오지 못했습니다."); return; }
        const d = await res.json();
        setPeople(d.people); setCanEdit(d.canEdit);
    }, []);
    useEffect(() => { load(); }, [load]);

    const toggle = async (p: Person, duty: string) => {
        const grant = !p.duties.includes(duty);
        setBusy(`${p.member_id}:${duty}`); setError("");
        const res = await fetch("/api/intra/duties", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId: p.member_id, duty, grant }),
        }).catch(() => null);
        if (!res?.ok) setError((await res?.json().catch(() => null))?.error ?? "변경하지 못했습니다.");
        await load();
        setBusy(null);
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {STAFF_DUTIES.map(d => (
                    <div key={d.key} className="rounded border border-neutral-200 bg-white p-3">
                        <p className="text-xs font-semibold text-neutral-900">{d.label} <span className="font-mono text-[10px] font-normal text-neutral-400">{d.key}:duty</span></p>
                        <p className="mt-1 text-[11px] text-neutral-600">{d.scope}</p>
                        <p className="mt-0.5 text-[10px] text-neutral-400">{d.menus}</p>
                    </div>
                ))}
            </div>

            {!people ? (
                <div className="flex h-20 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
            ) : (
                <div className="overflow-x-auto rounded border border-neutral-200 bg-white">
                    <table className="w-full min-w-[520px] text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                            <tr>
                                <th className="px-3 py-2 text-left">직원</th>
                                {STAFF_DUTIES.map(d => <th key={d.key} className="px-3 py-2 text-center">{d.label}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {people.map(p => {
                                const master = p.levels.includes("super_admin");
                                return (
                                    <tr key={p.member_id}>
                                        <td className="px-3 py-2">
                                            <p className="font-medium text-neutral-900">{p.name || p.email}</p>
                                            <p className="text-[10px] text-neutral-400">{p.levels.join(" · ")}</p>
                                        </td>
                                        {STAFF_DUTIES.map(d => {
                                            const on = master || p.duties.includes(d.key);
                                            const key = `${p.member_id}:${d.key}`;
                                            return (
                                                <td key={d.key} className="px-3 py-2 text-center">
                                                    {master ? (
                                                        <span className="text-[10px] text-neutral-400">전체</span>
                                                    ) : busy === key ? (
                                                        <Loader2 className="mx-auto h-4 w-4 animate-spin text-neutral-400" />
                                                    ) : (
                                                        <input type="checkbox" checked={on} disabled={!canEdit} onChange={() => toggle(p, d.key)}
                                                            aria-label={`${p.name} ${d.label}`} className="h-4 w-4 accent-neutral-900 disabled:opacity-50" />
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <p className="text-[11px] text-neutral-400">
                {canEdit ? "체크하면 바로 부여·회수됩니다." : "변경은 마스터만 할 수 있습니다."} 적용은 대상자의 다음 로그인(또는 최대 1시간 뒤 토큰 갱신)부터.
                본인 기록(근태·급여명세·GPR·경비)은 직무와 상관없이 본인이 My에서 봅니다.
            </p>
        </div>
    );
}
