"use client";

import { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Member { id: string; name: string | null; email: string; company: string | null; created_at: string; }

export default function SmarcommMembersPage() {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        createClient().from("members")
            .select("id, name, email, company, created_at")
            .contains("affiliations", ["smarcomm"])
            .order("created_at", { ascending: false })
            .limit(200)
            .then((res: { data: Member[] | null }) => { setMembers(res.data ?? []); setLoading(false); });
    }, []);

    const filtered = members.filter(m => !search || m.name?.includes(search) || m.email?.includes(search) || m.company?.includes(search));

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-lg font-bold">회원 관리</h1>
                <p className="text-sm text-neutral-400 mt-0.5">SmarComm 구독 회원 관리</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">전체 구독 회원</p>
                    <p className="text-2xl font-bold">{members.length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">검색 결과</p>
                    <p className="text-2xl font-bold">{filtered.length}</p>
                </div>
            </div>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 이메일, 회사 검색"
                    className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400" />
            </div>
            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <Users className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{search ? "검색 결과 없음" : "구독 회원이 없습니다"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-neutral-50 text-left">{["이름","이메일","회사","가입일"].map(h => <th key={h} className="px-4 py-3 font-semibold text-neutral-500">{h}</th>)}</tr></thead>
                        <tbody>
                            {filtered.map(m => (
                                <tr key={m.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium">{m.name || "-"}</td>
                                    <td className="px-4 py-3 text-neutral-500">{m.email}</td>
                                    <td className="px-4 py-3 text-neutral-500">{m.company || "-"}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-400">{new Date(m.created_at).toLocaleDateString("ko-KR")}</td>
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
