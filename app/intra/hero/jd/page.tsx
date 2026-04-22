"use client";

/**
 * JD 관리 (Intra)
 * hero_jd 목록 · 상태별 필터 · 7블록 상세 조회
 */

import { useEffect, useState } from "react";
import { FileText, Building2, Loader2, Search, Archive, Send, Eye } from "lucide-react";
import { PageHeader, StatCard } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface JD {
    id: string;
    company_id: string;
    position_title: string;
    summary: string | null;
    status: string;
    employment_type: string | null;
    experience_range: string | null;
    published_at: string | null;
    created_at: string;
    blocks: Record<string, unknown>;
    hero_companies: { company_name: string; industry: string | null } | null;
}

const STATUS_LABEL: Record<string, { l: string; c: string }> = {
    draft: { l: "작성 중", c: "bg-neutral-100 text-neutral-600" },
    published: { l: "공개", c: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    archived: { l: "보관", c: "bg-neutral-50 text-neutral-400" },
};

export default function HeroJdPage() {
    const [rows, setRows] = useState<JD[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "draft" | "published" | "archived">("all");
    const [selected, setSelected] = useState<JD | null>(null);

    useEffect(() => {
        createClient().from("hero_jd")
            .select("*, hero_companies(company_name, industry)")
            .order("updated_at", { ascending: false })
            .limit(200)
            .then(res => {
                setRows((res.data ?? []) as unknown as JD[]);
                setLoading(false);
            });
    }, []);

    const filtered = rows.filter(r => {
        if (filter !== "all" && r.status !== filter) return false;
        if (!search) return true;
        return r.position_title?.toLowerCase().includes(search.toLowerCase())
            || r.hero_companies?.company_name?.toLowerCase().includes(search.toLowerCase());
    });

    const stats = {
        total: rows.length,
        published: rows.filter(r => r.status === "published").length,
        draft: rows.filter(r => r.status === "draft").length,
        archived: rows.filter(r => r.status === "archived").length,
    };

    return (
        <div>
            <PageHeader title="JD 관리" description="hero_jd · 기업이 작성한 7블록 직무 서술" />

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatCard label="전체 JD" value={stats.total + "건"} sub="등록된 자리" icon={<FileText className="h-4 w-4" />} />
                        <StatCard label="공개 중" value={stats.published + "건"} sub="매칭 후보" icon={<Send className="h-4 w-4" />} />
                        <StatCard label="작성 중" value={stats.draft + "건"} sub="draft 상태" />
                        <StatCard label="보관" value={stats.archived + "건"} sub="archived" icon={<Archive className="h-4 w-4" />} />
                    </div>

                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-1">
                            {(["all", "published", "draft", "archived"] as const).map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`px-2.5 py-1 text-[11px] rounded ${filter === f ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                                    {f === "all" ? "전체" : STATUS_LABEL[f].l}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="포지션·기업명 검색"
                                className="pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded w-60 focus:outline-none focus:border-neutral-400" />
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="border border-dashed border-neutral-200 rounded-lg p-12 text-center">
                            <FileText className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
                            <p className="text-sm text-neutral-400">{search || filter !== "all" ? "검색 결과 없음" : "등록된 JD가 아직 없습니다"}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className={selected ? "lg:col-span-2" : "lg:col-span-3"}>
                                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead className="bg-neutral-50 border-b border-neutral-200">
                                            <tr>
                                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">포지션</th>
                                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">기업</th>
                                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                                <th className="text-left px-3 py-2 font-semibold text-neutral-600">고용</th>
                                                <th className="text-right px-3 py-2 font-semibold text-neutral-600">수정</th>
                                                <th className="px-3 py-2" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map(r => {
                                                const st = STATUS_LABEL[r.status] ?? STATUS_LABEL.draft;
                                                return (
                                                    <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                                        <td className="px-3 py-2 font-medium">
                                                            {r.position_title}
                                                            {r.summary && <p className="text-[10px] text-neutral-400 truncate max-w-xs">{r.summary}</p>}
                                                        </td>
                                                        <td className="px-3 py-2 text-neutral-500">
                                                            <div className="flex items-center gap-1">
                                                                <Building2 className="h-3 w-3 text-neutral-300" />
                                                                {r.hero_companies?.company_name || "-"}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${st.c}`}>{st.l}</span>
                                                        </td>
                                                        <td className="px-3 py-2 text-neutral-500">{r.employment_type || "-"}</td>
                                                        <td className="px-3 py-2 text-right text-[10px] text-neutral-400">
                                                            {new Date(r.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
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
                                            <h3 className="font-bold text-sm">{selected.position_title}</h3>
                                            <p className="text-[11px] text-neutral-500 mt-0.5">
                                                {selected.hero_companies?.company_name} · {selected.hero_companies?.industry || "-"}
                                            </p>
                                        </div>
                                        <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-600 text-xs">닫기</button>
                                    </div>

                                    {selected.summary && (
                                        <div className="mb-4 p-3 bg-neutral-50 rounded text-xs italic text-neutral-600">{selected.summary}</div>
                                    )}

                                    <div className="space-y-3 text-[11px]">
                                        {BLOCK_KEYS.map(({ key, label }) => {
                                            const val = (selected.blocks as Record<string, unknown>)[key];
                                            if (!val || (Array.isArray(val) && val.length === 0)) return null;
                                            return (
                                                <div key={key}>
                                                    <p className="font-semibold text-neutral-700 mb-1">{label}</p>
                                                    {Array.isArray(val) ? (
                                                        <ul className="list-disc ml-4 space-y-0.5 text-neutral-600">
                                                            {val.map((v, i) => <li key={i}>{String(v)}</li>)}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-neutral-600 whitespace-pre-wrap">{String(val)}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 p-3 border border-neutral-200 bg-neutral-50 rounded text-[11px] text-neutral-600">
                        <strong className="block mb-1">📄 JD 7블록 구조 (HeRo 권장)</strong>
                        ① 포지션 타이틀 + 한 줄 · ② 우리는 지금 · ③ 풀어야 하는 문제 · ④ 실제 하게 되는 일
                        · ⑤ 어울리는 사람 · ⑥ 함께 일할 사람들 · ⑦ 조건과 환경
                        <span className="ml-1 text-neutral-400">— docs/HeRo_Matching_Tetrad_v1.md</span>
                    </div>
                </>
            )}
        </div>
    );
}

const BLOCK_KEYS: { key: string; label: string }[] = [
    { key: "block2_now", label: "② 우리는 지금" },
    { key: "block3_problems", label: "③ 풀어야 하는 문제" },
    { key: "block4_work_6m", label: "④ 6개월 내 주 업무" },
    { key: "block4_work_mid", label: "④ 중기 업무 (1~3년)" },
    { key: "block4_non_jd", label: "④ JD 외 업무 (솔직 공개)" },
    { key: "block5_axes_summary", label: "⑤ 3축 요약" },
    { key: "block5_competencies", label: "⑤ 필요 역량" },
    { key: "block5_experience_texture", label: "⑤ 경험의 결" },
    { key: "block6_leader", label: "⑥ 직속 리더" },
    { key: "block6_team", label: "⑥ 팀 구성" },
    { key: "block6_interface", label: "⑥ 협업 인터페이스" },
    { key: "block7_employment", label: "⑦ 고용 형태" },
    { key: "block7_location", label: "⑦ 근무지·형태" },
    { key: "block7_compensation_range", label: "⑦ 처우 범위" },
    { key: "block7_culture_point", label: "⑦ 문화 포인트" },
];
