"use client";

/**
 * INTEL Dashboard — 관측·분석·AI 지휘 허브
 *
 * 3-Pane:
 *  1. Analytics  — Universe 트래픽·전환·리텐션 집계
 *  2. Mindle     — 외부 트렌드 수집·콘텐츠 파이프라인
 *  3. Agent Hub  — 27 에이전트 관제·메시지·지시
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Brain, BarChart3, TrendingUp, Bot,
    Globe, Radio, Layers, MessageSquare,
    Loader2, ArrowRight, Clock, Sparkles, Activity,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface IntelSnapshot {
    // Analytics
    analyticsRows: number;
    analyticsLast: string | null;
    // Mindle
    sourcesActive: number;
    sourcesTotal: number;
    trendsTotal: number;
    trendsToday: number;
    lastCrawl: string | null;
    pipelineCount: number;
    // Agent
    agentsActive: number;
    agentsTotal: number;
    msgs24h: number;
    msgsTotal: number;
    lastMsg: string | null;
}

function relTime(dateStr: string | null): string {
    if (!dateStr) return "미동기화";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

export default function IntelDashboard() {
    const [loading, setLoading] = useState(true);
    const [snap, setSnap] = useState<IntelSnapshot | null>(null);
    const [recentTrends, setRecentTrends] = useState<{ title: string; category: string; created_at: string }[]>([]);
    const [recentMsgs, setRecentMsgs] = useState<{ content: string; agent_id: string; created_at: string }[]>([]);

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            try {
                const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
                const [
                    analyticsCount, analyticsLast,
                    srcTotal, srcActive, lastCrawl,
                    trendsTotal, trendsToday, pipeline,
                    agentsActive, agentsTotal,
                    msgs24h, msgsTotal, lastMsg,
                    trendsData, msgsData,
                ] = await Promise.all([
                    supabase.from("analytics_snapshots").select("*", { count: "exact", head: true }),
                    supabase.from("analytics_snapshots").select("date").order("date", { ascending: false }).limit(1),
                    supabase.from("mindle_sources").select("*", { count: "exact", head: true }),
                    supabase.from("mindle_sources").select("*", { count: "exact", head: true }).eq("is_active", true),
                    supabase.from("mindle_sources").select("last_crawled_at").order("last_crawled_at", { ascending: false }).limit(1),
                    supabase.from("mindle_trends").select("*", { count: "exact", head: true }),
                    supabase.from("mindle_trends").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
                    supabase.from("content_pipeline").select("*", { count: "exact", head: true }),
                    supabase.from("agent_profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
                    supabase.from("agent_profiles").select("*", { count: "exact", head: true }),
                    supabase.from("agent_messages").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 86400000).toISOString()),
                    supabase.from("agent_messages").select("*", { count: "exact", head: true }),
                    supabase.from("agent_messages").select("created_at").order("created_at", { ascending: false }).limit(1),
                    supabase.from("mindle_trends").select("title, category, created_at").order("created_at", { ascending: false }).limit(5),
                    supabase.from("agent_messages").select("content, agent_id, created_at").order("created_at", { ascending: false }).limit(5),
                ]);

                setSnap({
                    analyticsRows: analyticsCount.count ?? 0,
                    analyticsLast: analyticsLast.data?.[0]?.date ?? null,
                    sourcesTotal: srcTotal.count ?? 0,
                    sourcesActive: srcActive.count ?? 0,
                    trendsTotal: trendsTotal.count ?? 0,
                    trendsToday: trendsToday.count ?? 0,
                    lastCrawl: lastCrawl.data?.[0]?.last_crawled_at ?? null,
                    pipelineCount: pipeline.count ?? 0,
                    agentsActive: agentsActive.count ?? 0,
                    agentsTotal: agentsTotal.count ?? 0,
                    msgs24h: msgs24h.count ?? 0,
                    msgsTotal: msgsTotal.count ?? 0,
                    lastMsg: lastMsg.data?.[0]?.created_at ?? null,
                });
                setRecentTrends(trendsData.data ?? []);
                setRecentMsgs(msgsData.data ?? []);
            } catch (err) {
                console.error("INTEL load error:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading || !snap) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Intelligence" description="관측 · 분석 · AI 지휘 허브" />

            {/* Hero — 3 Pillar Status */}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-4 w-4 text-purple-300" />
                    <span className="text-[11px] uppercase tracking-wider text-purple-300 font-semibold">Intelligence Layer</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-[11px] text-neutral-400 mb-1">Analytics 동기화</p>
                        <p className="text-lg font-bold">
                            {snap.analyticsRows > 0 ? `${snap.analyticsRows.toLocaleString()}건` : "대기 중"}
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                            {snap.analyticsLast ? `최근 ${relTime(snap.analyticsLast)}` : "Analytics 연결 필요"}
                        </p>
                    </div>
                    <div>
                        <p className="text-[11px] text-neutral-400 mb-1">Whole See 수집</p>
                        <p className="text-lg font-bold">{snap.trendsTotal.toLocaleString()}건</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                            오늘 +{snap.trendsToday} · 크롤 {relTime(snap.lastCrawl)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[11px] text-neutral-400 mb-1">Agent 활동</p>
                        <p className="text-lg font-bold">{snap.agentsActive}/{snap.agentsTotal} 가동</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                            24h 메시지 {snap.msgs24h}건 · 최근 {relTime(snap.lastMsg)}
                        </p>
                    </div>
                </div>
            </div>

            {/* 3-Pane Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Pane 1: Analytics */}
                <div className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <h2 className="text-sm font-semibold text-neutral-900">Analytics</h2>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-4">Universe 전체 트래픽 · 리텐션 · 퍼널</p>

                    {snap.analyticsRows === 0 ? (
                        <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded p-6 text-center my-auto">
                            <Activity className="h-6 w-6 text-neutral-300 mx-auto mb-2" />
                            <p className="text-xs text-neutral-500">Analytics 데이터 없음</p>
                            <p className="text-[10px] text-neutral-400 mt-1">GA/Plausible 연결 및 동기화 필요</p>
                        </div>
                    ) : (
                        <div className="space-y-2 my-auto">
                            <div className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-neutral-500">스냅샷</span>
                                <span className="text-[11px] font-semibold text-neutral-900">{snap.analyticsRows.toLocaleString()}건</span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-neutral-500">최근 동기화</span>
                                <span className="text-[11px] font-semibold text-neutral-900">{relTime(snap.analyticsLast)}</span>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-neutral-100 mt-4 pt-3 flex gap-2">
                        <Link href="/intra/analytics"
                            className="flex-1 px-3 py-1.5 text-[11px] bg-neutral-900 text-white hover:bg-neutral-700 rounded flex items-center justify-center gap-1">
                            Universe 전체 <ArrowRight className="h-3 w-3" />
                        </Link>
                        <Link href="/intra/analytics/sync"
                            className="px-3 py-1.5 text-[11px] border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded">
                            동기화
                        </Link>
                    </div>
                </div>

                {/* Pane 2: Whole See */}
                <div className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-amber-600" />
                        <h2 className="text-sm font-semibold text-neutral-900">Whole See</h2>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-4">크롤링 · 분류 · 분석 — 유니버스 정보 유입 엔진</p>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between py-1">
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1.5"><Radio className="h-3 w-3" />수집 소스</span>
                            <span className="text-[11px] font-semibold text-neutral-900">{snap.sourcesActive}/{snap.sourcesTotal} 활성</span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1.5"><Sparkles className="h-3 w-3" />트렌드 카드 (AI 분류)</span>
                            <span className="text-[11px] font-semibold text-neutral-900">{snap.trendsTotal.toLocaleString()}건 (오늘 +{snap.trendsToday})</span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1.5"><Layers className="h-3 w-3" />Mindle로 전달 대기</span>
                            <span className="text-[11px] font-semibold text-neutral-900">{snap.pipelineCount}건</span>
                        </div>
                    </div>

                    {recentTrends.length > 0 && (
                        <div className="border-t border-neutral-100 pt-3">
                            <p className="text-[10px] text-neutral-400 mb-2 uppercase tracking-wider">최근 트렌드</p>
                            <div className="space-y-1.5">
                                {recentTrends.slice(0, 3).map((t, i) => (
                                    <div key={i} className="text-[11px]">
                                        <span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-semibold mr-1.5">{t.category || "기타"}</span>
                                        <span className="text-neutral-700 truncate">{t.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-neutral-100 mt-4 pt-3 flex gap-2">
                        <Link href="/intra/intel/wholesee/trends"
                            className="flex-1 px-3 py-1.5 text-[11px] bg-amber-600 text-white hover:bg-amber-700 rounded flex items-center justify-center gap-1">
                            트렌드 카드 <ArrowRight className="h-3 w-3" />
                        </Link>
                        <Link href="/intra/intel/wholesee/sources"
                            className="px-3 py-1.5 text-[11px] border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded">
                            소스
                        </Link>
                    </div>
                </div>

                {/* Pane 3: Agent Hub */}
                <div className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <Bot className="h-5 w-5 text-emerald-600" />
                        <h2 className="text-sm font-semibold text-neutral-900">Agent Hub</h2>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-4">AI 에이전트 관제 · 지시 · 자율 운영</p>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between py-1">
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1.5"><Bot className="h-3 w-3" />에이전트 가동</span>
                            <span className="text-[11px] font-semibold text-neutral-900">{snap.agentsActive}/{snap.agentsTotal}</span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1.5"><MessageSquare className="h-3 w-3" />24h 메시지</span>
                            <span className="text-[11px] font-semibold text-neutral-900">{snap.msgs24h}건</span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1.5"><Clock className="h-3 w-3" />최근 활동</span>
                            <span className="text-[11px] font-semibold text-neutral-900">{relTime(snap.lastMsg)}</span>
                        </div>
                    </div>

                    {recentMsgs.length > 0 && (
                        <div className="border-t border-neutral-100 pt-3">
                            <p className="text-[10px] text-neutral-400 mb-2 uppercase tracking-wider">최근 메시지</p>
                            <div className="space-y-1.5">
                                {recentMsgs.slice(0, 3).map((m, i) => (
                                    <div key={i} className="text-[11px] text-neutral-700 truncate">
                                        <span className="text-neutral-400">[{m.agent_id || "?"}]</span> {m.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-neutral-100 mt-4 pt-3 flex gap-2">
                        <Link href="/intra/agent"
                            className="flex-1 px-3 py-1.5 text-[11px] bg-emerald-600 text-white hover:bg-emerald-700 rounded flex items-center justify-center gap-1">
                            관제 센터 <ArrowRight className="h-3 w-3" />
                        </Link>
                        <Link href="/intra/agent/comm"
                            className="px-3 py-1.5 text-[11px] border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded">
                            지시
                        </Link>
                    </div>
                </div>
            </div>

            {/* Philosophy strip */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-100 rounded">
                        <Brain className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-neutral-900 mb-1">INTEL의 역할 · 3개의 눈</p>
                        <p className="text-[11px] text-neutral-600 leading-relaxed">
                            UNIVERSE가 운영(CRUD)이면, INTEL은 관측·판단·지휘다.
                            <strong className="text-blue-700"> Analytics</strong>로 유니버스 내부를 읽고,
                            <strong className="text-amber-700"> Whole See</strong>로 외부 정보를 크롤링·분류·분석해 유니버스에 들여오고,
                            <strong className="text-emerald-700"> Agent Hub</strong>로 에이전트 군단에게 실행을 지시한다.
                            Whole See가 수집한 정보는 파이프라인을 통해 각 브랜드(특히 Mindle)로 전달된다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
