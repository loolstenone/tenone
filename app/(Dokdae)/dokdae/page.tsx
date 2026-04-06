'use client';

/**
 * 독대 — 텐원 × 열시일분 1:1 채팅
 * 모바일 퍼스트. 사이드바 없음. 정보는 채팅 인라인 카드로.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Eye, EyeOff, Plus, Mic, Image as ImageIcon, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── 타입 ─────────────────────────────────────────────────────────

type AuthState = 'loading' | 'ok' | 'login';

interface AgentStatus {
  name: string;
  displayName: string;
  layer: number;
  isActive: boolean;
  riskLevel: string;
}

interface TrendItem {
  title: string;
  summary?: string;
  tags?: string[];
  source?: string;
}

interface InlineCard {
  type: 'agent_status' | 'trend';
  data: AgentStatus[] | TrendItem[];
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
  cards?: InlineCard[];
}

// ── 상수 ─────────────────────────────────────────────────────────

const QUICK = [
  { key: 'morning_briefing', label: 'AM 브리핑'     },
  { key: 'agent_status',     label: '에이전트 현황' },
  { key: 'trend_summary',    label: '트렌드 요약'   },
  { key: 'today_tasks',      label: '오늘 할 일'    },
] as const;

function uid()    { return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }
function timeStr(){ return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }); }
function todayLabel() {
  return new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
}

// ── 인라인 카드 컴포넌트들 ─────────────────────────────────────────

function InlineAgentCard({ agents }: { agents: AgentStatus[] }) {
  const layers = [0, 1, 2];
  const layerLabel: Record<number, string> = { 0: 'ORCHESTRATOR', 1: 'L1 수집·인프라', 2: 'L2 대화형' };

  return (
    <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-2.5">
      <p className="text-[12px] font-semibold text-indigo-400/60 uppercase tracking-widest">Agent Status</p>
      {layers.map(layer => {
        const group = agents.filter(a => a.layer === layer);
        if (!group.length) return null;
        return (
          <div key={layer}>
            <p className="text-[11px] text-slate-700 mb-1.5 uppercase tracking-wide">{layerLabel[layer]}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.map(a => (
                <span key={a.name}
                  className={`inline-flex items-center gap-1 text-[13px] rounded-md px-2 py-1 border ${
                    a.isActive
                      ? 'text-slate-300 border-emerald-500/20 bg-emerald-500/5'
                      : 'text-slate-600 border-white/[0.05] bg-white/[0.02]'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${a.isActive ? 'bg-emerald-400' : 'bg-slate-700'}`}/>
                  {a.displayName}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InlineTrendCard({ trends }: { trends: TrendItem[] }) {
  return (
    <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-2">
      <p className="text-[12px] font-semibold text-purple-400/60 uppercase tracking-widest">Whole See Trends</p>
      {trends.map((t, i) => (
        <div key={i} className={`py-2 ${i < trends.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
          <p className="text-[14px] text-slate-200 leading-snug">{t.title}</p>
          {t.summary && (
            <p className="text-[13px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{t.summary}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {t.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] bg-indigo-500/10 text-indigo-400/70 rounded px-1.5 py-0.5">{tag}</span>
            ))}
            {t.source && (
              <span className="text-[11px] text-slate-700">{t.source}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 타이핑 인디케이터 ──────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-end gap-2 py-1">
      <div className="h-8 w-8 rounded-full bg-[#FEE500]/10 border border-[#FEE500]/20 flex-shrink-0 flex items-center justify-center">
        <span className="text-[8px] font-bold text-[#FEE500]">10</span>
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-[#1e1e2e] px-4 py-2.5">
        <div className="flex gap-1 items-center h-4">
          {[0, 150, 300].map((d, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-bounce"
              style={{ animationDelay: `${d}ms` }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 채팅 버블 ──────────────────────────────────────────────────────

function Bubble({ msg, showAvatar }: { msg: Message; showAvatar: boolean }) {
  const isUser = msg.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end items-end gap-1.5 py-0.5">
        <span className="text-[12px] text-slate-700 self-end shrink-0">{msg.time}</span>
        <div className="max-w-[72%] rounded-2xl rounded-tr-sm bg-[#FEE500] px-3.5 py-2.5">
          <p className="text-[15px] leading-relaxed text-neutral-900 whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 py-0.5">
      {/* 아바타 */}
      <div className={`mt-0.5 h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        showAvatar ? 'bg-[#FEE500]/10 border border-[#FEE500]/20' : 'invisible'
      }`}>
        {showAvatar && <span className="text-[9px] font-bold text-[#FEE500]">10:01</span>}
      </div>
      {/* 버블 + 인라인 카드 + 타임스탬프 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-end gap-1.5">
          <div className="max-w-[78%] rounded-2xl rounded-tl-sm bg-[#1e1e2e] px-3.5 py-2.5">
            <p className="text-[15px] leading-relaxed text-slate-200 whitespace-pre-wrap">{msg.text}</p>
            {/* 인라인 카드 — 트렌드만 */}
            {msg.cards?.map((card, i) => (
              <div key={i}>
                {card.type === 'trend' && (
                  <InlineTrendCard trends={card.data as TrendItem[]}/>
                )}
              </div>
            ))}
          </div>
          <span className="text-[12px] text-slate-700 self-end shrink-0">{msg.time}</span>
        </div>
      </div>
    </div>
  );
}

