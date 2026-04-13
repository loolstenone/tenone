"use client";

/**
 * Agent Hub — 관제 센터
 * INTEL > Agent Hub
 *
 * 4탭:
 *  현황판  — 에이전트 그리드 (L0~L3) + 통계
 *  실행 로그 — agent_messages 타임라인
 *  브리핑 — #브리핑 채널 아카이브
 *  대화    — 에이전트와 1:1 대화 (기존 기능 유지)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Bot, RefreshCw, Circle, Send, Loader2, Radio,
    Shield, Zap, Cpu, ArrowRight, MessageSquare,
    Activity, FileText, Sparkles, Clock, CheckCircle,
    AlertCircle, Play,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import type { AgentProfile, AgentMessage } from "@/types/agent";
import type { RiskLevel } from "@/types/agent";
import clsx from "clsx";

// ── 상수 ─────────────────────────────────────────────────────────

const LAYER_INFO: Record<number, { label: string; color: string; bg: string }> = {
    0: { label: "L0 메타", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
    1: { label: "L1 인프라", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    2: { label: "L2 브랜드", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    3: { label: "L3 서브", color: "text-neutral-500", bg: "bg-neutral-50 border-neutral-200" },
};

const TYPE_ICON: Record<string, typeof Bot> = {
    meta: Shield,
    infra: Cpu,
    agent: Zap,
    chatbot: MessageSquare,
};

const RISK_DOT: Record<RiskLevel, string> = {
    green: "text-emerald-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
};

const MSG_TYPE_LABEL: Record<string, string> = {
    user_input: "입력",
    agent_response: "응답",
    vrief: "Vrief",
    briefing: "브리핑",
    task: "작업",
    error: "오류",
};

// ── 채팅 타입 ────────────────────────────────────────────────────

interface ChatMessage {
    id: string;
    role: "user" | "agent";
    content: string;
    agentName?: string;
    timestamp: Date;
}

// ── 메인 페이지 ──────────────────────────────────────────────────

export default function AgentHubPage() {
    const [tab, setTab] = useState<"status" | "logs" | "briefing" | "chat">("status");

    // ── 에이전트 프로필 ──
    const [agents, setAgents] = useState<AgentProfile[]>([]);
    const [agentsLoading, setAgentsLoading] = useState(true);

    // ── 실행 로그 ──
    const [logs, setLogs] = useState<AgentMessage[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // ── 브리핑 ──
    const [briefings, setBriefings] = useState<{ id: string; content: string; created_at: string; sender_name: string }[]>([]);
    const [briefingLoading, setBriefingLoading] = useState(false);

    // ── 대화 ──
    const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
    const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
        try {
            const saved = localStorage.getItem("agent_chat_histories");
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.values(parsed).forEach((msgs: unknown) => {
                    (msgs as ChatMessage[]).forEach(m => { m.timestamp = new Date(m.timestamp); });
                });
                return parsed as Record<string, ChatMessage[]>;
            }
        } catch {}
        return {};
    });
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const messages = selectedAgent ? (chatHistories[selectedAgent.id] ?? []) : [];
    const setMessages = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
        if (!selectedAgent) return;
        const agentId = selectedAgent.id;
        setChatHistories(prev => {
            const current = prev[agentId] ?? [];
            const next = typeof updater === "function" ? updater(current) : updater;
            const updated = { ...prev, [agentId]: next };
            try { localStorage.setItem("agent_chat_histories", JSON.stringify(updated)); } catch {}
            return updated;
        });
    };

    // ── 데이터 페치 ─────────────────────────────────────────────

    const fetchAgents = useCallback(async () => {
        setAgentsLoading(true);
        try {
            const res = await fetch("/api/agent/profiles");
            const json = await res.json();
            setAgents(json.data ?? json ?? []);
        } catch {
            setAgents([]);
        } finally {
            setAgentsLoading(false);
        }
    }, []);

    const fetchLogs = useCallback(async () => {
        setLogsLoading(true);
        try {
            const res = await fetch("/api/agent/messages?limit=30");
            const json = await res.json();
            setLogs(json.data ?? json ?? []);
        } catch {
            setLogs([]);
        } finally {
            setLogsLoading(false);
        }
    }, []);

    const fetchBriefings = useCallback(async () => {
        setBriefingLoading(true);
        try {
            const res = await fetch("/api/chat/thread/468a2734-1819-4eb5-8137-c5a3465a4412/messages?limit=20");
            const json = await res.json();
            setBriefings(json.data ?? json ?? []);
        } catch {
            setBriefings([]);
        } finally {
            setBriefingLoading(false);
        }
    }, []);

    useEffect(() => { fetchAgents(); }, [fetchAgents]);

    useEffect(() => {
        if (tab === "logs" && logs.length === 0) fetchLogs();
        if (tab === "briefing" && briefings.length === 0) fetchBriefings();
        if (tab === "chat" && agents.length > 0 && !selectedAgent) {
            setSelectedAgent(agents[0]);
        }
    }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ── 수동 브리핑 ─────────────────────────────────────────────

    const [triggering, setTriggering] = useState(false);
    const triggerBriefing = async () => {
        setTriggering(true);
        try {
            await fetch("/api/agent/briefing", {
                method: "POST",
                headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? ""}` },
            });
            setTimeout(() => fetchBriefings(), 3000);
        } catch {}
        setTriggering(false);
    };

    // ── 채팅 전송 ────────────────────────────────────────────────

    const handleSend = async () => {
        if (!input.trim() || !selectedAgent || sending) return;
        const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: input.trim(), timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setSending(true);
        try {
            const res = await fetch("/api/agent/hub", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.content, agentName: selectedAgent.name }),
            });
            const json = await res.json();
            const hub = json.response ? json : (json.data ?? json);
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(), role: "agent",
                content: hub.response || hub.error || "응답 없음",
                agentName: hub.agentName,
                timestamp: new Date(),
            }]);
        } catch {
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(), role: "agent",
                content: "오류가 발생했습니다.", timestamp: new Date(),
            }]);
        } finally {
            setSending(false);
        }
    };

    // ── 에이전트 레이어 그룹 ─────────────────────────────────────

    const byLayer = [0, 1, 2, 3].map(l => ({
        layer: l,
        agents: agents.filter(a => a.layer === l),
    })).filter(g => g.agents.length > 0);

    const activeCount = agents.filter(a => a.is_active).length;
    const todayLogs = logs.filter(l => {
        const d = new Date(l.created_at);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }).length;

    // ── 렌더 ─────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title="Agent Hub"
                description="AI 에이전트 팀 운영 관제 센터"
            />

            {/* 통계 바 */}
            {!agentsLoading && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "총 에이전트", value: agents.length, icon: Bot, color: "text-neutral-700" },
                        { label: "활성", value: activeCount, icon: CheckCircle, color: "text-emerald-600" },
                        { label: "오늘 실행", value: todayLogs, icon: Activity, color: "text-blue-600" },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="border border-neutral-200 bg-white px-4 py-3 flex items-center gap-3">
                            <Icon className={clsx("h-5 w-5 shrink-0", color)} />
                            <div>
                                <p className="text-lg font-semibold text-neutral-900">{value}</p>
                                <p className="text-xs text-neutral-400">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 탭 */}
            <div className="flex border-b border-neutral-200 gap-1">
                {(["status", "logs", "briefing", "chat"] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={clsx(
                            "px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px",
                            tab === t
                                ? "border-neutral-900 text-neutral-900"
                                : "border-transparent text-neutral-400 hover:text-neutral-700"
                        )}
                    >
                        {t === "status" && "현황판"}
                        {t === "logs" && "실행 로그"}
                        {t === "briefing" && "브리핑"}
                        {t === "chat" && "대화"}
                    </button>
                ))}
            </div>

            {/* ── 현황판 ── */}
            {tab === "status" && (
                <div className="space-y-5">
                    {agentsLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
                    ) : (
                        byLayer.map(({ layer, agents: layerAgents }) => {
                            const info = LAYER_INFO[layer];
                            return (
                                <div key={layer}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={clsx("text-xs font-semibold px-2 py-0.5 border rounded-full", info.bg, info.color)}>
                                            {info.label}
                                        </span>
                                        <span className="text-xs text-neutral-400">{layerAgents.length}개</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                        {layerAgents.map(agent => {
                                            const TypeIcon = TYPE_ICON[agent.agent_type] ?? Bot;
                                            return (
                                                <button
                                                    key={agent.id}
                                                    onClick={() => { setSelectedAgent(agent); setTab("chat"); }}
                                                    className="text-left p-3 border border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-sm transition-all group"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <TypeIcon className="h-4 w-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
                                                        <Circle className={clsx("h-2 w-2 fill-current shrink-0 mt-0.5", RISK_DOT[agent.risk_level])} />
                                                    </div>
                                                    <p className="text-sm font-medium text-neutral-900 truncate">{agent.display_name}</p>
                                                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{agent.name}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className={clsx(
                                                            "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                                                            agent.is_active ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-400"
                                                        )}>
                                                            {agent.is_active ? "활성" : "비활성"}
                                                        </span>
                                                        <span className="text-[9px] text-neutral-300 group-hover:text-neutral-500 transition-colors">
                                                            대화 →
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ── 실행 로그 ── */}
            {tab === "logs" && (
                <div className="border border-neutral-200 bg-white">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Radio className="h-4 w-4 text-neutral-500" />
                            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">실행 로그</span>
                        </div>
                        <button onClick={fetchLogs} className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors">
                            <RefreshCw className={clsx("h-3.5 w-3.5", logsLoading && "animate-spin")} />
                        </button>
                    </div>
                    <div className="divide-y divide-neutral-50">
                        {logsLoading ? (
                            <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                        ) : logs.length === 0 ? (
                            <p className="text-xs text-neutral-400 text-center py-12">로그 없음</p>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50">
                                    <Circle className={clsx("h-2 w-2 fill-current shrink-0", RISK_DOT[log.risk_level])} />
                                    <div className="flex items-center gap-1.5 text-xs min-w-0 flex-1">
                                        <span className="font-mono text-neutral-700 font-medium">{log.from_agent}</span>
                                        <ArrowRight className="h-3 w-3 text-neutral-300 shrink-0" />
                                        <span className="font-mono text-neutral-500">{log.to_agent}</span>
                                        <span className="ml-2 px-1.5 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] rounded font-mono shrink-0">
                                            {MSG_TYPE_LABEL[log.message_type] ?? log.message_type}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-neutral-400 shrink-0">
                                        {new Date(log.created_at).toLocaleString("ko-KR", {
                                            month: "2-digit", day: "2-digit",
                                            hour: "2-digit", minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ── 브리핑 ── */}
            {tab === "briefing" && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-neutral-500" />
                            <span className="text-sm font-medium text-neutral-700">#브리핑 채널 아카이브</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={fetchBriefings} className="p-1.5 text-neutral-400 hover:text-neutral-700 border border-neutral-200 rounded transition-colors">
                                <RefreshCw className={clsx("h-3.5 w-3.5", briefingLoading && "animate-spin")} />
                            </button>
                            <button
                                onClick={triggerBriefing}
                                disabled={triggering}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded hover:bg-neutral-700 disabled:opacity-40 transition-colors"
                            >
                                <Play className="h-3 w-3" />
                                {triggering ? "발행 중..." : "지금 브리핑"}
                            </button>
                        </div>
                    </div>

                    {briefingLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                    ) : briefings.length === 0 ? (
                        <div className="border border-neutral-200 bg-white p-8 text-center">
                            <Sparkles className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
                            <p className="text-sm text-neutral-400 mb-1">아직 브리핑이 없습니다</p>
                            <p className="text-xs text-neutral-300">매일 10:01 자동 발행 · 또는 위의 "지금 브리핑" 클릭</p>
                        </div>
                    ) : (
                        briefings.map(b => (
                            <div key={b.id} className="border border-neutral-200 bg-white p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Bot className="h-4 w-4 text-neutral-400" />
                                    <span className="text-xs font-semibold text-neutral-700">{b.sender_name}</span>
                                    <span className="ml-auto text-[11px] text-neutral-400 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(b.created_at).toLocaleString("ko-KR", {
                                            month: "long", day: "numeric",
                                            hour: "2-digit", minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{b.content}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── 대화 ── */}
            {tab === "chat" && (
                <div className="flex gap-4" style={{ height: "calc(100vh - 340px)", minHeight: 400 }}>
                    {/* 에이전트 선택 */}
                    <div className="w-56 flex-shrink-0 flex flex-col border border-neutral-200 bg-white">
                        <div className="px-3 py-2.5 border-b border-neutral-100">
                            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">에이전트 선택</span>
                        </div>
                        <div className="flex-1 overflow-y-auto py-1">
                            {agentsLoading ? (
                                <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-neutral-300" /></div>
                            ) : (
                                agents.map(agent => (
                                    <button
                                        key={agent.id}
                                        onClick={() => setSelectedAgent(agent)}
                                        className={clsx(
                                            "w-full text-left px-3 py-2 transition-colors",
                                            selectedAgent?.id === agent.id
                                                ? "bg-neutral-900 text-white"
                                                : "hover:bg-neutral-50 text-neutral-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <Circle className={clsx("h-1.5 w-1.5 fill-current shrink-0", RISK_DOT[agent.risk_level])} />
                                            <span className="text-xs font-medium truncate">{agent.display_name}</span>
                                        </div>
                                        <span className={clsx("text-[10px] font-mono ml-3", selectedAgent?.id === agent.id ? "text-neutral-400" : "text-neutral-400")}>
                                            {agent.name}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 채팅 */}
                    <div className="flex-1 flex flex-col border border-neutral-200 bg-white">
                        <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-neutral-400" />
                            {selectedAgent ? (
                                <span className="text-sm font-medium text-neutral-800">{selectedAgent.display_name}</span>
                            ) : (
                                <span className="text-sm text-neutral-400">에이전트를 선택하세요</span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {!selectedAgent ? (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-300">
                                    <Bot className="h-10 w-10 mb-2" />
                                    <p className="text-sm text-neutral-400">좌측에서 에이전트 선택</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <p className="text-sm text-neutral-400">{selectedAgent.display_name}에게 메시지를 보내세요</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={clsx("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                                        <div className={clsx(
                                            "max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed",
                                            msg.role === "user"
                                                ? "bg-neutral-900 text-white"
                                                : "bg-neutral-50 border border-neutral-200 text-neutral-900"
                                        )}>
                                            {msg.role === "agent" && msg.agentName && (
                                                <p className="text-[10px] text-neutral-400 font-mono mb-1">@{msg.agentName}</p>
                                            )}
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                            <p className="text-[10px] mt-1 text-right text-neutral-400">
                                                {msg.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            {sending && (
                                <div className="flex justify-start">
                                    <div className="px-3.5 py-2.5 bg-neutral-50 border border-neutral-200">
                                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-3 border-t border-neutral-100">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    placeholder={selectedAgent ? `${selectedAgent.display_name}에게...` : "에이전트를 먼저 선택"}
                                    disabled={!selectedAgent || sending}
                                    className="flex-1 bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 disabled:opacity-40"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!selectedAgent || !input.trim() || sending}
                                    className="p-2 bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-30 transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
