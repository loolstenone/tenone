"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  Send,
  RefreshCw,
  Circle,
  MessageSquare,
  Loader2,
  Clock,
  Users,
  Activity,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";
import type { AgentProfile } from "@/types/agent";

// ── 에이전트 조직도 데이터 (fallback) ────────────────
const AGENT_ORG: {
  name: string;
  display_name: string;
  role: string;
  parent: string | null;
  brand: string;
}[] = [
  { name: "yeolshiiilbun", display_name: "열시일분", role: "오케스트레이터", parent: null, brand: "TenOne" },
  { name: "hero", display_name: "히어로", role: "인재·커리어", parent: "yeolshiiilbun", brand: "HeRo" },
  { name: "wholesee", display_name: "Whole See", role: "트렌드·분석", parent: "yeolshiiilbun", brand: "Mindle" },
  { name: "smarker", display_name: "스마커", role: "마케팅·캠페인", parent: "yeolshiiilbun", brand: "SmarComm" },
  { name: "badak", display_name: "바닥", role: "네트워킹", parent: "yeolshiiilbun", brand: "Badak" },
  { name: "red", display_name: "레드", role: "대학생 프로젝트", parent: "yeolshiiilbun", brand: "MADLeague" },
  { name: "blue", display_name: "블루", role: "지역 동아리", parent: "yeolshiiilbun", brand: "MADLeap" },
  { name: "soebot", display_name: "쇠봇", role: "커뮤니티 운영", parent: "yeolshiiilbun", brand: "Badak" },
  { name: "wio", display_name: "위오", role: "IT 인프라", parent: "yeolshiiilbun", brand: "WIO" },
];

// ── 채팅 메시지 ────────────────────────────────
interface RecentActivity {
  id: string;
  agent_name: string;
  agent_display_name: string;
  content: string;
  created_at: string;
}

interface AgentStat {
  name: string;
  display_name: string;
  last_active: string | null;
  message_count: number;
  is_active: boolean;
}

// ── 메인 컴포넌트 ───────────────────────────────────

