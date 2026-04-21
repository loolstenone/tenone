"use client";

import { useEffect, useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Row { module: string; test_type: string; question_count: number; sub_domain_count: number; }

export default function HitStructurePage() {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("hit_questions").select("module, test_type, sub_domain");
            const map = new Map<string, { qs: number; subs: Set<string> }>();
            (data ?? []).forEach((q: { module: string; test_type: string; sub_domain: string | null }) => {
                const key = `${q.module}|${q.test_type}`;
                if (!map.has(key)) map.set(key, { qs: 0, subs: new Set() });
                const e = map.get(key)!;
                e.qs++;
                if (q.sub_domain) e.subs.add(q.sub_domain);
            });
            setRows(Array.from(map.entries()).map(([k, v]) => {
                const [module, test_type] = k.split("|");
                return { module, test_type, question_count: v.qs, sub_domain_count: v.subs.size };
            }).sort((a, b) => a.module.localeCompare(b.module)));
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    const modules = Array.from(new Set(rows.map(r => r.module))).sort();
    const testTypes = Array.from(new Set(rows.map(r => r.test_type))).sort();
    const totalQs = rows.reduce((s, r) => s + r.question_count, 0);

    return (
        <div className="space-y-6">
            <PageHeader title="HIT 구성" description="Hero Identification Test 모듈 × 테스트 타입 구성 매트릭스" />

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-[11px] text-neutral-500">모듈</p>
                    <p className="text-xl font-bold">{modules.length}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-[11px] text-neutral-500">테스트 타입</p>
                    <p className="text-xl font-bold">{testTypes.length}</p>
                    <p className="text-[10px] text-neutral-400">{testTypes.join(", ")}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-[11px] text-neutral-500">전체 질문</p>
                    <p className="text-xl font-bold">{totalQs.toLocaleString()}</p>
                </div>
            </div>

            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-rose-500" />
                    모듈 × 타입 매트릭스
                </h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-[11px]">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600 sticky left-0 bg-neutral-50">모듈</th>
                                {testTypes.map(t => (
                                    <th key={t} className="px-2 py-2 text-center font-semibold text-neutral-600">{t}</th>
                                ))}
                                <th className="px-2 py-2 text-center font-semibold text-neutral-900">합계</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modules.map(m => {
                                const modRows = rows.filter(r => r.module === m);
                                const modTotal = modRows.reduce((s, r) => s + r.question_count, 0);
                                return (
                                    <tr key={m} className="border-b border-neutral-100 hover:bg-neutral-50">
                                        <td className="px-3 py-1.5 font-mono text-neutral-900 sticky left-0 bg-white">{m}</td>
                                        {testTypes.map(t => {
                                            const row = modRows.find(r => r.test_type === t);
                                            return (
                                                <td key={t} className="px-2 py-1.5 text-center">
                                                    {row ? (
                                                        <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold text-[10px]">
                                                            {row.question_count}
                                                            <span className="ml-1 text-[9px] text-rose-500">({row.sub_domain_count}sd)</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-neutral-200">—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-2 py-1.5 text-center font-semibold">{modTotal}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="mt-2 text-[10px] text-neutral-500">sd = sub_domain 수</p>
            </div>
        </div>
    );
}
