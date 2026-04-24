"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, UserCheck, CreditCard, Loader2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface FunnelStats {
    hitSessions: number;
    hitResultsGuest: number;
    hitResultsMember: number;
    members: number;
    paidPurchasers: number;
    companies: number;
    tihSubmissions: number;
    jdRegistrations: number;
    jhResponses: number;
    matches: number;
    matchesCurated: number;
}

interface DailyRow {
    date: string;
    sessions: number;
}

function StatBox({ label, value, sub }: { label: string; value: number; sub?: string }) {
    return (
        <div className="bg-neutral-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-neutral-400 mt-1">{label}</p>
            {sub && <p className="text-xs text-neutral-600 mt-0.5">{sub}</p>}
        </div>
    );
}

function FunnelStep({
    icon: Icon,
    label,
    value,
    rate,
    color,
    arrow,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    rate?: string;
    color: string;
    arrow?: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className={`flex flex-col items-center justify-center rounded-xl p-4 min-w-[140px] ${color}`}>
                <Icon className="h-5 w-5 mb-1" />
                <p className="text-xl font-bold">{value.toLocaleString()}</p>
                <p className="text-xs mt-0.5 opacity-80">{label}</p>
                {rate && <p className="text-xs font-semibold mt-1 opacity-90">{rate}</p>}
            </div>
            {arrow && <ArrowRight className="h-5 w-5 text-neutral-600 shrink-0" />}
        </div>
    );
}