// ── 날짜 구분선 ────────────────────────────────────────────────────

function DateDivider() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 h-px bg-white/[0.04]"/>
      <span className="text-[12px] text-slate-700 font-medium">{todayLabel()}</span>
      <div className="flex-1 h-px bg-white/[0.04]"/>
    </div>
  );
}

// ── API 응답에서 인라인 카드 추출 ─────────────────────────────────

function extractCards(apiData: Record<string, unknown>): InlineCard[] {
  const raw = apiData.cards as Array<Record<string, unknown>> | undefined;
  if (!raw?.length) return [];

  const agentItems = raw.filter(c => c.type === 'agent_status');
  const trendItems = raw.filter(c => c.type === 'trend');

  const cards: InlineCard[] = [];

  if (agentItems.length) {
    cards.push({
      type: 'agent_status',
      data: agentItems.map(c => ({
        name:        c.name as string,
        displayName: c.displayName as string,
        layer:       c.layer as number,
        isActive:    c.isActive as boolean,
        riskLevel:   c.riskLevel as string,
      })),
    });
  }

  if (trendItems.length) {
    cards.push({
      type: 'trend',
      data: trendItems.map(c => ({
        title:   c.title as string,
        summary: c.summary as string | undefined,
        tags:    c.tags as string[] | undefined,
        source:  c.source as string | undefined,
      })),
    });
  }

  return cards;
}

