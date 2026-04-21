"use client";

/**
 * Universe > CS 통합 허브 — 전 브랜드 고객 응대 인박스
 *
 * 목적: Marketing > CRM · Universe > 커머스 > 고객문의 · Badak > CS 로 분산된
 *       고객 문의·피드백·Q&A 를 하나의 인박스로 통합 모니터링.
 *
 * Registry: lib/cs-inbox-registry.ts (내부) — 신규 소스 추가 시 여기 entry 추가.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    MessageCircle, Loader2, ArrowRight, Mail, HelpCircle, Heart, ShoppingCart,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface InboxStat {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    total: number;
    open: number;
    href: string;
}

const CS_SOURCES = [
    { key: "contact", label: "연락/문의", icon: Mail, color: "text-blue-600",
      table: "contact_submissions", openFilter: { col: "status", val: "new" }, href: "/intra/ums/cs/contact" },
    { key: "jakka_qna", label: "Jakka 작품 Q&A", icon: HelpCircle, color: "text-amber-600",
      table: "jakka_product_qna", openFilter: { col: "status", val: "open" }, href: "/intra/ums/cs/jakka-qna" },
    { key: "badak_feedback", label: "Badak 피드백", icon: Heart, color: "text-rose-600",
      table: "badak_feedbacks", openFilter: null, href: "/intra/ums/cs/badak" },
    { key: "jakka_orders_cs", label: "Jakka 주문 문의", icon: ShoppingCart, color: "text-emerald-600",
      table: "jakka_orders", openFilter: { col: "status", val: "pending" }, href: "/intra/ums/jakka/market" },
];

export default function CSHubPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<InboxStat[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const results = await Promise.all(CS_SOURCES.map(async (s) => {
                const totalQ = sb.from(s.table).select("*", { count: "exact", head: true });
                let openQ = sb.from(s.table).select("*", { count: "exact", head: true });
                if (s.openFilter) openQ = openQ.eq(s.openFilter.col, s.openFilter.val);
                const [tRes, oRes] = await Promise.all([totalQ, openQ]);
                return {
                    key: s.key, label: s.label, icon: s.icon, color: s.color,
                    total: tRes.count ?? 0,
                    open: s.openFilter ? (oRes.count ?? 0) : (tRes.count ?? 0),
                    href: s.href,
                };
            }));
            setStats(results);
            setLoading(false);
        }
        load();
    }, []);

    const totalOpen = stats.reduce((s, v) => s + v.open, 0);
    const totalAll = stats.reduce((s, v) => s + v.total, 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title="CS 통합"
                description="전 브랜드 고객 응대 통합 인박스 — 문의·Q&A·피드백·주문 CS"
            />

            {/* 요약 */}
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-rose-700 font-semibold">오늘의 인박스</p>
                        <p className="text-3xl font-bold text-neutral-900 mt-1">
                            {loading ? "..." : totalOpen.toLocaleString()}
                            <span className="text-sm text-neutral-500 font-normal ml-2">건 응대 필요</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] text-neutral-500">누적 전체</p>
                        <p className="text-xl font-semibold text-neutral-700">{loading ? "..." : totalAll.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* 소스별 카드 */}
            {loading ? (
                <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.map(s => {
                        const Icon = s.icon;
                        const urgent = s.open > 0;
                        return (
                            <Link key={s.key} href={s.href}
                                className={`bg-white border rounded-lg p-5 transition-all ${urgent ? "border-rose-300 hover:border-rose-500 hover:shadow" : "border-neutral-200 hover:border-neutral-400"}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon className={`h-5 w-5 ${s.color}`} />
                                    <h3 className="text-sm font-semibold text-neutral-900 flex-1">{s.label}</h3>
                                    {urgent && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded font-bold">
                                            {s.open}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-4">
                                    <div>
                                        <p className="text-[10px] text-neutral-500">응대 대기</p>
                                        <p className={`text-2xl font-bold ${urgent ? "text-rose-600" : "text-neutral-400"}`}>{s.open}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-neutral-500">전체</p>
                                        <p className="text-sm text-neutral-600">{s.total.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-1 text-[11px] text-neutral-700 font-semibold">
                                    관리로 <ArrowRight className="h-3 w-3" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Philosophy */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-[11px] text-neutral-700 leading-relaxed">
                <p className="font-semibold mb-1 flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5 text-rose-500" /> 설계 원칙
                </p>
                CS 응답은 <strong>각 브랜드 전용 페이지</strong>에서 상세 작업, <strong>이 허브는 모니터링</strong>만.
                새 CS 소스(예: 신규 브랜드 문의)는 <code className="font-mono bg-neutral-100 px-1 rounded">CS_SOURCES</code> 상수에 entry 추가로 자동 집계.
                Action Hub Registry와 유사한 레지스트리 패턴.
            </div>
        </div>
    );
}
