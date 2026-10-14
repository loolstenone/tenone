"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { PageHeader, Card } from "@/components/intra/IntraUI";
import { brandSiteUrl } from "@/lib/domain-registry";
import { adminTitle } from "@/lib/brand-site-menus";
import { uploadPlannersAsset } from "@/features/planners/admin/upload";
import { homeApi, fromLocalInput, liveState, toLocalInput } from "@/features/planners/admin/homeApi";

// Planner's › 배너 — 첫 화면 배너 (아임웹 디자인 모드 '키비주얼' 자리). 첫 장 '우리는 모두 기획자다'는 고정, 여기 배너는 그 뒤에 이어진다
interface Banner {
    id: string; title: string; subtitle: string | null; image_url: string | null; link_url: string | null; button_label: string | null;
    sort_order: number; is_published: boolean; starts_at: string | null; ends_at: string | null;
}

export default function PlannersBannersAdmin() {
    const [items, setItems] = useState<Banner[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = () => homeApi<{ items: Banner[] }>("GET", "banners").then((d) => setItems(d.items)).catch((e) => setError(e.message));
    useEffect(() => { load(); }, []);

    async function add() {
        try { await homeApi("POST", "banners", { title: "새 배너", is_published: false }); load(); } catch (e) { setError((e as Error).message); }
    }
    async function move(i: number, d: -1 | 1) {
        if (!items) return;
        const a = items[i], b = items[i + d];
        if (!b) return;
        await Promise.all([homeApi("PATCH", "banners", { id: a.id, sort_order: b.sort_order }), homeApi("PATCH", "banners", { id: b.id, sort_order: a.sort_order })]);
        load();
    }

    return (
        <div className="max-w-4xl">
            <PageHeader title={adminTitle("/intra/ums/planners/banners", "배너")} description="첫 화면 배너 — 첫 장 '우리는 모두 기획자다'는 고정이고, 여기 배너가 그 뒤에 이어져 7초마다 넘어갑니다. 공개 기간을 정하면 그 기간에만 보입니다.">
                <div className="flex items-center gap-3">
                    <a href={brandSiteUrl("planners", "/planners")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700"><ExternalLink className="h-3.5 w-3.5" /> 첫 화면 보기</a>
                    <button onClick={add} className="inline-flex items-center gap-1.5 bg-neutral-900 px-3 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> 배너 추가</button>
                </div>
            </PageHeader>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            {!items ? (
                <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : items.length === 0 ? (
                <p className="border border-neutral-200 py-16 text-center text-sm text-neutral-400">배너가 없습니다. 지금은 첫 장만 보입니다.</p>
            ) : (
                <div className="space-y-4">
                    {items.map((b, i) => (
                        <BannerEditor key={b.id} b={b} onMove={(d) => move(i, d)} first={i === 0} last={i === items.length - 1} onChanged={load} onError={setError} />
                    ))}
                </div>
            )}
        </div>
    );
}

function BannerEditor({ b, onMove, first, last, onChanged, onError }: { b: Banner; onMove: (d: -1 | 1) => void; first: boolean; last: boolean; onChanged: () => void; onError: (m: string) => void }) {
    const [f, setF] = useState({ ...b, starts: toLocalInput(b.starts_at), ends: toLocalInput(b.ends_at) });
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const state = liveState(b);

    async function upload(list: FileList | null) {
        const file = list?.[0];
        if (!file) return;
        setBusy(true);
        try { const up = await uploadPlannersAsset(file, "media"); setF((x) => ({ ...x, image_url: up.publicUrl })); } catch (e) { onError((e as Error).message); } finally { setBusy(false); }
    }
    async function save() {
        setBusy(true); setSaved(false);
        try {
            await homeApi("PATCH", "banners", {
                id: b.id, title: f.title, subtitle: f.subtitle ?? "", image_url: f.image_url ?? "", link_url: f.link_url ?? "", button_label: f.button_label ?? "",
                is_published: f.is_published, starts_at: fromLocalInput(f.starts), ends_at: fromLocalInput(f.ends),
            });
            setSaved(true); onChanged();
        } catch (e) { onError((e as Error).message); } finally { setBusy(false); }
    }
    async function remove() {
        if (!confirm(`'${b.title}' 배너를 지울까요?`)) return;
        try { await homeApi("DELETE", "banners", undefined, b.id); onChanged(); } catch (e) { onError((e as Error).message); }
    }

    const input = "w-full border border-neutral-200 px-3 py-2 text-sm";
    return (
        <Card>
            <div className="mb-3 flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs ${state.tone === "on" ? "bg-[#0F766E] text-white" : state.tone === "wait" ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-500"}`}>{state.label}</span>
                <span className="ml-auto flex gap-1">
                    <button disabled={first} onClick={() => onMove(-1)} className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-30" aria-label="앞으로"><ArrowUp className="h-4 w-4" /></button>
                    <button disabled={last} onClick={() => onMove(1)} className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-30" aria-label="뒤로"><ArrowDown className="h-4 w-4" /></button>
                    <button onClick={remove} className="p-1 text-neutral-300 hover:text-red-600" aria-label="삭제"><Trash2 className="h-4 w-4" /></button>
                </span>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_200px]">
                <div className="space-y-3">
                    <label className="block text-xs text-neutral-500">큰 문구<input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={input} /></label>
                    <label className="block text-xs text-neutral-500">설명<textarea value={f.subtitle ?? ""} onChange={(e) => setF({ ...f, subtitle: e.target.value })} rows={2} className={input} /></label>
                    <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                        <label className="block text-xs text-neutral-500">링크 (예: /planners/pad/… 또는 https://…)<input value={f.link_url ?? ""} onChange={(e) => setF({ ...f, link_url: e.target.value })} className={input} /></label>
                        <label className="block text-xs text-neutral-500">버튼 문구<input value={f.button_label ?? ""} onChange={(e) => setF({ ...f, button_label: e.target.value })} placeholder="자세히 보기" className={input} /></label>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="block text-xs text-neutral-500">보이기 시작 (비우면 바로)<input type="datetime-local" value={f.starts} onChange={(e) => setF({ ...f, starts: e.target.value })} className={input} /></label>
                        <label className="block text-xs text-neutral-500">보이기 끝 (비우면 계속)<input type="datetime-local" value={f.ends} onChange={(e) => setF({ ...f, ends: e.target.value })} className={input} /></label>
                    </div>
                </div>
                <div>
                    <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif" className="hidden" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
                    <button type="button" onClick={() => fileRef.current?.click()} className="flex aspect-square w-full items-center justify-center overflow-hidden border border-dashed border-neutral-300 bg-[#134E4A] text-xs text-teal-100 hover:border-neutral-500">
                        {f.image_url
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={f.image_url} alt="" className="h-full w-full object-contain" />
                            : <span className="flex flex-col items-center gap-1">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />} 오른쪽 사진</span>}
                    </button>
                    {f.image_url && <button onClick={() => setF({ ...f, image_url: null })} className="mt-1 text-xs text-neutral-400 hover:text-red-600">사진 빼기</button>}
                </div>
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-3">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_published} onChange={(e) => setF({ ...f, is_published: e.target.checked })} /> 공개</label>
                {saved && <span className="text-sm text-[#0F766E]">저장했습니다.</span>}
                <button onClick={save} disabled={busy} className="ml-auto bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50">저장</button>
            </div>
        </Card>
    );
}
