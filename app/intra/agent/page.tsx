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
  0: { label: "L0 메타", color: "bg-neutral-100 text-neutral-600 border-neutral-200" },
  1: { label: "L1 인프라", color: "bg-neutral-100 text-neutral-600 border-neutral-200" },
  2: { label: "L2 브랜드", color: "bg-neutral-100 text-neutral-600 border-neutral-200" },
  3: { label: "L3 서브", color: "bg-neutral-100 text-neutral-600 border-neutral-200" },
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
  green: "border-emerald-200",
  yellow: "border-yellow-200",
  red: "border-red-200",
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
    <div className="flex flex-col">
      {/* 페이지 헤더 */}
      <div className="border-b border-neutral-200 pb-5 mb-6">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-900">Agent Hub</h1>
        <p className="text-sm text-neutral-400 mt-0.5">AI 에이전트와 대화하고 실행 로그를 확인합니다</p>
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ height: "calc(100vh - 220px)", minHeight: 480 }}>
        {/* ── Left: 에이전트 목록 ── */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col border border-neutral-200 bg-white">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-neutral-900" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">에이전트</span>
            </div>
            <button
              onClick={fetchAgents}
              className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {agentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              </div>
            ) : agents.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">
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
                    className={`w-full text-left p-3 border transition-all ${
                      isSelected
                        ? "bg-neutral-900 border-neutral-900"
                        : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Circle
                            className={`h-2 w-2 flex-shrink-0 fill-current ${RISK_DOT[agent.risk_level]}`}
                          />
                          <span className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-neutral-900"}`}>
                            {agent.display_name}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 font-mono ${isSelected ? "text-neutral-300" : "text-neutral-400"}`}>
                          {agent.name}
                        </p>
                      </div>
                      <div
                        className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                          agent.is_active ? "bg-emerald-400" : "bg-neutral-300"
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 border font-medium ${
                          isSelected
                            ? "bg-white/10 text-neutral-200 border-white/20"
                            : layer.color
                        }`}
                      >
                        {layer.label}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 border flex items-center gap-0.5 ${
                        isSelected
                          ? "bg-white/10 text-neutral-200 border-white/20"
                          : "bg-neutral-100 text-neutral-500 border-neutral-200"
                      }`}>
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
        <div className="flex-1 flex flex-col border border-neutral-200 bg-white min-h-[400px]">
          {/* 헤더 */}
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-3">
            <MessageSquare className="h-4 w-4 text-neutral-900" />
            {selectedAgent ? (
              <div>
                <span className="text-sm font-semibold text-neutral-900">
                  {selectedAgent.display_name}
                </span>
                <span className="text-xs text-neutral-400 ml-2 font-mono">
                  {selectedAgent.name}
                </span>
              </div>
            ) : (
              <span className="text-sm text-neutral-400">
                에이전트를 선택하세요
              </span>
            )}
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!selectedAgent ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-300">
                <Bot className="h-12 w-12 mb-3" />
                <p className="text-sm text-neutral-400">좌측에서 에이전트를 선택하면</p>
                <p className="text-sm text-neutral-400">대화를 시작할 수 있습니다</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-300">
                <MessageSquare className="h-10 w-10 mb-3" />
                <p className="text-sm text-neutral-400">
                  <span className="font-medium text-neutral-600">{selectedAgent.display_name}</span>
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
                    className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-50 border border-neutral-200 text-neutral-900"
                    }`}
                  >
                    {msg.role === "agent" && msg.agentName && (
                      <p className="text-[10px] text-neutral-400 font-mono mb-1">
                        @{msg.agentName}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1.5 text-right ${msg.role === "user" ? "text-neutral-400" : "text-neutral-400"}`}>
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
                <div className="px-3.5 py-2.5 bg-neutral-50 border border-neutral-200">
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 입력 */}
          <div className="p-3 border-t border-neutral-200">
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
                className="flex-1 bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!selectedAgent || !input.trim() || sending}
                className="p-2 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: 로그 ── */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col border border-neutral-200 bg-white">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-neutral-900" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">메시지 로그</span>
            </div>
            <button
              onClick={fetchLogs}
              className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">
                메시지 로그 없음
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2.5 border bg-neutral-50 ${RISK_BG[log.risk_level]}`}
                >
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-neutral-500 font-mono">{log.from_agent}</span>
                    <ArrowRight className="h-2.5 w-2.5 text-neutral-300" />
                    <span className="text-neutral-700 font-mono">{log.to_agent}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 border border-neutral-200 font-mono">
                      {log.message_type}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Circle
                        className={`h-1.5 w-1.5 fill-current ${RISK_DOT[log.risk_level]}`}
                      />
                      <span className="text-[10px] text-neutral-400">
                        {new Date(log.created_at).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  {log.payload?.input && (
                    <p className="text-[11px] text-neutral-400 mt-1.5 line-clamp-2">
                      {log.payload.input}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
