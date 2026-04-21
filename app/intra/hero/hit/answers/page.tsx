"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface ResponseTypeStat {
    response_type: string;
    count: number;
    modules: string[];
    examples: { question_text: string; scoring_key: string | null }[];
}

interface ResponseRow {
    id: string;
    response_value: string | null;
    response_score: number | null;
    created_at: string;
}

export default function HitAnswersPage() {
    const [loading, setLoading] = useState(true);
    const [typeStats, setTypeStats] = useState<ResponseTypeStat[]>([]);
    const [recent, setRecent] = useState<ResponseRow[]>([]);
    const [valueDist, setValueDist] = useState<{ value: string; count: number }[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const [qRes, rRes, distRes] = await Promise.all([
                sb.from("hit_questions").select("response_type, module, question_text, scoring_key").limit(3000),
                sb.from("hit_responses").select("id, response_value, response_score, created_at").order("created_at", { ascending: false }).limit(50),
                sb.from("hit_responses").select("response_value"),
            ]);

            // Group by response_type
            const map = new Map<string, { count: number; modules: Set<string>; examples: { question_text: string; scoring_key: string | null }[] }>();
            (qRes.data ?? []).forEach((q: { response_type: string | null; module: string; question_text: string; scoring_key: string | null }) => {
                const t = q.response_type || "unknown";
                if (!map.has(t)) map.set(t, { count: 0, modules: new Set(), examples: [] });
                const e = map.get(t)!;
                e.count++;
                e.modules.add(q.module);
                if (e.examples.length < 2) e.examples.push({ question_text: q.question_text, scoring_key: q.scoring_key });
            });
            setTypeStats(Array.from(map.entries()).map(([response_type, v]) => ({
                response_type, count: v.count, modules: Array.from(v.modules), examples: v.examples
            })).sort((a, b) => b.count - a.count));

            setRecent(rRes.data ?? []);

            // Value distribution
            const vmap = new Map<string, number>();
            (distRes.data ?? []).forEach((r: { response_value: string | null }) => {
                const v = r.response_value || "null";
                vmap.set(v, (vmap.get(v) ?? 0) + 1);
            });
            setValueDist(Array.from(vmap.entries()).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, 10));

            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <PageHeader title="HIT 답변 구성" description="response_type · scoring_key · 실제 답변 분포" />

            {/* Response Types */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-violet-500" />
                    response_type 분류 ({typeStats.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {typeStats.map(t => (
                        <div key={t.response_type} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                                    {t.response_type}
                                </span>
                                <span className="text-xs font-bold text-neutral-900">{t.count.toLocaleString()}개 질문</span>
                            </div>
                            <p className="text-[10px] text-neutral-500 mb-2">
                                사용 모듈: <span className="font-mono">{t.modules.slice(0, 4).join(", ")}</span>
                                {t.modules.length > 4 && <span className="text-neutral-400"> +{t.modules.length - 4}</span>}
                            </p>
                            {t.examples[0] && (
                                <div className="bg-neutral-50 rounded p-2 text-[10px]">
                                    <p className="text-neutral-700 truncate">{t.examples[0].question_text}</p>
                                    {t.examples[0].scoring_key && <p className="text-neutral-400 font-mono mt-1">key: {t.examples[0].scoring_key}</p>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Value Distribution */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">응답 값 분포 (실데이터 Top 10)</h2>
                {valueDist.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">
                        응답 데이터 없음.
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-1.5">
                        {valueDist.map(d => {
                            const max = valueDist[0].count;
                            const pct = (d.count / max) * 100;
                            return (
                                <div key={d.value} className="flex items-center gap-3">
                                    <span className="w-28 text-[11px] font-mono text-neutral-700 truncate">{d.value}</span>
                                    <div className="flex-1 h-4 bg-neutral-100 rounded overflow-hidden">
                                        <div className="h-full bg-violet-500" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="w-16 text-right text-[11px] font-semibold">{d.count.toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recent Responses */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">최근 응답 ({recent.length})</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">response_value</th>
                                <th className="text-right px-3 py-2 font-semibold text-neutral-600">score</th>
                                <th className="text-right px-3 py-2 font-semibold text-neutral-600">created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.slice(0, 20).map(r => (
                                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                                    <td className="px-3 py-1.5 font-mono text-[10px]">{r.response_value || "-"}</td>
                                    <td className="px-3 py-1.5 text-right font-semibold">{r.response_score ?? "-"}</td>
                                    <td className="px-3 py-1.5 text-right text-[10px] text-neutral-500">
                                        {new Date(r.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
