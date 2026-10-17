"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ExternalLink, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { PageHeader, Card } from "@/components/intra/IntraUI";
import { brandSiteUrl } from "@/lib/domain-registry";
import { adminTitle } from "@/lib/brand-site-menus";
import { plannersApi } from "@/features/planners/admin/upload";
import { homeApi, fromLocalInput, liveState, toLocalInput } from "@/features/planners/admin/homeApi";

// Planner's › 진열대 — 플래너'스 PAD 화면 맨 위 상품 진열대 (2026-10-17 첫 화면에서 옮김) (아임웹 '쇼핑 기획전' 자리). 상품은 플래너'스 PAD에서 골라 순서대로
interface Showcase { id: string; title: string; description: string | null; file_ids: string[]; sort_order: number; is_published: boolean; starts_at: string | null; ends_at: string | null }
interface Product { id: string; title: string; category: string; thumbnail_url: string | null; is_published: boolean }

export default function PlannersShowcasesAdmin() {
    const [items, setItems] = useState<Showcase[] | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null);

    const load = () => homeApi<{ items: Showcase[] }>("GET", "showcases").then((d) => setItems(d.items)).catch((e) => setError(e.message));
    useEffect(() => {
        load();
        plannersApi<{ files: Product[] }>("GET").then((d) => setProducts(d.files)).catch((e) => setError(e.message));
    }, []);

    async function add() {
        try { await homeApi("POST", "showcases", { title: "새 진열대", is_published: false }); load(); } catch (e) { setError((e as Error).message); }
    }
    async function move(i: number, d: -1 | 1) {
        if (!items) return;
        const a = items[i], b = items[i + d];
        if (!b) return;
        await Promise.all([homeApi("PATCH", "showcases", { id: a.id, sort_order: b.sort_order }), homeApi("PATCH", "showcases", { id: b.id, sort_order: a.sort_order })]);
        load();
    }

    return (
        <div className="max-w-5xl">
            <PageHeader title={adminTitle("/intra/ums/planners/showcases", "진열대")} description="플래너'스 PAD 진열대 — PAD 화면 전체 보기 맨 위, 분류별 섹션보다 먼저 이 순서대로 나옵니다. 상품은 최대 24개, 비공개 상품은 사이트에서 건너뜁니다.">
                <div className="flex items-center gap-3">
                    <a href={brandSiteUrl("planners", "/planners/pad")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700"><ExternalLink className="h-3.5 w-3.5" /> PAD 화면 보기</a>
                    <button onClick={add} className="inline-flex items-center gap-1.5 bg-neutral-900 px-3 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> 진열대 추가</button>
                </div>
            </PageHeader>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            {!items ? (
                <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : items.length === 0 ? (
                <p className="border border-neutral-200 py-16 text-center text-sm text-neutral-400">진열대가 없습니다.</p>
            ) : (
                <div className="space-y-4">
                    {items.map((s, i) => (
                        <ShowcaseEditor key={s.id} s={s} products={products} first={i === 0} last={i === items.length - 1} onMove={(d) => move(i, d)} onChanged={load} onError={setError} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ShowcaseEditor({ s, products, first, last, onMove, onChanged, onError }: {
    s: Showcase; products: Product[]; first: boolean; last: boolean; onMove: (d: -1 | 1) => void; onChanged: () => void; onError: (m: string) => void;
}) {
    const [f, setF] = useState({ title: s.title, description: s.description ?? "", ids: s.file_ids, is_published: s.is_published, starts: toLocalInput(s.starts_at), ends: toLocalInput(s.ends_at) });
    const [q, setQ] = useState("");
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
    const state = liveState(s);
    const results = q ? products.filter((p) => !f.ids.includes(p.id) && (p.title.includes(q) || p.category.includes(q))).slice(0, 12) : [];

    const shift = (i: number, d: -1 | 1) => {
        const j = i + d;
        if (j < 0 || j >= f.ids.length) return;
        const next = [...f.ids];
        [next[i], next[j]] = [next[j], next[i]];
        setF({ ...f, ids: next });
    };

    async function save() {
        setBusy(true); setSaved(false);
        try {
            await homeApi("PATCH", "showcases", { id: s.id, title: f.title, description: f.description, file_ids: f.ids, is_published: f.is_published, starts_at: fromLocalInput(f.starts), ends_at: fromLocalInput(f.ends) });
            setSaved(true); onChanged();
        } catch (e) { onError((e as Error).message); } finally { setBusy(false); }
    }
    async function remove() {
        if (!confirm(`'${s.title}' 진열대를 지울까요? 상품은 지워지지 않습니다.`)) return;
        try { await homeApi("DELETE", "showcases", undefined, s.id); onChanged(); } catch (e) { onError((e as Error).message); }
    }

    const input = "w-full border border-neutral-200 px-3 py-2 text-sm";
    return (
        <Card>
            <div className="mb-3 flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs ${state.tone === "on" ? "bg-[#0F766E] text-white" : state.tone === "wait" ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-500"}`}>{state.label}</span>
                <span className="ml-auto flex gap-1">
                    <button disabled={first} onClick={() => onMove(-1)} className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-30" aria-label="위로"><ArrowUp className="h-4 w-4" /></button>
                    <button disabled={last} onClick={() => onMove(1)} className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-30" aria-label="아래로"><ArrowDown className="h-4 w-4" /></button>
                    <button onClick={remove} className="p-1 text-neutral-300 hover:text-red-600" aria-label="삭제"><Trash2 className="h-4 w-4" /></button>
                </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-xs text-neutral-500">제목<input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={input} /></label>
                <label className="block text-xs text-neutral-500">설명 (선택)<input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={input} /></label>
                <label className="block text-xs text-neutral-500">보이기 시작 (비우면 바로)<input type="datetime-local" value={f.starts} onChange={(e) => setF({ ...f, starts: e.target.value })} className={input} /></label>
                <label className="block text-xs text-neutral-500">보이기 끝 (비우면 계속)<input type="datetime-local" value={f.ends} onChange={(e) => setF({ ...f, ends: e.target.value })} className={input} /></label>
            </div>

            <p className="mt-4 text-xs text-neutral-500">진열 상품 {f.ids.length}개</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {f.ids.map((id, i) => {
                    const p = byId.get(id);
                    return (
                        <div key={id} className="group relative border border-neutral-200 bg-neutral-50 p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {p?.thumbnail_url ? <img src={p.thumbnail_url} alt="" className="aspect-square w-full object-contain" /> : <div className="aspect-square" />}
                            <p className={`mt-1 line-clamp-2 text-[11px] leading-tight ${p?.is_published === false ? "text-red-500" : "text-neutral-700"}`}>{p ? p.title : "지워진 상품"}{p?.is_published === false ? " (비공개)" : ""}</p>
                            <div className="absolute inset-x-1 top-1 hidden justify-between group-hover:flex">
                                <span className="flex gap-0.5">
                                    <button onClick={() => shift(i, -1)} className="bg-white/90 p-0.5 shadow" aria-label="앞으로"><ArrowLeft className="h-3 w-3" /></button>
                                    <button onClick={() => shift(i, 1)} className="bg-white/90 p-0.5 shadow" aria-label="뒤로"><ArrowRight className="h-3 w-3" /></button>
                                </span>
                                <button onClick={() => setF({ ...f, ids: f.ids.filter((x) => x !== id) })} className="bg-white/90 p-0.5 shadow" aria-label="빼기"><X className="h-3 w-3" /></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="상품 이름·분류로 찾아서 진열대에 넣기" className="w-full border border-neutral-200 py-2 pl-9 pr-3 text-sm" />
                {results.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto border border-neutral-200 bg-white shadow-lg">
                        {results.map((p) => (
                            <li key={p.id}>
                                <button onClick={() => { setF({ ...f, ids: [...f.ids, p.id].slice(0, 24) }); setQ(""); }} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-neutral-50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="h-8 w-8 object-contain" />}
                                    <span className="flex-1 truncate">{p.title}</span>
                                    <span className="text-xs text-neutral-400">{p.category}{p.is_published ? "" : " · 비공개"}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-3">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_published} onChange={(e) => setF({ ...f, is_published: e.target.checked })} /> 공개</label>
                {saved && <span className="text-sm text-[#0F766E]">저장했습니다.</span>}
                <button onClick={save} disabled={busy} className="ml-auto bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50">저장</button>
            </div>
        </Card>
    );
}
