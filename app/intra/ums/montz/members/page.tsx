"use client";

import { useState, useEffect } from "react";
import { Search, Users, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MontzCreator } from "@/lib/supabase/montz";

type Row = Pick<MontzCreator, "id" | "display_name" | "handle" | "type" | "gender" | "availability_status" | "is_verified" | "work_count" | "follower_count" | "created_at">;

const TYPE_KO: Record<string, string> = { model: "모델", actor: "배우", both: "모델·배우" };
const AVAIL_KO: Record<string, string> = { active: "활동 중", selective: "선택적", inactive: "비활성" };
const AVAIL_C: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    selective: "bg-amber-50 text-amber-700",
    inactive: "bg-neutral-100 text-neutral-500",
};

export default function MontzMembersPage() {
    const [loading, setLoading] = useState(true);
    const [creators, setCreators] = useState<Row[]>([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("전체");

    useEffect(() => {
        createClient().from("montz_creators")
            .select("id, display_name, handle, type, gender, availability_status, is_verified, work_count, follower_count, created_at")
            .order("created_at", { ascending: false })
            .limit(300)
            .then(res => { setCreators((res.data ?? []) as Row[]); setLoading(false); });
    }, []);

    const filtered = creators.filter(c => {
        const matchSearch = !search || c.display_name.toLowerCase().includes(search.toLowerCase()) || c.handle.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "전체" || c.type === typeFilter;
        return matchSearch && matchType;
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">창작자 관리</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">MoNTZ 모델 · 배우 프로필 관리</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">전체 창작자</p>
                    <p className="text-2xl font-bold">{creators.length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">인증 창작자</p>
                    <p className="text-2xl font-bold text-emerald-600">{creators.filter(c => c.is_verified).length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">검색 결과</p>
                    <p className="text-2xl font-bold">{filtered.length}</p>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="이름, 핸들 검색"
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400" />
                </div>
                <div className="flex gap-1.5">
                    {["전체", "model", "actor", "both"].map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={`text-xs px-3 py-2 border rounded transition ${typeFilter === t ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                            {t === "전체" ? "전체" : TYPE_KO[t]}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <Users className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{search ? "검색 결과 없음" : "창작자가 없습니다"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-neutral-50 text-left">{["이름/핸들","유형","상태","작업","팔로워","가입일"].map(h => <th key={h} className="px-4 py-3 font-semibold text-neutral-500 text-xs">{h}</th>)}</tr></thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-medium">{c.display_name}</span>
                                            {c.is_verified && <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                                        </div>
                                        <span className="text-xs text-neutral-400">{c.handle}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-neutral-600">{TYPE_KO[c.type] ?? c.type}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${AVAIL_C[c.availability_status] ?? ""}`}>
                                            {AVAIL_KO[c.availability_status] ?? c.availability_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-neutral-500">{c.work_count}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-500">{c.follower_count.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-400">{new Date(c.created_at).toLocaleDateString("ko-KR")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">총 {filtered.length}명</div>
                </div>
            )}
        </div>
    );
}
