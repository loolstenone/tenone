"use client";

import { useState } from "react";
import { CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, Search, ChevronDown } from "lucide-react";

/* ── Service Stats ── */
const serviceStats = [
    { name: "SmarComm", subs: 120, mrr: 5400000, color: "bg-emerald-500" },
    { name: "WIO Orbi", subs: 45, mrr: 2800000, color: "bg-blue-500" },
    { name: "Mindle Premium", subs: 89, mrr: 700000, color: "bg-cyan-500" },
    { name: "Evolution School", subs: 89, mrr: 2100000, color: "bg-orange-500" },
    { name: "YouInOne", subs: 110, mrr: 1250000, color: "bg-purple-500" },
    { name: "HeRo Pro", subs: 34, mrr: 650000, color: "bg-rose-500" },
];
const totalSubs = serviceStats.reduce((s, v) => s + v.subs, 0);
const totalMRR = serviceStats.reduce((s, v) => s + v.mrr, 0);

/* ── Churn / LTV mock ── */
const churnData = [
    { month: "10월", churn: 3.2, ltv: 420000 },
    { month: "11월", churn: 2.8, ltv: 450000 },
    { month: "12월", churn: 4.1, ltv: 410000 },
    { month: "1월", churn: 2.5, ltv: 480000 },
    { month: "2월", churn: 2.1, ltv: 510000 },
    { month: "3월", churn: 1.9, ltv: 530000 },
];

/* ── Cross-sell ── */
const crossSell = [
    { desc: "SmarComm 구독 중이지만 Orbi를 사용하지 않는 고객", count: 32 },
    { desc: "Orbi 사용 중 SmarComm 미구독 고객", count: 18 },
    { desc: "Education 수료 후 미구독 전환 고객", count: 45 },
    { desc: "HeRo HIT 검사 완료 후 Pro 미전환", count: 27 },
];

/* ── Mock 구독자 ── */
const mockSubs = [
    { id: "1", name: "김민지", service: "SmarComm", plan: "Pro", amount: 149000, start: "2025-09-01", end: "2026-09-01", status: "active", autoRenew: true },
    { id: "2", name: "이준혁", service: "WIO Orbi", plan: "Business", amount: 399000, start: "2025-11-15", end: "2026-11-15", status: "active", autoRenew: true },
    { id: "3", name: "박서윤", service: "Evolution School", plan: "Standard", amount: 89000, start: "2026-01-10", end: "2026-07-10", status: "active", autoRenew: false },
    { id: "4", name: "송예린", service: "SmarComm", plan: "Starter", amount: 49000, start: "2026-02-01", end: "2026-08-01", status: "active", autoRenew: true },
    { id: "5", name: "윤서아", service: "WIO Orbi", plan: "Pro", amount: 149000, start: "2025-10-01", end: "2026-10-01", status: "active", autoRenew: true },
    { id: "6", name: "윤서아", service: "YouInOne", plan: "Team", amount: 79000, start: "2026-01-15", end: "2027-01-15", status: "active", autoRenew: true },
    { id: "7", name: "강현우", service: "SmarComm", plan: "Business", amount: 399000, start: "2025-08-01", end: "2026-08-01", status: "active", autoRenew: true },
    { id: "8", name: "강현우", service: "Mindle", plan: "Premium", amount: 9900, start: "2026-03-01", end: "2026-04-01", status: "active", autoRenew: true },
    { id: "9", name: "조민서", service: "Evolution School", plan: "Premium", amount: 149000, start: "2026-02-15", end: "2026-08-15", status: "active", autoRenew: false },
    { id: "10", name: "유하늘", service: "SmarComm", plan: "Enterprise", amount: 990000, start: "2025-06-01", end: "2026-06-01", status: "active", autoRenew: true },
    { id: "11", name: "유하늘", service: "WIO Orbi", plan: "Business", amount: 399000, start: "2025-06-01", end: "2026-06-01", status: "active", autoRenew: true },
    { id: "12", name: "정하은", service: "Mindle", plan: "Premium", amount: 9900, start: "2025-12-01", end: "2026-03-01", status: "expired", autoRenew: false },
    { id: "13", name: "한도윤", service: "SmarComm", plan: "Pro", amount: 149000, start: "2025-07-01", end: "2026-07-01", status: "active", autoRenew: true },
    { id: "14", name: "오지호", service: "HeRo", plan: "Pro", amount: 29000, start: "2026-03-01", end: "2026-06-01", status: "active", autoRenew: false },
    { id: "15", name: "배소현", service: "YouInOne", plan: "Solo", amount: 19000, start: "2026-02-01", end: "2026-05-01", status: "active", autoRenew: true },
    { id: "16", name: "신유진", service: "Evolution School", plan: "Standard", amount: 89000, start: "2025-11-01", end: "2026-05-01", status: "active", autoRenew: true },
    { id: "17", name: "임채원", service: "Mindle", plan: "Premium", amount: 9900, start: "2026-03-15", end: "2026-04-15", status: "active", autoRenew: true },
    { id: "18", name: "HSAD", service: "SmarComm", plan: "Pro", amount: 149000, start: "2026-03-29", end: "2027-03-29", status: "active", autoRenew: true },
    { id: "19", name: "넥스트웨이브", service: "WIO Orbi", plan: "Pro", amount: 149000, start: "2026-02-01", end: "2027-02-01", status: "active", autoRenew: true },
    { id: "20", name: "크리에이팁", service: "SmarComm", plan: "Starter", amount: 49000, start: "2026-01-01", end: "2026-07-01", status: "active", autoRenew: false },
];

