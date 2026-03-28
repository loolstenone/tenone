"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bot,
  Send,
  RefreshCw,
  Circle,
  MessageSquare,
  ArrowRight,
  Loader2,
  Radio,
  Shield,
  Zap,
  Cpu,
} from "lucide-react";
import type {
  AgentProfile,
  AgentMessage,
  AgentHubResponse,
  RiskLevel,
} from "@/types/agent";

// ── 상수 ──────────────────────────────────────────

const LAYER_BADGE: Record<number, { label: string; color: string }> = {
  0: { label: "L0 메타", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  1: { label: "L1 인프라", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  2: { label: "L2 브랜드", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  3: { label: "L3 서브", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

const TYPE_BADGE: Record<string, { label: string; icon: typeof Bot }> = {
  meta: { label: "메타", icon: Shield },
  infra: { label: "인프라", icon: Cpu },
  brand: { label: "브랜드", icon: Zap },
  sub: { label: "서브", icon: Radio },
};

const RISK_DOT: Record<RiskLevel, string> = {
  green: "text-emerald-400",
  yellow: "text-yellow-400",
  red: "text-red-400",
};

const RISK_BG: Record<RiskLevel, string> = {
  green: "border-emerald-500/20",
  yellow: "border-yellow-500/20",
  red: "border-red-500/20",
};

// ── 채팅 메시지 타입 ────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  agentName?: string;
  timestamp: Date;
}

// ── 메인 컴포넌트 ───────────────────────────────────

export default function AgentDashboardPage() {
  // 에이전트 목록
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);

  // 채팅
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 로그
  const [logs, setLogs] = useState<AgentMessage[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // ── 데이터 페치 ─────────────────────────────────

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
      const res = await fetch("/api/agent/messages?limit=20");
      const json = await res.json();
      setLogs(json.data ?? json ?? []);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchLogs();
  }, [fetchAgents, fetchLogs]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── 채팅 전송 ─────────────────────────────────

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent || sending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/agent/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          agentName: selectedAgent.name,
        }),
      });
      const json = await res.json();

      // successResponse wraps in the data directly based on api-utils
      const hub: AgentHubResponse = json.response ? json : json.data ?? json;

      const agentMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        content: hub.response || hub.error || "응답 없음",
        agentName: hub.agentName,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);

      // 로그 갱신
      fetchLogs();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: "오류가 발생했습니다. 다시 시도해주세요.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── 에이전트 선택 ─────────────────────────────

  const selectAgent = (agent: AgentProfile) => {
    if (selectedAgent?.id !== agent.id) {
      setSelectedAgent(agent);
      setMessages([]);
    }
  };

  // ── 렌더 ──────────────────────────────────────

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4 p-4 bg-[#0B0D17] text-slate-200">
      {/* ── Left: 에이전트 목록 ── */}
      <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col border border-slate-700/50 rounded-lg bg-[#0E1120]">
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-100">에이전트</span>
          </div>
          <button
            onClick={fetchAgents}
            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {agentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </div>
          ) : agents.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              등록된 에이전트 없음
            </p>
          ) : (
            agents.map((agent) => {
              const layer = LAYER_BADGE[agent.layer] ?? LAYER_BADGE[2];
              const typeMeta = TYPE_BADGE[agent.agent_type] ?? TYPE_BADGE.brand;
              const TypeIcon = typeMeta.icon;
              const isSelected = selectedAgent?.id === agent.id;

              return (
                <button
                  key={agent.id}
                  onClick={() => selectAgent(agent)}
                  className={`w-full text-left p-3 rounded-md border transition-all ${
                    isSelected
                      ? "bg-indigo-500/10 border-indigo-500/40"
                      : "bg-transparent border-transparent hover:bg-slate-800/60 hover:border-slate-700/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Circle
                          className={`h-2 w-2 flex-shrink-0 fill-current ${RISK_DOT[agent.risk_level]}`}
                        />
                        <span className="text-sm font-medium text-slate-100 truncate">
                          {agent.display_name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        {agent.name}
                      </p>
                    </div>
                    <div
                      className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                        agent.is_active ? "bg-emerald-400" : "bg-slate-600"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${layer.color}`}
                    >
                      {layer.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-700/40 text-slate-400 border-slate-600/40 flex items-center gap-0.5">
                      <TypeIcon className="h-2.5 w-2.5" />
                      {typeMeta.label}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Center: 채팅 ── */}
      <div className="flex-1 flex flex-col border border-slate-700/50 rounded-lg bg-[#0E1120] min-h-[400px]">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-3">
          <MessageSquare className="h-4 w-4 text-indigo-400" />
          {selectedAgent ? (
            <div>
              <span className="text-sm font-semibold text-slate-100">
                {selectedAgent.display_name}
              </span>
              <span className="text-xs text-slate-500 ml-2 font-mono">
                {selectedAgent.name}
              </span>
            </div>
          ) : (
            <span className="text-sm text-slate-500">
              에이전트를 선택하세요
            </span>
          )}
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!selectedAgent ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <Bot className="h-12 w-12 mb-3" />
              <p className="text-sm">좌측에서 에이전트를 선택하면</p>
              <p className="text-sm">대화를 시작할 수 있습니다</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <MessageSquare className="h-10 w-10 mb-3" />
              <p className="text-sm">
                <span className="text-indigo-400">{selectedAgent.display_name}</span>
                에게 메시지를 보내보세요
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-lg text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600/30 text-slate-100 border border-indigo-500/20"
                      : "bg-slate-800/60 text-slate-200 border border-slate-700/30"
                  }`}
                >
                  {msg.role === "agent" && msg.agentName && (
                    <p className="text-[10px] text-indigo-400 font-mono mb-1">
                      @{msg.agentName}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[10px] text-slate-500 mt-1.5 text-right">
                    {msg.timestamp.toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="px-3.5 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/30">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* 입력 */}
        <div className="p-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedAgent
                  ? `${selectedAgent.display_name}에게 메시지...`
                  : "에이전트를 먼저 선택하세요"
              }
              disabled={!selectedAgent || sending}
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!selectedAgent || !input.trim() || sending}
              className="p-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: 로그 ── */}
      <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col border border-slate-700/50 rounded-lg bg-[#0E1120]">
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-100">메시지 로그</span>
          </div>
          <button
            onClick={fetchLogs}
            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              메시지 로그 없음
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-2.5 rounded-md border bg-slate-800/30 ${RISK_BG[log.risk_level]}`}
              >
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-mono">{log.from_agent}</span>
                  <ArrowRight className="h-2.5 w-2.5 text-slate-600" />
                  <span className="text-slate-300 font-mono">{log.to_agent}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 font-mono">
                    {log.message_type}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Circle
                      className={`h-1.5 w-1.5 fill-current ${RISK_DOT[log.risk_level]}`}
                    />
                    <span className="text-[10px] text-slate-600">
                      {new Date(log.created_at).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                {log.payload?.input && (
                  <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">
                    {log.payload.input}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
