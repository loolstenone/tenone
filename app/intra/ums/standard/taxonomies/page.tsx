"use client";

/**
 * Standard > 산업군/직무군 — DB 기반 CRUD (Phase 2)
 * 이전: lib/badak-constants.ts 코드 상수 (read-only)
 * 현재: taxonomies 테이블 SSOT + 편집 UI
 */

import { useEffect, useState } from "react";
import { Briefcase, Factory, Loader2, Plus, Trash2, Edit2, Check, X, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

interface Taxonomy {
    id: string;
    kind: "industry" | "job_function" | "job_level" | "looking_for" | "can_offer";
    value: string;
    category: string | null;
    sort_order: number;
    is_active: boolean;
    is_core: boolean;
    description: string | null;
}

type TabKind = "industry" | "job_function";

export default function TaxonomiesStandardPage() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<Taxonomy[]>([]);
    const [tab, setTab] = useState<TabKind>("industry");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ value: string; category: string; sort_order: number }>({ value: "", category: "", sort_order: 99 });
    const [adding, setAdding] = useState(false);
    const [newForm, setNewForm] = useState<{ value: string; category: string; sort_order: number }>({ value: "", category: "", sort_order: 99 });
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        const res = await fetch("/api/intra/taxonomies");
        const j = await res.json();
        setItems(j.items ?? []);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function handleAdd() {
        if (!newForm.value) { setError("값 필수"); return; }
        setError(null);
        const res = await fetch("/api/intra/taxonomies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: tab, ...newForm }),
        });
        const j = await res.json();
        if (!res.ok) { setError(j.error || "추가 실패"); return; }
        setAdding(false);
        setNewForm({ value: "", category: "", sort_order: 99 });
        await load();
    }

    async function handleUpdate(id: string) {
        setError(null);
        const res = await fetch("/api/intra/taxonomies", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...editForm }),
        });
        const j = await res.json();
        if (!res.ok) { setError(j.error || "수정 실패"); return; }
        setEditingId(null);
        await load();
    }

    async function handleToggleActive(t: Taxonomy) {
        const res = await fetch("/api/intra/taxonomies", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: t.id, is_active: !t.is_active }),
        });
        if (!res.ok) { const j = await res.json(); setError(j.error); return; }
        await load();
    }

    async function handleDelete(id: string) {
        if (!confirm("삭제하시겠습니까? (복구 불가)")) return;
        const res = await fetch(`/api/intra/taxonomies?id=${id}`, { method: "DELETE" });
        if (!res.ok) { const j = await res.json(); setError(j.error); return; }
        await load();
    }

    const filtered = items.filter(i => i.kind === tab).sort((a, b) => a.sort_order - b.sort_order);
    const byCategory = new Map<string, Taxonomy[]>();
    filtered.forEach(t => {
        const c = t.category || "기타";
        if (!byCategory.has(c)) byCategory.set(c, []);
        byCategory.get(c)!.push(t);
    });

    const TabMeta = {
        industry: { label: "산업군", icon: Factory, color: "text-emerald-600", chipBg: "bg-emerald-50", chipBorder: "border-emerald-200", chipText: "text-emerald-800" },
        job_function: { label: "직무군", icon: Briefcase, color: "text-blue-600", chipBg: "bg-blue-50", chipBorder: "border-blue-200", chipText: "text-blue-800" },
    };
    const meta = TabMeta[tab];

    return (
        <div className="space-y-6">
            <PageHeader
                title="산업군 / 직무군 표준"
                description={`전 브랜드 공통 분류 · taxonomies 테이블 SSOT · ${items.length}건`}
            />

            {/* 경고 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900">
                <strong>주의:</strong> 이 상수는 <code className="font-mono bg-amber-100 px-1 rounded">taxonomies</code> 테이블 SSOT입니다.
                수정은 Badak · MADLeague · HeRo · Jakka 등 전 브랜드 프로필/지원서/매칭에 즉시 영향.
                <strong> Core 항목(🔒)은 삭제 금지</strong>.
            </div>

            {/* 탭 */}
            <div className="flex items-center gap-2 border-b border-neutral-200">
                {(["industry", "job_function"] as const).map(k => {
                    const m = TabMeta[k];
                    const Icon = m.icon;
                    const cnt = items.filter(i => i.kind === k).length;
                    return (
                        <button key={k} onClick={() => setTab(k)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors ${
                                tab === k ? "border-neutral-900 text-neutral-900 font-semibold" : "border-transparent text-neutral-500 hover:text-neutral-800"
                            }`}>
                            <Icon className={`h-3.5 w-3.5 ${m.color}`} />
                            {m.label}
                            <span className="text-[10px] text-neutral-400">({cnt})</span>
                        </button>
                    );
                })}
                <div className="flex-1" />
                <button onClick={() => setAdding(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-700 rounded">
                    <Plus className="h-3 w-3" /> 새 {meta.label} 추가
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5" /> {error}
                </div>
            )}

            {/* 추가 폼 */}
            {adding && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-semibold text-neutral-900">새 {meta.label} 추가</p>
                    <div className="flex items-center gap-2">
                        <input value={newForm.value} onChange={e => setNewForm({ ...newForm, value: e.target.value })}
                            placeholder="값 (예: 브랜드(인하우스))"
                            className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded" />
                        <input value={newForm.category} onChange={e => setNewForm({ ...newForm, category: e.target.value })}
                            placeholder="카테고리 (예: 브랜드/유통)"
                            className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded" />
                        <input type="number" value={newForm.sort_order} onChange={e => setNewForm({ ...newForm, sort_order: Number(e.target.value) })}
                            placeholder="순서" className="w-16 px-2 py-1 text-xs border border-neutral-200 rounded" />
                        <button onClick={handleAdd} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700">추가</button>
                        <button onClick={() => { setAdding(false); setNewForm({ value: "", category: "", sort_order: 99 }); }}
                            className="px-2 py-1 text-xs border border-neutral-200 rounded">취소</button>
                    </div>
                </div>
            )}

            {/* 리스트 */}
            {loading ? (
                <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
            ) : (
                <div className="space-y-4">
                    {Array.from(byCategory.entries()).map(([cat, list]) => (
                        <div key={cat}>
                            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">{cat} ({list.length})</h3>
                            <div className="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                                {list.map(t => (
                                    <div key={t.id} className="px-3 py-2 flex items-center gap-2 text-xs">
                                        {editingId === t.id ? (
                                            <>
                                                <input value={editForm.value} onChange={e => setEditForm({ ...editForm, value: e.target.value })}
                                                    className="flex-1 px-2 py-1 border border-neutral-300 rounded" />
                                                <input value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                                    className="w-40 px-2 py-1 border border-neutral-300 rounded" />
                                                <input type="number" value={editForm.sort_order} onChange={e => setEditForm({ ...editForm, sort_order: Number(e.target.value) })}
                                                    className="w-16 px-2 py-1 border border-neutral-300 rounded" />
                                                <button onClick={() => handleUpdate(t.id)} className="text-emerald-600 hover:text-emerald-800"><Check className="h-4 w-4" /></button>
                                                <button onClick={() => setEditingId(null)} className="text-neutral-400 hover:text-neutral-600"><X className="h-4 w-4" /></button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-8 text-neutral-400 font-mono text-[10px]">#{t.sort_order}</span>
                                                <span className={`flex-1 ${t.is_active ? "text-neutral-900" : "text-neutral-300 line-through"}`}>
                                                    {t.is_core && <span className="mr-1 text-[9px]" title="Core 항목">🔒</span>}
                                                    <span className={`inline-block px-1.5 py-0.5 rounded ${meta.chipBg} ${meta.chipBorder} border ${meta.chipText}`}>
                                                        {t.value}
                                                    </span>
                                                </span>
                                                <button onClick={() => handleToggleActive(t)}
                                                    className={`text-[10px] px-1.5 py-0.5 rounded ${t.is_active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                                                    {t.is_active ? "활성" : "비활성"}
                                                </button>
                                                <button onClick={() => { setEditingId(t.id); setEditForm({ value: t.value, category: t.category || "", sort_order: t.sort_order }); }}
                                                    className="text-neutral-400 hover:text-neutral-700"><Edit2 className="h-3 w-3" /></button>
                                                <button onClick={() => handleDelete(t.id)}
                                                    disabled={t.is_core}
                                                    title={t.is_core ? "Core 항목은 삭제 불가" : "삭제"}
                                                    className={`${t.is_core ? "text-neutral-200 cursor-not-allowed" : "text-rose-400 hover:text-rose-600"}`}>
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 마이그레이션 안내 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-[11px] text-neutral-700 leading-relaxed">
                <p className="font-semibold mb-1">코드 → DB 이관 완료 (2026-04-21)</p>
                <ul className="list-disc ml-4 space-y-0.5">
                    <li>이전: <code className="font-mono bg-neutral-100 px-1 rounded">lib/badak-constants.ts</code> 하드코딩 (read-only)</li>
                    <li>현재: <code className="font-mono bg-neutral-100 px-1 rounded">taxonomies</code> 테이블 SSOT + CRUD UI</li>
                    <li>기존 코드 <code>INDUSTRIES</code>·<code>JOB_FUNCTIONS</code> 상수는 fallback으로 유지. 점진적으로 DB fetch로 전환 권장.</li>
                </ul>
            </div>
        </div>
    );
}
