"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, X, Loader2, Search, ChevronDown, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

/**
 * HIT 리포트 해설 모듈 — 검사 결과 화면에 나가는 문안의 단일 원천 (hit_report_modules: id·category·title·content)
 * 어떤 점수에 어떤 모듈이 나가는지(선택 규칙)는 코드: lib/hit/report-assembler.ts(A·B) · lib/hit/stage-report-modules.ts(C~GAP)
 * 2026-10-13 재작성 — 옛 화면은 없는 컬럼(type_code·module_key 등)을 조회해 목록이 비고 저장도 안 됐다.
 * category 'archived:*' = 어떤 선택 규칙에도 연결되지 않아 보관한 옛 문안 (기본 숨김)
 */

interface ReportModule {
    id: string;
    category: string;
    title: string;
    content: string;
    updated_at: string | null;
}

/** 분류 → 검사·영역 (사람이 읽는 이름) */
const CATEGORY_LABELS: Record<string, string> = {
    mbti_axis: "Archetype · 성격", disc_primary: "Archetype · 행동 주특성", disc_combo: "Archetype · 행동 조합", disc_low: "Archetype · 행동 저특성",
    comm: "Archetype · 소통", cross: "Archetype · 성격×행동", sp: "Archetype · 강점", sp_growth: "Archetype · 키울 힘",
    personality: "Archetype · 성품", riasec: "Archetype · 흥미", uf: "Archetype · 성장 배경",
    core_competency: "Bounce · 핵심역량", track_competency: "Bounce · 직무 트랙",
    readiness: "Challenger · 준비도", onboarding: "Challenger · 첫 직무 적응", career_decision: "Challenger · 진로 결정",
    career_capital: "Departure · 경력 자본", career_motivation: "Departure · 이직 동기", transferability: "Departure · 전환 가능성",
    career_type: "Departure · 전환 유형", career_readiness: "Departure · 이직 준비도",
    expertise_asset: "Elevate · 전문성 자산", leadership_type: "Elevate · 리더십 유형", identity_flex: "Elevate · 정체성",
    network_capital: "Elevate · 네트워크", senior_readiness: "Elevate · 전환 준비", next_role: "Elevate · 차기 역할",
    direction_type: "Flourish · 2막 방향", life_review: "Flourish · 삶 돌아보기", legacy_skill: "Flourish · 유산",
    social_connect: "Flourish · 사회적 연결", second_act_readiness: "Flourish · 2막 준비",
    direction_bifurcation: "Gap · 복귀 방향", latent_capability: "Gap · 잠재 역량", resilience: "Gap · 회복탄력성",
    career_viability: "Gap · 경력 유효성", reentry_readiness: "Gap · 재진입 준비",
};
const labelOf = (c: string) => c.startsWith("archived:") ? `보관 · ${CATEGORY_LABELS[c.slice(9)] ?? c.slice(9)}` : (CATEGORY_LABELS[c] ?? c);

