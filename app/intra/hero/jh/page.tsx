"use client";

/**
 * JH 응답 현황 (Intra)
 * hero_jh_responses 목록 · 12축 분석 · 미작성 회원 현황
 */

import { useEffect, useState } from "react";
import { Compass, Users, Loader2, Search, Eye } from "lucide-react";
import { PageHeader, StatCard } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface JH {
    id: string;
    member_id: string;
    status: string;
    responses: Record<string, unknown>;
    practical_filters: Record<string, unknown>;
    submitted_at: string | null;
    created_at: string;
    updated_at: string;
    members: { name: string | null; email: string } | null;
}

const STATUS_LABEL: Record<string, { l: string; c: string }> = {
    draft: { l: "작성 중", c: "bg-neutral-100 text-neutral-600" },
    active: { l: "매칭 대기", c: "bg-emerald-50 text-emerald-700" },
    paused: { l: "일시 중지", c: "bg-amber-50 text-amber-700" },
    archived: { l: "보관", c: "bg-neutral-50 text-neutral-400" },
};

const JH_QUESTIONS = [
    { key: "jh1", label: "JH1 · 풀고 싶은 문제의 결 (택2)" },
    { key: "jh2", label: "JH2 · 매혹되는 상황의 모양" },
    { key: "jh3", label: "JH3 · 잘 쓰이고 있다고 느낄 때 (택3)" },
    { key: "jh4", label: "JH4 · 다르게 해내는 한 가지" },
    { key: "jh5", label: "JH5 · 1~3년 성장 방향" },
    { key: "jh6", label: "JH6 · 5~10년 후 자화상" },
    { key: "jh7", label: "JH7 · 서고 싶은 국면" },
    { key: "jh8", label: "JH8 · 기여하고 싶은 단위" },
    { key: "jh9", label: "JH9 · 일하는 방식 스펙트럼" },
    { key: "jh10", label: "JH10 · 동력원 (택2)" },
    { key: "jh11", label: "JH11 · 피하고 싶은 조직 (택2)" },
    { key: "jh12", label: "JH12 · 자유서술" },
];

export default function HeroJhPage() {
    const [rows, setRows] = useState<JH[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<JH | null>(null);

    useEffect(() => {
        createClient().from("hero_jh_responses")
            .select("*, members(name, email)")
            .order("updated_at", { ascending: false })
            .limit(200)
            .then(res => {
                setRows((res.data ?? []) as unknown as JH[]);
                setLoading(false);
            });
    }, []);

    const filtered = rows.filter(r =>
        !search
        || r.members?.name?.toLowerCase().includes(search.toLowerCase())
        || r.members?.email?.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: rows.length,
        active: rows.filter(r => r.status === "active").length,
        draft: rows.filter(r => r.status === "draft").length,
    };

    return (
        <div>
            <PageHeader title="JH 응답 현황" description="hero_jh_responses · 개인이 작성한 12문항 + 자유서술" />

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <StatCard label="전체 응답" value={stats.total + "건"} sub="JH 작성자" icon={<Compass className="h-4 w-4" />} />
                        <StatCard label="매칭 대기 (active)" value={stats.active + "건"} sub="매칭 엔진 후보" icon={<Users className="h-4 w-4" />} />
                        <StatCard label="작성 중 (draft)" value={stats.draft + "건"} sub="완료 전" />
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold">응답 목록 ({filtered.length})</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름·이메일"
                                className="pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded w-56 focus:outline-none focus:border-neutral-400" />
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="border border-dashed border-neutral-200 rounded-lg p-12 text-center">
                            <Compass className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
                            <p className="text-sm text-neutral-400">{search ? "검색 결과 없음" : "JH 응답이 아직 없습니다"}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className={selected ? "lg:col-span-2" : "lg:col-span-3"}>
                                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead className="bg-neutral-50 border-b border-neutral-200">
                                            <tr>
                                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">회원</th>
                                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                                <th className="text-right px-3 py-2 font-semibold text-neutral-600">작성일</th>
                                                <th className="text-right px-3 py-2 font-semibold text-neutral-600">수정</th>
                                                <th className="px-3 py-2" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map(r => {
                                                const st = STATUS_LABEL[r.status] ?? STATUS_LABEL.active;
                                                return (
                                                    <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                                        <td className="px-3 py-2">
                                                            <p className="font-medium text-neutral-800">{r.members?.name || "(이름 없음)"}</p>
                                                            <p className="text-[10px] text-neutral-400">{r.members?.email}</p>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${st.c}`}>{st.l}</span>
                                                        </td>
                                                        <td className="px-3 py-2 text-right text-[10px] text-neutral-400">
                                                            {new Date(r.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                                                        </td>
                                                        <td className="px-3 py-2 text-right text-[10px] text-neutral-400">
                                                            {new Date(r.updated_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <button onClick={() => setSelected(r)} className="text-neutral-400 hover:text-neutral-700">
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {selected && (
                                <div className="bg-white border border-neutral-200 rounded-lg p-5 h-fit lg:sticky lg:top-4">
                                    <div className="flex items-start justify-between mb-4 border-b border-neutral-100 pb-3">
                                        <div>
                                            <h3 className="font-bold text-sm">{selected.members?.name || "(이름 없음)"}</h3>
                                            <p className="text-[11px] text-neutral-500 mt-0.5">{selected.members?.email}</p>
                                        </div>
                                        <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-600 text-xs">닫기</button>
                                    </div>

                                    <div className="space-y-3 text-[11px]">
                                        {JH_QUESTIONS.map(({ key, label }) => {
                                            const val = (selected.responses as Record<string, unknown>)[key];
                                            if (val === undefined || val === null || val === "") return null;
                                            return (
                                                <div key={key}>
                                                    <p className="font-semibold text-neutral-700 mb-0.5">{label}</p>
                                                    {Array.isArray(val) ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {val.map((v, i) => (
                                                                <span key={i} className="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-600">{String(v)}</span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-neutral-600 whitespace-pre-wrap">{String(val)}</p>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {Object.keys(selected.practical_filters || {}).length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-neutral-100">
                                                <p className="font-semibold text-neutral-700 mb-1">실무 매칭 필드</p>
                                                <pre className="bg-neutral-50 p-2 rounded text-[10px] text-neutral-600 overflow-x-auto">
                                                    {JSON.stringify(selected.practical_filters, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 p-3 border border-neutral-200 bg-neutral-50 rounded text-[11px] text-neutral-600">
                        <strong className="block mb-1">🧭 JH 12문항 축</strong>
                        문제 축 (1,12) · 서사 축 (2) · 의미 축 (3,10) · 차별성 축 (4) · 궤적 축 (5,6) · 상황 축 (7,9) · 반경 축 (8) · 경계 축 (11)
                        <span className="ml-1 text-neutral-400">— docs/HeRo_Matching_Tetrad_v1.md</span>
                    </div>
                </>
            )}
        </div>
    );
}
