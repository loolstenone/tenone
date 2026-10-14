"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, ImagePlus, Loader2, Trash2, Upload, X } from "lucide-react";
import { PageHeader, Card } from "@/components/intra/IntraUI";
import { brandSiteUrl } from "@/lib/domain-registry";
import { PAD_CATEGORIES, formatFileSize, padPath } from "@/lib/planners/library-shared";
import { plannersApi, uploadPlannersAsset, type UploadedFile } from "@/features/planners/admin/upload";

// 플래너스 PAD › 상품 등록·편집 — 아임웹 상품 편집 화면 기준 (사진 · 디지털 파일 · 상품명 · 분류 · 설명 · 상세 이미지 · 공개)
interface Product {
    id: string; category: string; title: string; description: string | null; year: number | null;
    file_name: string; file_size: number; images: string[]; detail_images: string[];
    is_published: boolean; download_count: number; legacy_badak_no: number | null;
}
const EMPTY: Omit<Product, "id"> = { category: PAD_CATEGORIES[3], title: "", description: "", year: null, file_name: "", file_size: 0, images: [], detail_images: [], is_published: false, download_count: 0, legacy_badak_no: null };

export default function PlannersPadEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const isNew = id === "new";
    const router = useRouter();
    const [p, setP] = useState<Omit<Product, "id"> | null>(isNew ? EMPTY : null);
    const [newFile, setNewFile] = useState<UploadedFile | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

    useEffect(() => {
        if (isNew) return;
        plannersApi<{ file: Product }>("GET", `?id=${id}`).then((d) => setP(d.file)).catch((e) => setMsg({ ok: false, text: e.message }));
    }, [id, isNew]);

    if (!p) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    const set = (patch: Partial<Product>) => setP({ ...p, ...patch });

    async function addImages(files: FileList | null, key: "images" | "detail_images") {
        if (!files?.length || !p) return;
        setBusy(key); setMsg(null);
        try {
            const urls: string[] = [];
            for (const f of Array.from(files)) {
                const up = await uploadPlannersAsset(f, "media");
                if (up.publicUrl) urls.push(up.publicUrl);
            }
            setP((cur) => (cur ? { ...cur, [key]: [...cur[key], ...urls] } : cur));
        } catch (e) { setMsg({ ok: false, text: (e as Error).message }); } finally { setBusy(null); }
    }

    async function pickFile(files: FileList | null) {
        const f = files?.[0];
        if (!f) return;
        setBusy("file"); setMsg(null);
        try { setNewFile(await uploadPlannersAsset(f, "file")); } catch (e) { setMsg({ ok: false, text: (e as Error).message }); } finally { setBusy(null); }
    }

    async function save() {
        if (!p) return;
        if (!p.title.trim()) { setMsg({ ok: false, text: "상품명을 넣어 주세요." }); return; }
        if (isNew && !newFile) { setMsg({ ok: false, text: "내려받을 파일을 올려 주세요." }); return; }
        setBusy("save"); setMsg(null);
        const fields = { title: p.title, category: p.category, description: p.description, year: p.year, images: p.images, detail_images: p.detail_images, is_published: p.is_published };
        try {
            if (isNew) {
                const r = await plannersApi<{ id: string }>("POST", "", { action: "create", ...fields, file: newFile });
                router.replace(`/intra/ums/planners/pad/${r.id}`);
                return;
            }
            await plannersApi("PATCH", "", { id, ...fields, ...(newFile && { file: newFile }) });
            if (newFile) { set({ file_name: newFile.name, file_size: newFile.size }); setNewFile(null); }
            setMsg({ ok: true, text: "저장했습니다." });
        } catch (e) { setMsg({ ok: false, text: (e as Error).message }); } finally { setBusy(null); }
    }

    async function remove() {
        if (!confirm(`'${p?.title}' 상품을 삭제할까요? 내려받는 파일도 함께 지워집니다.`)) return;
        setBusy("delete");
        try { await plannersApi("DELETE", `?id=${id}`); router.replace("/intra/ums/planners/pad"); } catch (e) { setMsg({ ok: false, text: (e as Error).message }); setBusy(null); }
    }

    return (
        <div className="max-w-4xl">
            <PageHeader title={isNew ? "상품 등록" : p.title || "상품 편집"} description={isNew ? "플래너스 PAD에 새 플래너·서식을 올립니다." : `플래너스 PAD 상품${p.legacy_badak_no ? ` · 옛 바닥상회 #${p.legacy_badak_no}` : ""} · ${p.download_count.toLocaleString()}회 받음`}>
                <div className="flex items-center gap-3">
                    <Link href="/intra/ums/planners/pad" className="text-xs text-neutral-400 hover:text-neutral-700">← 상품 목록</Link>
                    {!isNew && (
                        <a href={brandSiteUrl("planners", padPath(id))} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700">
                            <ExternalLink className="h-3.5 w-3.5" /> 사이트에서 보기
                        </a>
                    )}
                </div>
            </PageHeader>

            <div className="space-y-6">
                <Card>
                    <SectionHead title="상품 사진" note="첫 장이 목록 썸네일 · 정사각형 권장 · PNG·JPG·WEBP 10MB까지" />
                    <ImageList urls={p.images} onChange={(images) => set({ images })} busy={busy === "images"} onAdd={(f) => addImages(f, "images")} />
                </Card>

                <Card>
                    <SectionHead title="디지털 파일" note="회원이 내려받는 파일 · PDF·zip·docx·pptx·png 60MB까지" />
                    <div className="flex flex-wrap items-center gap-3 border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
                        <span className="flex-1 truncate">
                            {newFile ? <><b>새 파일</b> {newFile.name} · {formatFileSize(newFile.size)}</> : p.file_name ? <>{p.file_name} · {formatFileSize(p.file_size)}</> : <span className="text-neutral-400">아직 올린 파일이 없습니다.</span>}
                        </span>
                        <FilePick label={p.file_name || newFile ? "파일 교체" : "파일 올리기"} accept=".pdf,.zip,.docx,.pptx,.png" busy={busy === "file"} onPick={pickFile} />
                    </div>
                    {newFile && !isNew && <p className="mt-2 text-xs text-amber-700">저장하면 새 파일로 바뀌고 이전 파일은 지워집니다.</p>}
                </Card>

                <Card>
                    <SectionHead title="상품 정보" />
                    <div className="grid gap-4 md:grid-cols-[1fr_200px_120px]">
                        <Field label="상품명">
                            <input value={p.title} onChange={(e) => set({ title: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm" />
                        </Field>
                        <Field label="분류">
                            <select value={p.category} onChange={(e) => set({ category: e.target.value })} className="w-full border border-neutral-200 px-2 py-2 text-sm">
                                {PAD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>
                        <Field label="연도 (선택)">
                            <input type="number" value={p.year ?? ""} onChange={(e) => set({ year: e.target.value ? Number(e.target.value) : null })} className="w-full border border-neutral-200 px-3 py-2 text-sm" />
                        </Field>
                    </div>
                    <Field label="설명" className="mt-4">
                        <textarea value={p.description ?? ""} onChange={(e) => set({ description: e.target.value })} rows={5} placeholder="상품 상세에 보이는 소개 문구 (줄바꿈 유지)" className="w-full border border-neutral-200 px-3 py-2 text-sm" />
                    </Field>
                </Card>

                <Card>
                    <SectionHead title="상세 이미지" note="상품 상세 아래에 차례로 보이는 내지 미리보기" />
                    <ImageList urls={p.detail_images} onChange={(detail_images) => set({ detail_images })} busy={busy === "detail_images"} onAdd={(f) => addImages(f, "detail_images")} wide />
                </Card>

                <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-neutral-200 bg-white py-4">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={p.is_published} onChange={(e) => set({ is_published: e.target.checked })} /> 사이트에 공개
                    </label>
                    {msg && <span className={`text-sm ${msg.ok ? "text-[#0F766E]" : "text-red-600"}`}>{msg.text}</span>}
                    <div className="ml-auto flex gap-2">
                        {!isNew && (
                            <button onClick={remove} disabled={!!busy} className="inline-flex items-center gap-1.5 border border-neutral-200 px-4 py-2 text-sm text-neutral-500 hover:border-red-300 hover:text-red-600">
                                <Trash2 className="h-4 w-4" /> 삭제
                            </button>
                        )}
                        <button onClick={save} disabled={!!busy} className="inline-flex items-center gap-1.5 bg-neutral-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50">
                            {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" />} {isNew ? "등록" : "저장"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionHead({ title, note }: { title: string; note?: string }) {
    return (
        <div className="mb-3 flex flex-wrap items-baseline gap-2">
            <h2 className="text-sm font-bold">{title}</h2>
            {note && <span className="text-xs text-neutral-400">{note}</span>}
        </div>
    );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-1 block text-xs text-neutral-500">{label}</span>
            {children}
        </label>
    );
}

function FilePick({ label, accept, busy, onPick, multiple = false }: { label: string; accept: string; busy: boolean; onPick: (f: FileList | null) => void; multiple?: boolean }) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <>
            <input ref={ref} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => { onPick(e.target.files); e.target.value = ""; }} />
            <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="inline-flex items-center gap-1.5 border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:border-neutral-500 disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {label}
            </button>
        </>
    );
}

/** 사진 목록 — 순서 바꾸기(←→) · 삭제 · 추가 */
function ImageList({ urls, onChange, onAdd, busy, wide = false }: { urls: string[]; onChange: (u: string[]) => void; onAdd: (f: FileList | null) => void; busy: boolean; wide?: boolean }) {
    const move = (i: number, d: -1 | 1) => {
        const j = i + d;
        if (j < 0 || j >= urls.length) return;
        const next = [...urls];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
    };
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className={`grid gap-3 ${wide ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3 md:grid-cols-6"}`}>
            {urls.map((u, i) => (
                <div key={u} className="group relative aspect-square border border-neutral-200 bg-neutral-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="h-full w-full object-contain p-1" />
                    {i === 0 && !wide && <span className="absolute left-1 top-1 bg-neutral-900 px-1 text-[10px] font-bold text-white">대표</span>}
                    <div className="absolute inset-x-1 bottom-1 hidden justify-between group-hover:flex">
                        <span className="flex gap-1">
                            <IconBtn label="앞으로" onClick={() => move(i, -1)}><ArrowLeft className="h-3 w-3" /></IconBtn>
                            <IconBtn label="뒤로" onClick={() => move(i, 1)}><ArrowRight className="h-3 w-3" /></IconBtn>
                        </span>
                        <IconBtn label="빼기" onClick={() => onChange(urls.filter((x) => x !== u))}><X className="h-3 w-3" /></IconBtn>
                    </div>
                </div>
            ))}
            <input ref={ref} type="file" accept=".png,.jpg,.jpeg,.gif,.webp" multiple className="hidden" onChange={(e) => { onAdd(e.target.files); e.target.value = ""; }} />
            <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="flex aspect-square flex-col items-center justify-center gap-1 border border-dashed border-neutral-300 text-xs text-neutral-400 hover:border-neutral-500 hover:text-neutral-700">
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />} 사진 추가
            </button>
        </div>
    );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button type="button" onClick={onClick} aria-label={label} title={label} className="flex h-6 w-6 items-center justify-center bg-white/90 shadow hover:bg-white">
            {children}
        </button>
    );
}
