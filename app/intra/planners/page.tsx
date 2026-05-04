"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/intra/IntraUI";
import { Search, Check, Loader2, Crown, FileText, Sparkles, BarChart2 } from "lucide-react";

interface Subscriber {
    member_id: string;
    email: string;
    name: string | null;
    mode: string;
    subscription_status: string;
    subscription_expires_at: string | null;
    is_pdf_buyer: boolean;
    created_at: string;
}

interface Payment {
    id: string;
    member_id: string;
    email: string;
    order_id: string;
    amount: number;
    status: string;
    source: string;
    paid_at: string | null;
    created_at: string;
}

interface BriefingLog {
    id: string;
    member_id: string;
    email: string;
    briefing_date: string;
    briefing_type: string;
    content_preview: string;
    created_at: string;
}

interface UsageRow {
    member_id: string;
    email: string;
    year_month: string;
    morning_count: number;
    evening_count: number;
    total_count: number;
}

type Tab = "subscribers" | "payments" | "briefings" | "usage";

export default function IntraPlannersPage() {
    const [tab, setTab] = useState<Tab>("subscribers");
    const [subs, setSubs] = useState<Subscriber[]>([]);
    const [pays, setPays] = useState<Payment[]>([]);
    const [briefings, setBriefings] = useState<BriefingLog[]>([]);
    const [usage, setUsage] = useState<UsageRow[]>([]);
    const [usageStats, setUsageStats] = useState({ totalBriefings: 0, totalMorning: 0, totalEvening: 0 });
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    // 활성화 모달
    const [activate, setActivate] = useState(false);
    const [targetEmail, setTargetEmail] = useState("");
    const [source, setSource] = useState<"pdf_buyer" | "manual" | "beta">("pdf_buyer");
    const [years, setYears] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    async function load() {
        setLoading(true);
        const [sRes, pRes, bRes, uRes] = await Promise.all([
            fetch("/api/intra/planners/subscribers"),
            fetch("/api/intra/planners/payments"),
            fetch("/api/intra/planners/briefings"),
            fetch("/api/intra/planners/usage"),
        ]);
        if (sRes.ok) setSubs((await sRes.json()).subscribers || []);
        if (pRes.ok) setPays((await pRes.json()).payments || []);
        if (bRes.ok) setBriefings((await bRes.json()).briefings || []);
        if (uRes.ok) {
            const ud = await uRes.json();
            setUsage(ud.usage || []);
            setUsageStats(ud.stats || { totalBriefings: 0, totalMorning: 0, totalEvening: 0 });
        }
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function handleActivate() {
        if (!targetEmail.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/myverse/admin/activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target_email: targetEmail.trim(), source, years }),
            });
            const d = await res.json();
            if (res.ok) {
                alert(`활성화 완료: ${d.target_email}`);
                setActivate(false);
                setTargetEmail("");
                load();
            } else {
                alert(`실패: ${d.error}`);
            }
        } finally { setSubmitting(false); }
    }

    const filteredSubs = subs.filter((s) =>
        !query || s.email.toLowerCase().includes(query.toLowerCase()) || (s.name ?? "").toLowerCase().includes(query.toLowerCase())
    );
    const filteredPays = pays.filter((p) =>
        !query || p.email.toLowerCase().includes(query.toLowerCase()) || p.order_id.includes(query)
    );
    const filteredBriefings = briefings.filter((b) =>
        !query || b.email.toLowerCase().includes(query.toLowerCase()) || b.briefing_date.includes(query)
    );
    const filteredUsage = usage.filter((u) =>
        !query || u.email.toLowerCase().includes(query.toLowerCase()) || u.year_month.includes(query)
    );

    const stats = {
        total: subs.length,
        active: subs.filter((s) => s.subscription_status === "active").length,
        pdf: subs.filter((s) => s.is_pdf_buyer).length,
        revenue: pays.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
    };

    const TABS: { key: Tab; label: string; count: number }[] = [
        { key: "subscribers", label: "구독자", count: subs.length },
        { key: "payments", label: "결제", count: pays.length },
        { key: "briefings", label: "브리핑 로그", count: briefings.length },
        { key: "usage", label: "AI 사용량", count: usage.length },
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Planner's Planner AI"
                description="구독자 · 결제 · PDF 구매자 활성화 · AI 사용량 관리"
            />

            {/* 통계 */}
            <div className="grid grid-cols-4 gap-4">
                <Stat label="전체 사용자" value={stats.total.toLocaleString()} />
                <Stat label="활성 구독" value={stats.active.toLocaleString()} />
                <Stat label="PDF 구매자" value={stats.pdf.toLocaleString()} icon={<FileText className="h-4 w-4 text-amber-500" />} />
                <Stat label="누적 결제" value={`${stats.revenue.toLocaleString()}원`} />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <Stat label="총 브리핑 생성" value={usageStats.totalBriefings.toLocaleString()} icon={<Sparkles className="h-4 w-4 text-[#0F766E]" />} />
                <Stat label="아침 브리핑" value={usageStats.totalMorning.toLocaleString()} />
                <Stat label="저녁 정리" value={usageStats.totalEvening.toLocaleString()} />
            </div>

            {/* 탭 */}
            <div className="flex items-center justify-between border-b border-neutral-800">
                <div className="flex gap-0">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-4 py-3 text-sm border-b-2 -mb-px transition-colors ${
                                tab === t.key ? "border-[#0F766E] text-white font-semibold" : "border-transparent text-neutral-400 hover:text-white"
                            }`}
                        >
                            {t.label} ({t.count})
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setActivate(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors"
                >
                    <Crown className="h-3.5 w-3.5" /> 수동 활성화
                </button>
            </div>

            {/* 검색 */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="이메일·이름·주문번호·날짜 검색"
                    className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-[#0F766E]"
                />
            </div>

            {loading ? (
                <div className="py-16 text-center"><Loader2 className="h-5 w-5 animate-spin text-neutral-500 mx-auto" /></div>
            ) : tab === "subscribers" ? (
                <div className="bg-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-700/50 text-xs text-neutral-400 uppercase tracking-wider">
                            <tr>
                                <th className="text-left px-4 py-3">이메일</th>
                                <th className="text-left px-4 py-3">이름</th>
                                <th className="text-left px-4 py-3">모드</th>
                                <th className="text-left px-4 py-3">상태</th>
                                <th className="text-left px-4 py-3">만료일</th>
                                <th className="text-left px-4 py-3">PDF</th>
                                <th className="text-left px-4 py-3">가입일</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {filteredSubs.map((s) => (
                                <tr key={s.member_id} className="hover:bg-neutral-700/30">
                                    <td className="px-4 py-3 text-neutral-100">{s.email}</td>
                                    <td className="px-4 py-3 text-neutral-300">{s.name || "—"}</td>
                                    <td className="px-4 py-3 text-neutral-400 text-xs">{s.mode === "weekly" ? "Weekly" : "All in One"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            s.subscription_status === "active" ? "bg-[#0F766E]/20 text-[#0F766E]" :
                                            s.subscription_status === "expired" ? "bg-red-500/20 text-red-400" :
                                            "bg-neutral-700 text-neutral-400"
                                        }`}>
                                            {s.subscription_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-400 text-xs">
                                        {s.subscription_expires_at ? new Date(s.subscription_expires_at).toLocaleDateString('ko-KR') : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {s.is_pdf_buyer && <Check className="h-4 w-4 text-amber-500" />}
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500 text-xs">
                                        {new Date(s.created_at).toLocaleDateString('ko-KR')}
                                    </td>
                                </tr>
                            ))}
                            {filteredSubs.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-12 text-neutral-500">구독자 없음</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : tab === "payments" ? (
                <div className="bg-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-700/50 text-xs text-neutral-400 uppercase tracking-wider">
                            <tr>
                                <th className="text-left px-4 py-3">주문번호</th>
                                <th className="text-left px-4 py-3">이메일</th>
                                <th className="text-left px-4 py-3">금액</th>
                                <th className="text-left px-4 py-3">소스</th>
                                <th className="text-left px-4 py-3">상태</th>
                                <th className="text-left px-4 py-3">결제일</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {filteredPays.map((p) => (
                                <tr key={p.id} className="hover:bg-neutral-700/30">
                                    <td className="px-4 py-3 font-mono text-xs text-neutral-400">{p.order_id}</td>
                                    <td className="px-4 py-3 text-neutral-100">{p.email}</td>
                                    <td className="px-4 py-3 text-neutral-200">{p.amount.toLocaleString()}원</td>
                                    <td className="px-4 py-3 text-neutral-400 text-xs">{p.source}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            p.status === "paid" ? "bg-[#0F766E]/20 text-[#0F766E]" :
                                            p.status === "manual" ? "bg-amber-500/20 text-amber-400" :
                                            p.status === "pending" ? "bg-neutral-600 text-neutral-300" :
                                            "bg-red-500/20 text-red-400"
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500 text-xs">
                                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString('ko-KR') : "—"}
                                    </td>
                                </tr>
                            ))}
                            {filteredPays.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-12 text-neutral-500">결제 없음</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : tab === "briefings" ? (
                <div className="bg-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-700/50 text-xs text-neutral-400 uppercase tracking-wider">
                            <tr>
                                <th className="text-left px-4 py-3">이메일</th>
                                <th className="text-left px-4 py-3">날짜</th>
                                <th className="text-left px-4 py-3">유형</th>
                                <th className="text-left px-4 py-3">내용 미리보기</th>
                                <th className="text-left px-4 py-3">생성시각</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {filteredBriefings.map((b) => (
                                <tr key={b.id} className="hover:bg-neutral-700/30">
                                    <td className="px-4 py-3 text-neutral-100">{b.email}</td>
                                    <td className="px-4 py-3 text-neutral-300 text-xs">{b.briefing_date}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            b.briefing_type === "morning" ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"
                                        }`}>
                                            {b.briefing_type === "morning" ? "아침" : "저녁"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500 text-xs max-w-xs truncate">{b.content_preview}</td>
                                    <td className="px-4 py-3 text-neutral-500 text-xs">
                                        {new Date(b.created_at).toLocaleString('ko-KR')}
                                    </td>
                                </tr>
                            ))}
                            {filteredBriefings.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-12 text-neutral-500">브리핑 없음</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-700/50 text-xs text-neutral-400 uppercase tracking-wider">
                            <tr>
                                <th className="text-left px-4 py-3">이메일</th>
                                <th className="text-left px-4 py-3">월</th>
                                <th className="text-left px-4 py-3">아침</th>
                                <th className="text-left px-4 py-3">저녁</th>
                                <th className="text-left px-4 py-3">합계</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {filteredUsage.map((u, i) => (
                                <tr key={`${u.member_id}-${u.year_month}-${i}`} className="hover:bg-neutral-700/30">
                                    <td className="px-4 py-3 text-neutral-100">{u.email}</td>
                                    <td className="px-4 py-3 text-neutral-300 text-xs">{u.year_month}</td>
                                    <td className="px-4 py-3 text-amber-400">{u.morning_count}</td>
                                    <td className="px-4 py-3 text-indigo-400">{u.evening_count}</td>
                                    <td className="px-4 py-3 text-neutral-100 font-medium">{u.total_count}</td>
                                </tr>
                            ))}
                            {filteredUsage.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-12 text-neutral-500">데이터 없음</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 활성화 모달 */}
            {activate && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-md w-full p-6">
                        <h3 className="font-semibold text-white mb-4">수동 구독 활성화</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">이메일</label>
                                <input
                                    value={targetEmail}
                                    onChange={(e) => setTargetEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 mb-1 block">소스</label>
                                <select
                                    value={source}
                                    onChange={(e) => setSource(e.target.value as typeof source)}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none"
                                >
                                    <option value="pdf_buyer">PDF 구매자 (1년 무료)</option>
                                    <option value="manual">수동 (원하는 기간)</option>
                                    <option value="beta">베타 테스터</option>
                                </select>
                            </div>
                            {source !== "pdf_buyer" && (
                                <div>
                                    <label className="text-xs text-neutral-400 mb-1 block">기간 (년)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={years}
                                        onChange={(e) => setYears(parseInt(e.target.value, 10))}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setActivate(false)}
                                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleActivate}
                                disabled={submitting || !targetEmail.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white rounded-lg text-sm font-medium hover:bg-[#0d5e56] transition-colors disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                활성화
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <p className="text-xs text-neutral-400 uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
}
