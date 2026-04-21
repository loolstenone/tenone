"use client";

import { useEffect, useState, useMemo } from "react";
import { HelpCircle, Loader2, Search } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Q {
    id: string; module: string; test_type: string; question_index: number;
    question_text: string; sub_domain: string | null; response_type: string | null;
    reverse_scored: boolean; scoring_key: string | null; layer_target: string | null;
}

export default function HitQuestionsPage() {
    const [loading, setLoading] = useState(true);
    const [all, setAll] = useState<Q[]>([]);
    const [search, setSearch] = useState("");
    const [module, setModule] = useState<string>("all");
    const [testType, setTestType] = useState<string>("all");

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("hit_questions").select("*").order("module").order("test_type").order("question_index").limit(3000);
            setAll(data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    const modules = useMemo(() => Array.from(new Set(all.map(q => q.module))).sort(), [all]);
    const testTypes = useMemo(() => Array.from(new Set(all.map(q => q.test_type))).sort(), [all]);

    const filtered = useMemo(() => all.filter(q => {
        if (module !== "all" && q.module !== module) return false;
        if (testType !== "all" && q.test_type !== testType) return false;
        if (search && !q.question_text?.toLowerCase().includes(search.toLowerCase()) && !q.sub_domain?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [all, module, testType, search]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <PageHeader title="HIT 질문 관리" description={`hit_questions 테이블 · 전체 ${all.length.toLocaleString()}개`} />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 bg-white border border-neutral-200 rounded-lg p-3">
                <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                    <Search className="h-3 w-3 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="질문 또는 sub_domain 검색…"
                        className="flex-1 text-xs bg-transparent outline-none" />
                </div>
                <select value={module} onChange={e => setModule(e.target.value)}
                    className="text-xs border border-neutral-200 rounded px-2 py-1">
                    <option value="all">전체 모듈</option>
                    {modules.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={testType} onChange={e => setTestType(e.target.value)}
                    className="text-xs border border-neutral-200 rounded px-2 py-1">
                    <option value="all">전체 타입</option>
                    {testTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-[11px] text-neutral-500">{filtered.length.toLocaleString()} 결과</span>
            </div>

            {/* Questions Table */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-rose-500" />
                    질문 목록 ({filtered.length})
                </h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">모듈</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">타입</th>
                                <th className="text-right px-3 py-2 font-semibold text-neutral-600">#</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">sub_domain</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">질문</th>
                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">응답 타입</th>
                                <th className="text-center px-3 py-2 font-semibold text-neutral-600">역채점</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice(0, 500).map(q => (
                                <tr key={q.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                    <td className="px-3 py-1.5 font-mono text-[10px] text-neutral-700">{q.module}</td>
                                    <td className="px-3 py-1.5">
                                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-semibold">{q.test_type}</span>
                                    </td>
                                    <td className="px-3 py-1.5 text-right text-neutral-500">{q.question_index}</td>
                                    <td className="px-3 py-1.5 text-neutral-600 truncate max-w-[140px]">{q.sub_domain || "-"}</td>
                                    <td className="px-3 py-1.5 text-neutral-900 truncate max-w-[380px]">{q.question_text}</td>
                                    <td className="px-3 py-1.5 text-[10px] text-neutral-500 font-mono">{q.response_type || "-"}</td>
                                    <td className="px-3 py-1.5 text-center">{q.reverse_scored ? <span className="text-[10px] text-rose-600">↓</span> : "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length > 500 && (
                        <div className="p-2 text-center text-[10px] text-neutral-500 bg-neutral-50">
                            상위 500건만 표시 (필터로 좁혀주세요)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