export default function UniverseSubscriptions() {
    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState<string>("");

    const filtered = mockSubs.filter((s) => {
        if (search && !s.name.includes(search)) return false;
        if (serviceFilter && s.service !== serviceFilter) return false;
        return true;
    });

    const maxMRR = Math.max(...serviceStats.map((s) => s.mrr));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> 구독 관리
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">서비스별 구독 현황 및 크로스셀 분석</p>
            </div>

            {/* Service Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {serviceStats.map((s) => (
                    <div key={s.name} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`h-3 w-3 rounded-full ${s.color}`} />
                            <span className="text-sm font-medium text-neutral-900">{s.name}</span>
                        </div>
                        <p className="text-lg font-bold text-neutral-900">{s.subs}명</p>
                        <p className="text-xs text-neutral-500">MRR ₩{s.mrr.toLocaleString()}</p>
                        {/* MRR bar */}
                        <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div className={`h-full ${s.color} rounded-full`} style={{ width: `${(s.mrr / maxMRR) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-500">총 구독자</p>
                    <p className="text-xl font-bold text-neutral-900 mt-1">{totalSubs}명</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-500">총 MRR</p>
                    <p className="text-xl font-bold text-neutral-900 mt-1">₩{(totalMRR / 10000).toFixed(0)}만</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-500">이탈률 (3월)</p>
                    <p className="text-xl font-bold text-green-600 mt-1 flex items-center gap-1">1.9% <ArrowUpRight className="h-3.5 w-3.5" /></p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-500">평균 LTV</p>
                    <p className="text-xl font-bold text-neutral-900 mt-1">₩530,000</p>
                </div>
            </div>

            {/* Churn / LTV Chart (bar) */}
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
                <h2 className="text-sm font-semibold text-neutral-900 mb-4">이탈률 & LTV 추이</h2>
                <div className="flex items-end gap-4 h-32">
                    {churnData.map((d) => (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex gap-1 items-end justify-center h-24">
                                <div className="w-5 bg-red-200 rounded-t" style={{ height: `${(d.churn / 5) * 100}%` }}
                                    title={`이탈률 ${d.churn}%`} />
                                <div className="w-5 bg-blue-200 rounded-t" style={{ height: `${(d.ltv / 600000) * 100}%` }}
                                    title={`LTV ₩${d.ltv.toLocaleString()}`} />
                            </div>
                            <span className="text-[10px] text-neutral-500">{d.month}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 mt-3 justify-center">
                    <span className="flex items-center gap-1.5 text-[11px] text-neutral-500"><span className="h-2 w-2 rounded-full bg-red-200" />이탈률</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-neutral-500"><span className="h-2 w-2 rounded-full bg-blue-200" />LTV</span>
                </div>
            </div>

            {/* Cross-sell */}
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> 크로스셀 기회
                </h2>
                <div className="space-y-2">
                    {crossSell.map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                <span className="text-xs text-neutral-700">{c.desc}</span>
                            </div>
                            <span className="text-sm font-bold text-neutral-900 shrink-0 ml-3">{c.count}명</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subscriber Table */}
            <div>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input type="text" placeholder="이름 검색"
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400" />
                    </div>
                    <div className="relative">
                        <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 bg-white">
                            <option value="">서비스 전체</option>
                            {serviceStats.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                    </div>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">이름</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">서비스</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">플랜</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500">금액</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">시작일</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">만료일</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">상태</th>
                                    <th className="text-center px-4 py-3 text-xs font-medium text-neutral-500">자동갱신</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {filtered.map((s) => (
                                    <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-neutral-900">{s.name}</td>
                                        <td className="px-4 py-3 text-neutral-700">{s.service}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">{s.plan}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-neutral-700">₩{s.amount.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{s.start}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{s.end}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                                                s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                            }`}>{s.status === "active" ? "활성" : "만료"}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs ${s.autoRenew ? "text-green-600" : "text-neutral-400"}`}>
                                                {s.autoRenew ? "ON" : "OFF"}
                                            </span>
                                        </td>
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