export default function AgentDashboardPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // 빠른 지시
  const [selectedAgentName, setSelectedAgentName] = useState("");
  const [commandInput, setCommandInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  // ── 데이터 로드 ─────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // 1. agent_profiles
      const { data: profileData } = await supabase
        .from("agent_profiles")
        .select("*")
        .order("layer", { ascending: true });

      const profiles: AgentProfile[] = profileData ?? [];
      setAgents(profiles);

      // 2. 오늘 날짜 범위
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // 3. chat_messages에서 에이전트 활동 통계
      const { data: messagesData } = await supabase
        .from("chat_messages")
        .select("id, sender_name, sender_display_name, content, created_at")
        .eq("sender_type", "agent")
        .order("created_at", { ascending: false })
        .limit(200);

      const messages = (messagesData ?? []) as { id: string; sender_name: string; sender_display_name: string | null; content: string; created_at: string }[];

      // 에이전트별 통계 계산
      const statsMap = new Map<string, AgentStat>();

      // profiles 기준으로 초기화
      for (const p of profiles) {
        statsMap.set(p.name, {
          name: p.name,
          display_name: p.display_name,
          last_active: null,
          message_count: 0,
          is_active: p.is_active,
        });
      }

      // fallback으로 AGENT_ORG 초기화 (profiles가 비었을 때)
      if (profiles.length === 0) {
        for (const org of AGENT_ORG) {
          statsMap.set(org.name, {
            name: org.name,
            display_name: org.display_name,
            last_active: null,
            message_count: 0,
            is_active: false,
          });
        }
      }

      for (const msg of messages) {
        const agentName = msg.sender_name;
        const existing = statsMap.get(agentName);
        const msgDate = new Date(msg.created_at);
        const isToday = msgDate >= todayStart;

        if (existing) {
          if (!existing.last_active) existing.last_active = msg.created_at;
          if (isToday) existing.message_count++;
        }
      }

      setAgentStats(Array.from(statsMap.values()));

      // 4. 최근 활동 10건
      const recent: RecentActivity[] = messages.slice(0, 10).map((m) => ({
        id: m.id,
        agent_name: m.sender_name,
        agent_display_name: m.sender_display_name || m.sender_name,
        content: m.content,
        created_at: m.created_at,
      }));
      setRecentActivity(recent);

      // 기본 선택 에이전트
      if (!selectedAgentName && profiles.length > 0) {
        setSelectedAgentName(profiles[0].name);
      } else if (!selectedAgentName && profiles.length === 0) {
        setSelectedAgentName(AGENT_ORG[0].name);
      }
    } catch (err) {
      console.error("Agent dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedAgentName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── 빠른 지시 전송 ─────────────────────────────

  const handleSendCommand = async () => {
    if (!commandInput.trim() || !selectedAgentName || sending) return;
    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/agent/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: commandInput.trim(),
          agentName: selectedAgentName,
        }),
      });
      const json = await res.json();
      const response = json.response || json.data?.response || "응답 없음";
      setSendResult(response);
      setCommandInput("");
      // 활동 로그 갱신
      loadData();
    } catch {
      setSendResult("오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  };

  // ── 유틸 ──────────────────────────────────────

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "대기 중";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  const formatTimestamp = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── 조직도 데이터 ──────────────────────────────

  const orgData = AGENT_ORG.map((org) => {
    const profile = agents.find((a) => a.name === org.name);
    const stat = agentStats.find((s) => s.name === org.name);
    return {
      ...org,
      is_active: profile?.is_active ?? false,
      display_name: profile?.display_name ?? org.display_name,
      role: org.role,
      last_active: stat?.last_active ?? null,
      message_count: stat?.message_count ?? 0,
    };
  });

  const orchestrator = orgData.find((a) => a.parent === null);
  const children = orgData.filter((a) => a.parent !== null);

  // ── 렌더 ──────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Team AI Agent" description="AI 에이전트 팀 대시보드" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Team AI Agent" description="AI 에이전트 팀 대시보드" />

      {/* ── Section 1: 조직도 ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-neutral-700" />
          <h2 className="text-sm font-semibold text-neutral-900">조직도</h2>
          <button
            onClick={loadData}
            className="ml-auto p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 오케스트레이터 카드 */}
        {orchestrator && (
          <div className="mb-3">
            <div className="border border-neutral-200 bg-neutral-900 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{orchestrator.display_name}</span>
                    <Circle
                      className={`h-2 w-2 flex-shrink-0 fill-current ${
                        orchestrator.is_active ? "text-emerald-400" : "text-neutral-500"
                      }`}
                    />
                    <span className="text-xs text-neutral-400">{orchestrator.is_active ? "활성" : "대기"}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">{orchestrator.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-neutral-400">{formatTime(orchestrator.last_active)}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">오늘 {orchestrator.message_count}건</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 하위 에이전트 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {children.map((agent) => (
            <div
              key={agent.name}
              className="border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-neutral-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-neutral-900">{agent.display_name}</span>
                      <Circle
                        className={`h-1.5 w-1.5 flex-shrink-0 fill-current ${
                          agent.is_active ? "text-emerald-400" : "text-neutral-300"
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{agent.brand}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">{agent.role}</p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
                <span className="text-[11px] text-neutral-400">{formatTime(agent.last_active)}</span>
                <span className="text-[11px] text-neutral-500">오늘 {agent.message_count}건</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2: 에이전트 상태 ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-neutral-700" />
          <h2 className="text-sm font-semibold text-neutral-900">에이전트 상태</h2>
        </div>

        <div className="border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500">에이전트</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500">상태</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500">마지막 활동</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-neutral-500">오늘 메시지</th>
              </tr>
            </thead>
            <tbody>
              {orgData.map((agent) => (
                <tr key={agent.name} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900">{agent.display_name}</span>
                      <span className="text-[11px] text-neutral-400 font-mono">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 border ${
                        agent.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-neutral-50 text-neutral-500 border-neutral-200"
                      }`}
                    >
                      <Circle
                        className={`h-1.5 w-1.5 fill-current ${
                          agent.is_active ? "text-emerald-500" : "text-neutral-400"
                        }`}
                      />
                      {agent.is_active ? "활성" : "대기"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-neutral-500">{formatTime(agent.last_active)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-xs font-mono text-neutral-700">{agent.message_count}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 3: 최근 활동 ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-neutral-700" />
          <h2 className="text-sm font-semibold text-neutral-900">최근 활동</h2>
        </div>

        <div className="border border-neutral-200 bg-white">
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <MessageSquare className="h-8 w-8 mb-2" />
              <p className="text-sm">에이전트 활동 기록이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentActivity.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900">{item.agent_display_name}</span>
                      <ChevronRight className="h-3 w-3 text-neutral-300" />
                      <span className="text-xs text-neutral-400">{formatTimestamp(item.created_at)}</span>
                    </div>
                    <p className="text-sm text-neutral-600 mt-0.5 line-clamp-2">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Section 4: 빠른 지시 ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Send className="h-4 w-4 text-neutral-700" />
          <h2 className="text-sm font-semibold text-neutral-900">빠른 지시</h2>
        </div>

        <div className="border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-3">
            {/* 에이전트 선택 드롭다운 */}
            <select
              value={selectedAgentName}
              onChange={(e) => setSelectedAgentName(e.target.value)}
              className="w-40 bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
            >
              {orgData.map((agent) => (
                <option key={agent.name} value={agent.name}>
                  {agent.display_name}
                </option>
              ))}
            </select>

            {/* 메시지 입력 */}
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendCommand();
                }
              }}
              placeholder="에이전트에게 지시할 내용을 입력하세요..."
              disabled={sending}
              className="flex-1 bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 disabled:opacity-40"
            />

            {/* 전송 버튼 */}
            <button
              onClick={handleSendCommand}
              disabled={!commandInput.trim() || sending}
              className="px-4 py-2 bg-neutral-900 text-white text-sm hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              전송
            </button>
          </div>

          {/* 전송 결과 */}
          {sendResult && (
            <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 text-sm text-neutral-700">
              <p className="text-[11px] text-neutral-400 mb-1 font-mono">응답</p>
              <p className="whitespace-pre-wrap">{sendResult}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
