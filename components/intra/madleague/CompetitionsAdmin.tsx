"use client";

/**
 * 인트라 › MAD League › 경쟁 PT — 회차 목록 · 새 회차
 * 회차를 열면 참가 신청 폼 연결 → 팀 구성·배정 → 결과 입력 (CompetitionEditor)
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";

interface Row { id: string; title: string; year: number; client_name: string | null; status: string; presentation_date: string | null; form_id: string | null; team_count: number }

export const COMP_STATUS_LABEL: Record<string, string> = { upcoming: "모집 예정", ongoing: "진행 중", completed: "종료", cancelled: "취소" };
const STATUS_TONE: Record<string, string> = {
    upcoming: "bg-sky-50 text-sky-700", ongoing: "bg-emerald-50 text-emerald-700", completed: "bg-neutral-100 text-neutral-500", cancelled: "bg-neutral-100 text-neutral-400",
};

export function CompetitionsAdmin({ title, basePath }: { title: string; basePath: string }) {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [error, setError] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newYear, setNewYear] = useState(String(new Date().getFullYear()));
    const [newClient, setNewClient] = useState("");
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        const res = await fetch("/api/intra/madleague/competitions");
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "불러오지 못했습니다."); return; }
        setRows(data.competitions);
    }, []);
    useEffect(() => { load(); }, [load]);

    const create = async () => {
        if (!newTitle.trim()) return;
        setCreating(true);
        const res = await fetch("/api/intra/madleague/competitions", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle, year: Number(newYear), client_name: newClient }),
        });
        const data = await res.json();
        setCreating(false);
        if (!res.ok) { setError(data.error ?? "만들지 못했습니다."); return; }
        window.location.href = `${basePath}/${data.id}`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
                <p className="mt-1 text-sm text-neutral-500">회차를 만들고 참가 신청 폼을 연결한 뒤, 팀을 구성·배정하고 결과를 입력합니다. 팀원은 매드리거 › 경쟁 PT 워크스페이스에서 자기 팀을 봅니다.</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-5">
                <div className="mb-3 text-sm font-semibold text-neutral-800">새 회차</div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="제목 (예: 2026 2차 ○○ 경쟁 PT)" className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm" />
                    <input value={newYear} onChange={e => setNewYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="연도" className="w-24 rounded border border-neutral-300 px-3 py-2 text-sm" />
                    <input value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="클라이언트 (선택)" className="w-48 rounded border border-neutral-300 px-3 py-2 text-sm" />
                    <button onClick={create} disabled={creating || !newTitle.trim()} className="inline-flex items-center justify-center gap-1 rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-300">
                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} 만들기
                    </button>
                </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {!rows ? (
                <p className="text-sm text-neutral-400">불러오는 중…</p>
            ) : rows.length === 0 ? (
                <p className="text-sm text-neutral-400">회차가 없습니다.</p>
            ) : (
                <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
                    {rows.map(r => (
                        <Link key={r.id} href={`${basePath}/${r.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-neutral-50">
                            <span className={`rounded px-2 py-0.5 text-xs ${STATUS_TONE[r.status] ?? ""}`}>{COMP_STATUS_LABEL[r.status] ?? r.status}</span>
                            <span className="font-semibold text-neutral-900">{r.title}</span>
                            {r.client_name && <span className="text-xs text-neutral-400">{r.client_name}</span>}
                            <span className="ml-auto text-xs text-neutral-500">팀 {r.team_count}{r.form_id ? " · 신청 폼 연결" : ""}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
