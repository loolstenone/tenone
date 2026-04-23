"use client";

import { useEffect, useState } from "react";
import { Bot, Save, X, Loader2, Copy, Check } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface AiPrompt {
    id: string;
    context_key: string | null;
    system_prompt: string | null;
    user_template: string | null;
    model: string | null;
    max_tokens: number | null;
    description: string | null;
    brand_id: string | null;
    created_at: string | null;
    updated_at: string | null;
}

const MODEL_OPTIONS = [
    "claude-sonnet-4-20250514",
    "claude-opus-4-20250514",
    "claude-haiku-4-5-20251001",
];

export default function AiPromptsPage() {
    const [rows, setRows] = useState<AiPrompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<AiPrompt | null>(null);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        const { data } = await createClient()
            .from("hit_ai_prompts")
            .select("*")
            .order("created_at");
        setRows(data ?? []);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function handleSave() {
        if (!editing) return;
        setSaving(true);
        await createClient()
            .from("hit_ai_prompts")
            .update({
                context_key: editing.context_key,
                system_prompt: editing.system_prompt,
                user_template: editing.user_template,
                model: editing.model,
                max_tokens: editing.max_tokens,
                description: editing.description,
            })
            .eq("id", editing.id);
        setSaving(false);
        setEditing(null);
        load();
    }

    async function copyToClipboard(text: string, key: string) {
        await navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    }

    const placeholders = ["{{TIH_JSON}}", "{{JD_JSON}}", "{{HIT_JSON}}", "{{JH_JSON}}", "{{SCORE_JSON}}", "{{RISK_JSON}}"];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="AI 프롬프트"
                description="HIT AI 큐레이션·상담 프롬프트 SSOT — 코드 하드코딩 없이 DB에서 관리"
                icon={<Bot className="h-5 w-5" />}
            />

            {/* 플레이스홀더 가이드 */}
            <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-xs text-neutral-400 mb-2 font-medium">템플릿 변수 (user_template에서 치환)</p>
                <div className="flex flex-wrap gap-2">
                    {placeholders.map(p => (
                        <span key={p} className="font-mono text-xs bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded">{p}</span>
                    ))}
                </div>
            </div>

            {/* 목록 */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                </div>
            ) : (
                <div className="space-y-4">
                    {rows.map(row => (
                        <div key={row.id} className="bg-neutral-800 rounded-xl overflow-hidden">
                            {/* 헤더 */}
                            <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-neutral-700">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-sm font-semibold text-white">{row.id}</span>
                                        {row.brand_id && (
                                            <span className="text-xs bg-neutral-700 text-neutral-400 px-2 py-0.5 rounded">{row.brand_id}</span>
                                        )}
                                        {row.context_key && (
                                            <span className="text-xs bg-neutral-700 text-neutral-400 px-2 py-0.5 rounded">{row.context_key}</span>
                                        )}
                                    </div>
                                    {row.description && (
                                        <p className="text-xs text-neutral-400">{row.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                                        <span>모델: <span className="text-neutral-300">{row.model ?? "—"}</span></span>
                                        <span>최대 토큰: <span className="text-neutral-300">{row.max_tokens?.toLocaleString() ?? "—"}</span></span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditing({ ...row })}
                                    className="shrink-0 text-xs text-neutral-500 hover:text-neutral-200 transition-colors"
                                >
                                    편집
                                </button>
                            </div>

                            {/* 시스템 프롬프트 미리보기 */}
                            <div className="px-5 py-3 border-b border-neutral-700">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-neutral-500 font-medium">시스템 프롬프트</p>
                                    {row.system_prompt && (
                                        <button
                                            onClick={() => copyToClipboard(row.system_prompt!, `sys-${row.id}`)}
                                            className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-300 transition-colors"
                                        >
                                            {copied === `sys-${row.id}`
                                                ? <><Check className="h-3 w-3" /> 복사됨</>
                                                : <><Copy className="h-3 w-3" /> 복사</>}
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-400 line-clamp-3 whitespace-pre-wrap">{row.system_prompt ?? "—"}</p>
                            </div>

                            {/* 유저 템플릿 미리보기 */}
                            <div className="px-5 py-3">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-neutral-500 font-medium">유저 템플릿</p>
                                    {row.user_template && (
                                        <button
                                            onClick={() => copyToClipboard(row.user_template!, `usr-${row.id}`)}
                                            className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-300 transition-colors"
                                        >
                                            {copied === `usr-${row.id}`
                                                ? <><Check className="h-3 w-3" /> 복사됨</>
                                                : <><Copy className="h-3 w-3" /> 복사</>}
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-400 line-clamp-3 whitespace-pre-wrap">{row.user_template ?? "—"}</p>
                            </div>
                        </div>
                    ))}
                    {rows.length === 0 && (
                        <div className="py-12 text-center text-neutral-500 text-sm">등록된 AI 프롬프트가 없습니다.</div>
                    )}
                </div>
            )}

            {/* 편집 모달 */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-3xl mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">
                                프롬프트 편집 — <span className="font-mono">{editing.id}</span>
                            </h3>
                            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-neutral-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-neutral-400 mb-1 block">모델</label>
                                    <select
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                                        value={editing.model ?? ""}
                                        onChange={e => setEditing({ ...editing, model: e.target.value })}
                                    >
                                        <option value="">— 선택 —</option>
                                        {MODEL_OPTIONS.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-400 mb-1 block">최대 토큰</label>
                                    <input
                                        type="number"
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                                        value={editing.max_tokens ?? ""}
                                        onChange={e => setEditing({ ...editing, max_tokens: Number(e.target.value) || null })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">설명</label>
                                <input
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                                    value={editing.description ?? ""}
                                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">컨텍스트 키 (context_key)</label>
                                <input
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500"
                                    value={editing.context_key ?? ""}
                                    onChange={e => setEditing({ ...editing, context_key: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">시스템 프롬프트</label>
                                <textarea
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500 resize-none font-mono"
                                    rows={8}
                                    value={editing.system_prompt ?? ""}
                                    onChange={e => setEditing({ ...editing, system_prompt: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">유저 템플릿</label>
                                <p className="text-xs text-neutral-600 mb-1">
                                    사용 가능: {placeholders.join(" · ")}
                                </p>
                                <textarea
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-500 resize-none font-mono"
                                    rows={10}
                                    value={editing.user_template ?? ""}
                                    onChange={e => setEditing({ ...editing, user_template: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
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
