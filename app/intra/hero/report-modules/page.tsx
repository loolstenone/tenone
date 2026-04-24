"use client";

import { useEffect, useState } from "react";
import { BookOpen, Save, X, Loader2, Search, ChevronDown, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface ReportModule {
    id: string;
    type_code: string;
    module_key: string;
    module_label: string;
    content: string | null;
    content_type: string | null;
    order_index: number | null;
}

const TYPE_GROUPS = ["D", "I", "S", "C"] as const;

export default function ReportModulesPage() {
    const [rows, setRows] = useState<ReportModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [groupFilter, setGroupFilter] = useState<"all" | "D" | "I" | "S" | "C">("all");
    const [moduleKeyFilter, setModuleKeyFilter] = useState("all");
    const [editing, setEditing] = useState<ReportModule | null>(null);
    const [saving, setSaving] = useState(false);
    const [expandedType, setExpandedType] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        const { data } = await createClient()
            .from("hit_report_modules")
            .select("*")
            .order("type_code")
            .order("module_key")
            .order("order_index");
        setRows(data ?? []);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const moduleKeys = Array.from(new Set(rows.map(r => r.module_key))).sort();

    const filtered = rows.filter(r => {
        const group = r.type_code?.split("-")[0] ?? "";
        if (groupFilter !== "all" && group !== groupFilter) return false;
        if (moduleKeyFilter !== "all" && r.module_key !== moduleKeyFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                r.type_code?.toLowerCase().includes(q) ||
                r.module_key?.toLowerCase().includes(q) ||
                r.module_label?.toLowerCase().includes(q) ||
                (r.content ?? "").toLowerCase().includes(q)
            );
        }
        return true;
    });

    // 타입별 그룹핑
    const byType = filtered.reduce<Record<string, ReportModule[]>>((acc, r) => {
        (acc[r.type_code] ??= []).push(r);
        return acc;
    }, {});

    async function handleSave() {
        if (!editing) return;
        setSaving(true);
        await createClient()
            .from("hit_report_modules")
            .update({
                module_label: editing.module_label,
                content: editing.content,
                content_type: editing.content_type,
                order_index: editing.order_index,
            })
            .eq("id", editing.id);
        setSaving(false);
        setEditing(null);
        load();
    }

    const stats = {
        total: rows.length,
        types: new Set(rows.map(r => r.type_code)).size,
        modules: moduleKeys.length,
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="리포트 모듈"
                description="HIT 결과 리포트 조립 모듈 (324개) — 64 타입 × 모듈 키별 콘텐츠"
            />

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "전체 모듈", value: stats.total },
                    { label: "타입 수", value: stats.types },
                    { label: "모듈 키", value: stats.modules },
                ].map(s => (
                    <div key={s.label} className="bg-neutral-800 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                        <p className="text-xs text-neutral-400 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* 필터 */}
            <div className="flex flex-wrap gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                        className="bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-100 w-56 focus:outline-none focus:border-neutral-500"
                        placeholder="타입·키·내용 검색…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-1">
                    {(["all", ...TYPE_GROUPS] as const).map(g => (
                        <button
                            key={g}
                            onClick={() => setGroupFilter(g)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                groupFilter === g
                                    ? "bg-[#E53935] text-white"
                                    : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                            }`}
                        >
                            {g === "all" ? "전체" : g}
                        </button>
                    ))}
                </div>
                <select
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none"
                    value={moduleKeyFilter}
                    onChange={e => setModuleKeyFilter(e.target.value)}
                >
                    <option value="all">모든 모듈 키</option>
                    {moduleKeys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
            </div>

            {/* 목록 */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                </div>
            ) : (
                <div className="space-y-2">
                    {Object.entries(byType).map(([typeCode, modules]) => (
                        <div key={typeCode} className="bg-neutral-800 rounded-lg overflow-hidden">
                            <button
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-750 transition-colors"
                                onClick={() => setExpandedType(expandedType === typeCode ? null : typeCode)}
                            >
                                {expandedType === typeCode
                                    ? <ChevronDown className="h-4 w-4 text-neutral-400" />
                                    : <ChevronRight className="h-4 w-4 text-neutral-400" />}
                                <span className="font-mono text-sm font-semibold text-neutral-100">{typeCode}</span>
                                <span className="text-xs text-neutral-500">{modules.length}개 모듈</span>
                            </button>
                            {expandedType === typeCode && (
                                <div className="border-t border-neutral-700 divide-y divide-neutral-700">
                                    {modules.map(m => (
                                        <div key={m.id} className="px-4 py-3 flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-mono bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded">{m.module_key}</span>
                                                    <span className="text-sm text-neutral-200">{m.module_label}</span>
                                                    {m.content_type && (
                                                        <span className="text-xs text-neutral-500">{m.content_type}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-neutral-400 line-clamp-2">{m.content ?? "—"}</p>
                                            </div>
                                            <button
                                                onClick={() => setEditing({ ...m })}
                                                className="shrink-0 text-xs text-neutral-500 hover:text-neutral-200 transition-colors"
                                            >
                                                편집
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {Object.keys(byType).length === 0 && (
                        <div className="py-12 text-center text-neutral-500 text-sm">검색 결과가 없습니다.</div>
                    )}
                </div>
            )}

            {/* 편집 모달 */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-2xl mx-4 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">
                                모듈 편집 — <span className="font-mono">{editing.type_code} / {editing.module_key}</span>
                            </h3>
                            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-neutral-400" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">모듈 레이블</label>
                                <input
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                                    value={editing.module_label ?? ""}
                                    onChange={e => setEditing({ ...editing, module_label: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">콘텐츠 타입</label>
                                <input
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                                    value={editing.content_type ?? ""}
                                    onChange={e => setEditing({ ...editing, content_type: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">내용</label>
                                <textarea
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500 resize-none"
                                    rows={8}
                                    value={editing.content ?? ""}
                                    onChange={e => setEditing({ ...editing, content: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setEditing(null)}
                                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">취소</button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
