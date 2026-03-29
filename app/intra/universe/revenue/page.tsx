"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, BarChart3, PieChart, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ── 타입 ── */
interface PLSummary { revenue: number; cost: number; profit: number; margin: number }
interface BrandRev { name: string; revenue: number; color: string }
interface SourceRev { name: string; amount: number; pct: number; color: string }
interface MonthTrend { month: string; revenue: number; cost: number }
interface DetailRow { date: string; brand: string; source: string; desc: string; amount: number }

/* ── Mock (fallback) ── */
const mockPL: PLSummary = { revenue: 14350000, cost: 8720000, profit: 5630000, margin: 39.2 };

const mockBrandRevenue: BrandRev[] = [
    { name: "SmarComm", revenue: 5400000, color: "bg-emerald-500" },
    { name: "WIO Orbi", revenue: 2800000, color: "bg-blue-500" },
    { name: "Evolution School", revenue: 2100000, color: "bg-orange-500" },
    { name: "YouInOne", revenue: 1250000, color: "bg-purple-500" },
    { name: "Mindle", revenue: 700000, color: "bg-cyan-500" },
    { name: "HeRo", revenue: 680000, color: "bg-rose-500" },
    { name: "Badak", revenue: 320000, color: "bg-amber-500" },
    { name: "기타", revenue: 1100000, color: "bg-neutral-400" },
];

const mockRevenueSources: SourceRev[] = [
    { name: "구독", amount: 8900000, pct: 62, color: "bg-blue-500" },
    { name: "교육", amount: 2100000, pct: 15, color: "bg-orange-500" },
    { name: "이벤트", amount: 1200000, pct: 8, color: "bg-violet-500" },
    { name: "매칭", amount: 1050000, pct: 7, color: "bg-rose-500" },
    { name: "콘텐츠", amount: 1100000, pct: 8, color: "bg-emerald-500" },
];

const mockMonthlyTrend: MonthTrend[] = [
    { month: "10월", revenue: 9800000, cost: 7200000 },
    { month: "11월", revenue: 10500000, cost: 7800000 },
    { month: "12월", revenue: 12100000, cost: 8100000 },
    { month: "1월", revenue: 11200000, cost: 7900000 },
    { month: "2월", revenue: 13000000, cost: 8500000 },
    { month: "3월", revenue: 14350000, cost: 8720000 },
];

const mockDetails: DetailRow[] = [
    { date: "2026-03-29", brand: "SmarComm", source: "구독", desc: "HSAD Pro 연간 구독", amount: 1788000 },
    { date: "2026-03-28", brand: "WIO Orbi", source: "구독", desc: "넥스트웨이브 Pro 월정액", amount: 149000 },
    { date: "2026-03-28", brand: "Evolution School", source: "교육", desc: "브랜드 전략 마스터 3기 수강료", amount: 890000 },
    { date: "2026-03-27", brand: "SmarComm", source: "구독", desc: "크리에이팁 Starter", amount: 49000 },
    { date: "2026-03-27", brand: "HeRo", source: "매칭", desc: "인재 매칭 수수료", amount: 150000 },
    { date: "2026-03-26", brand: "Badak", source: "이벤트", desc: "CEO 라운드테이블 참가비", amount: 100000 },
    { date: "2026-03-26", brand: "Mindle", source: "구독", desc: "Premium 구독 x3", amount: 29700 },
    { date: "2026-03-25", brand: "MADLeague", source: "이벤트", desc: "DAM Party Season 4", amount: 225000 },
    { date: "2026-03-25", brand: "YouInOne", source: "구독", desc: "Team 플랜 x2", amount: 158000 },
    { date: "2026-03-24", brand: "SmarComm", source: "콘텐츠", desc: "AI 마케팅 리포트 판매", amount: 35000 },
];

const brandColorMap: Record<string, string> = {
    SmarComm: "bg-emerald-500", "WIO Orbi": "bg-blue-500", "Evolution School": "bg-orange-500",
    YouInOne: "bg-purple-500", Mindle: "bg-cyan-500", HeRo: "bg-rose-500",
    Badak: "bg-amber-500", MADLeague: "bg-violet-500", MADLeap: "bg-indigo-500",
    ChangeUp: "bg-lime-500",
};

