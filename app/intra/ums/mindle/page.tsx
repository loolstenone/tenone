"use client";

/**
 * Mindle UMS — 브랜드 관리 대시보드
 *
 * 포지션:
 *  - Mindle은 Whole See(INTEL)의 정보를 가장 적극적으로 활용하는 콘텐츠 브랜드
 *  - UMS에서는 브랜드 운영 CRUD (사이트·회원·콘텐츠)를 담당
 *  - 크롤링·분석·분류는 INTEL > Whole See에 위임
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    TrendingUp, Mail, Users, Globe, Layers,
    Loader2, ArrowRight, Sparkles, Send, FileText,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface MindleStats {
    subscribers: number;
    subscribersActive: number;
    issuesTotal: number;
    issuesSent: number;
    issuesDraft: number;
    wholeSeeTrends: number;
    siteOpen: boolean | null;
}

function rel(dateStr: string | null): string {
    if (!dateStr) return "-";
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (d < 1) return "방금 전";
    if (d < 60) return `${d}분 전`;
    const h = Math.floor(d / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

export default function MindleUMSDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<MindleStats | null>(null);
    const [recentIssues, setRecentIssues] = useState<{ title: string; status: string; created_at: string }[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            try {
                const [
                    subsActive, subsTotal,
                    issuesAll, issuesSent, issuesDraft,
                    trendsTotal, siteRow, recent,
                ] = await Promise.all([
                    sb.from("newsletter_subscribers").select("*", { count: "exact", head: true })
                        .eq("site_id", "mindle").eq("is_active", true),
                    sb.from("newsletter_subscribers").select("*", { count: "exact", head: true })
                        .eq("site_id", "mindle"),
                    sb.from("newsletter_issues").select("*", { count: "exact", head: true }),
                    sb.from("newsletter_issues").select("*", { count: "exact", head: true }).eq("status", "sent"),
                    sb.from("newsletter_issues").select("*", { count: "exact", head: true }).eq("status", "draft"),
                    sb.from("mindle_trends").select("*", { count: "exact", head: true }),
                    sb.from("ums_sites").select("is_open").eq("site_id", "mindle").single(),
                    sb.from("newsletter_issues").select("title, status, created_at").order("created_at", { ascending: false }).limit(5),
                ]);
                setStats({
                    subscribers: subsTotal.count ?? 0,
                    subscribersActive: subsActive.count ?? 0,
                    issuesTotal: issuesAll.count ?? 0,
                    issuesSent: issuesSent.count ?? 0,
                    issuesDraft: issuesDraft.count ?? 0,
                    wholeSeeTrends: trendsTotal.count ?? 0,
                    siteOpen: siteRow.data?.is_open ?? null,
                });
                setRecentIssues(recent.data ?? []);
            } catch (e) {
                console.error("Mindle UMS load:", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading || !stats) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Mindle 브랜드 관리" description="트렌드 콘텐츠 브랜드 · Whole See(INTEL)의 정보를 가장 적극 활용" />

            {/* Brand Identity Strip */}
            <div className="bg-gradient-to-r from-cyan-900 to-cyan-700 text-white rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-cyan-200" />
                    <span className="text-[11px] uppercase tracking-wider text-cyan-200 font-semibold">
                        MINDLE · 트렌드 콘텐츠 브랜드
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-[11px] text-cyan-200 mb-1">사이트 상태</p>
                        <p className="text-lg font-bold">{stats.siteOpen === null ? "미등록" : stats.siteOpen ? "오픈" : "닫힘"}</p>
                    </div>
                    <div>
                        <p className="text-[11px] text-cyan-200 mb-1">뉴스레터 구독자</p>
                        <p className="text-lg font-bold">{stats.subscribersActive.toLocaleString()}명</p>
                        <p className="text-[10px] text-cyan-300">전체 {stats.subscribers}</p>
                    </div>
                    <div>
                        <p className="text-[11px] text-cyan-200 mb-1">Whole See 원천</p>
                        <p className="text-lg font-bold">{stats.wholeSeeTrends.toLocaleString()}건</p>
                        <p className="text-[10px] text-cyan-300">활용 가능 트렌드</p>
                    </div>
                </div>
            </div>

            {/* 3 Management Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 사이트 관리 */}
                <Link href="/intra/ums/sites/list?filter=mindle"
                    className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-cyan-300 hover:bg-cyan-50/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <h2 className="text-sm font-semibold text-neutral-900">사이트 관리</h2>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-4">mindle.tenone.biz 도메인·SEO·브랜딩·오픈/차단</p>
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-500">상태</span>
                        <span className={`font-semibold ${stats.siteOpen ? "text-emerald-600" : "text-neutral-500"}`}>
                            {stats.siteOpen ? "오픈 중" : stats.siteOpen === false ? "닫힘" : "미설정"}
                        </span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] text-cyan-700 font-semibold">
                        사이트 관리로 <ArrowRight className="h-3 w-3" />
                    </div>
                </Link>

                {/* 회원 (구독자) 관리 */}
                <Link href="/intra/ums/mindle/members"
                    className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-cyan-300 hover:bg-cyan-50/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5 text-violet-600" />
                        <h2 className="text-sm font-semibold text-neutral-900">회원 관리</h2>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-4">뉴스레터 구독자 · 회원 프로필 · 수신 설정</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">활성 구독자</span>
                            <span className="font-semibold text-neutral-900">{stats.subscribersActive.toLocaleString()}명</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">전체 구독자</span>
                            <span className="font-semibold text-neutral-900">{stats.subscribers.toLocaleString()}명</span>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] text-cyan-700 font-semibold">
                        회원 관리로 <ArrowRight className="h-3 w-3" />
                    </div>
                </Link>

                {/* 콘텐츠 관리 */}
                <Link href="/intra/ums/mindle/content"
                    className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-cyan-300 hover:bg-cyan-50/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-amber-600" />
                        <h2 className="text-sm font-semibold text-neutral-900">콘텐츠 관리</h2>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-4">Whole See 트렌드 큐레이션 · 뉴스레터 발행 · 아카이브</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">발송 이슈</span>
                            <span className="font-semibold text-neutral-900">{stats.issuesSent}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">초안</span>
                            <span className="font-semibold text-neutral-900">{stats.issuesDraft}</span>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] text-cyan-700 font-semibold">
                        콘텐츠 관리로 <ArrowRight className="h-3 w-3" />
                    </div>
                </Link>
            </div>

            {/* 최근 이슈 + Whole See 연결 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 최근 뉴스레터 이슈 */}
                <div className="bg-white border border-neutral-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Send className="h-4 w-4 text-neutral-500" />
                            <h3 className="text-sm font-semibold text-neutral-900">최근 뉴스레터 이슈</h3>
                        </div>
                        <Link href="/intra/ums/newsletter/issues" className="text-[11px] text-cyan-700 hover:underline">전체 보기</Link>
                    </div>
                    {recentIssues.length === 0 ? (
                        <div className="text-center text-[11px] text-neutral-400 py-6">발행 이력이 없습니다.</div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {recentIssues.map((i, idx) => (
                                <div key={idx} className="py-2 flex items-center justify-between">
                                    <div className="flex-1 min-w-0 pr-3">
                                        <p className="text-xs text-neutral-800 truncate">{i.title}</p>
                                        <p className="text-[10px] text-neutral-400 mt-0.5">{rel(i.created_at)}</p>
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                        i.status === "sent" ? "bg-emerald-100 text-emerald-700" :
                                        i.status === "scheduled" ? "bg-amber-100 text-amber-700" :
                                        "bg-neutral-100 text-neutral-600"
                                    }`}>
                                        {i.status === "sent" ? "발송" : i.status === "scheduled" ? "예약" : "초안"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Whole See 연결 안내 */}
                <div className="bg-white border border-neutral-200 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-neutral-500" />
                        <h3 className="text-sm font-semibold text-neutral-900">Whole See 정보 원천</h3>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-4">
                        크롤링·분류·분석은 INTEL {'>'} Whole See에서 담당합니다.
                        Mindle은 이 원천에서 선별·큐레이션해 독자에게 전달하는 브랜드입니다.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <Link href="/intra/intel/wholesee/trends"
                            className="p-3 border border-neutral-200 rounded hover:border-amber-300 hover:bg-amber-50/30">
                            <p className="text-[10px] text-neutral-400">트렌드 카드</p>
                            <p className="text-sm font-bold text-neutral-900">{stats.wholeSeeTrends.toLocaleString()}건</p>
                            <p className="text-[10px] text-amber-700 mt-1">Whole See →</p>
                        </Link>
                        <Link href="/intra/intel/wholesee/pipeline"
                            className="p-3 border border-neutral-200 rounded hover:border-amber-300 hover:bg-amber-50/30">
                            <p className="text-[10px] text-neutral-400">콘텐츠 파이프라인</p>
                            <p className="text-sm font-bold text-neutral-900">가공 중</p>
                            <p className="text-[10px] text-amber-700 mt-1">Whole See →</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
