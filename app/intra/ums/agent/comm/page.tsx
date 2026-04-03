"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/intra/IntraUI";
import * as chatDb from "@/lib/supabase/chat";
import {
    MessageSquare, Bot, RefreshCw, ExternalLink,
    Hash, Clock, Send, AlertCircle, CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

interface ChannelSummary {
    channel: chatDb.ChatThread;
    latestMessage: chatDb.ChatMessage | null;
    messageCount: number;
}

export default function AgentCommPage() {
    const [channels, setChannels] = useState<chatDb.ChatThread[]>([]);
    const [summaries, setSummaries] = useState<ChannelSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState<string | null>(null);
    const [triggerResult, setTriggerResult] = useState<{ action: string; message: string; ok: boolean } | null>(null);

    const loadChannels = async () => {
        setLoading(true);
        const ch = await chatDb.fetchChannels();
        setChannels(ch);
        const summaryData: ChannelSummary[] = await Promise.all(
            ch.map(async (channel) => {
                const msgs = await chatDb.fetchMessages(channel.id, 5);
                return {
                    channel,
                    latestMessage: msgs[msgs.length - 1] || null,
                    messageCount: msgs.length,
                };
            })
        );
        setSummaries(summaryData);
        setLoading(false);
    };

    useEffect(() => { loadChannels(); }, []);

    const triggerAction = async (endpoint: string, action: string, label: string) => {
        const key = `${endpoint}:${action}`;
        setTriggering(key);
        setTriggerResult(null);
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_KEY || ''}` },
                body: JSON.stringify({ action }),
            });
            if (res.status === 401) {
                setTriggerResult({ action: label, message: '인증 필요 — 서버에서 실행하세요', ok: false });
            } else {
                const data = await res.json();
                let msg = '';
                if (action === 'crawl' && endpoint.includes('opportunity')) {
                    msg = `${data.sources || 0}개 소스에서 ${data.collected || 0}건 수집`;
                } else if (action === 'process' && endpoint.includes('opportunity')) {
                    msg = `${data.processed || 0}건 발굴 (${data.skipped || 0}건 제외)`;
                } else if (action === 'crawl') {
                    msg = `${data.sources || 0}개 소스에서 ${data.collected || 0}건 수집`;
                } else {
                    msg = `${data.processed || 0}건 발행 (${data.skipped || 0}건 제외)`;
                }
                setTriggerResult({ action: label, message: msg, ok: res.ok });
            }
        } catch {
            setTriggerResult({ action: label, message: '요청 실패', ok: false });
        }
        setTriggering(null);
        setTimeout(() => setTriggerResult(null), 5000);
    };

    const formatTime = (isoStr: string) => {
        try {
            return new Date(isoStr).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return isoStr; }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="에이전트 소통"
                description="AI 에이전트 채널 현황 및 메시지 모니터링"
            />

            {/* 액션 버튼 */}
            <div className="space-y-2">
                <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wide">Mindle 트렌드</p>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => triggerAction('/api/crawler', 'crawl', 'RSS 크롤')}
                        disabled={!!triggering}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                    >
                        {triggering === '/api/crawler:crawl' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        RSS 크롤
                    </button>
                    <button
                        onClick={() => triggerAction('/api/crawler', 'process', '트렌드 생성')}
                        disabled={!!triggering}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-neutral-300 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                    >
                        {triggering === '/api/crawler:process' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        트렌드 카드 생성
                    </button>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wide pt-1">비즈니스 기회</p>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => triggerAction('/api/opportunity/crawl', 'crawl', '기회 크롤')}
                        disabled={!!triggering}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {triggering === '/api/opportunity/crawl:crawl' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        공모전/지원사업 수집
                    </button>
                    <button
                        onClick={() => triggerAction('/api/opportunity/crawl', 'process', '기회 AI 분석')}
                        disabled={!!triggering}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-blue-300 text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                    >
                        {triggering === '/api/opportunity/crawl:process' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        AI 관련성 분석
                    </button>
                </div>
                <div className="flex items-center gap-2 pt-1">
                    <button
                        onClick={loadChannels}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                        <RefreshCw className="h-3.5 w-3.5 text-neutral-400" />
                        새로고침
                    </button>
                    <Link
                        href="/intra/myverse/messenger"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                        <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                        메신저 전체 보기
                    </Link>
                </div>
            </div>

            {/* 액션 결과 */}
            {triggerResult && (
                <div className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 text-xs",
                    triggerResult.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
                )}>
                    {triggerResult.ok
                        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                    <span className="font-medium">{triggerResult.action}</span>
                    <span className="text-neutral-500 mx-1">—</span>
                    <span>{triggerResult.message}</span>
                </div>
            )}

            {/* 채널 카드 그리드 */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="bg-white border border-neutral-200 p-5 animate-pulse">
                            <div className="h-4 bg-neutral-100 rounded w-2/3 mb-3" />
                            <div className="h-3 bg-neutral-100 rounded w-full mb-2" />
                            <div className="h-3 bg-neutral-100 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            ) : summaries.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
                    <MessageSquare className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">채널이 없습니다</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summaries.map(({ channel, latestMessage }) => (
                        <div key={channel.id} className="bg-white border border-neutral-200 hover:border-neutral-300 transition-colors">
                            {/* 채널 헤더 */}
                            <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
                                <Hash className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                <span className="text-sm font-medium text-neutral-800 flex-1 truncate">{channel.name}</span>
                                {channel.agent_name && (
                                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 shrink-0">
                                        <Bot className="h-2.5 w-2.5" />
                                        {channel.agent_name}
                                    </span>
                                )}
                            </div>

                            {/* 채널 설명 */}
                            {channel.description && (
                                <div className="px-4 pt-2.5 pb-0">
                                    <p className="text-[11px] text-neutral-400 leading-relaxed">{channel.description}</p>
                                </div>
                            )}

                            {/* 최근 메시지 */}
                            <div className="px-4 py-3">
                                {latestMessage ? (
                                    <div className="flex items-start gap-2">
                                        <div className={clsx(
                                            "h-5 w-5 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5",
                                            latestMessage.sender_type === 'agent' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-500'
                                        )}>
                                            {latestMessage.sender_type === 'agent' ? 'AI' : (latestMessage.sender_name || '?').slice(0, 1)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-[10px] font-medium text-neutral-600">{latestMessage.sender_name}</span>
                                                <span className="text-[9px] text-neutral-300 flex items-center gap-0.5">
                                                    <Clock className="h-2 w-2" />
                                                    {formatTime(latestMessage.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                                                {latestMessage.content}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-neutral-300 text-center py-1">아직 메시지 없음</p>
                                )}
                            </div>

                            {/* 채널 링크 */}
                            <div className="px-4 pb-3">
                                <Link
                                    href="/intra/myverse/messenger"
                                    className="text-[10px] text-neutral-400 hover:text-neutral-700 flex items-center gap-1 transition-colors"
                                >
                                    <ExternalLink className="h-2.5 w-2.5" />
                                    채널 열기
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cron 스케줄 안내 */}
            <div className="bg-neutral-50 border border-neutral-200 px-5 py-4">
                <p className="text-xs font-medium text-neutral-600 mb-3">Vercel Cron 스케줄</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: '통합 크롤', schedule: 'AM 9:00 KST (daily)', path: '/api/cron/all-crawl' },
                        { label: '통합 처리 + 브리핑', schedule: 'AM 9:30 KST (daily)', path: '/api/cron/all-process' },
                    ].map(item => (
                        <div key={item.label} className="text-[11px]">
                            <p className="font-medium text-neutral-700">{item.label}</p>
                            <p className="text-neutral-400">{item.schedule}</p>
                            <p className="text-[9px] text-neutral-300 font-mono mt-0.5">{item.path}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
