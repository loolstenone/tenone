"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wrench, Database, Loader2, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface AgentToolInfo {
    id: string;
    name: string | null;
    display_name: string | null;
    tools: unknown;
    knowledge_refs: unknown;
    can_invoke: unknown;
    brand_id: string | null;
}

export default function AgentToolsPage() {
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState<AgentToolInfo[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("agent_profiles")
                .select("id, name, display_name, tools, knowledge_refs, can_invoke, brand_id")
                .order("name");
            setAgents(data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    function toList(v: unknown): string[] {
        if (Array.isArray(v)) return v.map(x => String(x));
        if (!v) return [];
        return [String(v)];
    }

    return (
        <div className="space-y-6">
            <PageHeader title="도구 · 지식 참조" description="에이전트별 tools · knowledge_refs · can_invoke — 읽기 전용 (Phase 1)" />

            <Link href="/intra/ums/agents" className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Agent 관리로 돌아가기
            </Link>

            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="text-left px-3 py-2 font-semibold text-neutral-600">에이전트</th>
                            <th className="text-left px-3 py-2 font-semibold text-neutral-600">브랜드</th>
                            <th className="text-left px-3 py-2 font-semibold text-neutral-600 w-64">Tools</th>
                            <th className="text-left px-3 py-2 font-semibold text-neutral-600 w-64">Knowledge Refs</th>
                            <th className="text-left px-3 py-2 font-semibold text-neutral-600 w-64">Can Invoke</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map(a => {
                            const tools = toList(a.tools);
                            const refs = toList(a.knowledge_refs);
                            const inv = toList(a.can_invoke);
                            return (
                                <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 align-top">
                                    <td className="px-3 py-2 font-medium text-neutral-900 whitespace-nowrap">{a.display_name || a.name}</td>
                                    <td className="px-3 py-2 text-neutral-500 whitespace-nowrap">{a.brand_id || "-"}</td>
                                    <td className="px-3 py-2">
                                        {tools.length === 0 ? <span className="text-neutral-300">-</span> : (
                                            <div className="flex flex-wrap gap-1">
                                                {tools.map((t, i) => (
                                                    <span key={i} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1 rounded"><Wrench className="h-2.5 w-2.5 inline mr-0.5" />{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {refs.length === 0 ? <span className="text-neutral-300">-</span> : (
                                            <div className="flex flex-wrap gap-1">
                                                {refs.map((r, i) => (
                                                    <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 rounded"><Database className="h-2.5 w-2.5 inline mr-0.5" />{r}</span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {inv.length === 0 ? <span className="text-neutral-300">-</span> : (
                                            <div className="flex flex-wrap gap-1">
                                                {inv.map((v, i) => (
                                                    <span key={i} className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-1 rounded">{v}</span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-[11px] text-neutral-600">
                편집은 Phase 2 · 현재는 SQL로 <code className="font-mono bg-neutral-100 px-1 rounded">UPDATE agent_profiles SET tools = '["..."]'::jsonb WHERE ...</code> 직접 편집.
            </div>
        </div>
    );
}
