"use client";

import { useState, useEffect } from "react";
import { Search, Building2, Mail, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TIHResponse {
    id: string;
    company: string;
    contact_name: string;
    email: string;
    responses: Record<string, any>;
    status: "pending" | "reviewing" | "matched" | "closed";
    created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    pending: { label: "대기", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    reviewing: { label: "검토 중", className: "bg-blue-50 text-blue-700 border-blue-200" },
    matched: { label: "매칭 완료", className: "bg-green-50 text-green-700 border-green-200" },
    closed: { label: "종료", className: "bg-neutral-100 text-neutral-500 border-neutral-200" },
};

export default function SearchLightIntraPage() {
    const [rows, setRows] = useState<TIHResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<TIHResponse | null>(null);
    const [waitlist, setWaitlist] = useState<{ email: string; company: string; created_at: string }[]>([]);

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("hero_tih_responses").select("*").order("created_at", { ascending: false }),
            sb.from("hero_search_light_waitlist").select("email, company, created_at").order("created_at", { ascending: false }),
        ]).then(([{ data: tih }, { data: wl }]: [{ data: any }, { data: any }]) => {
            setRows(tih ?? []);
            setWaitlist(wl ?? []);
            setLoading(false);
        });
    }, []);

    const filtered = rows.filter(
        (r) =>
            !search ||
            r.company?.includes(search) ||
            r.email?.includes(search) ||
            r.contact_name?.includes(search)
    );

    async function updateStatus(id: string, status: string) {
        const sb = createClient();
        const { error } = await sb.from("hero_tih_responses").update({ status }).eq("id", id);
        if (error) { alert(`상태 변경 실패: ${error.message}`); return; }
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as any } : r)));
        if (selected?.id === id) setSelected((p) => p ? { ...p, status: status as any } : p);
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">Search Light · 기업 요청</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">
                        TIH 검사 제출 {rows.length}건 · 사전 등록 {waitlist.length}건
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="기업명, 이메일 검색..."
                        className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-56 focus:outline-none focus:border-neutral-400"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* TIH 응답 목록 */}
                    <div className="lg:col-span-2">
                        <h2 className="text-sm font-semibold text-neutral-500 mb-3">TIH 검사 제출</h2>
                        {filtered.length === 0 ? (
                            <div className="border border-neutral-200 rounded-lg p-12 text-center">
                                <Building2 className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
                                <p className="text-sm text-neutral-400">제출된 TIH 검사가 없습니다</p>
                            </div>
                        ) : (
                            <div className="border border-neutral-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-neutral-50 text-left">
                                            <th className="px-4 py-3 font-semibold text-neutral-500">기업</th>
                                            <th className="px-4 py-3 font-semibold text-neutral-500">담당자</th>
                                            <th className="px-4 py-3 font-semibold text-neutral-500">상태</th>
                                            <th className="px-4 py-3 font-semibold text-neutral-500">제출일</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((r) => (
                                            <tr key={r.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                                <td className="px-4 py-3 font-medium">{r.company}</td>
                                                <td className="px-4 py-3 text-neutral-500 text-xs">
                                                    <p>{r.contact_name}</p>
                                                    <p className="text-neutral-400">{r.email}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex text-xs px-2 py-0.5 border rounded-full font-medium ${STATUS_LABELS[r.status]?.className}`}>
                                                        {STATUS_LABELS[r.status]?.label ?? r.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-neutral-400">
                                                    {new Date(r.created_at).toLocaleDateString("ko-KR")}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => setSelected(r)} className="text-neutral-400 hover:text-neutral-600">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* 사전 등록 */}
                        {waitlist.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-sm font-semibold text-neutral-500 mb-3">사전 등록</h2>
                                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-neutral-50 text-left">
                                                <th className="px-4 py-3 font-semibold text-neutral-500">기업</th>
                                                <th className="px-4 py-3 font-semibold text-neutral-500">이메일</th>
                                                <th className="px-4 py-3 font-semibold text-neutral-500">등록일</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {waitlist.map((w) => (
                                                <tr key={w.email} className="border-t border-neutral-100">
                                                    <td className="px-4 py-3 font-medium">{w.company}</td>
                                                    <td className="px-4 py-3 text-neutral-500 text-xs">{w.email}</td>
                                                    <td className="px-4 py-3 text-xs text-neutral-400">
                                                        {new Date(w.created_at).toLocaleDateString("ko-KR")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 상세 패널 */}
                    {selected && (
                        <div className="bg-white border border-neutral-200 rounded-lg p-6 h-fit">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold">{selected.company}</h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">{selected.contact_name} · {selected.email}</p>
                                </div>
                                <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-600 text-xs">닫기</button>
                            </div>

                            {/* 상태 변경 */}
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-neutral-500 mb-2">상태 변경</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(STATUS_LABELS).map(([key, val]) => (
                                        <button
                                            key={key}
                                            onClick={() => updateStatus(selected.id, key)}
                                            className={`text-xs px-2 py-1 border rounded-full font-medium transition-opacity ${selected.status === key ? val.className : "border-neutral-200 text-neutral-500 opacity-50 hover:opacity-100"}`}
                                        >
                                            {val.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* TIH 응답 요약 */}
                            <div className="space-y-3 text-xs">
                                {selected.responses?.s0 && (
                                    <div className="p-3 bg-neutral-50 rounded-lg">
                                        <p className="font-semibold mb-1">Section 0 · 포지션</p>
                                        <p>산업: {selected.responses.s0.industry}</p>
                                        <p>직무: {selected.responses.s0.jobFunction}</p>
                                        <p>트랙: {selected.responses.s0.track}</p>
                                    </div>
                                )}
                                {selected.responses?.s2 && (
                                    <div className="p-3 bg-neutral-50 rounded-lg">
                                        <p className="font-semibold mb-1">Section 2 · 3축 배분</p>
                                        <p>수호자 {selected.responses.s2.guardian}점 · 개척자 {selected.responses.s2.pioneer}점 · 결속자 {selected.responses.s2.connector}점</p>
                                    </div>
                                )}
                                {selected.responses?.s6?.q1 && (
                                    <div className="p-3 bg-neutral-50 rounded-lg">
                                        <p className="font-semibold mb-1">Section 6 · 한 줄 묘사</p>
                                        <p className="italic text-neutral-600">"{selected.responses.s6.q1}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
