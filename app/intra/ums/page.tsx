"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users, CreditCard, TrendingUp, DollarSign,
    ArrowUpRight, ArrowDownRight, Activity, Loader2,
    Globe, ShoppingCart, FileText, LayoutList, Bell, CheckCircle2,
    Bot, Layers, Inbox, Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";
import { ACTION_HUB_REGISTRY, CATEGORY_LABEL, PRIORITY_COLOR, type ActionCategory } from "@/lib/action-hub-registry";

/* ═══════════════════════════════════════════════════════════════
   타입
═══════════════════════════════════════════════════════════════ */
interface UniverseHealth {
    openSites: number;
    totalSites: number;
    activeRoles: number;
    totalCapabilitySlots: number;
    activeAgents: number;
    totalAgents: number;
    members: number;
    monthRevenue: number;
    mrr: number;
}

interface MatrixCell {
    brand_id: string;
    capability_key: string;
    active_count: number;
}

interface PendingAction {
    label: string;
    count: number;
    href: string;
    category: ActionCategory;
    priority: "critical" | "high" | "normal";
}

interface BrandItem { name: string; letter: string; color: string; members: number; subs: number; revenue: number; trend: number; }
interface ActivityItem { text: string; time: string; type: string; }
interface UmsHubStat { hub: string; icon: React.ComponentType<{ className?: string }>; color: string; stats: { label: string; value: number }[]; }

/* ═══════════════════════════════════════════════════════════════
   상수
═══════════════════════════════════════════════════════════════ */
const CAPABILITY_ORDER = ["community", "club", "meetup", "course", "membership", "portfolio", "showcase", "subscription", "purchase"];
const CAPABILITY_LABEL: Record<string, string> = {
    community: "커뮤니티", club: "동아리", meetup: "모임", course: "강의",
    membership: "멤버십", portfolio: "포트폴리오", showcase: "이벤트",
    subscription: "구독", purchase: "구매",
};
const CAPABILITY_COLOR: Record<string, string> = {
    community: "bg-neutral-500", club: "bg-violet-500", meetup: "bg-amber-500",
    course: "bg-orange-500", membership: "bg-purple-500", portfolio: "bg-pink-500",
    showcase: "bg-rose-500", subscription: "bg-emerald-500", purchase: "bg-teal-500",
};

// Phase 1 도달 목표 (매출 ₩1M/월)
const PHASE1_TARGET = 1_000_000;

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

/* ═══════════════════════════════════════════════════════════════
   유틸
═══════════════════════════════════════════════════════════════ */
function relativeTime(dateStr: string | null | undefined): string {
    if (!dateStr) return "-";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
}

function pct(num: number, den: number): number {
    if (den === 0) return 0;
    return Math.round((num / den) * 100);
}

