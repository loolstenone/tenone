'use client';

/**
 * 독대 (獨對) — 텐원 × 열시일분 1:1 전용 채널
 * JARVIS 스타일 다크 인터페이스
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Send,
  Loader2,
  Zap,
  TrendingUp,
  Circle,
  Clock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import type { AgentStatusCard, TrendCard } from '@/app/api/agent/dokdae/route';

// ── 타입 ──────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

type SideCard = AgentStatusCard | TrendCard;

// ── 상수 ──────────────────────────────────────────

const QUICK_ACTIONS = [
  { key: 'morning_briefing', label: 'AM 브리핑', icon: Zap },
  { key: 'agent_status', label: '에이전트 현황', icon: Circle },
  { key: 'trend_summary', label: '트렌드 요약', icon: TrendingUp },
  { key: 'today_tasks', label: '오늘 할 일', icon: Clock },
] as const;

const RISK_COLOR: Record<string, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

// ── 유틸 ──────────────────────────────────────────

function uid() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function timeStr() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

// ── 서브 컴포넌트 ──────────────────────────────────

function AgentStatusItem({ card }: { card: AgentStatusCard }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span
        className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
          card.isActive ? RISK_COLOR[card.riskLevel] ?? 'bg-slate-500' : 'bg-slate-700'
        }`}
      />
      <span className="text-xs text-slate-300 flex-1 truncate">{card.displayName}</span>
      <span className="text-[10px] text-slate-600 font-mono">L{card.layer}</span>
    </div>
  );
}

function TrendItem({ card }: { card: TrendCard }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 space-y-1.5">
      <p className="text-xs font-medium text-slate-200 leading-snug line-clamp-2">{card.title}</p>
      {card.summary && (
        <p className="text-[11px] text-slate-500 line-clamp-2">{card.summary}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 flex-wrap">
          {card.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] text-indigo-400/60 bg-indigo-500/10 rounded px-1">
              {tag}
            </span>
          ))}
        </div>
        {card.source && (
          <a
            href={card.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-400 transition-colors"
          >
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────

export default function DokdaePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<SideCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 초기 카드 로드
  const loadCards = useCallback(async () => {
    setCardsLoading(true);
    try {
      const res = await fetch('/api/agent/dokdae', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'init', quickAction: 'agent_status' }),
      });
      if (!res.ok) return;
      const json = await res.json();
      const data = json.data ?? json;
      if (data.cards?.length) setCards(data.cards);
    } catch {
      // 카드 로드 실패는 무시
    } finally {
      setCardsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const sendMessage = useCallback(async (text: string, quickAction?: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: uid(),
      role: 'user',
      content: text.trim(),
      time: timeStr(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/dokdae', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          ...(quickAction ? { quickAction } : {}),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `오류 (${res.status})`);
      }

      const data = json.data ?? json;

      const aiMsg: Message = {
        id: uid(),
        role: 'assistant',
        content: data.response || '응답 없음',
        time: timeStr(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // 카드 업데이트
      if (data.cards?.length) setCards(data.cards);
    } catch (err) {
      const errText = err instanceof Error ? err.message : '알 수 없는 오류';
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'assistant', content: `오류: ${errText}`, time: timeStr() },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const agentCards = cards.filter((c): c is AgentStatusCard => c.type === 'agent_status');
  const trendCards = cards.filter((c): c is TrendCard => c.type === 'trend');

  return (
    // 다크 오버레이 — intra 레이아웃의 흰 배경을 덮는다
    <div className="-mx-3 -my-3 sm:-mx-4 sm:-my-4 lg:-mx-8 lg:-my-6 min-h-[calc(100vh-56px)] lg:min-h-[calc(100vh-80px)] bg-[#06060e] text-slate-100 flex flex-col">
      {/* 헤더 */}
      <div className="border-b border-white/[0.04] px-4 py-3 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-[10px] text-indigo-400 font-bold">1001</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide">독대</h1>
            <p className="text-[10px] text-slate-600">열시일분 × 텐원 전용 채널</p>
          </div>
        </div>
        <button
          onClick={loadCards}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
          title="새로고침"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* 3-panel 본문 */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── 왼쪽: 에이전트 현황 ── */}
        <div className="hidden lg:flex w-52 xl:w-60 flex-shrink-0 flex-col border-r border-white/[0.04]">
          <div className="px-4 py-3 border-b border-white/[0.04]">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">에이전트</p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {cardsLoading ? (
              <div className="flex justify-center pt-6">
                <Loader2 size={14} className="animate-spin text-slate-600" />
              </div>
            ) : agentCards.length === 0 ? (
              <p className="text-[11px] text-slate-700 pt-4">데이터 없음</p>
            ) : (
              agentCards.map((c) => (
                <AgentStatusItem key={c.name} card={c} />
              ))
            )}
          </div>
        </div>

        {/* ── 중앙: 채팅 ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 lg:px-6">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-700">
                <div className="h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Mic size={20} className="text-indigo-400/60" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500">열시일분에게 말을 걸어보세요</p>
                  <p className="text-xs text-slate-700 mt-1">Universe 전체 상황을 파악하고 있습니다</p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-6 w-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[8px] text-indigo-400 font-bold">10</span>
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-xl px-3.5 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600/80 text-white'
                      : 'bg-white/[0.04] border border-white/[0.06] text-slate-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-indigo-300' : 'text-slate-600'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start gap-2">
                <div className="h-6 w-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[8px] text-indigo-400 font-bold">10</span>
                </div>
                <div className="rounded-xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.06]">
                  <Loader2 size={13} className="animate-spin text-slate-500" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* 빠른 명령 */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide lg:px-6">
            {QUICK_ACTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => sendMessage(label, key)}
                disabled={isLoading}
                className="flex items-center gap-1.5 flex-shrink-0 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:border-white/10 transition-all disabled:opacity-40"
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>

          {/* 입력 */}
          <div className="px-4 pb-4 pt-2 border-t border-white/[0.04] flex gap-2 lg:px-6">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="열시일분에게 지시하세요..."
              className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/40 disabled:opacity-50 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-30 transition-colors"
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>

        {/* ── 오른쪽: 트렌드 카드 ── */}
        <div className="hidden xl:flex w-60 2xl:w-72 flex-shrink-0 flex-col border-l border-white/[0.04]">
          <div className="px-4 py-3 border-b border-white/[0.04]">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">트렌드 신호</p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {cardsLoading ? (
              <div className="flex justify-center pt-6">
                <Loader2 size={14} className="animate-spin text-slate-600" />
              </div>
            ) : trendCards.length === 0 ? (
              <p className="text-[11px] text-slate-700 pt-4 px-1">트렌드 데이터 없음</p>
            ) : (
              trendCards.map((c, i) => (
                <TrendItem key={i} card={c} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