// ── 로그인 화면 ────────────────────────────────────────────────────

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail]     = useState('');
  const [pw, setPw]           = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    const { error } = await createClient().auth.signInWithPassword({ email, password: pw });
    if (error) { setErr('이메일 또는 비밀번호를 확인하세요.'); setLoading(false); }
    else onSuccess();
  };

  return (
    <div className="min-h-[100dvh] bg-[#101018] flex flex-col items-center justify-center px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-[#FEE500]/10 border border-[#FEE500]/20 flex items-center justify-center">
          <span className="text-base font-bold text-[#FEE500]">10:01</span>
        </div>
        <h1 className="text-xl font-bold text-white">독대</h1>
        <p className="text-[13px] text-slate-600 mt-1">열시일분과의 전용 채널</p>
      </div>
      <form onSubmit={submit} className="w-full max-w-[320px] space-y-2.5">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="이메일" autoComplete="email"
          className="w-full rounded-xl bg-white/[0.05] border border-white/[0.07] px-4 py-3.5 text-[15px] text-white placeholder:text-slate-700 focus:outline-none focus:border-[#FEE500]/30"/>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
            placeholder="비밀번호" autoComplete="current-password"
            className="w-full rounded-xl bg-white/[0.05] border border-white/[0.07] px-4 py-3.5 text-[13px] text-white placeholder:text-slate-700 focus:outline-none focus:border-[#FEE500]/30 pr-12"/>
          <button type="button" onClick={() => setShowPw(p => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
            {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
          </button>
        </div>
        {err && <p className="text-[11px] text-red-400 px-1">{err}</p>}
        <button type="submit" disabled={loading || !email || !pw}
          className="w-full rounded-xl bg-[#FEE500] py-3.5 text-[15px] font-bold text-neutral-900 hover:bg-yellow-300 active:scale-[0.98] disabled:opacity-30 transition-all">
          {loading ? <Loader2 size={16} className="animate-spin mx-auto text-neutral-800"/> : '입장하기'}
        </button>
      </form>
      <p className="mt-12 text-[12px] text-slate-800">Ten:One™ Universe OS</p>
    </div>
  );
}

// ── 채팅 화면 ─────────────────────────────────────────────────────

function SideMenu({ onClose, onSend }: { onClose: () => void; onSend: (label: string, key: string) => void }) {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [agentLoading, setAgentLoading] = useState(true);
  const [agentOpen, setAgentOpen] = useState(false);

  useEffect(() => {
    createClient()
      .from('agent_profiles')
      .select('name, display_name, is_active, layer, risk_level')
      .order('layer', { ascending: true })
      .then(({ data }: { data: Array<{ name: string; display_name: string; is_active: boolean; layer: number; risk_level: string }> | null }) => {
        setAgents((data ?? []).map((a) => ({
          name: a.name,
          displayName: a.display_name,
          layer: a.layer,
          isActive: a.is_active,
          riskLevel: a.risk_level,
        })));
        setAgentLoading(false);
      });
  }, []);

  const layerLabel: Record<number, string> = { 0: 'ORCHESTRATOR', 1: 'L1 수집·인프라', 2: 'L2 대화형' };

  const quickMenuItems = [
    { key: 'morning_briefing', label: 'AM 브리핑',     desc: '오늘 Universe 현황 요약' },
    { key: 'trend_summary',    label: '트렌드 요약',    desc: 'Mindle 주요 신호 3개'   },
    { key: 'today_tasks',      label: '오늘 할 일',     desc: '브랜드별 우선순위 정리'  },
  ];

  const handleQuick = (key: string, label: string) => {
    onSend(label, key);
    onClose();
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div
        className="relative w-80 max-w-[90vw] h-full bg-[#14141f] border-l border-white/[0.06] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <p className="text-[15px] font-semibold text-white">Universe 메뉴</p>
            <p className="text-[12px] text-slate-600 mt-0.5">Ten:One OS</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center text-slate-600 hover:text-slate-300 transition-colors">
            <X size={18}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 빠른 요청 */}
          <div className="px-4 pt-5 pb-3">
            <p className="text-[11px] text-slate-700 uppercase tracking-widest mb-3">빠른 요청</p>
            <div className="space-y-1.5">
              {quickMenuItems.map(item => (
                <button key={item.key} onClick={() => handleQuick(item.key, item.label)}
                  className="w-full flex items-start gap-3 rounded-xl px-3.5 py-3 bg-white/[0.03] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.05] active:scale-[0.98] transition-all text-left">
                  <div>
                    <p className="text-[14px] text-slate-200 font-medium">{item.label}</p>
                    <p className="text-[12px] text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 에이전트 현황 */}
          <div className="px-4 pt-4 pb-3">
            <button
              onClick={() => setAgentOpen(o => !o)}
              className="w-full flex items-center justify-between mb-3 group"
            >
              <p className="text-[11px] text-slate-700 uppercase tracking-widest group-hover:text-slate-500 transition-colors">에이전트 현황</p>
              <span className={`text-[10px] text-slate-700 transition-transform ${agentOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {agentOpen && (
              agentLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 size={18} className="animate-spin text-slate-700"/>
                </div>
              ) : (
                <div className="space-y-4">
                  {[0, 1, 2].map(layer => {
                    const group = agents.filter(a => a.layer === layer);
                    if (!group.length) return null;
                    return (
                      <div key={layer}>
                        <p className="text-[11px] text-slate-700 mb-2 pl-0.5">{layerLabel[layer]}</p>
                        <div className="space-y-1">
                          {group.map(a => (
                            <div key={a.name}
                              className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
                                a.isActive ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-white/[0.05] bg-white/[0.02]'
                              }`}>
                              <div className="flex items-center gap-2.5">
                                <span className={`h-2 w-2 rounded-full flex-shrink-0 ${a.isActive ? 'bg-emerald-400' : 'bg-slate-700'}`}/>
                                <span className={`text-[14px] ${a.isActive ? 'text-slate-200' : 'text-slate-600'}`}>{a.displayName}</span>
                              </div>
                              <span className={`text-[11px] ${a.isActive ? 'text-emerald-500' : 'text-slate-700'}`}>
                                {a.isActive ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>

        {/* 로그아웃 */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-white/[0.06]">
          <button onClick={handleLogout}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-slate-600 hover:text-slate-400 hover:bg-white/[0.03] border border-white/[0.04] hover:border-white/10 transition-all">
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatScreen() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = (smooth = true) =>
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });

  // 이전 대화 로드
  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data }: { data: { user: import('@supabase/supabase-js').User | null } }) => {
      if (!data.user) return;
      const { data: rows } = await sb
        .from('agent_messages')
        .select('from_agent, payload, created_at')
        .eq('message_type', 'dokdae_chat')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: true })
        .limit(60);

      if (rows?.length) {
        const loaded: Message[] = rows.map((row: { from_agent: string; payload: Record<string, unknown>; created_at: string }) => ({
          id: uid(),
          role: row.from_agent === 'user' ? 'user' : 'ai',
          text: (row.payload as { text?: string }).text ?? '',
          time: new Date(row.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          cards: row.from_agent !== 'user' ? extractCards(row.payload as Record<string, unknown>) : undefined,
        }));
        setMessages(loaded);
      }
      setHistoryLoaded(true);
    });
  }, []);

  useEffect(() => { if (historyLoaded) scrollDown(false); }, [historyLoaded]);
  useEffect(() => { if (!isLoading) scrollDown(); }, [messages.length, isLoading]);

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  const send = useCallback(async (text: string, quickAction?: string) => {
    if (!text.trim() || isLoading) return;

    setMessages(prev => [...prev, { id: uid(), role: 'user', text: text.trim(), time: timeStr() }]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const res  = await fetch('/api/agent/dokdae', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), ...(quickAction ? { quickAction } : {}) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '서버 오류');
      const data  = json.data ?? json;
      const cards = extractCards(data);
      setMessages(prev => [...prev, {
        id: uid(), role: 'ai',
        text: data.response || '응답 없음',
        time: timeStr(),
        cards,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: uid(), role: 'ai',
        text: e instanceof Error ? `오류: ${e.message}` : '오류가 발생했습니다.',
        time: timeStr(),
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#101018]">

      {drawerOpen && (
        <SideMenu
          onClose={() => setDrawerOpen(false)}
          onSend={(label, key) => { send(label, key); }}
        />
      )}

      {/* 헤더 */}
      <div className="flex-shrink-0 bg-[#101018] border-b border-white/[0.04]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <div className="h-9 w-9 rounded-full bg-[#FEE500]/10 border border-[#FEE500]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-[#FEE500]">10:01</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-white leading-none">열시일분</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>
              <p className="text-[12px] text-slate-600 leading-none">Universe 오케스트레이터</p>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(true)}
            className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-slate-300 active:scale-90 transition-all">
            <Menu size={20}/>
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
        <div className="max-w-2xl mx-auto px-4 py-3">

          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl bg-[#FEE500]/10 border border-[#FEE500]/15 flex items-center justify-center">
                <span className="text-sm font-bold text-[#FEE500]">10:01</span>
              </div>
              <p className="text-[15px] text-slate-500">지시를 내리거나 Universe 현황을 물어보세요</p>
            </div>
          )}

          {messages.length > 0 && <DateDivider/>}

          {messages.map((msg, i) => {
            const prev = messages[i - 1];
            const showAvatar = msg.role === 'ai' && (!prev || prev.role === 'user');
            return <Bubble key={msg.id} msg={msg} showAvatar={showAvatar}/>;
          })}

          {isLoading && (
            <div className="flex items-end gap-2 py-1">
              <div className="h-8 w-8 rounded-full bg-[#FEE500]/10 border border-[#FEE500]/20 flex-shrink-0 flex items-center justify-center">
                <span className="text-[8px] font-bold text-[#FEE500]">10</span>
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-[#1e1e2e] px-4 py-2.5">
                <div className="flex gap-1 items-center h-4">
                  {[0, 150, 300].map((d, i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}/>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef}/>
        </div>
      </div>

      {/* 퀵 액션 */}
      <div className="flex-shrink-0 border-t border-white/[0.04] bg-[#101018]">
        <div className="max-w-2xl mx-auto flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {QUICK.map(q => (
            <button key={q.key} onClick={() => send(q.label, q.key)} disabled={isLoading}
              className="flex-shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[13px] text-slate-500 hover:text-slate-300 hover:border-white/15 active:scale-95 transition-all disabled:opacity-30">
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* 입력 바 */}
      <div className="flex-shrink-0 bg-[#101018] border-t border-white/[0.04]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-2xl mx-auto flex items-end gap-2 px-3 py-2">
          <button className="flex-shrink-0 h-9 w-9 rounded-full bg-white/[0.05] flex items-center justify-center text-slate-500 hover:text-slate-300 active:scale-90 transition-all">
            <Plus size={18}/>
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="메시지 입력"
            rows={1}
            className="flex-1 resize-none bg-[#1e1e2e] rounded-2xl px-4 py-2.5 text-[15px] text-slate-200 placeholder:text-slate-700 focus:outline-none disabled:opacity-40 leading-relaxed"
            style={{ maxHeight: '100px' }}
          />
          {!input.trim() ? (
            <>
              <button className="flex-shrink-0 h-9 w-9 rounded-full bg-white/[0.05] flex items-center justify-center text-slate-500 hover:text-slate-300 active:scale-90 transition-all">
                <ImageIcon size={17}/>
              </button>
              <button className="flex-shrink-0 h-9 w-9 rounded-full bg-white/[0.05] flex items-center justify-center text-slate-500 hover:text-slate-300 active:scale-90 transition-all">
                <Mic size={17}/>
              </button>
            </>
          ) : (
            <button onClick={() => send(input)} disabled={isLoading}
              className="flex-shrink-0 h-9 w-9 rounded-full bg-[#FEE500] flex items-center justify-center active:scale-90 disabled:opacity-30 transition-all">
              {isLoading
                ? <Loader2 size={15} className="animate-spin text-neutral-800"/>
                : <Send size={15} className="text-neutral-900 ml-0.5"/>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 페이지 ───────────────────────────────────────────────────────

export default function DokdaePage() {
  const [auth, setAuth] = useState<AuthState>('loading');

  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(({ data }: { data: { session: import('@supabase/supabase-js').Session | null } }) => setAuth(data.session ? 'ok' : 'login'));
    const { data: { subscription } } = sb.auth.onAuthStateChange(
      (_event: string, session: import('@supabase/supabase-js').Session | null) =>
        setAuth(session ? 'ok' : 'login'),
    );
    return () => subscription.unsubscribe();
  }, []);

  if (auth === 'loading') return (
    <div className="min-h-[100dvh] bg-[#101018] flex items-center justify-center">
      <div className="h-5 w-5 border-2 border-slate-800 border-t-[#FEE500] rounded-full animate-spin"/>
    </div>
  );

  if (auth === 'login') return <LoginScreen onSuccess={() => setAuth('ok')}/>;
  return <ChatScreen/>;
}
