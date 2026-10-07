"use client";

import { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";

// 회원 = MADLeague 활동 역할(member_capability_roles) 보유자 — 현역·임원·멘토(club) · 기업(showcase/host)
// 지원서(mad_applications)는 심사 관리 화면에서 본다
interface RoleRow {
    capability_key: string; role: string;
    club: { id: string; name: string; color: string | null } | null;
    year: number | null; position: string | null; company: string | null;
    valid_from: string; valid_until: string | null;
}
interface MemberRow {
    member_id: string; name: string | null; email: string | null; avatar_url: string | null;
    university: string | null; major: string | null; portfolio_public: boolean;
    roles: RoleRow[];
}

function roleLabel(r: RoleRow): string {
    if (r.capability_key === "showcase") return r.company ? `기업 · ${r.company}` : "기업";
    const pos = r.position ? `${r.role}(${r.position})` : r.role;
    return r.year ? `${pos} ${r.year}` : pos;
}

const ROLE_FILTERS = ["전체", "현역", "임원", "멘토", "OB", "기업"] as const;

export default function MADLeagueMembersPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [members, setMembers] = useState<MemberRow[]>([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]>("전체");
    const [history, setHistory] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/madleague/admin/members${history ? "?history=1" : ""}`)
            .then(async r => {
                const d = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(d.error || "불러오기 실패");
                setMembers(d.members ?? []);
                setError(null);
            })
            .catch(e => setError(e instanceof Error ? e.message : "불러오기 실패"))
            .finally(() => setLoading(false));
    }, [history]);

    const hasRole = (m: MemberRow, f: (typeof ROLE_FILTERS)[number]) =>
        f === "전체" || m.roles.some(r => f === "기업" ? r.capability_key === "showcase" : r.role === f);

    const filtered = members.filter(m => {
        const q = search.trim();
        const matchSearch = !q || m.name?.includes(q) || m.email?.includes(q) || m.university?.includes(q)
            || m.roles.some(r => r.club?.name.includes(q));
        return matchSearch && hasRole(m, roleFilter);
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">회원 관리</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">MAD League 활동 역할 보유자 (현역·임원·멘토·기업)</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <input type="checkbox" checked={history} onChange={e => setHistory(e.target.checked)} /> 종료된 역할 포함
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 이메일, 학교, 동아리..."
                            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-60 focus:outline-none focus:border-neutral-400" />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                {ROLE_FILTERS.map(f => (
                    <button key={f} onClick={() => setRoleFilter(f)}
                        className={`text-xs px-3 py-1.5 rounded-full ${roleFilter === f ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>
                        {f} {f === "전체" ? members.length : members.filter(m => hasRole(m, f)).length}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : error ? (
                <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-sm text-red-700">{error}</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <Users className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{search ? "검색 결과가 없습니다" : "활동 역할이 있는 회원이 없습니다"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left">
                                {["이름", "이메일", "역할", "동아리", "학교 / 학과", "포트폴리오"].map(h => <th key={h} className="px-4 py-3 font-semibold text-neutral-500">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(m => {
                                const clubs = Array.from(new Map(m.roles.filter(r => r.club).map(r => [r.club!.id, r.club!])).values());
                                return (
                                    <tr key={m.member_id} className="border-t border-neutral-100 hover:bg-neutral-50 align-top">
                                        <td className="px-4 py-3 font-medium">{m.name ?? "-"}</td>
                                        <td className="px-4 py-3 text-neutral-500">{m.email ?? "-"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {m.roles.map((r, i) => (
                                                    <span key={i} className={`text-xs px-2 py-0.5 rounded ${r.valid_until ? "bg-neutral-100 text-neutral-400 line-through" : "bg-neutral-900 text-white"}`}>
                                                        {roleLabel(r)}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {clubs.length === 0 && <span className="text-xs text-neutral-300">-</span>}
                                                {clubs.map(c => (
                                                    <span key={c.id} className="text-xs px-2 py-0.5 rounded font-medium"
                                                        style={{ backgroundColor: (c.color ?? "#EC1D25") + "20", color: c.color ?? "#EC1D25" }}>
                                                        {c.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600">{m.university ?? "-"}{m.major && ` / ${m.major}`}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{m.portfolio_public ? "공개" : "비공개"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">총 {filtered.length}명</div>
                </div>
            )}
        </div>
    );
}
