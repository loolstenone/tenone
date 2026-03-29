"use client";

import { TrendingUp, DollarSign, BarChart3, PieChart } from "lucide-react";

/* ── P&L Summary ── */
const plSummary = {
    revenue: 14350000,
    cost: 8720000,
    profit: 5630000,
    margin: 39.2,
};

/* ── Brand Revenue ── */
const brandRevenue = [
    { name: "SmarComm", revenue: 5400000, color: "bg-emerald-500" },
    { name: "WIO Orbi", revenue: 2800000, color: "bg-blue-500" },
    { name: "Evolution School", revenue: 2100000, color: "bg-orange-500" },
    { name: "YouInOne", revenue: 1250000, color: "bg-purple-500" },
    { name: "Mindle", revenue: 700000, color: "bg-cyan-500" },
    { name: "HeRo", revenue: 680000, color: "bg-rose-500" },
    { name: "Badak", revenue: 320000, color: "bg-amber-500" },
    { name: "기타", revenue: 1100000, color: "bg-neutral-400" },
];
const maxBrandRev = Math.max(...brandRevenue.map((b) => b.revenue));

/* ── Revenue Source ── */
const revenueSources = [
    { name: "구독", amount: 8900000, pct: 62, color: "bg-blue-500" },
    { name: "교육", amount: 2100000, pct: 15, color: "bg-orange-500" },
    { name: "이벤트", amount: 1200000, pct: 8, color: "bg-violet-500" },
    { name: "매칭", amount: 1050000, pct: 7, color: "bg-rose-500" },
    { name: "콘텐츠", amount: 1100000, pct: 8, color: "bg-emerald-500" },
];

/* ── Monthly Trend ── */
const monthlyTrend = [
    { month: "10월", revenue: 9800000, cost: 7200000 },
    { month: "11월", revenue: 10500000, cost: 7800000 },
    { month: "12월", revenue: 12100000, cost: 8100000 },
    { month: "1월", revenue: 11200000, cost: 7900000 },
    { month: "2월", revenue: 13000000, cost: 8500000 },
    { month: "3월", revenue: 14350000, cost: 8720000 },
];
const maxMonthly = Math.max(...monthlyTrend.map((m) => m.revenue));

/* ── Detail ── */
const details = [
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
    { date: "2026-03-24", brand: "Evolution School", source: "교육", desc: "데이터 분석 기초 수강료 x5", amount: 950000 },
    { date: "2026-03-23", brand: "WIO Orbi", source: "구독", desc: "Business 플랜 갱신", amount: 399000 },
    { date: "2026-03-23", brand: "HeRo", source: "구독", desc: "Pro 구독 x2", amount: 58000 },
    { date: "2026-03-22", brand: "SmarComm", source: "구독", desc: "Business 연간 구독", amount: 4788000 },
    { date: "2026-03-22", brand: "ChangeUp", source: "교육", desc: "스타트업 린 런칭 수강료 x3", amount: 1170000 },
    { date: "2026-03-21", brand: "Mindle", source: "콘텐츠", desc: "트렌드 리포트 월간 구독", amount: 9900 },
    { date: "2026-03-21", brand: "Badak", source: "매칭", desc: "네트워크 매칭 수수료", amount: 200000 },
    { date: "2026-03-20", brand: "MADLeap", source: "교육", desc: "크리에이티브 디렉팅 1기", amount: 1200000 },
    { date: "2026-03-20", brand: "YouInOne", source: "구독", desc: "Solo 플랜 x5", amount: 95000 },
    { date: "2026-03-19", brand: "SmarComm", source: "구독", desc: "Pro 월간 갱신 x8", amount: 1192000 },
];

export default function UniverseRevenue() {
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
                {/* Brand Revenue (horizontal bar) */}
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

                {/* Revenue Source (pie representation) */}
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
