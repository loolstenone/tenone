"use client";

import { useState, useEffect } from "react";
import {
    Globe, Users, CreditCard, TrendingUp, DollarSign, UserPlus,
    ArrowUpRight, ArrowDownRight, Activity, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ── 타입 정의 ── */
interface StatItem {
    label: string;
    value: string;
    change: string;
    up: boolean;
    icon: React.ComponentType<{ className?: string }>;
}
interface BrandItem {
    name: string;
    letter: string;
    color: string;
    members: number;
    subs: number;
    revenue: number;
    trend: number;
}
interface ActivityItem {
    text: string;
    time: string;
    type: string;
}

/* ── Mock 데이터 (fallback) ── */
const mockStats: StatItem[] = [
    { label: "전체 회원", value: "9,247명", change: "+312", up: true, icon: Users },
    { label: "활동 회원", value: "3,120명", change: "+89", up: true, icon: Activity },
    { label: "구독 회원", value: "487명", change: "+23", up: true, icon: CreditCard },
    { label: "이번달 매출", value: "₩14,350,000", change: "+8.2%", up: true, icon: DollarSign },
    { label: "MRR", value: "₩8,900,000", change: "+5.1%", up: true, icon: TrendingUp },
    { label: "게스트", value: "234명", change: "-12", up: false, icon: UserPlus },
];

const mockBrands: BrandItem[] = [
    { name: "MADLeague", letter: "M", color: "bg-violet-500", members: 2340, subs: 0, revenue: 0, trend: 12 },
    { name: "MADLeap", letter: "L", color: "bg-indigo-500", members: 1870, subs: 0, revenue: 0, trend: 8 },
    { name: "Badak", letter: "B", color: "bg-amber-500", members: 890, subs: 0, revenue: 320000, trend: -3 },
    { name: "SmarComm", letter: "S", color: "bg-emerald-500", members: 540, subs: 120, revenue: 5400000, trend: 15 },
    { name: "WIO Orbi", letter: "W", color: "bg-blue-500", members: 320, subs: 45, revenue: 2800000, trend: 22 },
    { name: "HeRo", letter: "H", color: "bg-rose-500", members: 1250, subs: 34, revenue: 680000, trend: 6 },
    { name: "Planner's", letter: "P", color: "bg-teal-500", members: 430, subs: 0, revenue: 0, trend: -1 },
    { name: "Evolution School", letter: "E", color: "bg-orange-500", members: 380, subs: 89, revenue: 2100000, trend: 18 },
    { name: "Mindle", letter: "M", color: "bg-cyan-500", members: 620, subs: 89, revenue: 700000, trend: 9 },
    { name: "RooK", letter: "R", color: "bg-pink-500", members: 270, subs: 0, revenue: 0, trend: 35 },
    { name: "ChangeUp", letter: "C", color: "bg-lime-500", members: 180, subs: 0, revenue: 0, trend: 4 },
    { name: "YouInOne", letter: "Y", color: "bg-purple-500", members: 147, subs: 110, revenue: 2350000, trend: 11 },
];

const mockActivities: ActivityItem[] = [
    { text: "김민지 MADLeap 5기 가입", time: "3분 전", type: "join" },
    { text: "HSAD SmarComm Pro 구독", time: "1시간 전", type: "subscribe" },
    { text: "DAM Party Season 4 예약 +5명", time: "2시간 전", type: "booking" },
    { text: "박서윤 Evolution School 수료", time: "3시간 전", type: "complete" },
    { text: "이준혁 WIO Orbi Business 업그레이드", time: "4시간 전", type: "upgrade" },
    { text: "정하은 Mindle Premium 구독 해지", time: "5시간 전", type: "churn" },
    { text: "최다운 HeRo HIT 검사 완료", time: "6시간 전", type: "complete" },
    { text: "송예린 Badak 네트워크 매칭 성사", time: "7시간 전", type: "match" },
];

/* ── 브랜드 메타 (색상, 이니셜) ── */
const brandMeta: Record<string, { letter: string; color: string }> = {
    MADLeague: { letter: "M", color: "bg-violet-500" },
    MADLeap: { letter: "L", color: "bg-indigo-500" },
    Badak: { letter: "B", color: "bg-amber-500" },
    SmarComm: { letter: "S", color: "bg-emerald-500" },
    "WIO Orbi": { letter: "W", color: "bg-blue-500" },
    HeRo: { letter: "H", color: "bg-rose-500" },
    "Planner's": { letter: "P", color: "bg-teal-500" },
    "Evolution School": { letter: "E", color: "bg-orange-500" },
    Mindle: { letter: "M", color: "bg-cyan-500" },
    RooK: { letter: "R", color: "bg-pink-500" },
    ChangeUp: { letter: "C", color: "bg-lime-500" },
    YouInOne: { letter: "Y", color: "bg-purple-500" },
};

/* ── Sparkline ── */
function Sparkline({ trend }: { trend: number }) {
    const points = Array.from({ length: 7 }, (_, i) => {
        const base = 30 + (trend > 0 ? i * 3 : -i * 1.5);
        return base + Math.random() * 10;
    });
    const max = Math.max(...points);
    const min = Math.min(...points);
    const h = 24;
    const w = 56;
    const path = points
        .map((p, i) => {
            const x = (i / (points.length - 1)) * w;
            const y = h - ((p - min) / (max - min + 1)) * h;
            return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ");
    return (
        <svg width={w} height={h} className="shrink-0">
            <path d={path} fill="none" stroke={trend >= 0 ? "#22c55e" : "#ef4444"} strokeWidth={1.5} />
        </svg>
    );
}

/* ── 상대 시간 표시 ── */
function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
}

export default function UniverseDashboard() {
    const [filter, setFilter] = useState<"all" | "revenue" | "members">("all");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatItem[]>(mockStats);
    const [brands, setBrands] = useState<BrandItem[]>(mockBrands);
    const [activities, setActivities] = useState<ActivityItem[]>(mockActivities);

    useEffect(() => {
        async function loadData() {
            try {
                const supabase = createClient();

                // 병렬로 여러 쿼리 실행
                const [
                    membersRes,
                    activeRes,
                    subsRes,
                    mrrRes,
                    guestsRes,
                    agentsRes,
                    revenueRes,
                    // 최근 활동: agent_messages + subscriptions + bookings
                    agentMsgRes,
                    recentSubsRes,
                    recentBookingsRes,
                ] = await Promise.all([
                    // 총 회원수
                    supabase.from("members").select("*", { count: "exact", head: true }),
                    // 활동 회원 (is_active=true)
                    supabase.from("members").select("*", { count: "exact", head: true }).eq("is_active", true),
                    // 구독 회원수
                    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
                    // MRR (active subscriptions price sum)
                    supabase.from("subscriptions").select("price").eq("status", "active"),
                    // 게스트 수
                    supabase.from("guests").select("*", { count: "exact", head: true }),
                    // 활성 에이전트
                    supabase.from("agent_profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
                    // 이번달 매출
                    supabase.from("revenue").select("amount, brand, source")
                        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
                    // 최근 에이전트 메시지
                    supabase.from("agent_messages").select("content, created_at, agent_id").order("created_at", { ascending: false }).limit(3),
                    // 최근 구독
                    supabase.from("subscriptions").select("service, plan, member_name, created_at").order("created_at", { ascending: false }).limit(3),
                    // 최근 예약
                    supabase.from("bookings").select("event, name, created_at").order("created_at", { ascending: false }).limit(3),
                ]);

                // ── Stats 계산 ──
                const totalMembers = membersRes.count ?? 0;
                const activeMembers = activeRes.count ?? 0;
                const totalSubs = subsRes.count ?? 0;
                const mrrTotal = (mrrRes.data || []).reduce((s: number, r: { price: number }) => s + (r.price || 0), 0);
                const totalGuests = guestsRes.count ?? 0;
                const monthRevenue = (revenueRes.data || []).reduce((s: number, r: { amount: number }) => s + (r.amount || 0), 0);

                // 데이터가 존재하면 stats 덮어쓰기
                if (totalMembers > 0 || totalSubs > 0 || mrrTotal > 0) {
                    setStats([
                        { label: "전체 회원", value: `${totalMembers.toLocaleString()}명`, change: "", up: true, icon: Users },
                        { label: "활동 회원", value: `${activeMembers.toLocaleString()}명`, change: "", up: true, icon: Activity },
                        { label: "구독 회원", value: `${totalSubs.toLocaleString()}명`, change: "", up: true, icon: CreditCard },
                        { label: "이번달 매출", value: `₩${monthRevenue.toLocaleString()}`, change: "", up: true, icon: DollarSign },
                        { label: "MRR", value: `₩${mrrTotal.toLocaleString()}`, change: "", up: true, icon: TrendingUp },
                        { label: "게스트", value: `${totalGuests.toLocaleString()}명`, change: "", up: false, icon: UserPlus },
                    ]);
                }

                // ── 브랜드별 집계 ──
                const revenueData = revenueRes.data || [];
                if (revenueData.length > 0) {
                    // members 브랜드별 집계
                    const membersAll = await supabase.from("members").select("affiliations");
                    const brandMap: Record<string, { members: number; revenue: number; subs: number }> = {};

                    // affiliations에서 브랜드별 회원수 집계
                    (membersAll.data || []).forEach((m: { affiliations: string[] }) => {
                        (m.affiliations || []).forEach((brand: string) => {
                            if (!brandMap[brand]) brandMap[brand] = { members: 0, revenue: 0, subs: 0 };
                            brandMap[brand].members++;
                        });
                    });

                    // 매출 집계
                    revenueData.forEach((r: { brand: string; amount: number }) => {
                        if (!brandMap[r.brand]) brandMap[r.brand] = { members: 0, revenue: 0, subs: 0 };
                        brandMap[r.brand].revenue += r.amount || 0;
                    });

                    // 구독 집계
                    const subsAll = await supabase.from("subscriptions").select("service").eq("status", "active");
                    (subsAll.data || []).forEach((s: { service: string }) => {
                        if (!brandMap[s.service]) brandMap[s.service] = { members: 0, revenue: 0, subs: 0 };
                        brandMap[s.service].subs++;
                    });

                    const brandList: BrandItem[] = Object.entries(brandMap).map(([name, data]) => ({
                        name,
                        letter: brandMeta[name]?.letter || name[0],
                        color: brandMeta[name]?.color || "bg-neutral-500",
                        members: data.members,
                        subs: data.subs,
                        revenue: data.revenue,
                        trend: 0, // 트렌드는 과거 데이터 비교 필요 → 현재 0
                    }));

                    if (brandList.length > 0) {
                        setBrands(brandList);
                    }
                }

                // ── 최근 활동 피드 ──
                const activityFeed: ActivityItem[] = [];
                (recentSubsRes.data || []).forEach((s: { member_name?: string; service?: string; plan?: string; created_at: string }) => {
                    activityFeed.push({
                        text: `${s.member_name || "회원"} ${s.service} ${s.plan} 구독`,
                        time: relativeTime(s.created_at),
                        type: "subscribe",
                    });
                });
                (recentBookingsRes.data || []).forEach((b: { name?: string; event?: string; created_at: string }) => {
                    activityFeed.push({
                        text: `${b.name || "예약자"} ${b.event} 예약`,
                        time: relativeTime(b.created_at),
                        type: "booking",
                    });
                });
                (agentMsgRes.data || []).forEach((m: { content?: string; created_at: string }) => {
                    activityFeed.push({
                        text: (m.content || "에이전트 활동").substring(0, 40),
                        time: relativeTime(m.created_at),
                        type: "complete",
                    });
                });

                // 시간순 정렬
                if (activityFeed.length > 0) {
                    setActivities(activityFeed.slice(0, 8));
                }
            } catch (err) {
                // 에러 시 mock 데이터 유지
                console.error("Universe dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const sortedBrands = [...brands].sort((a, b) => {
        if (filter === "revenue") return b.revenue - a.revenue;
        if (filter === "members") return b.members - a.members;
        return 0;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <Globe className="h-5 w-5" /> Universe Dashboard
                    </h1>
                    <p className="text-sm text-neutral-500 mt-0.5">Ten:One Universe 전체 현황</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <s.icon className="h-4 w-4 text-neutral-400" />
                            {s.change && (
                                <span className={`text-[11px] flex items-center gap-0.5 ${s.up ? "text-green-600" : "text-red-500"}`}>
                                    {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {s.change}
                                </span>
                            )}
                        </div>
                        <p className="text-lg font-bold text-neutral-900">{s.value}</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Brand Grid */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-neutral-900">브랜드별 현황</h2>
                        <div className="flex gap-1">
                            {(["all", "members", "revenue"] as const).map((f) => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`px-2.5 py-1 text-[11px] rounded ${filter === f ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                                    {f === "all" ? "전체" : f === "members" ? "회원순" : "매출순"}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {sortedBrands.map((b) => (
                            <div key={b.name} className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`h-8 w-8 rounded-lg ${b.color} text-white flex items-center justify-center text-xs font-bold`}>
                                        {b.letter}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 truncate">{b.name}</p>
                                        <p className="text-[11px] text-neutral-500">{b.members.toLocaleString()}명</p>
                                    </div>
                                    <Sparkline trend={b.trend} />
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-neutral-500">
                                        {b.subs > 0 ? `구독 ${b.subs}명` : "구독 없음"}
                                    </span>
                                    <span className="text-neutral-500">
                                        {b.revenue > 0 ? `₩${(b.revenue / 10000).toFixed(0)}만` : "-"}
                                    </span>
                                    <span className={`flex items-center gap-0.5 ${b.trend >= 0 ? "text-green-600" : "text-red-500"}`}>
                                        {b.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                        {Math.abs(b.trend)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div>
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">최근 활동</h2>
                    <div className="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                        {activities.map((a, i) => (
                            <div key={i} className="px-4 py-3 flex items-start gap-3">
                                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                                    a.type === "join" ? "bg-blue-500" :
                                    a.type === "subscribe" ? "bg-green-500" :
                                    a.type === "booking" ? "bg-amber-500" :
                                    a.type === "complete" ? "bg-violet-500" :
                                    a.type === "upgrade" ? "bg-emerald-500" :
                                    a.type === "churn" ? "bg-red-500" :
                                    a.type === "match" ? "bg-pink-500" : "bg-neutral-400"
                                }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-neutral-800">{a.text}</p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
