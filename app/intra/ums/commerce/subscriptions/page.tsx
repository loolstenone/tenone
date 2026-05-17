"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Search, ChevronDown, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

/* ── 타입 ── */
interface ServiceStat { name: string; subs: number; mrr: number; color: string }
interface SubRow {
    id: string; name: string; service: string; plan: string;
    amount: number; start: string; end: string; status: string; autoRenew: boolean;
}

// 서비스 식별자(lowercase) → 표시명·색상 매핑
const serviceLabels: Record<string, string> = {
    smarcomm: "SmarComm", wio: "WIO Orbi", mindle: "Mindle",
    evschool: "Evolution School", youinone: "YouInOne", hero: "HeRo",
    badak: "Badak",
};
const serviceColors: Record<string, string> = {
    smarcomm: "bg-emerald-500", wio: "bg-blue-500", mindle: "bg-cyan-500",
    evschool: "bg-orange-500", youinone: "bg-purple-500", hero: "bg-rose-500",
    badak: "bg-red-500",
};

export default function UniverseSubscriptions() {
    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
    const [subs, setSubs] = useState<SubRow[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const supabase = createClient();

                // wio_subscriptions 먼저, fallback으로 기존 subscriptions
                let rawSubs: any[] | null = null;
                let error: any = null;

                const wioRes = await supabase
                    .from("wio_subscriptions")
                    .select("id, user_id, service, plan_key, price_paid, started_at, expires_at, status, auto_renew")
                    .order("created_at", { ascending: false });

                if (!wioRes.error && wioRes.data && wioRes.data.length > 0) {
                    rawSubs = wioRes.data;
                } else {
                    const legacyRes = await supabase
                        .from("subscriptions")
                        .select("id, member_id, service, plan, price, started_at, expires_at, status, auto_renew")
                        .order("created_at", { ascending: false });
                    rawSubs = legacyRes.data;
                    error = legacyRes.error;
                }

                if (error) throw error;
                if (!rawSubs || rawSubs.length === 0) {
                    setLoading(false);
                    return;
                }

                // 서비스별 집계
                const serviceMap: Record<string, { subs: number; mrr: number }> = {};
                const subList: SubRow[] = [];

                rawSubs.forEach((s: any) => {
                    const plan = s.plan_key || s.plan || '-';
                    const price = s.price_paid ?? s.price ?? 0;
                    const startDate = s.started_at?.split("T")[0] || "-";
                    const endDate = s.expires_at?.split("T")[0] || "-";

                    // 구독자 리스트
                    subList.push({
                        id: s.id,
                        name: s.user_id ? s.user_id.substring(0, 8) + '...' : "-",
                        service: s.service,
                        plan,
                        amount: price,
                        start: startDate,
                        end: endDate,
                        status: s.status,
                        autoRenew: s.auto_renew ?? false,
                    });

                    // active만 서비스별 집계
                    if (s.status === "active") {
                        if (!serviceMap[s.service]) serviceMap[s.service] = { subs: 0, mrr: 0 };
                        serviceMap[s.service].subs++;
                        serviceMap[s.service].mrr += price;
                    }
                });

                const statsList: ServiceStat[] = Object.entries(serviceMap).map(([name, data]) => ({
                    name,
                    subs: data.subs,
                    mrr: data.mrr,
                    color: serviceColors[name] || "bg-neutral-500",
                }));

                if (statsList.length > 0) setServiceStats(statsList);
                if (subList.length > 0) setSubs(subList);
            } catch (err) {
                console.error("Subscriptions fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const filtered = subs.filter((s) => {
        if (search && !s.name.includes(search)) return false;
        if (serviceFilter && s.service !== serviceFilter) return false;
        return true;
    });

    const totalSubs = serviceStats.reduce((s, v) => s + v.subs, 0);
    const totalMRR = serviceStats.reduce((s, v) => s + v.mrr, 0);
    const maxMRR = Math.max(...serviceStats.map((s) => s.mrr), 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        );
    }

    const hasSubs = subs.length > 0;

    return (
        <div className="space-y-6">
            <PageHeader title="구독 관리" description="서비스별 구독 현황 (wio_subscriptions 실측)" />

            {/* Service Stats */}
            {serviceStats.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {serviceStats.map((s) => (
                        <div key={s.name} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`h-3 w-3 rounded-full ${s.color}`} />
                                <span className="text-sm font-medium text-neutral-900">{serviceLabels[s.name] ?? s.name}</span>
                            </div>
                            <p className="text-lg font-bold text-neutral-900">{s.subs}명</p>
                            <p className="text-xs text-neutral-500">MRR ₩{s.mrr.toLocaleString()}</p>
                            <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                <div className={`h-full ${s.color} rounded-full`} style={{ width: `${(s.mrr / maxMRR) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                    <strong>활성 구독 0건.</strong> 서비스별 카드는 wio_subscriptions에 status='active' 행이 누적되면 자동 표시됩니다.
                </div>
            )}

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
                    <p className="text-xs text-neutral-500">이탈률</p>
                    <p className="text-sm font-medium text-neutral-400 mt-2">데이터 누적 중</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-500">평균 LTV</p>
                    <p className="text-sm font-medium text-neutral-400 mt-2">데이터 누적 중</p>
                </div>
            </div>

            {/* Churn / LTV — 데이터 누적 후 활성화 */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-6 text-center">
                <h2 className="text-sm font-semibold text-neutral-700">이탈률 &amp; LTV 추이</h2>
                <p className="mt-2 text-xs text-neutral-500">
                    최소 3개월간 구독·해지 이력이 누적되어야 산출 가능합니다. <br />
                    Phase 2-B 결제 PG 연결 + 최초 구독 수신 후 자동 활성화.
                </p>
            </div>

            {/* Cross-sell — 데이터 누적 후 활성화 */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-6 text-center">
                <h2 className="text-sm font-semibold text-neutral-700 flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4" /> 크로스셀 기회
                </h2>
                <p className="mt-2 text-xs text-neutral-500">
                    2개 이상 서비스에 활성 구독이 누적되면 자동 분석됩니다. <br />
                    현재 구독 수 부족으로 표본 미충족.
                </p>
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
                            {serviceStats.map((s) => <option key={s.name} value={s.name}>{serviceLabels[s.name] ?? s.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                    </div>
                </div>
                {!hasSubs ? (
                    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-8 text-center text-xs text-neutral-500">
                        활성 구독이 아직 없습니다. wio_subscriptions에 행이 누적되면 여기에 표시됩니다.
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50">
                                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">사용자</th>
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
                                            <td className="px-4 py-3 font-mono text-xs text-neutral-700">{s.name}</td>
                                            <td className="px-4 py-3 text-neutral-700">{serviceLabels[s.service] ?? s.service}</td>
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
                )}
            </div>
        </div>
    );
}