/* ═══════════════════════════════════════════════════════════════
   컴포넌트 — Phase Ribbon
═══════════════════════════════════════════════════════════════ */
function PhaseRibbon({ monthRevenue }: { monthRevenue: number }) {
    const progress = Math.min(pct(monthRevenue, PHASE1_TARGET), 100);
    const remaining = Math.max(PHASE1_TARGET - monthRevenue, 0);
    return (
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">Phase 0.5 · Bootstrap</span>
                    <span className="text-[11px] text-neutral-400">인프라 구축 · 최초 이용자 수집</span>
                </div>
                <div className="text-[11px] text-neutral-300">
                    Phase 1 (매출 ₩1M/월)까지 <span className="text-white font-semibold">₩{remaining.toLocaleString()}</span>
                </div>
            </div>
            <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
                <span>₩0</span>
                <span>{progress}%</span>
                <span>₩1,000,000</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   컴포넌트 — L1 Hero Strip (North Star 5)
═══════════════════════════════════════════════════════════════ */
function HeroStrip({ health }: { health: UniverseHealth | null }) {
    if (!health) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-4 animate-pulse h-24" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            icon: Globe,
            label: "브랜드 오픈",
            primary: `${health.openSites} / ${health.totalSites}`,
            secondary: `${pct(health.openSites, health.totalSites)}% 활성`,
            accent: "text-blue-600",
            bar: pct(health.openSites, health.totalSites),
            barColor: "bg-blue-500",
        },
        {
            icon: Layers,
            label: "Capability 활성",
            primary: `${health.activeRoles} / ${health.totalCapabilitySlots}`,
            secondary: `역할 보유자 기준`,
            accent: "text-violet-600",
            bar: pct(health.activeRoles, health.totalCapabilitySlots),
            barColor: "bg-violet-500",
        },
        {
            icon: Bot,
            label: "에이전트 가동",
            primary: `${health.activeAgents} / ${health.totalAgents}`,
            secondary: `is_active=true`,
            accent: "text-emerald-600",
            bar: pct(health.activeAgents, health.totalAgents),
            barColor: "bg-emerald-500",
        },
        {
            icon: Users,
            label: "유니버스 회원",
            primary: `${health.members.toLocaleString()}명`,
            secondary: `Phase 1 목표 100명`,
            accent: "text-amber-600",
            bar: Math.min(pct(health.members, 100), 100),
            barColor: "bg-amber-500",
        },
        {
            icon: DollarSign,
            label: "이번달 매출",
            primary: `₩${health.monthRevenue.toLocaleString()}`,
            secondary: `MRR ₩${health.mrr.toLocaleString()}`,
            accent: "text-rose-600",
            bar: Math.min(pct(health.monthRevenue, PHASE1_TARGET), 100),
            barColor: "bg-rose-500",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {cards.map((c) => (
                <div key={c.label} className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <c.icon className={`h-4 w-4 ${c.accent}`} />
                        <span className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">{c.label}</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">{c.primary}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{c.secondary}</p>
                    <div className="mt-2 h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div className={`h-full ${c.barColor} transition-all`} style={{ width: `${c.bar}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   컴포넌트 — L2 Capability 요약 (전체 매트릭스는 Standard 관리로 이전)
═══════════════════════════════════════════════════════════════ */
function CapabilitySummary({ matrix }: { matrix: MatrixCell[] }) {
    const brandsMap = new Map<string, number>();
    const capCounts = new Map<string, number>();
    let totalActive = 0;
    matrix.forEach(m => {
        brandsMap.set(m.brand_id, (brandsMap.get(m.brand_id) ?? 0) + m.active_count);
        capCounts.set(m.capability_key, (capCounts.get(m.capability_key) ?? 0) + m.active_count);
        totalActive += m.active_count;
    });
    const brandsActive = Array.from(brandsMap.values()).filter(v => v > 0).length;
    const topCaps = Array.from(capCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-violet-500" />
                    Capability 요약
                </h2>
                <Link href="/intra/ums/standard/capabilities" className="text-[11px] text-violet-700 hover:underline flex items-center gap-1 font-semibold">
                    전체 매트릭스 보기 → Standard 관리
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                    <p className="text-[10px] text-neutral-500 uppercase">활성 브랜드</p>
                    <p className="text-lg font-bold text-neutral-900">{brandsActive} <span className="text-xs text-neutral-400 font-normal">/ {brandsMap.size}</span></p>
                </div>
                <div>
                    <p className="text-[10px] text-neutral-500 uppercase">총 활성 역할</p>
                    <p className="text-lg font-bold text-neutral-900">{totalActive.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-[10px] text-neutral-500 uppercase mb-1">Top capability</p>
                    <div className="flex flex-wrap gap-1">
                        {topCaps.map(([k, v]) => (
                            <span key={k} className="text-[10px] bg-violet-50 text-violet-800 border border-violet-200 px-1.5 py-0.5 rounded">
                                {CAPABILITY_LABEL[k] || k} <span className="text-violet-500">{v}</span>
                            </span>
                        ))}
                        {topCaps.length === 0 && <span className="text-[10px] text-neutral-400">데이터 없음</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   (제거됨) CapabilityMatrix — Standard 관리 > Capability 정의로 이전
═══════════════════════════════════════════════════════════════ */
function _UnusedCapabilityMatrix({ matrix }: { matrix: MatrixCell[] }) {
    // 브랜드별 그룹핑
    const brandsMap = new Map<string, Map<string, number>>();
    matrix.forEach((m) => {
        if (!brandsMap.has(m.brand_id)) brandsMap.set(m.brand_id, new Map());
        brandsMap.get(m.brand_id)!.set(m.capability_key, m.active_count);
    });
    const brandKeys = Array.from(brandsMap.keys()).sort();

    if (brandKeys.length === 0) {
        return (
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-violet-500" />
                    Universe Capability Matrix
                </h2>
                <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-8 text-center text-xs text-neutral-400">
                    capability 탑재 데이터가 아직 집계되지 않았습니다.
                </div>
            </div>
        );
    }

    const totalActive = matrix.reduce((s, m) => s + m.active_count, 0);
    const brandsWithAny = brandKeys.filter((b) => Array.from(brandsMap.get(b)!.values()).some((v) => v > 0)).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-violet-500" />
                    Universe Capability Matrix
                </h2>
                <div className="text-[11px] text-neutral-500">
                    <span className="font-semibold text-neutral-900">{brandsWithAny}/{brandKeys.length}</span> 브랜드 활성
                    <span className="mx-2 text-neutral-300">·</span>
                    총 <span className="font-semibold text-neutral-900">{totalActive}</span> 활성 역할
                </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
                <table className="w-full text-[11px]">
                    <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50">
                            <th className="text-left px-3 py-2 font-semibold text-neutral-600 sticky left-0 bg-neutral-50">브랜드</th>
                            {CAPABILITY_ORDER.map((cap) => (
                                <th key={cap} className="px-2 py-2 font-semibold text-neutral-600 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className={`h-1.5 w-1.5 rounded-full ${CAPABILITY_COLOR[cap]}`} />
                                        <span>{CAPABILITY_LABEL[cap]}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {brandKeys.map((brand) => {
                            const capMap = brandsMap.get(brand)!;
                            return (
                                <tr key={brand} className="border-b border-neutral-100 hover:bg-neutral-50">
                                    <td className="px-3 py-2 font-medium text-neutral-900 sticky left-0 bg-white capitalize">{brand}</td>
                                    {CAPABILITY_ORDER.map((cap) => {
                                        const has = capMap.has(cap);
                                        const count = capMap.get(cap) ?? 0;
                                        if (!has) {
                                            return (
                                                <td key={cap} className="px-2 py-2 text-center">
                                                    <span className="text-neutral-200">—</span>
                                                </td>
                                            );
                                        }
                                        const intensity = count === 0 ? "bg-neutral-100 text-neutral-400" :
                                                         count < 5 ? "bg-emerald-100 text-emerald-700" :
                                                         count < 20 ? "bg-emerald-300 text-emerald-900" :
                                                         "bg-emerald-500 text-white";
                                        return (
                                            <td key={cap} className="px-2 py-2 text-center">
                                                <span className={`inline-block min-w-[24px] px-1.5 py-0.5 rounded text-[10px] font-semibold ${intensity}`}>
                                                    {count === 0 ? "·" : count}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[10px] text-neutral-500">
                <span>범례:</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-neutral-200" />미탑재</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-neutral-100" />탑재·활동 0</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-100" />1-4</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-300" />5-19</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-500" />20+</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   컴포넌트 — L5 Action Hub (minimal)
═══════════════════════════════════════════════════════════════ */
function ActionHub({ pending }: { pending: PendingAction[] }) {
    const active = pending.filter(p => p.count > 0);
    const total = active.reduce((s, p) => s + p.count, 0);

    // category별 그룹핑
    const byCategory = new Map<ActionCategory, PendingAction[]>();
    active.forEach(p => {
        if (!byCategory.has(p.category)) byCategory.set(p.category, []);
        byCategory.get(p.category)!.push(p);
    });
    // priority 기준 정렬 (critical > high > normal)
    const prioRank = { critical: 0, high: 1, normal: 2 };
    byCategory.forEach(list => list.sort((a, b) => prioRank[a.priority] - prioRank[b.priority]));

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <Inbox className="h-4 w-4 text-rose-500" />
                    Action Hub
                    {total > 0 && (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">{total}</span>
                    )}
                </h2>
                <span className="text-[10px] text-neutral-400">
                    레지스트리 {ACTION_HUB_REGISTRY.length}건 · 활성 {active.length}
                </span>
            </div>
            {total === 0 ? (
                <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-4 text-center text-[11px] text-neutral-400">
                    처리할 승인·요청이 없습니다. <span className="text-neutral-300">({ACTION_HUB_REGISTRY.length}개 소스 모니터링 중)</span>
                </div>
            ) : (
                <div className="space-y-3">
                    {Array.from(byCategory.entries()).map(([cat, list]) => (
                        <div key={cat}>
                            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
                                {CATEGORY_LABEL[cat]} <span className="text-neutral-300">({list.length})</span>
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {list.map(p => (
                                    <Link key={p.label} href={p.href}
                                        className="bg-white border border-neutral-200 rounded-lg p-3 hover:border-rose-300 hover:bg-rose-50/30 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-[11px] text-neutral-500 truncate">{p.label}</p>
                                            {p.priority !== "normal" && (
                                                <span className={`text-[9px] px-1 rounded font-semibold ${PRIORITY_COLOR[p.priority]}`}>
                                                    {p.priority === "critical" ? "!" : "↑"}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xl font-bold text-neutral-900">{p.count}<span className="text-[11px] text-neutral-500 font-normal ml-1">건</span></p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   메인 컴포넌트
═══════════════════════════════════════════════════════════════ */
export default function UniverseDashboard() {
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "revenue" | "members">("all");

    // Part A — L1/L2/L5
    const [health, setHealth] = useState<UniverseHealth | null>(null);
    const [matrix, setMatrix] = useState<MatrixCell[]>([]);
    const [pending, setPending] = useState<PendingAction[]>([]);

    // 참고 지표
    const [brands, setBrands] = useState<BrandItem[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [umsHubs, setUmsHubs] = useState<UmsHubStat[]>([]);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            try {
                /* ── Part A: Universe Health ── */
                const [
                    openSitesRes, totalSitesRes,
                    rolesRes, slotsRes,
                    activeAgentsRes, totalAgentsRes,
                    membersRes,
                    revenueRes, mrrRes,
                ] = await Promise.all([
                    supabase.from("ums_sites").select("*", { count: "exact", head: true }).eq("is_open", true),
                    supabase.from("ums_sites").select("*", { count: "exact", head: true }),
                    supabase.from("member_capability_roles").select("*", { count: "exact", head: true }).is("valid_until", null),
                    supabase.from("brand_capabilities").select("*", { count: "exact", head: true }),
                    supabase.from("agent_profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
                    supabase.from("agent_profiles").select("*", { count: "exact", head: true }),
                    supabase.from("members").select("*", { count: "exact", head: true }),
                    supabase.from("revenue").select("amount, brand")
                        .gte("recorded_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
                    supabase.from("wio_subscriptions").select("price_paid").eq("status", "active"),
                ]);

                const monthRevenue = (revenueRes.data || []).reduce((s: number, r: { amount: number }) => s + (r.amount || 0), 0);
                const mrr = (mrrRes.data || []).reduce((s: number, r: { price_paid: number }) => s + (r.price_paid || 0), 0);

                setHealth({
                    openSites: openSitesRes.count ?? 0,
                    totalSites: totalSitesRes.count ?? 0,
                    activeRoles: rolesRes.count ?? 0,
                    totalCapabilitySlots: slotsRes.count ?? 0,
                    activeAgents: activeAgentsRes.count ?? 0,
                    totalAgents: totalAgentsRes.count ?? 0,
                    members: membersRes.count ?? 0,
                    monthRevenue,
                    mrr,
                });

                /* ── Part A: Matrix ── */
                const [bcRes, mcrRes] = await Promise.all([
                    supabase.from("brand_capabilities").select("brand_id, capability_key"),
                    supabase.from("member_capability_roles").select("brand_id, capability_key").is("valid_until", null),
                ]);
                const countMap = new Map<string, number>();
                (mcrRes.data || []).forEach((r: { brand_id: string; capability_key: string }) => {
                    const k = `${r.brand_id}|${r.capability_key}`;
                    countMap.set(k, (countMap.get(k) ?? 0) + 1);
                });
                const mx: MatrixCell[] = (bcRes.data || []).map((r: { brand_id: string; capability_key: string }) => ({
                    brand_id: r.brand_id,
                    capability_key: r.capability_key,
                    active_count: countMap.get(`${r.brand_id}|${r.capability_key}`) ?? 0,
                }));
                setMatrix(mx);

                /* ── Part A: Action Hub (Registry 기반) ──
                 * 각 브랜드의 처리 대기 액션은 lib/action-hub-registry.ts에 등록.
                 * 새 브랜드 추가 시 레지스트리 한 줄 추가로 자동 반영. CLAUDE.md §1.11 참조.
                 */
                const registryCounts = await Promise.all(
                    ACTION_HUB_REGISTRY.map(async (entry) => {
                        let query = supabase
                            .from(entry.table)
                            .select("*", { count: "exact", head: true })
                            .eq(entry.filter.column, entry.filter.value);
                        // extraFilters AND 조건 적용
                        for (const ef of entry.extraFilters ?? []) {
                            query = query.eq(ef.column, ef.value);
                        }
                        const { count, error } = await query;
                        return {
                            label: entry.label,
                            count: error ? 0 : (count ?? 0),
                            href: entry.href,
                            category: entry.category,
                            priority: entry.priority ?? "normal",
                        };
                    })
                );
                setPending(registryCounts);

                /* ── 참고 지표: 브랜드별 현황 ── */
                const brandMap: Record<string, { members: number; revenue: number; subs: number }> = {};
                const brandJoins = await supabase.from("member_brand_joins").select("brand_id");
                (brandJoins.data || []).forEach((j: { brand_id: string }) => {
                    const brand = j.brand_id;
                    if (!brandMap[brand]) brandMap[brand] = { members: 0, revenue: 0, subs: 0 };
                    brandMap[brand].members++;
                });
                (revenueRes.data || []).forEach((r: { brand: string; amount: number }) => {
                    if (!brandMap[r.brand]) brandMap[r.brand] = { members: 0, revenue: 0, subs: 0 };
                    brandMap[r.brand].revenue += r.amount || 0;
                });
                const subsAll = await supabase.from("wio_subscriptions").select("service").eq("status", "active");
                (subsAll.data || []).forEach((s: { service: string }) => {
                    if (!brandMap[s.service]) brandMap[s.service] = { members: 0, revenue: 0, subs: 0 };
                    brandMap[s.service].subs++;
                });
                setBrands(Object.entries(brandMap).map(([name, data]) => ({
                    name,
                    letter: brandMeta[name]?.letter || name[0],
                    color: brandMeta[name]?.color || "bg-neutral-500",
                    members: data.members,
                    subs: data.subs,
                    revenue: data.revenue,
                    trend: 0,
                })));

                /* ── 활동 피드 ── */
                const [agentMsgRes, recentSubsRes, recentBookingsRes] = await Promise.all([
                    supabase.from("agent_messages").select("content, created_at, agent_id").order("created_at", { ascending: false }).limit(3),
                    supabase.from("wio_subscriptions").select("service, plan_key, user_id, created_at").order("created_at", { ascending: false }).limit(3),
                    supabase.from("bookings").select("event, name, created_at").order("created_at", { ascending: false }).limit(3),
                ]);
                const feed: ActivityItem[] = [];
                (recentSubsRes.data || []).forEach((s: { service?: string; plan_key?: string; created_at: string }) => {
                    feed.push({ text: `${s.service || "서비스"} ${s.plan_key || ""} 신규 구독`, time: relativeTime(s.created_at), type: "subscribe" });
                });
                (recentBookingsRes.data || []).forEach((b: { name?: string; event?: string; created_at: string }) => {
                    feed.push({ text: `${b.name || "예약자"} ${b.event} 예약`, time: relativeTime(b.created_at), type: "booking" });
                });
                (agentMsgRes.data || []).forEach((m: { content?: string; created_at: string }) => {
                    feed.push({ text: (m.content || "에이전트 활동").substring(0, 40), time: relativeTime(m.created_at), type: "complete" });
                });
                setActivities(feed.slice(0, 8));

                /* ── UMS 허브 ── */
                const [
                    umsOrdersRes, umsProductsRes, umsSubsRes, umsPaymentsRes,
                    umsContentRes, umsBoardsRes, umsPostsRes,
                    umsNewsletterRes, umsNotifRes, umsMpointsRes,
                    umsGuestsRes,
                ] = await Promise.all([
                    supabase.from("shop_orders").select("*", { count: "exact", head: true }),
                    supabase.from("shop_products").select("*", { count: "exact", head: true }),
                    supabase.from("wio_subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
                    supabase.from("customer_payments").select("*", { count: "exact", head: true }),
                    supabase.from("content_pipeline").select("*", { count: "exact", head: true }),
                    supabase.from("ums_boards").select("*", { count: "exact", head: true }),
                    supabase.from("ums_posts").select("*", { count: "exact", head: true }),
                    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true),
                    supabase.from("notifications").select("*", { count: "exact", head: true }).eq("is_read", false),
                    supabase.from("member_points").select("*", { count: "exact", head: true }),
                    supabase.from("guests").select("*", { count: "exact", head: true }),
                ]);
                setUmsHubs([
                    // SITE/MEMBER 허브 제거 — Hero Strip과 중복. 나머지는 Hero에 없는 원시 카운트만 유지.
                    { hub: "GUEST", icon: Users, color: "text-violet-600", stats: [{ label: "게스트", value: umsGuestsRes.count ?? 0 }] },
                    { hub: "COMMERCE", icon: ShoppingCart, color: "text-emerald-600", stats: [{ label: "주문", value: umsOrdersRes.count ?? 0 }, { label: "상품", value: umsProductsRes.count ?? 0 }, { label: "결제", value: umsPaymentsRes.count ?? 0 }] },
                    { hub: "CONTENT", icon: FileText, color: "text-amber-600", stats: [{ label: "파이프라인", value: umsContentRes.count ?? 0 }] },
                    { hub: "BOARD", icon: LayoutList, color: "text-rose-600", stats: [{ label: "보드", value: umsBoardsRes.count ?? 0 }, { label: "포스트", value: umsPostsRes.count ?? 0 }] },
                    { hub: "ENGAGE", icon: Bell, color: "text-cyan-600", stats: [{ label: "구독자", value: umsNewsletterRes.count ?? 0 }, { label: "미읽알림", value: umsNotifRes.count ?? 0 }, { label: "포인트내역", value: umsMpointsRes.count ?? 0 }] },
                ]);
            } catch (err) {
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
            <PageHeader title="Universe Dashboard" description="Ten:One Universe 전체 현황 · 인프라 진척 · 오늘 할 일" />

            {/* Phase Ribbon */}
            <PhaseRibbon monthRevenue={health?.monthRevenue ?? 0} />

            {/* L1 Hero Strip */}
            <HeroStrip health={health} />

            {/* L5 Action Hub */}
            <ActionHub pending={pending} />

            {/* ── 참고 지표 구분선 ── */}
            <div className="border-t border-neutral-200 pt-6">
                <h2 className="text-[11px] uppercase tracking-wider text-neutral-400 mb-3">참고 지표 · 원시 카운트</h2>

                {umsHubs.length > 0 && (
                    <div className="mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {umsHubs.map((hub) => (
                                <div key={hub.hub} className="bg-white border border-neutral-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <hub.icon className={`h-4 w-4 ${hub.color}`} />
                                        <span className="text-xs font-semibold text-neutral-700">{hub.hub}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {hub.stats.map((s) => (
                                            <div key={s.label} className="flex items-center justify-between">
                                                <span className="text-[11px] text-neutral-500">{s.label}</span>
                                                <span className="text-[11px] font-medium text-neutral-900">{s.value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {brands.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Brand Grid */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-neutral-900">브랜드별 현황</h3>
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
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-neutral-500">
                                                {b.subs > 0 ? `구독 ${b.subs}명` : "구독 없음"}
                                            </span>
                                            <span className="text-neutral-500">
                                                {b.revenue > 0 ? `₩${(b.revenue / 10000).toFixed(0)}만` : "-"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900 mb-3">최근 활동</h3>
                            {activities.length === 0 ? (
                                <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-4 text-center text-[11px] text-neutral-400">
                                    집계된 활동이 없습니다.
                                </div>
                            ) : (
                                <div className="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                                    {activities.map((a, i) => (
                                        <div key={i} className="px-4 py-3 flex items-start gap-3">
                                            <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                                                a.type === "join" ? "bg-blue-500" :
                                                a.type === "subscribe" ? "bg-green-500" :
                                                a.type === "booking" ? "bg-amber-500" :
                                                a.type === "complete" ? "bg-violet-500" :
                                                "bg-neutral-400"
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-neutral-800">{a.text}</p>
                                                <p className="text-[10px] text-neutral-400 mt-0.5">{a.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