const sourceColorMap: Record<string, string> = {
    "구독": "bg-blue-500", "교육": "bg-orange-500", "이벤트": "bg-violet-500",
    "매칭": "bg-rose-500", "콘텐츠": "bg-emerald-500",
};

export default function UniverseRevenue() {
    const [loading, setLoading] = useState(true);
    const [plSummary, setPlSummary] = useState<PLSummary>(mockPL);
    const [brandRevenue, setBrandRevenue] = useState<BrandRev[]>(mockBrandRevenue);
    const [revenueSources, setRevenueSources] = useState<SourceRev[]>(mockRevenueSources);
    const [monthlyTrend, setMonthlyTrend] = useState<MonthTrend[]>(mockMonthlyTrend);
    const [details, setDetails] = useState<DetailRow[]>(mockDetails);

    useEffect(() => {
        async function loadData() {
            try {
                const supabase = createClient();

                const { data: rawRevenue, error } = await supabase
                    .from("revenue")
                    .select("amount, brand, source, description, cost, created_at")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                if (!rawRevenue || rawRevenue.length === 0) {
                    setLoading(false);
                    return;
                }

                // 전체 매출/비용 계산
                const totalRevenue = rawRevenue.reduce((s: number, r: { amount: number }) => s + (r.amount || 0), 0);
                const totalCost = rawRevenue.reduce((s: number, r: { cost?: number }) => s + (r.cost || 0), 0);
                const profit = totalRevenue - totalCost;
                const margin = totalRevenue > 0 ? Number(((profit / totalRevenue) * 100).toFixed(1)) : 0;

                setPlSummary({ revenue: totalRevenue, cost: totalCost, profit, margin });

                // 브랜드별 매출
                const brandMap: Record<string, number> = {};
                rawRevenue.forEach((r: { brand: string; amount: number }) => {
                    const b = r.brand || "기타";
                    brandMap[b] = (brandMap[b] || 0) + (r.amount || 0);
                });
                const brandList: BrandRev[] = Object.entries(brandMap)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, revenue]) => ({
                        name,
                        revenue,
                        color: brandColorMap[name] || "bg-neutral-400",
                    }));
                if (brandList.length > 0) setBrandRevenue(brandList);

                // 수익원별
                const sourceMap: Record<string, number> = {};
                rawRevenue.forEach((r: { source: string; amount: number }) => {
                    const src = r.source || "기타";
                    sourceMap[src] = (sourceMap[src] || 0) + (r.amount || 0);
                });
                const sourceList: SourceRev[] = Object.entries(sourceMap)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, amount]) => ({
                        name,
                        amount,
                        pct: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0,
                        color: sourceColorMap[name] || "bg-neutral-400",
                    }));
                if (sourceList.length > 0) setRevenueSources(sourceList);

                // 월별 추이
                const monthMap: Record<string, { revenue: number; cost: number }> = {};
                rawRevenue.forEach((r: { created_at: string; amount: number; cost?: number }) => {
                    const d = new Date(r.created_at);
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                    if (!monthMap[key]) monthMap[key] = { revenue: 0, cost: 0 };
                    monthMap[key].revenue += r.amount || 0;
                    monthMap[key].cost += r.cost || 0;
                });
                const monthList: MonthTrend[] = Object.entries(monthMap)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .slice(-6)
                    .map(([key, data]) => ({
                        month: `${parseInt(key.split("-")[1])}월`,
                        revenue: data.revenue,
                        cost: data.cost,
                    }));
                if (monthList.length > 0) setMonthlyTrend(monthList);

                // 상세 내역 (최근 20건)
                const detailList: DetailRow[] = rawRevenue.slice(0, 20).map((r: {
                    created_at: string; brand: string; source: string;
                    description: string; amount: number;
                }) => ({
                    date: r.created_at?.split("T")[0] || "-",
                    brand: r.brand || "-",
                    source: r.source || "-",
                    desc: r.description || "-",
                    amount: r.amount || 0,
                }));
                if (detailList.length > 0) setDetails(detailList);
            } catch (err) {
                console.error("Revenue fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const maxBrandRev = Math.max(...brandRevenue.map((b) => b.revenue), 1);
    const maxMonthly = Math.max(...monthlyTrend.map((m) => m.revenue), 1);

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
            <div>
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> 손익 관리
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">전체 유니버스 P&L 현황</p>
            </div>

            {/* P&L Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <DollarSign className="h-4 w-4 text-neutral-400 mb-2" />
                    <p className="text-lg font-bold text-neutral-900">₩{(plSummary.revenue / 10000).toFixed(0)}만</p>
                    <p className="text-[11px] text-neutral-500">매출</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <BarChart3 className="h-4 w-4 text-neutral-400 mb-2" />
                    <p className="text-lg font-bold text-neutral-900">₩{(plSummary.cost / 10000).toFixed(0)}만</p>
                    <p className="text-[11px] text-neutral-500">비용</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mb-2" />
                    <p className="text-lg font-bold text-green-600">₩{(plSummary.profit / 10000).toFixed(0)}만</p>
                    <p className="text-[11px] text-neutral-500">영업이익</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <PieChart className="h-4 w-4 text-neutral-400 mb-2" />
                    <p className="text-lg font-bold text-neutral-900">{plSummary.margin}%</p>
                    <p className="text-[11px] text-neutral-500">이익률</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Brand Revenue */}
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">브랜드별 매출</h2>
                    <div className="space-y-3">
                        {brandRevenue.map((b) => (
                            <div key={b.name} className="flex items-center gap-3">
                                <span className="text-xs text-neutral-600 w-28 shrink-0 text-right">{b.name}</span>
                                <div className="flex-1 h-5 bg-neutral-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${b.color} rounded-full`}
                                        style={{ width: `${(b.revenue / maxBrandRev) * 100}%` }} />
                                </div>
                                <span className="text-xs text-neutral-700 w-20 shrink-0">₩{(b.revenue / 10000).toFixed(0)}만</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Source */}
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">수익원별 비중</h2>
                    <div className="flex h-6 rounded-full overflow-hidden mb-4">
                        {revenueSources.map((s) => (
                            <div key={s.name} className={`${s.color} relative group`} style={{ width: `${s.pct}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {s.name}: {s.pct}%
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        {revenueSources.map((s) => (
                            <div key={s.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                                    <span className="text-xs text-neutral-700">{s.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-neutral-500">{s.pct}%</span>
                                    <span className="text-xs font-medium text-neutral-900">₩{(s.amount / 10000).toFixed(0)}만</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
                <h2 className="text-sm font-semibold text-neutral-900 mb-4">월별 추이 (최근 6개월)</h2>
                <div className="flex items-end gap-6 h-40">
                    {monthlyTrend.map((m) => (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex gap-1.5 items-end justify-center h-32">
                                <div className="w-6 bg-blue-400 rounded-t" style={{ height: `${(m.revenue / maxMonthly) * 100}%` }}
                                    title={`매출 ₩${m.revenue.toLocaleString()}`} />
                                <div className="w-6 bg-red-300 rounded-t" style={{ height: `${(m.cost / maxMonthly) * 100}%` }}
                                    title={`비용 ₩${m.cost.toLocaleString()}`} />
                            </div>
                            <span className="text-[10px] text-neutral-500">{m.month}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 mt-3 justify-center">
                    <span className="flex items-center gap-1.5 text-[11px] text-neutral-500"><span className="h-2 w-2 rounded-full bg-blue-400" />매출</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-neutral-500"><span className="h-2 w-2 rounded-full bg-red-300" />비용</span>
                </div>
            </div>

            {/* Detail Table */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">상세 내역</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">날짜</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">브랜드</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">수익원</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">내용</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500">금액</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {details.map((d, i) => (
                                    <tr key={i} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3 text-xs text-neutral-500">{d.date}</td>
                                        <td className="px-4 py-3 text-neutral-700">{d.brand}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                d.source === "구독" ? "bg-blue-100 text-blue-700" :
                                                d.source === "교육" ? "bg-orange-100 text-orange-700" :
                                                d.source === "이벤트" ? "bg-violet-100 text-violet-700" :
                                                d.source === "매칭" ? "bg-rose-100 text-rose-700" :
                                                "bg-emerald-100 text-emerald-700"
                                            }`}>{d.source}</span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-700">{d.desc}</td>
                                        <td className="px-4 py-3 text-right font-medium text-neutral-900">₩{d.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