export default function ReportModulesPage() {
    const [rows, setRows] = useState<ReportModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [showArchived, setShowArchived] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [editing, setEditing] = useState<ReportModule | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setLoadError(null);
        const { data, error } = await createClient()
            .from("hit_report_modules")
            .select("id, category, title, content, updated_at")
            .order("category")
            .order("id");
        if (error) setLoadError("해설 모듈을 불러오지 못했습니다. 새로고침해 주세요.");
        setRows((data ?? []) as ReportModule[]);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const visible = useMemo(() => rows.filter(r => showArchived || !r.category.startsWith("archived:")), [rows, showArchived]);
    const categories = useMemo(() => Array.from(new Set(visible.map(r => r.category))).sort((a, b) => labelOf(a).localeCompare(labelOf(b), "ko")), [visible]);

    const filtered = visible.filter(r => {
        if (category !== "all" && r.category !== category) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q);
    });

    const byCategory = filtered.reduce<Record<string, ReportModule[]>>((acc, r) => {
        (acc[r.category] ??= []).push(r);
        return acc;
    }, {});
    const groupKeys = Object.keys(byCategory).sort((a, b) => labelOf(a).localeCompare(labelOf(b), "ko"));

    async function handleSave() {
        if (!editing) return;
        setSaving(true);
        setSaveError(null);
        const { error } = await createClient()
            .from("hit_report_modules")
            .update({ title: editing.title, content: editing.content, updated_at: new Date().toISOString() })
            .eq("id", editing.id);
        setSaving(false);
        if (error) { setSaveError("저장하지 못했습니다. 권한 또는 연결을 확인해 주세요."); return; }
        setEditing(null);
        load();
    }

    const stats = {
        active: rows.filter(r => !r.category.startsWith("archived:")).length,
        categories: new Set(rows.filter(r => !r.category.startsWith("archived:")).map(r => r.category)).size,
        archived: rows.filter(r => r.category.startsWith("archived:")).length,
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="리포트 모듈"
                description="HIT 결과 화면에 나가는 해설 문안 — 여기서 고친 문장이 다음 조회부터 바로 반영됩니다. 어떤 점수에 어떤 해설이 나가는지는 코드의 선택 규칙이 정합니다."
            />

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "사용 중인 해설", value: stats.active },
                    { label: "분류", value: stats.categories },
                    { label: "보관 (연결 안 됨)", value: stats.archived },
                ].map(s => (
                    <div key={s.label} className="bg-neutral-800 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                        <p className="text-xs text-neutral-400 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                        className="bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-100 w-64 focus:outline-none focus:border-neutral-500"
                        placeholder="ID·제목·내용 검색…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    <option value="all">모든 분류</option>
                    {categories.map(c => <option key={c} value={c}>{labelOf(c)}</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
                    <input type="checkbox" checked={showArchived} onChange={e => { setShowArchived(e.target.checked); setCategory("all"); }} />
                    보관 포함
                </label>
            </div>

            {loadError && <p className="text-sm text-red-400">{loadError}</p>}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                </div>
            ) : (
                <div className="space-y-2">
                    {groupKeys.map(cat => {
                        const open = expanded === cat || !!search || category !== "all";
                        return (
                            <div key={cat} className="bg-neutral-800 rounded-lg overflow-hidden">
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700/50 transition-colors"
                                    onClick={() => setExpanded(expanded === cat ? null : cat)}
                                >
                                    {open ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
                                    <span className="text-sm font-semibold text-neutral-100">{labelOf(cat)}</span>
                                    <span className="text-xs font-mono text-neutral-500">{cat}</span>
                                    <span className="ml-auto text-xs text-neutral-500">{byCategory[cat].length}개</span>
                                </button>
                                {open && (
                                    <div className="border-t border-neutral-700 divide-y divide-neutral-700">
                                        {byCategory[cat].map(m => (
                                            <div key={m.id} className="px-4 py-3 flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-mono bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded">{m.id}</span>
                                                        <span className="text-sm text-neutral-200">{m.title}</span>
                                                    </div>
                                                    <p className="text-xs text-neutral-400 line-clamp-2">{m.content}</p>
                                                </div>
                                                <button
                                                    onClick={() => { setSaveError(null); setEditing({ ...m }); }}
                                                    className="shrink-0 text-xs text-neutral-500 hover:text-neutral-200 transition-colors"
                                                >
                                                    편집
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {groupKeys.length === 0 && !loadError && (
                        <div className="py-12 text-center text-neutral-500 text-sm">검색 결과가 없습니다.</div>
                    )}
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setEditing(null)}>
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-2xl mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">
                                해설 편집 — <span className="font-mono">{editing.id}</span>
                            </h3>
                            <button onClick={() => setEditing(null)} aria-label="닫기"><X className="h-5 w-5 text-neutral-400" /></button>
                        </div>
                        <p className="text-xs text-neutral-500">{labelOf(editing.category)}</p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">제목</label>
                                <input
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                                    value={editing.title}
                                    onChange={e => setEditing({ ...editing, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">내용 (결과 화면에 두 문장씩 문단으로 나뉘어 표시)</label>
                                <textarea
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500 resize-y"
                                    rows={10}
                                    value={editing.content}
                                    onChange={e => setEditing({ ...editing, content: e.target.value })}
                                />
                            </div>
                        </div>
                        {saveError && <p className="text-sm text-red-400">{saveError}</p>}
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">취소</button>
                            <button onClick={handleSave} disabled={saving || !editing.title.trim() || !editing.content.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
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
