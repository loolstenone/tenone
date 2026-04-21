"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Loader2, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Prompt {
    id: string;
    name: string | null;
    system_prompt: string | null;
    model_id: string | null;
    layer: number | null;
    brand_id: string | null;
    updated_at: string;
}

export default function AgentPromptsPage() {
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<Prompt[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("agent_profiles")
                .select("id, name, display_name, system_prompt, model_id, layer, brand_id, updated_at")
                .order("layer", { nullsFirst: false });
            setProfiles((data ?? []).map((d: { id: string; name: string; display_name?: string; system_prompt?: string; model_id?: string; layer?: number; brand_id?: string; updated_at: string }) => ({
                id: d.id, name: d.display_name || d.name, system_prompt: d.system_prompt ?? null,
                model_id: d.model_id ?? null, layer: d.layer ?? null, brand_id: d.brand_id ?? null,
                updated_at: d.updated_at,
            })));
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <PageHeader title="시스템 프롬프트" description="에이전트 프로파일의 system_prompt 집합 — 읽기 전용 (Phase 1)" />

            <Link href="/intra/ums/agents" className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Agent 관리로 돌아가기
            </Link>

            <div className="space-y-3">
                {profiles.map(p => (
                    <div key={p.id} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900">{p.name}</h3>
                                <p className="text-[10px] text-neutral-500 font-mono">
                                    {p.brand_id || "global"} · L{p.layer ?? "?"} · {p.model_id?.replace(/^claude-/, "c-") || "-"}
                                </p>
                            </div>
                            <span className="text-[10px] text-neutral-400">{new Date(p.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="bg-neutral-50 rounded p-3 text-[11px] text-neutral-700 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                            {p.system_prompt ? p.system_prompt.substring(0, 500) + (p.system_prompt.length > 500 ? "…" : "") : "(프롬프트 없음)"}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-[11px] text-neutral-600 flex items-center gap-2">
                <FileText className="h-4 w-4 text-neutral-400" />
                편집 UI는 Phase 2에서 추가 예정. 현재는 SQL로 <code className="font-mono bg-neutral-100 px-1 rounded">UPDATE agent_profiles SET system_prompt = '...' WHERE id = '...'</code> 직접 편집.
            </div>
        </div>
    );
}
