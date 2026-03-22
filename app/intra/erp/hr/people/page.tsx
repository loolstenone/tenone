"use client";

import { useState, useMemo } from "react";
import {
    Users, Plus, Search, ChevronDown, ChevronRight,
    Check, X, UserCheck, Building2, Crown, GraduationCap,
    Handshake, Star, Shield, Briefcase, User as UserIcon,
    Send, Copy, Link as LinkIcon, Mail
} from "lucide-react";
import { initialPeople, madleagueClubs, categoryLabels, typeLabels, statusLabels, statusStyles } from "@/lib/people-data";
import type { Person, PeopleCategory, MembershipStatus } from "@/types/people";

type CategoryFilter = "all" | PeopleCategory;
type SubFilter = string; // type values
type StatusFilter = "all" | MembershipStatus;

export default function PeoplePage() {
    const [people, setPeople] = useState<Person[]>(initialPeople);
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
    const [subFilter, setSubFilter] = useState<SubFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteType, setInviteType] = useState('madleague-member');
    const [inviteClub, setInviteClub] = useState('madleap');
    const [inviteGeneration, setInviteGeneration] = useState('5');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteCopied, setInviteCopied] = useState(false);

    const inviteCodeMap: Record<string, string> = {
        'youinone': 'YIO-2026',
        'youinone-alliance': 'YIA-2026',
        'madleague-leader': 'ML-LEADER-2026',
        'partner': 'PARTNER-2026',
    };

    const getInviteUrl = () => {
        let code = inviteCodeMap[inviteType];
        if (inviteType === 'madleague-member') {
            code = `${inviteClub.toUpperCase()}-${inviteGeneration}`;
        }
        return `${typeof window !== 'undefined' ? window.location.origin : ''}/invite?code=${code}`;
    };

    const copyInviteUrl = () => {
        navigator.clipboard.writeText(getInviteUrl());
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
    };

    // -- counts --
    const totalCount = people.length;
    const internalCount = people.filter(p => p.category === "internal").length;
    const crewCount = people.filter(p => p.category === "crew").length;
    const generalCount = people.filter(p => p.category === "general").length;

    // -- sub-filter options by category --
    const subFilterOptions: Record<string, { value: string; label: string }[]> = {
        internal: [
            { value: "all", label: "전체" },
            { value: "staff", label: "직원" },
            { value: "partner", label: "Partner" },
            { value: "junior-partner", label: "Junior Partner" },
        ],
        crew: [
            { value: "all", label: "전체" },
            { value: "youinone", label: "YouInOne" },
            { value: "youinone-alliance", label: "Alliance" },
            { value: "madleague-leader", label: "MADLeague 회장단" },
            { value: "madleague-member", label: "MADLeague 멤버" },
        ],
        general: [
            { value: "all", label: "전체" },
            { value: "individual", label: "개인" },
            { value: "company", label: "기업" },
        ],
    };

    // -- count per sub-filter --
    function subCount(cat: PeopleCategory, type: string): number {
        if (type === "all") return people.filter(p => p.category === cat).length;
        return people.filter(p => p.type === type).length;
    }

    // -- count per status --
    function statusCount(status: StatusFilter): number {
        if (status === "all") return people.length;
        return people.filter(p => p.membershipStatus === status).length;
    }

    // -- filtered list --
    const filtered = useMemo(() => {
        let list = [...people];
        if (categoryFilter !== "all") list = list.filter(p => p.category === categoryFilter);
        if (subFilter !== "all") list = list.filter(p => p.type === subFilter);
        if (statusFilter !== "all") list = list.filter(p => p.membershipStatus === statusFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.email.toLowerCase().includes(q) ||
                (p.companyName && p.companyName.toLowerCase().includes(q)) ||
                (p.department && p.department.toLowerCase().includes(q))
            );
        }
        return list;
    }, [people, categoryFilter, subFilter, statusFilter, searchQuery]);

    // -- club name helper --
    function clubName(clubId?: string) {
        if (!clubId) return "";
        return madleagueClubs.find(c => c.id === clubId)?.name ?? clubId;
    }

    // -- actions --
    function handleApprove(id: string) {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, membershipStatus: "active" as MembershipStatus, approvedAt: new Date().toISOString().slice(0, 10) } : p));
    }
    function handleReject(id: string) {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, membershipStatus: "rejected" as MembershipStatus } : p));
    }
    function handleLeaveApprove(id: string) {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, membershipStatus: "inactive" as MembershipStatus } : p));
    }
    function handleLeaveReject(id: string) {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, membershipStatus: "active" as MembershipStatus, leaveRequestedAt: undefined } : p));
    }

    // -- role / affiliation display --
    function affiliationCell(p: Person) {
        switch (p.type) {
            case "staff":
                return <span className="text-xs text-neutral-600">{p.department} · {p.position}</span>;
            case "partner":
            case "junior-partner":
                return <span className="text-xs text-neutral-600">{p.position ?? p.crewRole ?? "-"}</span>;
            case "youinone":
                return <span className="text-xs text-neutral-600">YouInOne · {p.crewRole}</span>;
            case "youinone-alliance":
                return <span className="text-xs text-neutral-600">{p.companyName ?? "Alliance"} · {p.crewRole}</span>;
            case "madleague-leader":
            case "madleague-member":
                return (
                    <span className="text-xs text-neutral-600 flex items-center gap-1">
                        {clubName(p.clubId)} {p.clubGeneration}기
                        {p.madleagueStatus === "active" ? (
                            <span className="px-1 py-0.5 text-xs bg-green-50 text-green-600 font-medium">현멤버</span>
                        ) : (
                            <span className="px-1 py-0.5 text-xs bg-neutral-100 text-neutral-400 font-medium">OB</span>
                        )}
                    </span>
                );
            case "individual":
                return <span className="text-xs text-neutral-400">개인 회원</span>;
            case "company":
                return <span className="text-xs text-neutral-600">{p.companyName} · {p.industry}</span>;
            default:
                return <span className="text-xs text-neutral-400">-</span>;
        }
    }

    // -- type icon --
    function typeIcon(type: string) {
        switch (type) {
            case "staff": return <Briefcase className="h-3 w-3" />;
            case "partner": return <Handshake className="h-3 w-3" />;
            case "junior-partner": return <GraduationCap className="h-3 w-3" />;
            case "youinone": return <Star className="h-3 w-3" />;
            case "youinone-alliance": return <Shield className="h-3 w-3" />;
            case "madleague-leader": return <Crown className="h-3 w-3" />;
            case "madleague-member": return <Users className="h-3 w-3" />;
            case "individual": return <UserIcon className="h-3 w-3" />;
            case "company": return <Building2 className="h-3 w-3" />;
            default: return <UserIcon className="h-3 w-3" />;
        }
    }

    return (
        <div className="space-y-5">
            {/* ── Top bar ── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold">People</h1>
                    <p className="text-sm text-neutral-500 mt-1">Ten:One™ 에코시스템 구성원 관리</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-1.5 border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-colors">
                        <Send className="h-3.5 w-3.5" /> 초대장 발송
                    </button>
                    <a href="/intra/erp/hr/staff/register"
                        className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors">
                        <Plus className="h-3.5 w-3.5" /> 직원 등록
                    </a>
                </div>
            </div>

            {/* ── Stats row ── */}
            <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span>전체 <strong className="text-neutral-900">{totalCount}</strong>명</span>
                <span className="text-neutral-300">|</span>
                <span>내부 <strong className="text-neutral-900">{internalCount}</strong>명</span>
                <span className="text-neutral-300">|</span>
                <span>Crew <strong className="text-neutral-900">{crewCount}</strong>명</span>
                <span className="text-neutral-300">|</span>
                <span>일반 <strong className="text-neutral-900">{generalCount}</strong>명</span>
            </div>

            {/* ── Body: sidebar + table ── */}
            <div className="flex gap-4">
                {/* ── Left filter panel ── */}
                <div className="w-[200px] shrink-0 space-y-4">
                    {/* Category */}
                    <div className="border border-neutral-200 bg-white p-3 space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">카테고리</p>
                        {(["all", "internal", "crew", "general"] as const).map(cat => {
                            const label = cat === "all" ? "전체" : categoryLabels[cat];
                            const count = cat === "all" ? totalCount : people.filter(p => p.category === cat).length;
                            const active = categoryFilter === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => { setCategoryFilter(cat); setSubFilter("all"); }}
                                    className={`w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors ${active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"}`}
                                >
                                    <span>{label}</span>
                                    <span className={`text-xs ${active ? "text-neutral-300" : "text-neutral-400"}`}>{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Sub-filter (when category selected) */}
                    {categoryFilter !== "all" && subFilterOptions[categoryFilter] && (
                        <div className="border border-neutral-200 bg-white p-3 space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">유형</p>
                            {subFilterOptions[categoryFilter].map(opt => {
                                const active = subFilter === opt.value;
                                const cnt = subCount(categoryFilter as PeopleCategory, opt.value);
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSubFilter(opt.value)}
                                        className={`w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors ${active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"}`}
                                    >
                                        <span>{opt.label}</span>
                                        <span className={`text-xs ${active ? "text-neutral-300" : "text-neutral-400"}`}>{cnt}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Status */}
                    <div className="border border-neutral-200 bg-white p-3 space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">상태</p>
                        {(["all", "active", "pending", "leave-requested", "inactive"] as const).map(st => {
                            const label = st === "all" ? "전체" : statusLabels[st];
                            const cnt = statusCount(st);
                            const active = statusFilter === st;
                            return (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    className={`w-full flex items-center justify-between px-2 py-1.5 text-xs transition-colors ${active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"}`}
                                >
                                    <span>{label}</span>
                                    <span className={`text-xs ${active ? "text-neutral-300" : "text-neutral-400"}`}>{cnt}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search */}
                    <div className="border border-neutral-200 bg-white p-3">
                        <div className="flex items-center gap-1.5 border border-neutral-200 px-2 py-1.5">
                            <Search className="h-3 w-3 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="이름, 이메일 검색"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="flex-1 text-xs outline-none placeholder:text-neutral-300 bg-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Main table ── */}
                <div className="flex-1 min-w-0">
                    <div className="border border-neutral-200 bg-white overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200 text-xs text-neutral-400 uppercase tracking-wider">
                                    <th className="px-4 py-2.5 text-left">이름</th>
                                    <th className="px-3 py-2.5 text-left">유형</th>
                                    <th className="px-3 py-2.5 text-left">소속 / 역할</th>
                                    <th className="px-3 py-2.5 text-left">상태</th>
                                    <th className="px-3 py-2.5 text-left">가입일</th>
                                    <th className="px-3 py-2.5 text-left">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-xs text-neutral-400">
                                            검색 결과가 없습니다.
                                        </td>
                                    </tr>
                                )}
                                {filtered.map(p => (
                                    <PersonRow
                                        key={p.id}
                                        person={p}
                                        expanded={expandedId === p.id}
                                        onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
                                        affiliationCell={affiliationCell}
                                        typeIcon={typeIcon}
                                        clubName={clubName}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                        onLeaveApprove={handleLeaveApprove}
                                        onLeaveReject={handleLeaveReject}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-xs text-neutral-400 text-right">
                        {filtered.length}건 표시 / 전체 {totalCount}건
                    </p>
                </div>
            </div>

            {/* ── 초대장 발송 모달 ── */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
                    <div className="bg-white rounded-lg w-[440px] shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-3 border-b border-neutral-100">
                            <h3 className="text-sm font-bold">초대장 발송</h3>
                            <p className="text-xs text-neutral-400">Crew / Partner 초대 링크를 생성합니다</p>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            {/* 초대 유형 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1.5">초대 유형</label>
                                <select value={inviteType} onChange={e => setInviteType(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400">
                                    <option value="madleague-member">MADLeague 멤버</option>
                                    <option value="madleague-leader">MADLeague 회장단</option>
                                    <option value="youinone">YouInOne 멤버</option>
                                    <option value="youinone-alliance">YouInOne Alliance</option>
                                    <option value="partner">Partner</option>
                                </select>
                            </div>

                            {/* MADLeague 멤버일 때: 동아리 + 기수 */}
                            {inviteType === 'madleague-member' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">동아리</label>
                                        <select value={inviteClub} onChange={e => setInviteClub(e.target.value)}
                                            className="w-full px-3 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400">
                                            {madleagueClubs.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.region})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">기수</label>
                                        <input type="number" value={inviteGeneration} onChange={e => setInviteGeneration(e.target.value)}
                                            min={1} className="w-full px-3 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                                    </div>
                                </div>
                            )}

                            {/* 초대 링크 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1.5">초대 링크</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs font-mono text-neutral-600 truncate">
                                        {getInviteUrl()}
                                    </div>
                                    <button onClick={copyInviteUrl}
                                        className="flex items-center gap-1 px-3 py-2 text-xs border border-neutral-200 rounded hover:bg-neutral-50 transition-colors shrink-0">
                                        <Copy className="h-3 w-3" />
                                        {inviteCopied ? '복사됨!' : '복사'}
                                    </button>
                                </div>
                            </div>

                            {/* 이메일로 발송 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1.5">이메일로 발송 (선택)</label>
                                <div className="flex items-center gap-2">
                                    <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                        placeholder="email@example.com (쉼표로 여러 명)"
                                        className="flex-1 px-3 py-2 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                                    <button onClick={() => { if (inviteEmail.trim()) { setInviteEmail(''); alert('초대 이메일이 발송되었습니다. (Mock)'); } }}
                                        disabled={!inviteEmail.trim()}
                                        className="flex items-center gap-1 px-3 py-2 text-xs bg-neutral-900 text-white rounded disabled:opacity-30 shrink-0">
                                        <Mail className="h-3 w-3" /> 발송
                                    </button>
                                </div>
                            </div>

                            <div className="bg-neutral-50 border border-neutral-100 rounded p-3 text-[11px] text-neutral-400 space-y-1">
                                <p>• 초대 링크를 받은 사람만 Crew/Partner로 가입할 수 있습니다</p>
                                <p>• 가입 신청 후 관리자 승인이 필요합니다</p>
                                <p>• 링크는 해당 유형/동아리/기수에 자동 매핑됩니다</p>
                            </div>
                        </div>
                        <div className="px-5 py-3 border-t border-neutral-100 flex justify-end">
                            <button onClick={() => setShowInviteModal(false)} className="px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 rounded">닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── PersonRow component ──
function PersonRow({
    person: p,
    expanded,
    onToggle,
    affiliationCell,
    typeIcon,
    clubName,
    onApprove,
    onReject,
    onLeaveApprove,
    onLeaveReject,
}: {
    person: Person;
    expanded: boolean;
    onToggle: () => void;
    affiliationCell: (p: Person) => React.ReactNode;
    typeIcon: (type: string) => React.ReactNode;
    clubName: (id?: string) => string;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onLeaveApprove: (id: string) => void;
    onLeaveReject: (id: string) => void;
}) {
    return (
        <>
            <tr
                className="hover:bg-neutral-50 transition-colors cursor-pointer"
                onClick={onToggle}
            >
                {/* 이름 */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center">
                            {expanded ? <ChevronDown className="h-3 w-3 text-neutral-400" /> : <ChevronRight className="h-3 w-3 text-neutral-300" />}
                        </span>
                        <div className="h-7 w-7 rounded-full bg-neutral-900 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {p.avatarInitials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{p.name}</p>
                            <p className="text-xs text-neutral-400 truncate">{p.email}</p>
                        </div>
                    </div>
                </td>

                {/* 유형 */}
                <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 text-neutral-600 text-xs font-medium">
                        {typeIcon(p.type)}
                        {typeLabels[p.type] ?? p.type}
                    </span>
                </td>

                {/* 소속/역할 */}
                <td className="px-3 py-3">{affiliationCell(p)}</td>

                {/* 상태 */}
                <td className="px-3 py-3">
                    <span className={`inline-block px-1.5 py-0.5 text-xs font-medium ${statusStyles[p.membershipStatus] ?? "bg-neutral-100 text-neutral-500"}`}>
                        {statusLabels[p.membershipStatus] ?? p.membershipStatus}
                    </span>
                </td>

                {/* 가입일 */}
                <td className="px-3 py-3 text-xs text-neutral-400">{p.joinDate}</td>

                {/* 관리 */}
                <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    {p.membershipStatus === "pending" && (
                        <div className="flex items-center gap-1">
                            <button onClick={() => onApprove(p.id)} className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                <Check className="h-3 w-3" /> 승인
                            </button>
                            <button onClick={() => onReject(p.id)} className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                <X className="h-3 w-3" /> 거절
                            </button>
                        </div>
                    )}
                    {p.membershipStatus === "leave-requested" && (
                        <div className="flex items-center gap-1">
                            <button onClick={() => onLeaveApprove(p.id)} className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                <Check className="h-3 w-3" /> 승인
                            </button>
                            <button onClick={() => onLeaveReject(p.id)} className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors">
                                <X className="h-3 w-3" /> 반려
                            </button>
                        </div>
                    )}
                    {p.membershipStatus === "active" && (
                        <span className="text-xs text-neutral-300">-</span>
                    )}
                    {p.membershipStatus === "inactive" && (
                        <span className="text-xs text-neutral-300">비활성</span>
                    )}
                    {p.membershipStatus === "rejected" && (
                        <span className="text-xs text-neutral-300">거절됨</span>
                    )}
                </td>
            </tr>

            {/* ── Detail panel ── */}
            {expanded && (
                <tr>
                    <td colSpan={6} className="bg-neutral-50 px-4 py-4 border-b border-neutral-200">
                        <DetailPanel person={p} clubName={clubName} />
                    </td>
                </tr>
            )}
        </>
    );
}

// ── Detail Panel ──
function DetailPanel({ person: p, clubName }: { person: Person; clubName: (id?: string) => string }) {
    return (
        <div className="grid grid-cols-3 gap-4 text-xs">
            {/* Col 1: 기본 정보 */}
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">기본 정보</p>
                <Field label="이름" value={p.name} />
                <Field label="이메일" value={p.email} />
                {p.phone && <Field label="전화" value={p.phone} />}
                <Field label="가입일" value={p.joinDate} />
                {p.approvedBy && <Field label="승인자" value={p.approvedBy} />}
                {p.approvedAt && <Field label="승인일" value={p.approvedAt} />}
                {p.tags && p.tags.length > 0 && (
                    <div>
                        <span className="text-neutral-400">태그</span>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                            {p.tags.map(t => (
                                <span key={t} className="px-1 py-0.5 bg-neutral-200 text-neutral-600 text-xs">{t}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Col 2: 유형별 정보 */}
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">상세 정보</p>
                {(p.type === "staff" || p.type === "partner" || p.type === "junior-partner") && (
                    <>
                        {p.department && <Field label="부서" value={p.department} />}
                        {p.position && <Field label="직위" value={p.position} />}
                        {p.employeeId && <Field label="사번" value={p.employeeId} />}
                    </>
                )}
                {(p.type === "youinone" || p.type === "youinone-alliance") && (
                    <>
                        {p.crewRole && <Field label="역할" value={p.crewRole} />}
                        {p.companyName && <Field label="소속" value={p.companyName} />}
                    </>
                )}
                {(p.type === "madleague-leader" || p.type === "madleague-member") && (
                    <>
                        <Field label="동아리" value={clubName(p.clubId)} />
                        {p.clubGeneration && <Field label="기수" value={`${p.clubGeneration}기`} />}
                        {p.madleagueStatus && <Field label="구분" value={p.madleagueStatus === "active" ? "현멤버" : "OB"} />}
                        {p.crewRole && <Field label="직책" value={p.crewRole} />}
                    </>
                )}
                {p.type === "individual" && (
                    <p className="text-neutral-400 italic text-xs">추가 상세 정보 없음</p>
                )}
                {p.type === "company" && (
                    <>
                        {p.companyName && <Field label="회사명" value={p.companyName} />}
                        {p.industry && <Field label="업종" value={p.industry} />}
                        {p.companySize && <Field label="규모" value={p.companySize} />}
                    </>
                )}
            </div>

            {/* Col 3: 메모 / 이력 */}
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">메모 &amp; 이력</p>
                {p.bio ? (
                    <div>
                        <span className="text-neutral-400">소개</span>
                        <p className="text-neutral-700 mt-0.5">{p.bio}</p>
                    </div>
                ) : (
                    <p className="text-neutral-300 italic text-xs">소개 없음</p>
                )}
                {p.notes && (
                    <div>
                        <span className="text-neutral-400">비고</span>
                        <p className="text-neutral-700 mt-0.5">{p.notes}</p>
                    </div>
                )}
                {p.leaveRequestedAt && <Field label="탈퇴요청일" value={p.leaveRequestedAt} />}
                {p.leaveApprovedBy && <Field label="탈퇴승인자" value={p.leaveApprovedBy} />}
            </div>
        </div>
    );
}

// ── Tiny field component ──
function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="text-neutral-400 shrink-0">{label}</span>
            <span className="text-neutral-700">{value}</span>
        </div>
    );
}
