"use client";

/**
 * HeRo 기업 풀 관리 (Intra)
 * - hero_companies 목록 + Reputation Vector
 * - hero_company_members 담당자 연결 상태
 * - 가입 대기(pending) 승인 관리
 */

import { useEffect, useState } from "react";
import { Building2, Users, TrendingUp, ShieldCheck, Clock, CheckCircle2, XCircle, Loader2, Search } from "lucide-react";
import { PageHeader, StatCard } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Company {
    id: string;
    company_name: string;
    industry: string | null;
    size_category: string | null;
    employee_count: number | null;
    founded_year: number | null;
    match_count: number | null;
    match_success_rate: number | null;
    talent_satisfaction_avg: number | null;
    jobplanet_rating: number | null;
    blind_rating: number | null;
    internal_grade: string | null;
    last_news_at: string | null;
    created_at: string;
    member_count?: number;
    pending_count?: number;
}

interface PendingMember {
    id: string;
    member_id: string;
    company_id: string;
    position_title: string | null;
    contact_email: string | null;
    invited_at: string;
    members: { name: string | null; email: string } | null;
    hero_companies: { company_name: string } | null;
}

export default function HeroCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    async function load() {
        setLoading(true);
        const sb = createClient();

        const [companiesRes, pendingRes] = await Promise.all([
            sb.from("hero_companies")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(200),
            sb.from("hero_company_members")
                .select("id, member_id, company_id, position_title, contact_email, invited_at, members(name, email), hero_companies(company_name)")
                .eq("status", "pending")
                .order("invited_at", { ascending: false }),
        ]);

        const companiesList = (companiesRes.data ?? []) as Company[];

        // 각 기업별 member count 계산
        if (companiesList.length > 0) {
            const { data: counts } = await sb
                .from("hero_company_members")
                .select("company_id, status")
                .in("company_id", companiesList.map(c => c.id));

            const byCompany: Record<string, { total: number; pending: number }> = {};
            (counts ?? []).forEach((r: { company_id: string; status: string }) => {
                byCompany[r.company_id] ??= { total: 0, pending: 0 };
                byCompany[r.company_id].total++;
                if (r.status === "pending") byCompany[r.company_id].pending++;
            });

            companiesList.forEach(c => {
                c.member_count = byCompany[c.id]?.total ?? 0;
                c.pending_count = byCompany[c.id]?.pending ?? 0;
            });
        }

        setCompanies(companiesList);
        setPendingMembers((pendingRes.data ?? []) as unknown as PendingMember[]);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function reviewMember(id: string, action: "approve" | "reject") {
        const sb = createClient();
        if (action === "approve") {
            await sb.from("hero_company_members")
                .update({ status: "active", role: "hiring_manager", joined_at: new Date().toISOString() })
                .eq("id", id);
        } else {
            await sb.from("hero_company_members").delete().eq("id", id);
        }
        setPendingMembers(prev => prev.filter(p => p.id !== id));
        load();
    }

    const filtered = companies.filter(c =>
        !search || c.company_name?.toLowerCase().includes(search.toLowerCase()) || c.industry?.toLowerCase().includes(search.toLowerCase())
    );

    const totalCompanies = companies.length;
    const totalActiveMembers = companies.reduce((s, c) => s + ((c.member_count ?? 0) - (c.pending_count ?? 0)), 0);
    const matchedCompanies = companies.filter(c => (c.match_count ?? 0) > 0).length;

    return (
        <div>
            <PageHeader title="기업 풀 관리" description="hero_companies · Reputation Vector · 담당자 승인" />

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard label="전체 기업" value={totalCompanies + "개"} sub="풀 등록 기업" icon={<Building2 className="h-4 w-4" />} />
                        <StatCard label="활성 담당자" value={totalActiveMembers + "명"} sub="승인 완료" icon={<Users className="h-4 w-4" />} />
                        <StatCard label="매칭 경험 기업" value={matchedCompanies + "개"} sub={`${totalCompanies > 0 ? Math.round((matchedCompanies / totalCompanies) * 100) : 0}% 기업`} icon={<TrendingUp className="h-4 w-4" />} />
                        <StatCard label="승인 대기" value={pendingMembers.length + "명"} sub="담당자 가입 신청" icon={<Clock className="h-4 w-4" />} />
                    </div>

                    {/* 승인 대기 담당자 */}
                    {pendingMembers.length > 0 && (
                        <div className="mb-8 border border-amber-200 bg-amber-50/40 rounded-lg">
                            <div className="px-4 py-3 border-b border-amber-200 bg-amber-50">
                                <h2 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    담당자 가입 승인 대기 ({pendingMembers.length}명)
                                </h2>
                            </div>
                            <div className="divide-y divide-amber-100">
                                {pendingMembers.map(p => (
                                    <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-amber-50/50">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-neutral-800">
                                                {p.members?.name || "(이름 없음)"}
                                                {p.position_title && <span className="text-xs text-neutral-400 ml-2">· {p.position_title}</span>}
                                            </p>
                                            <p className="text-[11px] text-neutral-500 truncate">
                                                {p.hero_companies?.company_name} · {p.contact_email || p.members?.email}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 ml-4">
                                            <button onClick={() => reviewMember(p.id, "approve")}
                                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> 승인
                                            </button>
                                            <button onClick={() => reviewMember(p.id, "reject")}
                                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded">
                                                <XCircle className="h-3.5 w-3.5" /> 거절
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 기업 목록 */}
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold">기업 목록 ({filtered.length}개)</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="기업명·산업 검색"
                                className="pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded w-60 focus:outline-none focus:border-neutral-400" />
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="border border-dashed border-neutral-200 rounded-lg p-12 text-center">
                            <Building2 className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
                            <p className="text-sm text-neutral-400">{search ? "검색 결과 없음" : "등록된 기업이 아직 없습니다"}</p>
                        </div>
                    ) : (
                        <div className="border border-neutral-200 rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">기업</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">산업</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">규모</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">담당자</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">매칭</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">외부 평점</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">등록일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(c => (
                                        <tr key={c.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                            <td className="px-3 py-2 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    {c.internal_grade && (
                                                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded">
                                                            {c.internal_grade}
                                                        </span>
                                                    )}
                                                    {c.company_name}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-neutral-500">{c.industry || "-"}</td>
                                            <td className="px-3 py-2 text-neutral-500">
                                                {c.size_category || "-"}
                                                {c.employee_count && <span className="text-[10px] text-neutral-400 ml-1">· {c.employee_count}명</span>}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <span className="font-semibold">{(c.member_count ?? 0) - (c.pending_count ?? 0)}</span>
                                                {(c.pending_count ?? 0) > 0 && <span className="text-[10px] text-amber-600 ml-1">+{c.pending_count} 대기</span>}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {c.match_count ?? 0}건
                                                {c.match_success_rate != null && (
                                                    <span className="text-[10px] text-emerald-600 ml-1">{Math.round(c.match_success_rate * 100)}%</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-right text-neutral-500 text-[11px]">
                                                {c.jobplanet_rating && <span>JP {c.jobplanet_rating.toFixed(1)}</span>}
                                                {c.jobplanet_rating && c.blind_rating && <span className="text-neutral-300"> · </span>}
                                                {c.blind_rating && <span>BL {c.blind_rating.toFixed(1)}</span>}
                                                {!c.jobplanet_rating && !c.blind_rating && <span className="text-neutral-300">-</span>}
                                            </td>
                                            <td className="px-3 py-2 text-right text-[11px] text-neutral-400">
                                                {new Date(c.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 안내 */}
                    <div className="mt-6 p-3 border border-neutral-200 bg-neutral-50 rounded text-[11px] text-neutral-600">
                        <strong className="flex items-center gap-1.5 mb-1"><ShieldCheck className="h-3.5 w-3.5" /> Reputation Vector</strong>
                        각 기업의 JobPlanet·Blind 외부 평점·Mindle 뉴스 최종일이 매칭 시 자동 반영됩니다.
                        내부 등급(internal_grade)은 관리자가 수동 부여 · 현재 미구현 (Phase 4).
                    </div>
                </>
            )}
        </div>
    );
}
