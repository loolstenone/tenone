"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, Search, ChevronDown, ChevronRight,
    Shield, Briefcase, User as UserIcon, Loader2,
    Mail, Building2, Calendar, Award, Globe,
} from "lucide-react";
import * as membersDb from "@/lib/supabase/members";
import type { MemberRow } from "@/lib/supabase/members";
import { defaultModuleAccess } from "@/types/auth";
import type { AccountType, IntraModule } from "@/types/auth";

const typeLabels: Record<string, string> = {
    staff: "직원", partner: "파트너", alliance: "얼라이언스",
    madleaguer: "MADLeaguer", crew: "크루", member: "일반회원",
};
const typeBadge: Record<string, string> = {
    staff: "bg-blue-50 text-blue-700",
    partner: "bg-amber-50 text-amber-700",
    alliance: "bg-purple-50 text-purple-700",
    madleaguer: "bg-green-50 text-green-700",
    crew: "bg-cyan-50 text-cyan-700",
    member: "bg-neutral-100 text-neutral-500",
};

const typeFilters = [
    { value: "all", label: "전체" },
    { value: "staff", label: "직원" },
    { value: "partner", label: "파트너" },
    { value: "alliance", label: "얼라이언스" },
    { value: "madleaguer", label: "MADLeaguer" },
    { value: "crew", label: "크루" },
    { value: "member", label: "일반회원" },
];

