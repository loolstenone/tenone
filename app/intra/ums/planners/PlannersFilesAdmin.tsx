"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Upload, Trash2 } from "lucide-react";
import { PageHeader, Card } from "@/components/intra/IntraUI";
import { brandSiteUrl } from "@/lib/domain-registry";
import { adminTitle } from "@/lib/brand-site-menus";
import { createClient } from "@/lib/supabase/client";
import { PLANNER_CATEGORIES, TEMPLATE_CATEGORIES, formatFileSize, type PlannersFileKind } from "@/lib/planners/library-shared";

// 사이트 플래너스 PAD(/planners/pad) — 플래너(본체) · 템플릿 (lib/brand-site-menus.ts) — 원천 planners_files
interface Row {
    id: string; kind: PlannersFileKind; category: string; title: string; description: string | null; year: number | null;
    file_name: string; file_size: number; sort_order: number; is_published: boolean; download_count: number; legacy_badak_no: number | null;
}

const SITE_PATH: Record<PlannersFileKind, string> = { planner: "/planners/pad?c=%EC%97%B0%EA%B0%84%20%ED%94%8C%EB%9E%98%EB%84%88", template: "/planners/pad" };

export function PlannersFilesAdmin({ kind }: { kind: PlannersFileKind }) {
    const categories: readonly string[] = kind === "planner" ? PLANNER_CATEGORIES : TEMPLATE_CATEGORIES;
    const title = adminTitle(kind === "planner" ? "/intra/ums/planners/planner" : "/intra/ums/planners/templates", kind === "planner" ? "플래너" : "템플릿");
    const [rows, setRows] = useState<Row[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");

    const load = useCallback(async () => {
        const res = await fetch(`/api/intra/planners/files?kind=${kind}`);
        const body = await res.json().catch(() => ({}));
        if (!res.ok) { setError(body.error ?? "목록을 불러오지 못했습니다."); return; }
        setRows(body.files);
    }, [kind]);

    useEffect(() => { load(); }, [load]);

    async function patch(id: string, change: Partial<Row>) {
        setRows(prev => prev?.map(r => (r.id === id ? { ...r, ...change } : r)) ?? prev);
        const res = await fetch("/api/intra/planners/files", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...change }) });
        if (!res.ok) { setError((await res.json().catch(() => ({}))).error ?? "저장하지 못했습니다."); load(); }
    }

    async function remove(r: Row) {
        if (!confirm(`'${r.title}'을(를) 삭제할까요? 파일도 함께 지워집니다.`)) return;
        const res = await fetch(`/api/intra/planners/files?id=${r.id}`, { method: "DELETE" });
        if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "삭제하지 못했습니다.");
        load();
    }

    const shown = (rows ?? []).filter(r => filter === "all" || r.category === filter);
    const published = (rows ?? []).filter(r => r.is_published).length;

    return (
        <div>
            <PageHeader title={title} description="사이트 플래너스 PAD — 로그인 회원이 내려받는 자료. 비공개는 사이트에 보이지 않습니다.">
                <a href={brandSiteUrl("planners", SITE_PATH[kind])} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트에서 보기
                </a>
            </PageHeader>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <UploadForm kind={kind} categories={categories} onDone={load} />

            <Card>
                <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-neutral-500">전체 {rows?.length ?? 0}개 · 공개 {published}개</span>
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="ml-auto border border-neutral-200 px-2 py-1 text-sm">
                        <option value="all">전체 분류</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                {!rows ? (
                    <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                ) : shown.length === 0 ? (
                    <p className="py-10 text-center text-sm text-neutral-400">자료가 없습니다.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                                <th className="py-2 pr-2">제목</th>
                                <th className="py-2 pr-2">분류</th>
                                <th className="py-2 pr-2 text-right">크기</th>
                                <th className="py-2 pr-2 text-right">받음</th>
                                <th className="py-2 pr-2">공개</th>
                                <th className="py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {shown.map(r => (
                                <tr key={r.id} className="border-b border-neutral-100 align-top">
                                    <td className="py-2 pr-2">
                                        <input defaultValue={r.title} onBlur={e => e.target.value.trim() && e.target.value !== r.title && patch(r.id, { title: e.target.value.trim() })}
                                            className="w-full border border-transparent px-1 py-0.5 hover:border-neutral-200 focus:border-neutral-400 focus:outline-none" />
                                        <p className="px-1 text-xs text-neutral-400">{r.file_name}{r.legacy_badak_no ? ` · 옛 바닥상회 #${r.legacy_badak_no}` : ""}</p>
                                    </td>
                                    <td className="py-2 pr-2">
                                        <select value={r.category} onChange={e => patch(r.id, { category: e.target.value })} className="border border-neutral-200 px-1 py-0.5 text-xs">
                                            {[...new Set([...categories, r.category])].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </td>
                                    <td className="py-2 pr-2 text-right text-xs text-neutral-500">{formatFileSize(r.file_size)}</td>
                                    <td className="py-2 pr-2 text-right text-xs text-neutral-500">{r.download_count.toLocaleString()}</td>
                                    <td className="py-2 pr-2">
                                        <label className="inline-flex items-center gap-1 text-xs">
                                            <input type="checkbox" checked={r.is_published} onChange={e => patch(r.id, { is_published: e.target.checked })} />
                                            {r.is_published ? "공개" : "비공개"}
                                        </label>
                                    </td>
                                    <td className="py-2 text-right">
                                        <button onClick={() => remove(r)} className="text-neutral-300 hover:text-red-600" aria-label="삭제"><Trash2 className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>
        </div>
    );
}

function UploadForm({ kind, categories, onDone }: { kind: PlannersFileKind; categories: readonly string[]; onDone: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState(categories[0]);
    const [publish, setPublish] = useState(false);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!file || !title.trim()) { setMsg("파일과 제목을 넣어 주세요."); return; }
        setBusy(true); setMsg(null);
        try {
            const prep = await fetch("/api/intra/planners/files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "prepare", file: { name: file.name, size: file.size, type: file.type } }) });
            const p = await prep.json();
            if (!prep.ok) throw new Error(p.error);
            const { error: upErr } = await createClient().storage.from("planners-files").uploadToSignedUrl(p.path, p.token, file, { contentType: file.type || undefined });
            if (upErr) throw new Error(upErr.message);
            const res = await fetch("/api/intra/planners/files", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", kind, category, title: title.trim(), is_published: publish, file: { path: p.path, name: file.name, size: file.size, type: file.type } }) });
            const r = await res.json();
            if (!res.ok) throw new Error(r.error);
            setFile(null); setTitle(""); setMsg("올렸습니다.");
            onDone();
        } catch (err) {
            setMsg(err instanceof Error ? err.message : "올리지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <Card>
            <form onSubmit={submit} className="flex flex-wrap items-end gap-3 text-sm">
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-neutral-500">파일 (PDF·zip·docx·pptx·png, 60MB까지)</span>
                    <input type="file" accept=".pdf,.zip,.docx,.pptx,.png" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                </label>
                <label className="flex flex-1 flex-col gap-1">
                    <span className="text-xs text-neutral-500">제목 (사이트에 보이는 이름)</span>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="border border-neutral-200 px-2 py-1.5" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-neutral-500">분류</span>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="border border-neutral-200 px-2 py-1.5">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </label>
                <label className="flex items-center gap-1 pb-2 text-xs">
                    <input type="checkbox" checked={publish} onChange={e => setPublish(e.target.checked)} /> 바로 공개
                </label>
                <button disabled={busy} className="inline-flex items-center gap-1.5 bg-neutral-900 px-4 py-2 text-white disabled:opacity-50">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} 올리기
                </button>
                {msg && <p className="w-full text-xs text-neutral-600">{msg}</p>}
            </form>
        </Card>
    );
}
