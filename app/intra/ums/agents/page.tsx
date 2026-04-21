"use client";

/**
 * Universe > Agent 관리 — Phase 2 (인라인 편집 + 상세 모달)
 *
 * 편집 가능:
 *   - is_active 토글 (인라인)
 *   - display_name 인라인
 *   - temperature·max_tokens 인라인
 *   - system_prompt (모달)
 *   - 삭제 (비활성 + critical 아닌 경우만)
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Bot, Loader2, CheckCircle2, XCircle, Edit2, ArrowRight, AlertTriangle,
    Save, X, Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

interface AgentProfile {
    id: string;
    name: string;
    display_name: string | null;
    layer: number | null;
    agent_type: string | null;
    model_id: string | null;
    system_prompt: string | null;
    temperature: number | null;
    max_tokens: number | null;
    risk_level: string | null;
    is_active: boolean;
    version: number | null;
    brand_id: string | null;
    runtime: string | null;
    updated_at: string;
}

const LAYER_META: Record<number, { label: string; color: string }> = {
    0: { label: "L0 메타", color: "bg-purple-100 text-purple-700" },
    1: { label: "L1 인프라", color: "bg-blue-100 text-blue-700" },
    2: { label: "L2 브랜드", color: "bg-amber-100 text-amber-700" },
    3: { label: "L3 태스크", color: "bg-emerald-100 text-emerald-700" },
};

const RISK_COLOR: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-rose-100 text-rose-700",
    critical: "bg-rose-600 text-white",
};

export default function AgentManagementPage() {
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState<AgentProfile[]>([]);
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
    const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [modalAgent, setModalAgent] = useState<AgentProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        const res = await fetch("/api/intra/agents");
        const j = await res.json();
        setAgents(j.items ?? []);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function patchAgent(id: string, updates: Record<string, unknown>) {
        setError(null);
        const res = await fetch("/api/intra/agents", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...updates }),
        });
        const j = await res.json();
        if (!res.ok) { setError(j.error || "수정 실패"); return false; }
        await load();
        return true;
    }

    async function handleToggleActive(a: AgentProfile) {
        await patchAgent(a.id, { is_active: !a.is_active });
    }

    async function handleDelete(a: AgentProfile) {
        if (!confirm(`"${a.display_name || a.name}" 삭제하시겠습니까? 복구 불가.`)) return;
        const res = await fetch(`/api/intra/agents?id=${a.id}`, { method: "DELETE" });
        const j = await res.json();
        if (!res.ok) { setError(j.error); return; }
        await load();
    }

    function startEdit(id: string, field: string, currentValue: string | number | null) {
        setEditingField({ id, field });
        setEditValue(String(currentValue ?? ""));
    }

    async function saveEdit() {
        if (!editingField) return;
        const val = editingField.field === "temperature" || editingField.field === "max_tokens"
            ? (editValue === "" ? null : Number(editValue))
            : editValue;
        const ok = await patchAgent(editingField.id, { [editingField.field]: val });
        if (ok) setEditingField(null);
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    const filtered = agents.filter(a => {
        if (filter === "active") return a.is_active;
        if (filter === "inactive") return !a.is_active;
        return true;
    });

    const byLayer = new Map<number, AgentProfile[]>();
    filtered.forEach(a => {
        const l = a.layer ?? -1;
        if (!byLayer.has(l)) byLayer.set(l, []);
        byLayer.get(l)!.push(a);
    });

    const stats = {
        total: agents.length,
        active: agents.filter(a => a.is_active).length,
        byRuntime: agents.reduce((m, a) => { const r = a.runtime ?? "unknown"; m[r] = (m[r] ?? 0) + 1; return m; }, {} as Record<string, number>),
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Agent 관리 · Phase 2"
                description="에이전트 프로파일 · 프롬프트 · 도구 — 인라인 편집 + 시스템 프롬프트 모달"
            />

            {/* 구분 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-900 leading-relaxed">
                <strong>편집 허브입니다.</strong> 여기서 수정한 내용은 <Link href="/intra/agent" className="underline font-semibold mx-1">Intelligence &gt; Agent Team</Link>(관제)에 자동 반영.
                Critical risk 에이전트는 삭제 전 risk_level 완화 필요. 활성 상태로는 삭제 불가.
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" /> {error}
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X className="h-3 w-3" /></button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4 text-emerald-600" />
                        <span className="text-[11px] text-neutral-500">활성 / 전체</span>
                    </div>
                    <p className="text-xl font-bold">{stats.active} / {stats.total}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-[11px] text-neutral-500 mb-1">Layer 분포</p>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(LAYER_META).map(([k, m]) => {
                            const cnt = agents.filter(a => a.layer === Number(k)).length;
                            return <span key={k} className={`text-[10px] px-1.5 py-0.5 rounded ${m.color}`}>L{k} · {cnt}</span>;
                        })}
                    </div>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-[11px] text-neutral-500 mb-1">Runtime</p>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(stats.byRuntime).slice(0, 5).map(([r, c]) => (
                            <span key={r} className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded">{r} · <strong>{c}</strong></span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
                {(["all", "active", "inactive"] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-2.5 py-1 text-[11px] rounded ${filter === f ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                        {f === "all" ? "전체" : f === "active" ? "활성" : "비활성"}
                    </button>
                ))}
                <span className="text-[11px] text-neutral-400 ml-2">{filtered.length}개</span>
            </div>

            {/* Layer별 그룹핑 */}
            {Array.from(byLayer.keys()).sort().map(layer => {
                const meta = LAYER_META[layer];
                const list = byLayer.get(layer)!;
                return (
                    <div key={layer}>
                        <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                            {meta ? (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${meta.color}`}>{meta.label}</span>
                            ) : (
                                <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">Unknown</span>
                            )}
                            <span className="text-[11px] text-neutral-400 font-normal">({list.length})</span>
                        </h3>
                        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">이름 / 표시명</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">브랜드</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">모델</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">temp</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">tokens</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">Risk</th>
                                        <th className="text-center px-3 py-2 font-semibold text-neutral-600">활성</th>
                                        <th className="text-center px-3 py-2 font-semibold text-neutral-600">프롬프트</th>
                                        <th className="text-center px-3 py-2 font-semibold text-neutral-600">삭제</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {list.map(a => {
                                        const isEditingName = editingField?.id === a.id && editingField.field === "display_name";
                                        const isEditingTemp = editingField?.id === a.id && editingField.field === "temperature";
                                        const isEditingTokens = editingField?.id === a.id && editingField.field === "max_tokens";

                                        return (
                                            <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                                <td className="px-3 py-1.5">
                                                    {isEditingName ? (
                                                        <div className="flex gap-1">
                                                            <input value={editValue} onChange={e => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-0.5 text-xs border border-neutral-300 rounded" autoFocus
                                                                onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingField(null); }} />
                                                            <button onClick={saveEdit} className="text-emerald-600"><Save className="h-3.5 w-3.5" /></button>
                                                            <button onClick={() => setEditingField(null)} className="text-neutral-400"><X className="h-3.5 w-3.5" /></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => startEdit(a.id, "display_name", a.display_name)}
                                                            className="text-left hover:bg-neutral-100 rounded px-1 group">
                                                            <p className="font-medium text-neutral-900 flex items-center gap-1">
                                                                {a.display_name || <span className="text-neutral-400 italic">표시명 없음</span>}
                                                                <Edit2 className="h-2.5 w-2.5 text-neutral-300 group-hover:text-neutral-600" />
                                                            </p>
                                                            <p className="text-[10px] text-neutral-400 font-mono">{a.name}</p>
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-3 py-1.5 text-neutral-500">{a.brand_id || "-"}</td>
                                                <td className="px-3 py-1.5 text-neutral-600 font-mono text-[10px]">{a.model_id?.replace(/^claude-/, "c-") || "-"}</td>
                                                <td className="px-3 py-1.5 text-right">
                                                    {isEditingTemp ? (
                                                        <input type="number" step="0.1" min="0" max="2" value={editValue}
                                                            onChange={e => setEditValue(e.target.value)}
                                                            onBlur={saveEdit}
                                                            onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingField(null); }}
                                                            className="w-14 px-1 py-0.5 text-xs border border-neutral-300 rounded text-right" autoFocus />
                                                    ) : (
                                                        <button onClick={() => startEdit(a.id, "temperature", a.temperature)}
                                                            className="text-neutral-700 hover:bg-neutral-100 rounded px-1">
                                                            {a.temperature ?? "-"}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-3 py-1.5 text-right">
                                                    {isEditingTokens ? (
                                                        <input type="number" min="0" value={editValue}
                                                            onChange={e => setEditValue(e.target.value)}
                                                            onBlur={saveEdit}
                                                            onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingField(null); }}
                                                            className="w-20 px-1 py-0.5 text-xs border border-neutral-300 rounded text-right" autoFocus />
                                                    ) : (
                                                        <button onClick={() => startEdit(a.id, "max_tokens", a.max_tokens)}
                                                            className="text-neutral-700 hover:bg-neutral-100 rounded px-1">
                                                            {a.max_tokens?.toLocaleString() ?? "-"}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-3 py-1.5">
                                                    {a.risk_level && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${RISK_COLOR[a.risk_level] || "bg-neutral-100 text-neutral-500"}`}>
                                                            {a.risk_level}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-1.5 text-center">
                                                    <button onClick={() => handleToggleActive(a)} title="토글">
                                                        {a.is_active ? <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" /> : <XCircle className="h-4 w-4 text-neutral-300 inline" />}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-1.5 text-center">
                                                    <button onClick={() => setModalAgent(a)}
                                                        className="text-neutral-500 hover:text-neutral-900" title="시스템 프롬프트 편집">
                                                        <Edit2 className="h-3.5 w-3.5 inline" />
                                                    </button>
                                                </td>
                                                <td className="px-3 py-1.5 text-center">
                                                    <button onClick={() => handleDelete(a)}
                                                        disabled={a.is_active || a.risk_level === "critical"}
                                                        title={a.is_active ? "먼저 비활성화" : a.risk_level === "critical" ? "Critical은 삭제 불가" : "삭제"}
                                                        className={`${(a.is_active || a.risk_level === "critical") ? "text-neutral-200 cursor-not-allowed" : "text-rose-400 hover:text-rose-600"}`}>
                                                        <Trash2 className="h-3.5 w-3.5 inline" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}

            <div className="flex gap-3">
                <Link href="/intra/ums/agents/prompts" className="flex-1 bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">시스템 프롬프트 전체 보기</p>
                    <p className="text-[10px] text-neutral-500">agent_profiles.system_prompt 리스트 <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
                <Link href="/intra/ums/agents/tools" className="flex-1 bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">도구 · 지식 참조</p>
                    <p className="text-[10px] text-neutral-500">tools · knowledge_refs <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
                <Link href="/intra/agent" className="flex-1 bg-neutral-900 text-white rounded-lg p-4 hover:bg-neutral-700">
                    <p className="text-xs font-semibold">관제 센터로 →</p>
                    <p className="text-[10px] text-neutral-300">Intelligence &gt; Agent Team</p>
                </Link>
            </div>

            {/* 시스템 프롬프트 편집 모달 */}
            {modalAgent && (
                <PromptEditModal
                    agent={modalAgent}
                    onClose={() => setModalAgent(null)}
                    onSaved={async () => { setModalAgent(null); await load(); }}
                    onError={setError}
                />
            )}
        </div>
    );
}

function PromptEditModal({ agent, onClose, onSaved, onError }: {
    agent: AgentProfile;
    onClose: () => void;
    onSaved: () => void;
    onError: (err: string) => void;
}) {
    const [prompt, setPrompt] = useState(agent.system_prompt ?? "");
    const [saving, setSaving] = useState(false);

    async function save() {
        setSaving(true);
        const res = await fetch("/api/intra/agents", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: agent.id, system_prompt: prompt, version: (agent.version ?? 0) + 1 }),
        });
        const j = await res.json();
        if (!res.ok) {
            onError(j.error || "저장 실패");
            setSaving(false);
            return;
        }
        onSaved();
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-neutral-900">{agent.display_name || agent.name}</h2>
                        <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            {agent.brand_id || "global"} · L{agent.layer ?? "?"} · {agent.model_id?.replace(/^claude-/, "c-") || "-"} · v{agent.version ?? 0}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                    <label className="text-xs font-semibold text-neutral-700 mb-2 block">시스템 프롬프트</label>
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                        className="w-full h-96 p-3 text-xs font-mono border border-neutral-300 rounded resize-none leading-relaxed"
                        placeholder="에이전트 행동을 정의하는 시스템 프롬프트..." />
                    <p className="mt-2 text-[10px] text-neutral-500">
                        {prompt.length.toLocaleString()}자 · 저장 시 version 자동 증가
                    </p>
                </div>
                <div className="px-5 py-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-1.5 text-xs border border-neutral-200 rounded hover:bg-neutral-50">취소</button>
                    <button onClick={save} disabled={saving}
                        className="px-4 py-1.5 text-xs bg-neutral-900 text-white rounded hover:bg-neutral-700 disabled:opacity-50 flex items-center gap-1">
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        {saving ? "저장 중..." : "저장 (v+1)"}
                    </button>
                </div>
            </div>
        </div>
    );
}
