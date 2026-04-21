"use client";

/**
 * Universe > Agent 관리 — 에이전트 프로파일 CRUD
 *
 * 역할 구분:
 *   - Intelligence > Agent Team = 관제 (현황·메시지·로그)
 *   - Universe > Agent 관리 = 편집 (프로파일·프롬프트·도구)
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Bot, Loader2, CheckCircle2, XCircle, Edit2, ArrowRight, AlertTriangle, Zap,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface AgentProfile {
    id: string;
    name: string;
    display_name: string | null;
    layer: number | null;
    agent_type: string | null;
    model_id: string | null;
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

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("agent_profiles")
                .select("*")
                .order("layer", { nullsFirst: false })
                .order("name");
            setAgents(data ?? []);
            setLoading(false);
        }
        load();
    }, []);

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
        byModel: agents.reduce((m, a) => { const id = a.model_id ?? "unknown"; m[id] = (m[id] ?? 0) + 1; return m; }, {} as Record<string, number>),
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Agent 관리"
                description="에이전트 프로파일 · 프롬프트 · 도구 — SSOT 편집 허브 (Intelligence는 관제 전담)"
            />

            {/* 구분 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-900 leading-relaxed">
                <strong>편집 허브입니다.</strong> 여기서 수정한 프로파일·프롬프트·도구는
                <Link href="/intra/agent" className="underline font-semibold mx-1">Intelligence &gt; Agent Team</Link>(관제 센터)에 자동 반영됩니다.
                관제·메시지 모니터링은 Intelligence로 이동하세요.
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4 text-emerald-600" />
                        <span className="text-[11px] text-neutral-500">활성 / 전체</span>
                    </div>
                    <p className="text-xl font-bold">{stats.active} / {stats.total}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-[11px] text-neutral-500 mb-1">Layer</p>
                    <p className="text-xs text-neutral-700 space-x-1">
                        {Object.entries(LAYER_META).map(([k, m]) => {
                            const cnt = agents.filter(a => a.layer === Number(k)).length;
                            return <span key={k} className={`inline-block px-1 py-0.5 rounded text-[10px] ${m.color}`}>{m.label.split(" ")[0]} {cnt}</span>;
                        })}
                    </p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-[11px] text-neutral-500 mb-1">Runtime</p>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(stats.byRuntime).slice(0, 5).map(([r, c]) => (
                            <span key={r} className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded">{r} · <strong>{c}</strong></span>
                        ))}
                    </div>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-[11px] text-neutral-500 mb-1">모델</p>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(stats.byModel).slice(0, 4).map(([m, c]) => (
                            <span key={m} className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded truncate max-w-[120px]">{m.replace(/^claude-/, "c-")} · <strong>{c}</strong></span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {(["all", "active", "inactive"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-2.5 py-1 text-[11px] rounded ${filter === f ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                            {f === "all" ? "전체" : f === "active" ? "활성" : "비활성"}
                        </button>
                    ))}
                </div>
                <span className="text-[11px] text-neutral-400">{filtered.length}개</span>
                <div className="flex-1" />
                <button disabled className="text-[11px] text-neutral-400 flex items-center gap-1 cursor-not-allowed">
                    <Zap className="h-3 w-3" /> 새 에이전트 (준비 중)
                </button>
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
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">이름</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">브랜드</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">유형</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">모델</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">temp · tokens</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">Risk</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">Runtime</th>
                                        <th className="text-center px-3 py-2 font-semibold text-neutral-600">상태</th>
                                        <th className="text-center px-3 py-2 font-semibold text-neutral-600">편집</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {list.map(a => (
                                        <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                            <td className="px-3 py-1.5">
                                                <div>
                                                    <p className="font-medium text-neutral-900">{a.display_name || a.name}</p>
                                                    <p className="text-[10px] text-neutral-400 font-mono">{a.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-3 py-1.5 text-neutral-500">{a.brand_id || "-"}</td>
                                            <td className="px-3 py-1.5 text-neutral-600 text-[10px]">{a.agent_type || "-"}</td>
                                            <td className="px-3 py-1.5 text-neutral-600 font-mono text-[10px]">{a.model_id?.replace(/^claude-/, "c-") || "-"}</td>
                                            <td className="px-3 py-1.5 text-right text-neutral-500 text-[10px]">
                                                {a.temperature ?? "-"} · {a.max_tokens?.toLocaleString() ?? "-"}
                                            </td>
                                            <td className="px-3 py-1.5">
                                                {a.risk_level && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${RISK_COLOR[a.risk_level] || "bg-neutral-100 text-neutral-500"}`}>
                                                        {a.risk_level}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-1.5 text-neutral-500 text-[10px]">{a.runtime || "-"}</td>
                                            <td className="px-3 py-1.5 text-center">
                                                {a.is_active ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" /> : <XCircle className="h-3.5 w-3.5 text-neutral-300 inline" />}
                                            </td>
                                            <td className="px-3 py-1.5 text-center">
                                                <button disabled className="text-neutral-300 cursor-not-allowed">
                                                    <Edit2 className="h-3.5 w-3.5 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}

            {/* 향후 작업 안내 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 leading-relaxed">
                    <strong>Phase 1 (현재)</strong>: 읽기 전용 뷰. 에이전트 프로파일·프롬프트·도구는 DB 직접 편집이 필요합니다.
                    <br />
                    <strong>Phase 2 (계획)</strong>: 인라인 편집 UI · 새 에이전트 생성 마법사 · 시스템 프롬프트 버전 관리.
                </p>
            </div>

            <div className="flex gap-3">
                <Link href="/intra/ums/agents/prompts" className="flex-1 bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">시스템 프롬프트</p>
                    <p className="text-[10px] text-neutral-500">hit_ai_prompts · Layer별 기본 프롬프트 <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
                <Link href="/intra/ums/agents/tools" className="flex-1 bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">도구 · 지식 참조</p>
                    <p className="text-[10px] text-neutral-500">agent tools · knowledge_refs <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
                <Link href="/intra/agent" className="flex-1 bg-neutral-900 text-white rounded-lg p-4 hover:bg-neutral-700">
                    <p className="text-xs font-semibold">관제 센터로 →</p>
                    <p className="text-[10px] text-neutral-300">Intelligence &gt; Agent Team (현황·메시지·로그)</p>
                </Link>
            </div>
        </div>
    );
}
