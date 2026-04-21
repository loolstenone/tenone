"use client";

import { useState, useEffect } from "react";
import { Clock, Filter, RefreshCw, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AgentLog {
    id: string;
    from_agent: string;
    to_agent: string;
    message_type: string;
    payload: Record<string, unknown>;
    risk_level: string;
    confidence: number | null;
    created_at: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
    user_input:      { label: '사용자 입력', color: 'bg-blue-50 text-blue-600' },
    agent_response:  { label: '에이전트 응답', color: 'bg-emerald-50 text-emerald-600' },
    route:           { label: '라우팅', color: 'bg-amber-50 text-amber-600' },
    invoke:          { label: '호출', color: 'bg-violet-50 text-violet-600' },
    error:           { label: '오류', color: 'bg-red-50 text-red-600' },
    notification:    { label: '알림', color: 'bg-neutral-100 text-neutral-600' },
    dokdae_chat:     { label: '독대', color: 'bg-yellow-50 text-yellow-700' },
};

const riskColors: Record<string, string> = {
    green:  'bg-green-400',
    yellow: 'bg-yellow-400',
    red:    'bg-red-400',
};

export default function AgentLogsPage() {
    const [logs, setLogs] = useState<AgentLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterAgent, setFilterAgent] = useState<string>('all');
    const [agents, setAgents] = useState<string[]>([]);

    const loadLogs = async () => {
        setLoading(true);
        const supabase = createClient();
        let query = supabase
            .from('agent_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (filterType !== 'all') query = query.eq('message_type', filterType);
        if (filterAgent !== 'all') query = query.or(`from_agent.eq.${filterAgent},to_agent.eq.${filterAgent}`);

        const { data } = await query;
        if (data) {
            setLogs(data as AgentLog[]);
            const allAgents = new Set<string>();
            data.forEach((d: AgentLog) => {
                if (d.from_agent && d.from_agent !== 'user') allAgents.add(d.from_agent);
                if (d.to_agent && d.to_agent !== 'user') allAgents.add(d.to_agent);
            });
            setAgents(Array.from(allAgents).sort());
        }
        setLoading(false);
    };

    useEffect(() => { loadLogs(); }, [filterType, filterAgent]);

    const getPreview = (log: AgentLog): string => {
        const p = log.payload;
        if (p.text) return String(p.text).slice(0, 120);
        if (p.input) return String(p.input).slice(0, 120);
        if (p.output) return String(p.output).slice(0, 120);
        return JSON.stringify(p).slice(0, 100);
    };

    return (
        <div>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-base font-semibold text-neutral-900">에이전트 로그</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">agent_messages · 최근 100건</p>
                </div>
                <button onClick={loadLogs} disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    새로고침
                </button>
            </div>

            {/* 필터 */}
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-1.5">
                    <Filter className="h-3 w-3 text-neutral-400" />
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}
                        className="text-[11px] border border-neutral-200 px-2 py-1 focus:outline-none focus:border-neutral-400">
                        <option value="all">전체 타입</option>
                        {Object.entries(typeLabels).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </div>
                <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)}
                    className="text-[11px] border border-neutral-200 px-2 py-1 focus:outline-none focus:border-neutral-400">
                    <option value="all">전체 에이전트</option>
                    {agents.map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>
                <span className="text-[10px] text-neutral-300 self-center ml-auto">{logs.length}건</span>
            </div>

            {/* 로그 목록 */}
            <div className="space-y-1">
                {logs.map(log => {
                    const tl = typeLabels[log.message_type] || typeLabels.notification;
                    return (
                        <div key={log.id} className="flex items-start gap-3 px-3 py-2.5 hover:bg-neutral-50 transition-colors border-b border-neutral-50">
                            {/* 리스크 도트 */}
                            <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${riskColors[log.risk_level] || riskColors.green}`} />

                            {/* 에이전트 흐름 */}
                            <div className="w-36 shrink-0">
                                <div className="flex items-center gap-1 text-[11px]">
                                    <span className="font-medium text-neutral-700">{log.from_agent}</span>
                                    <ArrowRight className="h-2.5 w-2.5 text-neutral-300" />
                                    <span className="font-medium text-neutral-700">{log.to_agent}</span>
                                </div>
                                <span className={`text-[9px] px-1.5 py-0.5 mt-0.5 inline-block ${tl.color}`}>
                                    {tl.label}
                                </span>
                            </div>

                            {/* 내용 */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-neutral-600 truncate">{getPreview(log)}</p>
                                {log.confidence !== null && (
                                    <span className="text-[9px] text-neutral-300 mt-0.5 inline-block">
                                        신뢰도: {(log.confidence * 100).toFixed(0)}%
                                    </span>
                                )}
                            </div>

                            {/* 시간 */}
                            <div className="text-[10px] text-neutral-300 shrink-0 flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {new Date(log.created_at).toLocaleString('ko-KR', {
                                    month: 'numeric', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })}
                            </div>
                        </div>
                    );
                })}

                {logs.length === 0 && !loading && (
                    <div className="text-center py-12 text-neutral-400">
                        <p className="text-xs">로그가 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}
