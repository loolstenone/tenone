"use client";

import { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Member {
    id: string;
    name: string;
    email: string;
    university: string | null;
    major: string | null;
    year_in_school: number | null;
    status: string;
    created_at: string;
    mad_clubs?: { name: string; color: string | null } | null;
}

export default function MADLeagueMembersPage() {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState("");
    const [clubFilter, setClubFilter] = useState("all");
    const [clubs, setClubs] = useState<{ slug: string; name: string; color: string | null }[]>([]);

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("mad_applications")
                .select("id, name, email, university, major, year_in_school, status, created_at, mad_clubs(name, color)")
                .eq("status", "accepted")
                .order("created_at", { ascending: false })
                .limit(500),
            sb.from("mad_clubs").select("slug, name, color").eq("status", "active").order("sort_order"),
        ]).then(([membersRes, clubsRes]) => {
            setMembers((membersRes.data ?? []) as Member[]);
            setClubs((clubsRes.data ?? []) as { slug: string; name: string; color: string | null }[]);
            setLoading(false);
        });
    }, []);

    const filtered = members.filter(m => {
        const matchSearch = !search || m.name?.includes(search) || m.email?.includes(search) || m.university?.includes(search);
        const matchClub = clubFilter === "all" || (m.mad_clubs as { name: string; color: string | null } | null)?.name === clubFilter;
        return matchSearch && matchClub;
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">회원 관리</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">승인된 MAD League 현역 회원</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={clubFilter} onChange={e => setClubFilter(e.target.value)}
                        className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-neutral-400">
                        <option value="all">전체 동아리</option>
                        {clubs.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                    </select>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 이메일, 학교..."
                            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-52 focus:outline-none focus:border-neutral-400" />
                    </div>
                </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">총 현역</p>
                    <p className="text-2xl font-bold">{members.length}</p>
                </div>
                {clubs.slice(0, 3).map(c => (
                    <div key={c.slug} className="border border-neutral-200 rounded-lg p-4">
                        <p className="text-xs text-neutral-400 mb-1">{c.name}</p>
                        <p className="text-2xl font-bold">
                            {members.filter(m => (m.mad_clubs as { name: string; color: string | null } | null)?.name === c.name).length}
                        </p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <Users className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{search ? "검색 결과가 없습니다" : "현역 회원이 없습니다"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left">
                                <th className="px-4 py-3 font-semibold text-neutral-500">이름</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">이메일</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">동아리</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">학교 / 학과</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">가입일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(m => {
                                const club = m.mad_clubs as { name: string; color: string | null } | null;
                                return (
                                    <tr key={m.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                        <td className="px-4 py-3 font-medium">{m.name}</td>
                                        <td className="px-4 py-3 text-neutral-500">{m.email}</td>
                                        <td className="px-4 py-3">
                                            {club && (
                                                <span className="text-xs px-2 py-0.5 rounded font-medium"
                                                    style={{ backgroundColor: (club.color ?? "#EC1D25") + "20", color: club.color ?? "#EC1D25" }}>
                                                    {club.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600">
                                            {m.university ?? "-"}{m.major && ` / ${m.major}`}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-400">
                                            {new Date(m.created_at).toLocaleDateString("ko-KR")}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">
                        총 {filtered.length}명
                    </div>
                </div>
            )}
        </div>
    );
}