export default function FunnelPage() {
    const [stats, setStats] = useState<FunnelStats | null>(null);
    const [daily, setDaily] = useState<DailyRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const sb = createClient();

            const [
                sessionsRes,
                hitGuestRes,
                hitMemberRes,
                membersRes,
                purchasersRes,
                companiesRes,
                tihRes,
                jdRes,
                jhRes,
                matchesRes,
                matchesCuratedRes,
                dailyRes,
            ] = await Promise.all([
                sb.from("hit_sessions").select("id", { count: "exact", head: true }),
                sb.from("hit_a_results").select("id", { count: "exact", head: true }).is("member_id", null),
                sb.from("hit_a_results").select("id", { count: "exact", head: true }).not("member_id", "is", null),
                sb.from("members").select("id", { count: "exact", head: true }),
                sb.from("member_capability_roles").select("id", { count: "exact", head: true })
                    .eq("brand_id", "hero").eq("capability_key", "purchase").is("valid_until", null),
                sb.from("hero_companies").select("id", { count: "exact", head: true }),
                sb.from("hero_tih_responses").select("id", { count: "exact", head: true }),
                sb.from("hero_jd").select("id", { count: "exact", head: true }),
                sb.from("hero_jh_responses").select("id", { count: "exact", head: true }),
                sb.from("hero_matches").select("id", { count: "exact", head: true }),
                sb.from("hero_matches").select("id", { count: "exact", head: true }).eq("match_status", "curated"),
                sb.from("hit_sessions").select("created_at").order("created_at", { ascending: false }).limit(300),
            ]);

            setStats({
                hitSessions: sessionsRes.count ?? 0,
                hitResultsGuest: hitGuestRes.count ?? 0,
                hitResultsMember: hitMemberRes.count ?? 0,
                members: membersRes.count ?? 0,
                paidPurchasers: purchasersRes.count ?? 0,
                companies: companiesRes.count ?? 0,
                tihSubmissions: tihRes.count ?? 0,
                jdRegistrations: jdRes.count ?? 0,
                jhResponses: jhRes.count ?? 0,
                matches: matchesRes.count ?? 0,
                matchesCurated: matchesCuratedRes.count ?? 0,
            });

            // 일별 세션 집계 (최근 14일)
            const rows = dailyRes.data ?? [];
            const map: Record<string, number> = {};
            for (const r of rows) {
                const d = r.created_at?.slice(0, 10);
                if (d) map[d] = (map[d] ?? 0) + 1;
            }
            const sorted = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);
            setDaily(sorted.map(([date, sessions]) => ({ date, sessions })));

            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <PageHeader title="Funnel 분석" description="비회원 → 회원 → 유료 전환율" />
                <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-500" /></div>
            </div>
        );
    }

    if (!stats) return null;

    const guestToMemberRate = stats.hitResultsGuest > 0
        ? ((stats.hitResultsMember / (stats.hitResultsGuest + stats.hitResultsMember)) * 100).toFixed(1)
        : "0.0";
    const memberToPaidRate = stats.members > 0
        ? ((stats.paidPurchasers / stats.members) * 100).toFixed(1)
        : "0.0";
    const tihToMatchRate = stats.tihSubmissions > 0
        ? ((stats.matches / stats.tihSubmissions) * 100).toFixed(1)
        : "0.0";
    const matchCuratedRate = stats.matches > 0
        ? ((stats.matchesCurated / stats.matches) * 100).toFixed(1)
        : "0.0";

    const maxSessions = Math.max(...daily.map(d => d.sessions), 1);

    return (
        <div className="p-6 space-y-8">
            <PageHeader
                title="Funnel 분석"
                description="비회원 → 회원 → 유료 전환율 · 기업 Funnel"
            />

            {/* 개인 Funnel */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-300">개인 Funnel (인재 풀)</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <FunnelStep
                        icon={Users}
                        label="검사 세션"
                        value={stats.hitSessions}
                        color="bg-neutral-700 text-neutral-200"
                        arrow
                    />
                    <FunnelStep
                        icon={Users}
                        label="비회원 결과"
                        value={stats.hitResultsGuest}
                        color="bg-neutral-700 text-neutral-200"
                        arrow
                    />
                    <FunnelStep
                        icon={UserCheck}
                        label="회원 결과"
                        value={stats.hitResultsMember}
                        rate={`전환율 ${guestToMemberRate}%`}
                        color="bg-blue-900/60 text-blue-200"
                        arrow
                    />
                    <FunnelStep
                        icon={CreditCard}
                        label="유료 구매"
                        value={stats.paidPurchasers}
                        rate={`전환율 ${memberToPaidRate}%`}
                        color="bg-[#E53935]/20 text-red-300"
                    />
                </div>
            </section>

            {/* 기업 Funnel */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-300">기업 Funnel</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <FunnelStep
                        icon={TrendingUp}
                        label="TIH 제출"
                        value={stats.tihSubmissions}
                        color="bg-neutral-700 text-neutral-200"
                        arrow
                    />
                    <FunnelStep
                        icon={Users}
                        label="기업 등록"
                        value={stats.companies}
                        color="bg-neutral-700 text-neutral-200"
                        arrow
                    />
                    <FunnelStep
                        icon={TrendingUp}
                        label="JD 등록"
                        value={stats.jdRegistrations}
                        color="bg-neutral-700 text-neutral-200"
                        arrow
                    />
                    <FunnelStep
                        icon={UserCheck}
                        label="매칭 생성"
                        value={stats.matches}
                        rate={`TIH 대비 ${tihToMatchRate}%`}
                        color="bg-blue-900/60 text-blue-200"
                        arrow
                    />
                    <FunnelStep
                        icon={CreditCard}
                        label="AI 큐레이션"
                        value={stats.matchesCurated}
                        rate={`매칭 대비 ${matchCuratedRate}%`}
                        color="bg-[#E53935]/20 text-red-300"
                    />
                </div>
            </section>

            {/* 요약 통계 */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-300">전체 현황</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatBox label="전체 회원" value={stats.members} />
                    <StatBox label="JH 응답" value={stats.jhResponses} />
                    <StatBox label="기업 등록" value={stats.companies} />
                    <StatBox label="매칭 전체" value={stats.matches} sub={`큐레이션 ${stats.matchesCurated}건`} />
                </div>
            </section>

            {/* 일별 세션 차트 */}
            {daily.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-neutral-300">일별 검사 세션 (최근 14일)</h2>
                    <div className="bg-neutral-800 rounded-xl p-5">
                        <div className="flex items-end gap-2 h-32">
                            {daily.map(d => (
                                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs text-neutral-500">{d.sessions}</span>
                                    <div
                                        className="w-full bg-[#E53935]/70 rounded-sm"
                                        style={{ height: `${(d.sessions / maxSessions) * 96}px`, minHeight: "2px" }}
                                    />
                                    <span className="text-[10px] text-neutral-600">{d.date.slice(5)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
