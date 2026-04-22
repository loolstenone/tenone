"use client";

/**
 * 64 HeRo 유형 관리 (Intra)
 * hit_hero_types — type_code · character_name · character_label
 * strengths · cautions · fit_direction · illustration_url
 *
 * Universe 전체에서 쓰이는 identity badge SSOT
 */

import { useEffect, useState } from "react";
import { Sparkles, Save, X, Loader2, Search, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface HeroType {
    type_code: string;
    character_name: string;
    character_label: string;
    profile_overview: string | null;
    strengths: string[];
    cautions: string[];
    fit_direction: string | null;
    illustration_url: string | null;
}

// type_code prefix(C/P) × MBTI(INFP...) · C=Character DISC 축, P=Personality 축
function prefix(code: string): { group: string; mbti: string } {
    const [g, m] = code.split("-");
    return { group: g, mbti: m };
}

export default function HeroTypesPage() {
    const [rows, setRows] = useState<HeroType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [groupFilter, setGroupFilter] = useState<"all" | "C" | "P">("all");
    const [editing, setEditing] = useState<HeroType | null>(null);
    const [saving, setSaving] = useState(false);

    async function load() {
        setLoading(true);
        const { data } = await createClient()
            .from("hit_hero_types")
            .select("*")
            .order("type_code");
        setRows((data ?? []).map((r: Record<string, unknown>) => ({
            ...r,
            strengths: Array.isArray(r.strengths) ? (r.strengths as string[]) : [],
            cautions: Array.isArray(r.cautions) ? (r.cautions as string[]) : [],
        })) as HeroType[]);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const filtered = rows.filter(r => {
        const p = prefix(r.type_code);
        if (groupFilter !== "all" && p.group !== groupFilter) return false;
        if (!search) return true;
        const s = search.toLowerCase();
        return r.type_code.toLowerCase().includes(s)
            || r.character_name?.toLowerCase().includes(s)
            || r.character_label?.toLowerCase().includes(s);
    });

    async function save() {
        if (!editing) return;
        setSaving(true);
        const sb = createClient();
        const { error } = await sb
            .from("hit_hero_types")
            .update({
                character_name: editing.character_name,
                character_label: editing.character_label,
                profile_overview: editing.profile_overview,
                fit_direction: editing.fit_direction,
                illustration_url: editing.illustration_url,
                strengths: editing.strengths.filter(s => s.trim()),
                cautions: editing.cautions.filter(s => s.trim()),
            })
            .eq("type_code", editing.type_code);

        if (error) {
            alert(`저장 실패: ${error.message}`);
            setSaving(false);
            return;
        }

        setRows(prev => prev.map(r => r.type_code === editing.type_code ? editing : r));
        setEditing(null);
        setSaving(false);
    }

    return (
        <div>
            <PageHeader title="HeRo 유형 관리" description="hit_hero_types · 64 영웅 유형 · Universe-wide Badge SSOT" />

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-500">총 {rows.length}개 유형</span>
                            <div className="flex items-center gap-0.5 ml-3">
                                {(["all", "C", "P"] as const).map(f => (
                                    <button key={f} onClick={() => setGroupFilter(f)}
                                        className={`px-2.5 py-1 text-[11px] rounded ${groupFilter === f ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                                        {f === "all" ? "전체" : f === "C" ? "C 그룹 (Character)" : "P 그룹 (Personality)"}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="유형·캐릭터명"
                                className="pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded w-60 focus:outline-none focus:border-neutral-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filtered.map(r => (
                            <button key={r.type_code} onClick={() => setEditing(r)}
                                className="text-left border border-neutral-200 rounded-lg p-3 hover:border-neutral-400 hover:shadow-sm transition-all bg-white">
                                <div className="flex items-center gap-2 mb-2">
                                    {r.illustration_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={r.illustration_url} alt={r.character_name} className="w-10 h-10 rounded object-cover bg-neutral-100" />
                                    ) : (
                                        <div className="w-10 h-10 rounded bg-gradient-to-br from-rose-100 to-amber-50 flex items-center justify-center">
                                            <Sparkles className="h-4 w-4 text-rose-400" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-mono text-neutral-400">{r.type_code}</p>
                                        <p className="text-xs font-semibold text-neutral-800 truncate">{r.character_name}</p>
                                    </div>
                                </div>
                                <p className="text-[11px] text-neutral-600 truncate">{r.character_label}</p>
                            </button>
                        ))}
                    </div>

                    {/* 편집 모달 */}
                    {editing && (
                        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
                            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">{editing.type_code}</span>
                                        <h3 className="text-sm font-bold">{editing.character_name}</h3>
                                    </div>
                                    <button onClick={() => setEditing(null)} className="text-neutral-400 hover:text-neutral-700">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="p-5 space-y-4">
                                    <Field label="캐릭터명 (character_name)">
                                        <input value={editing.character_name} onChange={e => setEditing({ ...editing, character_name: e.target.value })}
                                            className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                                    </Field>
                                    <Field label="한 줄 설명 (character_label)">
                                        <input value={editing.character_label} onChange={e => setEditing({ ...editing, character_label: e.target.value })}
                                            className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                                    </Field>
                                    <Field label="프로필 개요 (profile_overview)">
                                        <textarea value={editing.profile_overview ?? ""} onChange={e => setEditing({ ...editing, profile_overview: e.target.value })}
                                            rows={4}
                                            className="w-full px-3 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 resize-none" />
                                    </Field>
                                    <Field label="적합 방향 (fit_direction)">
                                        <textarea value={editing.fit_direction ?? ""} onChange={e => setEditing({ ...editing, fit_direction: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 resize-none" />
                                    </Field>
                                    <Field label="일러스트 URL (illustration_url)">
                                        <div className="flex items-center gap-2">
                                            <input value={editing.illustration_url ?? ""} onChange={e => setEditing({ ...editing, illustration_url: e.target.value })}
                                                placeholder="https://..."
                                                className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                                            {editing.illustration_url && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={editing.illustration_url} alt="preview" className="w-10 h-10 rounded object-cover border border-neutral-200" />
                                            )}
                                        </div>
                                    </Field>

                                    <JsonArrayField
                                        label="강점 (strengths)"
                                        items={editing.strengths}
                                        onChange={items => setEditing({ ...editing, strengths: items })}
                                    />
                                    <JsonArrayField
                                        label="주의점 (cautions)"
                                        items={editing.cautions}
                                        onChange={items => setEditing({ ...editing, cautions: items })}
                                    />
                                </div>

                                <div className="px-5 py-3 border-t border-neutral-200 flex items-center justify-end gap-2 bg-neutral-50">
                                    <button onClick={() => setEditing(null)} className="text-xs text-neutral-500 hover:text-neutral-700 px-3 py-1.5">
                                        취소
                                    </button>
                                    <button onClick={save} disabled={saving}
                                        className="flex items-center gap-1.5 text-xs bg-neutral-900 text-white px-3 py-1.5 rounded hover:bg-neutral-700 disabled:opacity-50">
                                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                        저장
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 p-3 border border-neutral-200 bg-neutral-50 rounded text-[11px] text-neutral-600">
                        <strong className="block mb-1">🏅 Universe Badge SSOT</strong>
                        이 64 유형은 HeRo 내부용이 아닌 <strong>Universe 전체의 Identity Layer</strong>. 사용자가 opt-in하면
                        전 브랜드(Badak · MADLeague · Jakka 등)의 프로필 카드에 badge로 표시됩니다.
                        일러스트·설명을 수정하면 Universe 전 사이트에 즉시 반영.
                    </div>
                </>
            )}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-[11px] font-semibold text-neutral-600 block mb-1">{label}</label>
            {children}
        </div>
    );
}

function JsonArrayField({ label, items, onChange }: {
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
}) {
    function update(idx: number, val: string) {
        const next = [...items];
        next[idx] = val;
        onChange(next);
    }
    function remove(idx: number) {
        onChange(items.filter((_, i) => i !== idx));
    }
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-neutral-600">{label}</label>
                <button
                    type="button"
                    onClick={() => onChange([...items, ""])}
                    className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                    <Plus className="h-3 w-3" />
                    추가
                </button>
            </div>
            <div className="space-y-1.5">
                {items.length === 0 && (
                    <p className="text-[11px] text-neutral-400 italic py-1">항목 없음 — 추가 버튼을 눌러 작성하세요</p>
                )}
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-[10px] text-neutral-400 font-mono w-4 shrink-0 text-right">{idx + 1}</span>
                        <input
                            value={item}
                            onChange={e => update(idx, e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400"
                            placeholder="내용을 입력하세요"
                        />
                        <button
                            type="button"
                            onClick={() => remove(idx)}
                            className="text-neutral-300 hover:text-rose-400 transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
