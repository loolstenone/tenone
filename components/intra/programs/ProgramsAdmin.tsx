"use client";

/**
 * 인트라 프로그램 회차 목록 · 새 회차 (코어)
 *   brand 지정 → 그 브랜드 회차만 (별도 관리: /intra/ums/{brand}/…)
 *   brand 없음 → 전 브랜드 (통합 관리: /intra/ums/programs)
 * 회차를 열면 ProgramEditor — 참가 신청 폼 연결 → 팀 구성·배정 → 제출 → 결과 발표
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { PROGRAM_KIND_LABEL, PROGRAM_STATUS_LABEL } from "@/lib/programs/paths";

interface Row {
    id: string; brand_id: string; channels: string[]; kind: string; mode: string; title: string; year: number;
    client_name: string | null; status: string; form_id: string | null; results_published_at: string | null;
    team_count: number; participant_count: number;
}

const STATUS_TONE: Record<string, string> = {
    upcoming: "bg-sky-50 text-sky-700", ongoing: "bg-emerald-50 text-emerald-700", completed: "bg-neutral-100 text-neutral-500", cancelled: "bg-neutral-100 text-neutral-400",
};

export function ProgramsAdmin({ title, description, basePath, brand, brands, defaultKind = "competition" }: {
    title: string; description?: string; basePath: string;
    brand?: string; brands?: { slug: string; name: string }[]; defaultKind?: string;
}) {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ brand: brand ?? "", kind: defaultKind, title: "", year: String(new Date().getFullYear()), client_name: "" });
    const [creating, setCreating] = useState(false);
    const brandName = (slug: string) => brands?.find(b => b.slug === slug)?.name ?? slug;

    const load = useCallback(async () => {
        const res = await fetch(`/api/intra/programs/rounds${brand ? `?brand=${brand}` : ""}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "불러오지 못했습니다."); return; }
        setRows(data.rounds);
    }, [brand]);
    useEffect(() => { load(); }, [load]);

    const create = async () => {
        if (!form.title.trim() || !form.brand) return;
        setCreating(true);
        const res = await fetch("/api/intra/programs/rounds", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, year: Number(form.year) }),
        });
        const data = await res.json();
        setCreating(false);
        if (!res.ok) { setError(data.error ?? "만들지 못했습니다."); return; }
        window.location.href = `${basePath}/${data.id}`;
    };

    const inputCls = "rounded border border-neutral-300 px-3 py-2 text-sm";
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
                {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-5">
                <div className="mb-3 text-sm font-semibold text-neutral-800">새 회차</div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {!brand && (
                        <select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className={`${inputCls} w-40`}>
                            <option value="">운영 브랜드</option>
                            {(brands ?? []).map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                        </select>
                    )}
                    <select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })} className={`${inputCls} w-32`}>
                        {Object.entries(PROGRAM_KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="제목 (예: 2027 봄 시즌 경쟁 PT)" className={`${inputCls} flex-1 min-w-48`} />
                    <input value={form.year} onChange={e => setForm({ ...form, year: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="연도" className={`${inputCls} w-24`} />
                    <input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} placeholder="클라이언트 (선택)" className={`${inputCls} w-48`} />
                    <button onClick={create} disabled={creating || !form.title.trim() || !form.brand} className="inline-flex items-center justify-center gap-1 rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-300">
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
                        <Link key={r.id} href={`${basePath}/${r.id}`} className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-neutral-50">
                            <span className={`rounded px-2 py-0.5 text-xs ${STATUS_TONE[r.status] ?? ""}`}>{PROGRAM_STATUS_LABEL[r.status] ?? r.status}</span>
                            {!brand && <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{brandName(r.brand_id)}</span>}
                            <span className="text-xs text-neutral-500">{PROGRAM_KIND_LABEL[r.kind] ?? r.kind}</span>
                            <span className="font-semibold text-neutral-900">{r.title}</span>
                            {r.client_name && <span className="text-xs text-neutral-400">{r.client_name}</span>}
                            <span className="ml-auto text-xs text-neutral-500">
                                팀 {r.team_count} · 참가 {r.participant_count}{r.form_id ? " · 신청 폼" : ""}{r.results_published_at ? " · 결과 발표" : ""}
                                {r.channels.filter(c => c !== r.brand_id).length > 0 && ` · 창구 ${r.channels.filter(c => c !== r.brand_id).map(brandName).join(", ")}`}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