export default function PeoplePage() {
    const [members, setMembers] = useState<MemberRow[]>([]);
    const [stats, setStats] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
    const [editingType, setEditingType] = useState<string | null>(null);

    const loadMembers = useCallback(async () => {
        try {
            const [{ members: data }, statsData] = await Promise.all([
                membersDb.fetchMembers({ accountType: typeFilter, search: search || undefined, limit: 100 }),
                membersDb.getMemberStats(),
            ]);
            setMembers(data);
            setStats(statsData);
        } catch (err) {
            console.warn('[People] DB load failed:', err);
        } finally {
            setLoading(false);
        }
    }, [typeFilter, search]);

    useEffect(() => { loadMembers(); }, [loadMembers]);

    const handleChangeType = async (memberId: string, newType: string) => {
        try {
            const modules = defaultModuleAccess[newType as AccountType] || [];
            await membersDb.changeMemberType(memberId, newType, modules as string[]);
            setEditingType(null);
            loadMembers();
        } catch (err) {
            console.error('[People] Type change failed:', err);
            alert('역할 변경에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 text-neutral-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold tracking-tight">회원 관리</h1>
                <p className="text-sm text-neutral-500 mt-1">전체 회원의 역할, 권한, 소속을 통합 관리합니다.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {typeFilters.map(t => {
                    const count = t.value === 'all' ? stats.total || 0 : (stats as Record<string, number>)[t.value] || 0;
                    return (
                        <button key={t.value} onClick={() => setTypeFilter(t.value)}
                            className={`rounded-xl p-3 text-center transition-all border ${
                                typeFilter === t.value
                                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                                    : 'bg-white border-neutral-100 hover:border-neutral-300 shadow-sm'
                            }`}>
                            <div className="text-xl font-bold">{count}</div>
                            <div className="text-xs mt-0.5 opacity-70">{t.label}</div>
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="이름, 이메일 검색..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-200 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100 bg-white" />
            </div>

            {/* Members Table */}
            <div className="bg-white border border-neutral-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-left bg-neutral-50/60">
                            <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">이름</th>
                            <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">이메일</th>
                            <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">유형</th>
                            <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">역할</th>
                            <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">소속</th>
                            <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">인트라</th>
                            <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">가입일</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {members.map(m => (
                            <tr key={m.id} className="hover:bg-neutral-50/50 transition-colors cursor-pointer"
                                onClick={() => setSelectedMember(m)}>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                                            {m.avatar_initials || m.name?.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{m.name}</div>
                                            {m.department && <div className="text-xs text-neutral-400">{m.department} · {m.position}</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-neutral-500 text-xs">{m.email}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeBadge[m.account_type] || typeBadge.member}`}>
                                        {typeLabels[m.account_type] || m.account_type}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-xs text-neutral-500">
                                    {(m.roles || []).map((r: string) => typeLabels[r] || r).join(', ')}
                                </td>
                                <td className="px-5 py-3.5 text-xs text-neutral-500">
                                    {(m.affiliations || []).join(', ') || '-'}
                                </td>
                                <td className="px-5 py-3.5">
                                    {m.intra_access
                                        ? <span className="text-xs text-green-600">접근 가능</span>
                                        : <span className="text-xs text-neutral-400">불가</span>
                                    }
                                </td>
                                <td className="px-5 py-3.5 text-xs text-neutral-400">{(m.created_at || '').substring(0, 10)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {members.length === 0 && (
                    <div className="px-6 py-16 text-center text-neutral-400 text-sm">회원이 없습니다.</div>
                )}
            </div>

            {/* Member Detail Modal */}
            {selectedMember && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => { setSelectedMember(null); setEditingType(null); }} />
                    <div className="fixed inset-y-0 right-0 w-full max-w-lg z-50 bg-white shadow-2xl overflow-y-auto">
                        <div className="p-6 border-b border-neutral-100">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-lg font-bold">
                                    {selectedMember.avatar_initials}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold tracking-tight">{selectedMember.name}</h2>
                                    <p className="text-sm text-neutral-500">{selectedMember.email}</p>
                                </div>
                                <button onClick={() => { setSelectedMember(null); setEditingType(null); }}
                                    className="text-neutral-400 hover:text-neutral-900 text-xl">✕</button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 기본 정보 */}
                            <section>
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">기본 정보</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-neutral-400" />
                                        <span>{selectedMember.email}</span>
                                    </div>
                                    {selectedMember.phone && (
                                        <div className="flex items-center gap-3">
                                            <UserIcon className="h-4 w-4 text-neutral-400" />
                                            <span>{selectedMember.phone}</span>
                                        </div>
                                    )}
                                    {selectedMember.company && (
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-4 w-4 text-neutral-400" />
                                            <span>{selectedMember.company}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-4 w-4 text-neutral-400" />
                                        <span>가입 경로: {selectedMember.origin_site}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-neutral-400" />
                                        <span>가입일: {(selectedMember.created_at || '').substring(0, 10)}</span>
                                    </div>
                                </div>
                            </section>

                            {/* 역할/권한 */}
                            <section>
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">역할 & 권한</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600">주 유형</span>
                                        {editingType !== null ? (
                                            <div className="flex items-center gap-2">
                                                <select value={editingType}
                                                    onChange={e => setEditingType(e.target.value)}
                                                    className="text-sm rounded-lg border border-neutral-200 px-3 py-1.5 focus:outline-none">
                                                    {typeFilters.filter(t => t.value !== 'all').map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                                <button onClick={() => handleChangeType(selectedMember.id, editingType)}
                                                    className="px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-lg">저장</button>
                                                <button onClick={() => setEditingType(null)}
                                                    className="px-3 py-1.5 text-neutral-400 text-xs">취소</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeBadge[selectedMember.account_type]}`}>
                                                    {typeLabels[selectedMember.account_type]}
                                                </span>
                                                <button onClick={() => setEditingType(selectedMember.account_type)}
                                                    className="text-xs text-neutral-400 hover:text-neutral-900">변경</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600">보유 역할</span>
                                        <div className="flex gap-1.5">
                                            {(selectedMember.roles || []).map((r: string) => (
                                                <span key={r} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
                                                    {typeLabels[r] || r}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600">인트라 접근</span>
                                        <span className={`text-xs font-medium ${selectedMember.intra_access ? 'text-green-600' : 'text-neutral-400'}`}>
                                            {selectedMember.intra_access ? '가능' : '불가'}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* 모듈 접근 */}
                            <section>
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">모듈 접근</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {(selectedMember.module_access || []).map((mod: string) => (
                                        <span key={mod} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">{mod}</span>
                                    ))}
                                    {(!selectedMember.module_access || selectedMember.module_access.length === 0) && (
                                        <span className="text-xs text-neutral-400">없음</span>
                                    )}
                                </div>
                            </section>

                            {/* 포인트 */}
                            <section>
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">포인트</h3>
                                <div className="flex items-center gap-3">
                                    <Award className="h-5 w-5 text-amber-500" />
                                    <span className="text-lg font-bold">{(selectedMember.total_points || 0).toLocaleString()}P</span>
                                    <span className="text-xs text-neutral-500">{selectedMember.grade || 'Bronze'}</span>
                                </div>
                            </section>

                            {/* Staff 전용 */}
                            {selectedMember.account_type === 'staff' && (
                                <section>
                                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">직원 정보</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500">사번</span>
                                            <span>{selectedMember.employee_id || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500">부서</span>
                                            <span>{selectedMember.department || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500">직위</span>
                                            <span>{selectedMember.position || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500">시스템 권한</span>
                                            <div className="flex gap-1">
                                                {(selectedMember.system_access || []).map((s: string) => (
                                                    <span key={s} className="text-xs px-2 py-0.5 bg-neutral-100 rounded-full">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
