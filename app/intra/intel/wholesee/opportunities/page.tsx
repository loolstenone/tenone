"use client";

/**
 * Whole See > 기회 수집 (Intake Pipeline)
 *
 * 정체성: 크롤링·자동 수집·AI 분류 파이프라인 모니터링 (Stage 1 Intake)
 * 운영 관리는 ERP > 프로젝트 > 수주 파이프라인 (/intra/opportunity)에서.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    TrendingUp, Loader2, Briefcase, Award, Globe, Users, Tag, Clock, ArrowRight, Zap,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Opportunity {
    id: string;
    title: string;
    source: string;
    status: string;
    relevance_score: number | null;
    budget_min: number | null;
    deadline: string | null;
    created_at: string;
    category: string | null;
}

const SOURCE_META: Record<string, { label: string; icon: typeof Globe; color: string }> = {
    narjangter: { label: "나라장터", icon: Briefcase, color: "bg-blue-50 text-blue-700 border-blue-200" },
    competition: { label: "공모전", icon: Award, color: "bg-purple-50 text-purple-700 border-purple-200" },
    government: { label: "지원사업", icon: Globe, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    referral: { label: "소개/의뢰", icon: Users, color: "bg-amber-50 text-amber-700 border-amber-200" },
    website: { label: "웹사이트", icon: Globe, color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    openchat: { label: "오픈채팅", icon: Users, color: "bg-pink-50 text-pink-700 border-pink-200" },
    other: { label: "기타", icon: Tag, color: "bg-neutral-100 text-neutral-600 border-neutral-200" },
};

function rel(dateStr: string | null): string {
    if (!dateStr) return "-";
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (d < 60) return `${d}분 전`;
    const h = Math.floor(d / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

export default function WholeSeeOpportunitiesPage() {
    const [loading, setLoading] = useState(true);
    const [opps, setOpps] = useState<Opportunity[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("wio_opportunities")
                .select("id, title, source, status, relevance_score, budget_min, deadline, created_at, category")
                .order("created_at", { ascending: false })
                .limit(100);
            setOpps(data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    const bySource = new Map<string, number>();
    opps.forEach(o => bySource.set(o.source, (bySource.get(o.source) ?? 0) + 1));
    const newOpps = opps.filter(o => o.status === "new").length;
    const avgScore = opps.length > 0
        ? opps.reduce((s, o) => s + (o.relevance_score ?? 0), 0) / opps.length
        : 0;

    return (
        <div className="space-y-6">
            <PageHeader
                title="기회 수집 (Opportunity Intake)"
                description="Whole See의 크롤링·자동 수집 파이프라인 · Stage 1 모니터링"
            />

            {/* 안내 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900 leading-relaxed">
                <strong>수집 모니터링 페이지입니다.</strong>
                운영(검토·입찰·수주) 관리는 <Link href="/intra/opportunity" className="underline font-semibold mx-1">ERP &gt; 프로젝트 &gt; 수주 파이프라인</Link>에서.
                크롤링은 매일 08:00·08:30 Cron 2회 (나라장터·공모전·정부지원사업).
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                        <span className="text-[11px] text-neutral-500">전체 수집</span>
                    </div>
                    <p className="text-xl font-bold">{opps.length}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-[11px] text-neutral-500">신규 미검토</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{newOpps}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Award className="h-4 w-4 text-emerald-600" />
                        <span className="text-[11px] text-neutral-500">평균 관련성</span>
                    </div>
                    <p className="text-xl font-bold">{(avgScore * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-violet-600" />
                        <span className="text-[11px] text-neutral-500">최근 수집</span>
                    </div>
                    <p className="text-sm font-bold">{opps[0] ? rel(opps[0].created_at) : "없음"}</p>
                </div>
            </div>

            {/* 소스별 분포 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">소스별 수집 분포</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Array.from(bySource.entries()).sort((a, b) => b[1] - a[1]).map(([src, cnt]) => {
                        const meta = SOURCE_META[src] ?? SOURCE_META.other;
                        const Icon = meta.icon;
                        return (
                            <div key={src} className={`rounded border p-3 ${meta.color}`}>
                                <div className="flex items-center gap-1 mb-1">
                                    <Icon className="h-3.5 w-3.5" />
                                    <span className="text-[11px] font-semibold">{meta.label}</span>
                                </div>
                                <p className="text-lg font-bold">{cnt}</p>
                            </div>
                        );
                    })}
                    {bySource.size === 0 && (
                        <div className="col-span-4 bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">
                            아직 수집된 기회가 없습니다. Cron 크롤링 대기 중.
                        </div>
                    )}
                </div>
            </div>

            {/* 최근 수집 리스트 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">최근 수집 ({opps.length})</h2>
                {loading ? (
                    <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
                ) : opps.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">
                        아직 수집된 기회가 없습니다.
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">소스</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">제목</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">관련성</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">예산</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">마감</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">수집</th>
                                </tr>
                            </thead>
                            <tbody>
                                {opps.slice(0, 30).map(o => {
                                    const src = SOURCE_META[o.source] ?? SOURCE_META.other;
                                    return (
                                        <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                            <td className="px-3 py-1.5">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${src.color}`}>{src.label}</span>
                                            </td>
                                            <td className="px-3 py-1.5 text-neutral-900 truncate max-w-[280px]">{o.title}</td>
                                            <td className="px-3 py-1.5 text-right">
                                                {o.relevance_score !== null && (
                                                    <span className={`font-semibold ${o.relevance_score >= 0.8 ? "text-emerald-600" : o.relevance_score >= 0.5 ? "text-amber-600" : "text-neutral-400"}`}>
                                                        {(o.relevance_score * 100).toFixed(0)}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-1.5 text-right text-neutral-600">
                                                {o.budget_min ? `₩${(o.budget_min / 10000).toLocaleString()}만` : "-"}
                                            </td>
                                            <td className="px-3 py-1.5 text-right text-neutral-500">{o.deadline || "-"}</td>
                                            <td className="px-3 py-1.5 text-neutral-500">{o.status}</td>
                                            <td className="px-3 py-1.5 text-right text-neutral-500">{rel(o.created_at)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <Link href="/intra/opportunity" className="flex-1 bg-neutral-900 text-white rounded-lg p-4 hover:bg-neutral-700">
                    <p className="text-xs font-semibold">운영 파이프라인 →</p>
                    <p className="text-[10px] text-neutral-300">ERP &gt; 프로젝트 &gt; 수주 파이프라인 (검토·입찰·수주)</p>
                </Link>
                <Link href="/intra/intel/wholesee/crawling" className="flex-1 bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">크롤러 상태</p>
                    <p className="text-[10px] text-neutral-500">Whole See 크롤러 엔진 <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
            </div>
        </div>
    );
}
