"use client";

/**
 * 인트라 신청 폼 목록 — 브랜드별 (유니버스 공통 폼 모듈)
 * 이벤트마다 새 폼을 만들거나, 지난 행사 폼을 복제해 질문·설정을 이어 쓴다.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Copy, ExternalLink, Loader2 } from "lucide-react";
import { AVAILABILITY_LABEL, formAvailability } from "@/lib/forms";
import { brandSiteUrl } from "@/lib/domain-registry";
import type { FormDef } from "@/types/forms";

type Row = Pick<FormDef, "id" | "slug" | "program" | "title" | "status" | "opens_at" | "closes_at" | "settings" | "updated_at"> & { response_count: number; pending_count: number };

interface Props {
    brandId: string;
    title: string;
    /** 폼 상세 화면 경로 prefix — `${basePath}/${id}` */
    basePath: string;
    /** 프로그램 키 안내 (예: { creazy: "크리에이지", dam: "댐 파티" }) */
    programs?: Record<string, string>;
}

const STATUS_TONE: Record<string, string> = {
    open: "bg-emerald-50 text-emerald-700", upcoming: "bg-sky-50 text-sky-700", draft: "bg-neutral-100 text-neutral-500",
    closed: "bg-neutral-100 text-neutral-500", full: "bg-amber-50 text-amber-700",
};

export function FormsAdmin({ brandId, title, basePath, programs = {} }: Props) {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newProgram, setNewProgram] = useState("");
    const [copyFrom, setCopyFrom] = useState("");

    const load = useCallback(async () => {
        const res = await fetch(`/api/intra/forms?brand=${brandId}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "불러오지 못했습니다."); return; }
        setRows(data.forms);
    }, [brandId]);
    useEffect(() => { load(); }, [load]);

    const create = async () => {
        if (!newTitle.trim()) return;
        setCreating(true);
        const res = await fetch("/api/intra/forms", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brand: brandId, title: newTitle, program: newProgram || null, copyFrom: copyFrom || undefined }),
        });
        const data = await res.json();
        setCreating(false);
        if (!res.ok) { setError(data.error ?? "만들지 못했습니다."); return; }
        window.location.href = `${basePath}/${data.id}`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
                <p className="mt-1 text-sm text-neutral-500">행사마다 신청서를 새로 만들고, 열기·마감·질문·로그인 여부를 설정합니다. 프로그램 페이지에 열린 신청서가 버튼으로 자동 노출됩니다.</p>
            </div>

            <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
                <div className="text-sm font-semibold text-neutral-800">새 신청서</div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_220px_auto] gap-2">
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="제목 (예: 2026 DAM 파티 시즌 4 학생 참가 신청)"
                        className="border border-neutral-300 rounded px-3 py-2 text-sm" />
                    <select value={newProgram} onChange={e => setNewProgram(e.target.value)} className="border border-neutral-300 rounded px-3 py-2 text-sm">
                        <option value="">연결 프로그램 없음</option>
                        {Object.entries(programs).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select value={copyFrom} onChange={e => setCopyFrom(e.target.value)} className="border border-neutral-300 rounded px-3 py-2 text-sm">
                        <option value="">빈 신청서로 시작</option>
                        {(rows ?? []).map(r => <option key={r.id} value={r.id}>복제: {r.title}</option>)}
                    </select>
                    <button onClick={create} disabled={creating || !newTitle.trim()}
                        className="inline-flex items-center justify-center gap-1 bg-neutral-900 text-white text-sm px-4 py-2 rounded disabled:opacity-40">
                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} 만들기
                    </button>
                </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {!rows ? <p className="text-sm text-neutral-400">불러오는 중…</p> : rows.length === 0 ? (
                <p className="text-sm text-neutral-400 py-10 text-center">신청서가 없습니다.</p>
            ) : (
                <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                    {rows.map(r => {
                        const av = formAvailability(r, r.response_count);
                        return (
                            <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                                <span className={`text-[11px] px-2 py-0.5 rounded ${STATUS_TONE[av]}`}>{AVAILABILITY_LABEL[av]}</span>
                                <Link href={`${basePath}/${r.id}`} className="font-medium text-neutral-900 hover:underline">{r.title}</Link>
                                {r.program && <span className="text-xs text-neutral-400">{programs[r.program] ?? r.program}</span>}
                                <span className="ml-auto text-sm text-neutral-600">응답 {r.response_count}{r.pending_count > 0 && <b className="ml-1 text-rose-600">대기 {r.pending_count}</b>}</span>
                                {r.status !== "draft" && (
                                    <a href={brandSiteUrl(brandId, `/${brandId}/forms/${r.slug}`)} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-700" title="사이트에서 보기">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                                <button onClick={() => { setCopyFrom(r.id); setNewTitle(`${r.title} (복제)`); setNewProgram(r.program ?? ""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                    className="text-neutral-400 hover:text-neutral-700" title="복제해서 새로 만들기"><Copy className="h-4 w-4" /></button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
