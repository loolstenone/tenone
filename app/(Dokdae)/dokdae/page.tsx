'use client';

/**
 * 독대 — 텐원 × 열시일분 1:1 채팅
 * 모바일 퍼스트. 사이드바 없음. 정보는 채팅 인라인 카드로.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Eye, EyeOff, Plus, Mic, Image as ImageIcon, Menu, X, Search } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

// ── 타입 ─────────────────────────────────────────────────────────

type AuthState = 'loading' | 'ok' | 'login';

interface AgentStatus {
  name: string;
  displayName: string;
  layer: number;
  isActive: boolean;
  riskLevel: string;
  role?: string;
}

interface SelectedAgent {
  name: string;          // '_group' 이면 단체방 모드
  displayName: string;
  role: string;
}

const GROUP_AGENT: SelectedAgent = {
  name: '_group',
  displayName: 'Universe 단체방',
  role: '텐원 AI 팀 전체',
};

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
  role: 'user' | 'ai' | 'router';
  text: string;
  time: string;
  cards?: InlineCard[];
  error?: boolean;
  retryText?: string;
  retryAction?: string;
  // 단체방 모드에서 발신 에이전트 식별
  agentName?: string;
  agentDisplayName?: string;
  agentLayer?: number;
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
    <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.06] p-3.5 space-y-3">
      <p className="text-[12px] font-semibold text-indigo-300/70 uppercase tracking-widest">Agent Status</p>
      {layers.map(layer => {
        const group = agents.filter(a => a.layer === layer);
        if (!group.length) return null;
        return (
          <div key={layer}>
            <p className="text-[12px] text-slate-400 mb-2 uppercase tracking-wide">{layerLabel[layer]}</p>
            <div className="flex flex-wrap gap-2">
              {group.map(a => (
                <span key={a.name}
                  className={`inline-flex items-center gap-1.5 text-[13px] rounded-lg px-2.5 py-1.5 border ${
                    a.isActive
                      ? 'text-white border-emerald-400/30 bg-emerald-400/10'
                      : 'text-slate-500 border-white/[0.08] bg-white/[0.03]'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${a.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`}/>
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
    <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.06] p-3.5 space-y-2.5">
      <p className="text-[12px] font-semibold text-purple-300/70 uppercase tracking-widest">Whole See Trends</p>
      {trends.map((t, i) => (
        <div key={i} className={`py-2 ${i < trends.length - 1 ? 'border-b border-white/[0.08]' : ''}`}>
          <p className="text-[15px] text-white leading-snug font-medium">{t.title}</p>
          {t.summary && (
            <p className="text-[14px] text-slate-400 mt-1 leading-snug line-clamp-2">{t.summary}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {t.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-[12px] bg-indigo-400/15 text-indigo-300 rounded-md px-2 py-0.5">{tag}</span>
            ))}
            {t.source && (
              <span className="text-[12px] text-slate-500">{t.source}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 간단 마크다운 렌더링 ──────────────────────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="mt-2 mb-2 rounded-lg bg-black/30 border border-white/10 px-3 py-2 overflow-x-auto">
            <code className="text-[13px] text-emerald-300 font-mono">{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(line); continue; }

    if (line.startsWith('## ')) {
      elements.push(<p key={i} className="text-[15px] font-bold text-white mt-3 mb-1">{line.slice(3)}</p>);
    } else if (line.startsWith('### ')) {
      elements.push(<p key={i} className="text-[14px] font-semibold text-slate-200 mt-2 mb-1">{line.slice(4)}</p>);
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="text-slate-500 mt-0.5">•</span>
          <span className="flex-1">{formatInline(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\.\s/)?.[1];
      elements.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="text-slate-400 text-[14px] font-mono min-w-[1.2em]">{num}.</span>
          <span className="flex-1">{formatInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else if (line.startsWith('|') && line.endsWith('|')) {
      // 테이블 행 — 구분선(---)은 스킵
      if (line.includes('---')) continue;
      const cells = line.split('|').filter(c => c.trim());
      elements.push(
        <div key={i} className="flex gap-3 text-[13px] py-0.5">
          {cells.map((c, ci) => <span key={ci} className={ci === 0 ? 'text-slate-300 min-w-[80px]' : 'text-slate-400 flex-1'}>{c.trim()}</span>)}
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(<p key={i}>{formatInline(line)}</p>);
    }
  }
  return elements;
}

function formatInline(text: string): React.ReactNode {
  // **bold** · `code` · @멘션 — 한 번에 토큰화
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|@\w+)/g);
  return tokens.map((tk, i) => {
    if (tk.startsWith('**') && tk.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{tk.slice(2, -2)}</strong>;
    }
    if (tk.startsWith('`') && tk.endsWith('`')) {
      return <code key={i} className="text-[13px] bg-white/10 px-1 py-0.5 rounded text-emerald-300 font-mono">{tk.slice(1, -1)}</code>;
    }
    if (/^@\w+$/.test(tk)) {
      return <span key={i} className="text-[#FEE500] font-medium bg-[#FEE500]/10 rounded px-1">{tk}</span>;
    }
    return tk;
  });
}

// ── 채팅 버블 ──────────────────────────────────────────────────────

// 에이전트별 색상 (단체방에서 발신자 구분용)
function agentAccent(layer?: number) {
  switch (layer) {
    case 0: return { dot: 'bg-[#FEE500]', text: 'text-[#FEE500]', bg: 'bg-[#FEE500]', ring: 'ring-[#FEE500]/40' };
    case 1: return { dot: 'bg-emerald-400', text: 'text-emerald-300', bg: 'bg-emerald-500', ring: 'ring-emerald-400/30' };
    case 2: return { dot: 'bg-indigo-400', text: 'text-indigo-300', bg: 'bg-indigo-500', ring: 'ring-indigo-400/30' };
    case 3: return { dot: 'bg-purple-400', text: 'text-purple-300', bg: 'bg-purple-500', ring: 'ring-purple-400/30' };
    default: return { dot: 'bg-slate-400', text: 'text-slate-300', bg: 'bg-slate-600', ring: 'ring-slate-400/30' };
  }
}

// 에이전트 이니셜 (한글 1자, 영문 알파벳은 첫 글자 대문자)
function agentInitial(name?: string, displayName?: string): string {
  if (!displayName && !name) return '?';
  const src = displayName ?? name ?? '';
  // 한글이면 첫 글자 1자
  if (/[ㄱ-힝]/.test(src[0] ?? '')) return src[0];
  // 영문/숫자면 대문자 1~2자
  const upper = src.match(/[A-Za-z0-9]+/)?.[0] ?? src;
  return upper.slice(0, 2).toUpperCase();
}

// 에이전트 아바타 — 이니셜 + layer 컬러
function AgentAvatar({ name, displayName, layer, size = 36 }: {
  name?: string; displayName?: string; layer?: number; size?: number;
}) {
  const accent = agentAccent(layer);
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold ${accent.bg} ring-1 ${accent.ring}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      title={displayName ?? name}
    >
      <span className={layer === 0 ? 'text-neutral-900' : ''}>{agentInitial(name, displayName)}</span>
    </div>
  );
}

function Bubble({ msg, showAvatar, onRetry }: { msg: Message; showAvatar: boolean; onRetry?: (text: string, action?: string) => void }) {
  const isUser = msg.role === 'user';
  const isRouter = msg.role === 'router';

  if (isUser) {
    return (
      <div className="flex justify-end items-end gap-2 py-0.5">
        <span className="text-[13px] text-slate-500 self-end shrink-0">{msg.time}</span>
        <div className="max-w-[72%] rounded-2xl rounded-tr-sm bg-[#FEE500] px-4 py-3">
          <p className="text-[16px] leading-relaxed text-neutral-900 font-medium whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>
    );
  }

  // 라우터 메모 — 중앙 정렬 슬림 박스 (1001이 누구를 호출하는지)
  if (isRouter) {
    return (
      <div className="flex justify-center py-1">
        <div className="rounded-full bg-white/[0.04] border border-white/[0.08] px-3 py-1">
          <p className="text-[12px] text-slate-400">
            <span className="text-[#FEE500]">1001</span> · {msg.text}
          </p>
        </div>
      </div>
    );
  }

  const accent = agentAccent(msg.agentLayer);
  const hasAgentInfo = !!msg.agentName || !!msg.agentDisplayName;

  return (
    <div className="flex items-start gap-2.5 py-0.5">
      {/* 아바타 — 에이전트 정보 있으면 이니셜 아바타, 없으면 텐원 로고 (legacy 1001) */}
      <div className={`mt-0.5 flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
        {showAvatar && (
          hasAgentInfo
            ? <AgentAvatar name={msg.agentName} displayName={msg.agentDisplayName} layer={msg.agentLayer} size={36} />
            : (
              <div className="h-9 w-9 rounded-full overflow-hidden bg-black border border-white/10">
                <Image src="/logo-tenone.png" alt="Ten:One" width={36} height={36} className="object-cover w-full h-full"/>
              </div>
            )
        )}
      </div>
      {/* 버블 + 인라인 카드 + 타임스탬프 */}
      <div className="flex-1 min-w-0">
        {/* 단체방: 발신 에이전트 라벨 (showAvatar일 때만, 연속 발화는 생략) */}
        {msg.agentDisplayName && showAvatar && (
          <div className="flex items-center gap-1.5 mb-1 ml-1">
            <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
            <span className={`text-[12px] font-medium ${accent.text}`}>{msg.agentDisplayName}</span>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className={`max-w-[78%] rounded-2xl rounded-tl-sm px-4 py-3 ${msg.error ? 'bg-red-900/30 border border-red-500/20' : 'bg-[#222336]'}`}>
            <div className="text-[16px] leading-relaxed text-white">{renderMarkdown(msg.text)}</div>
            {msg.error && msg.retryText && onRetry && (
              <button onClick={() => onRetry(msg.retryText!, msg.retryAction)}
                className="mt-2 text-[13px] text-red-300 hover:text-white border border-red-500/30 rounded-lg px-3 py-1.5 hover:bg-red-500/20 transition-all">
                재시도
              </button>
            )}
            {msg.cards?.map((card, i) => (
              <div key={i}>
                {card.type === 'agent_status' && (
                  <InlineAgentCard agents={card.data as AgentStatus[]}/>
                )}
                {card.type === 'trend' && (
                  <InlineTrendCard trends={card.data as TrendItem[]}/>
                )}
              </div>
            ))}
          </div>
          <span className="text-[13px] text-slate-500 self-end shrink-0">{msg.time}</span>
        </div>
      </div>
    </div>
  );
}

// ── 날짜 구분선 ────────────────────────────────────────────────────

function DateDivider() {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="flex-1 h-px bg-white/[0.08]"/>
      <span className="text-[13px] text-slate-400 font-medium">{todayLabel()}</span>
      <div className="flex-1 h-px bg-white/[0.08]"/>
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
    <div className="min-h-[100dvh] bg-[#0d0e1a] flex flex-col items-center justify-center px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 h-16 w-16 rounded-2xl overflow-hidden bg-black border border-white/10">
          <Image src="/logo-tenone.png" alt="Ten:One" width={64} height={64} className="object-cover w-full h-full"/>
        </div>
        <h1 className="text-2xl font-bold text-white">독대</h1>
        <p className="text-[15px] text-slate-400 mt-1.5">열시일분과의 전용 채널</p>
      </div>
      <form onSubmit={submit} className="w-full max-w-[320px] space-y-3">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="이메일" autoComplete="email"
          className="w-full rounded-xl bg-white/[0.07] border border-white/10 px-4 py-3.5 text-[16px] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FEE500]/40"/>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
            placeholder="비밀번호" autoComplete="current-password"
            className="w-full rounded-xl bg-white/[0.07] border border-white/10 px-4 py-3.5 text-[16px] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FEE500]/40 pr-12"/>
          <button type="button" onClick={() => setShowPw(p => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
            {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>
        </div>
        {err && <p className="text-[13px] text-red-400 px-1">{err}</p>}
        <button type="submit" disabled={loading || !email || !pw}
          className="w-full rounded-xl bg-[#FEE500] py-4 text-[16px] font-bold text-neutral-900 hover:bg-yellow-300 active:scale-[0.98] disabled:opacity-30 transition-all">
          {loading ? <Loader2 size={18} className="animate-spin mx-auto text-neutral-800"/> : '입장하기'}
        </button>
      </form>
      <p className="mt-12 text-[13px] text-slate-600">Ten:One™ Universe OS</p>
    </div>
  );
}

// ── 사이드 메뉴 ────────────────────────────────────────────────────

function SideMenu({
  onClose,
  onSend,
  selectedAgent,
  onSelectAgent,
}: {
  onClose: () => void;
  onSend: (label: string, key: string) => void;
  selectedAgent: SelectedAgent;
  onSelectAgent: (agent: SelectedAgent) => void;
}) {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [agentLoading, setAgentLoading] = useState(true);
  const [agentOpen, setAgentOpen] = useState(true);

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
  const layerRole: Record<number, string> = { 0: '오케스트레이터', 1: '수집·인프라 에이전트', 2: '대화형 에이전트' };

  const handleSelectAgent = (a: AgentStatus) => {
    onSelectAgent({
      name: a.name,
      displayName: a.displayName,
      role: layerRole[a.layer] ?? '에이전트',
    });
    onClose();
  };

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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
      <div
        className="relative w-80 max-w-[90vw] h-full bg-[#12132a] border-l border-white/10 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <p className="text-[16px] font-semibold text-white">Universe 메뉴</p>
            <p className="text-[13px] text-slate-400 mt-0.5">Ten:One OS</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={20}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 빠른 요청 */}
          <div className="px-4 pt-5 pb-3">
            <p className="text-[12px] text-slate-500 uppercase tracking-widest mb-3">빠른 요청</p>
            <div className="space-y-2">
              {quickMenuItems.map(item => (
                <button key={item.key} onClick={() => handleQuick(item.key, item.label)}
                  className="w-full flex items-start gap-3 rounded-xl px-4 py-3.5 bg-white/[0.05] border border-white/10 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98] transition-all text-left">
                  <div>
                    <p className="text-[15px] text-white font-medium">{item.label}</p>
                    <p className="text-[13px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 단체방 진입 */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-[12px] text-slate-500 uppercase tracking-widest mb-3">채널</p>
            <button
              onClick={() => { onSelectAgent(GROUP_AGENT); onClose(); }}
              className={`w-full flex items-center justify-between rounded-xl px-4 py-3.5 border transition-all active:scale-[0.98] text-left ${
                selectedAgent.name === '_group'
                  ? 'border-[#FEE500]/40 bg-[#FEE500]/[0.08]'
                  : 'border-indigo-400/30 bg-indigo-400/[0.06] hover:border-indigo-400/50 hover:bg-indigo-400/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[20px]">🌌</span>
                <div>
                  <p className={`text-[15px] font-semibold ${selectedAgent.name === '_group' ? 'text-[#FEE500]' : 'text-white'}`}>
                    Universe 단체방
                  </p>
                  <p className="text-[12px] text-slate-400 mt-0.5">텐원 AI 팀 28명 · 1001이 자동 라우팅</p>
                </div>
              </div>
              {selectedAgent.name === '_group' && (
                <span className="text-[12px] font-semibold text-[#FEE500]">대화 중</span>
              )}
            </button>
          </div>

          {/* 에이전트 선택 (1:1) */}
          <div className="px-4 pt-4 pb-3">
            <button
              onClick={() => setAgentOpen(o => !o)}
              className="w-full flex items-center justify-between mb-3 group"
            >
              <p className="text-[12px] text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">1:1 독대</p>
              <span className={`text-[11px] text-slate-500 transition-transform ${agentOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {agentOpen && (
              agentLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 size={18} className="animate-spin text-slate-500"/>
                </div>
              ) : (
                <div className="space-y-4">
                  {[0, 1, 2].map(layer => {
                    const group = agents.filter(a => a.layer === layer);
                    if (!group.length) return null;
                    return (
                      <div key={layer}>
                        <p className="text-[12px] text-slate-500 mb-2 pl-0.5">{layerLabel[layer]}</p>
                        <div className="space-y-1.5">
                          {group.map(a => {
                            const isSelected = selectedAgent.name === a.name;
                            return (
                              <button key={a.name} onClick={() => handleSelectAgent(a)}
                                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 border transition-all active:scale-[0.98] text-left ${
                                  isSelected
                                    ? 'border-[#FEE500]/40 bg-[#FEE500]/[0.08]'
                                    : a.isActive
                                      ? 'border-emerald-400/25 bg-emerald-400/[0.05] hover:bg-emerald-400/10 hover:border-emerald-400/40'
                                      : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15'
                                }`}>
                                <div className="flex items-center gap-2.5">
                                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${a.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`}/>
                                  <span className={`text-[15px] ${isSelected ? 'text-[#FEE500] font-medium' : a.isActive ? 'text-white' : 'text-slate-500'}`}>{a.displayName}</span>
                                </div>
                                {isSelected ? (
                                  <span className="text-[12px] font-semibold text-[#FEE500]">대화 중</span>
                                ) : (
                                  <span className={`text-[12px] font-medium ${a.isActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                                    {a.isActive ? 'ON' : 'OFF'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
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
        <div className="flex-shrink-0 px-4 py-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full rounded-xl px-4 py-3.5 text-[15px] text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all">
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 참여자 시트 ─────────────────────────────────────────────────
// 단체방에서 28명 에이전트 전체를 보여주고, 클릭 시 @멘션 prepend 또는 1:1 전환

function ParticipantSheet({
  agents, selectedAgent, routerStats, onClose, onSelectAgent, onMention,
}: {
  agents: AgentStatus[];
  selectedAgent: SelectedAgent;
  routerStats: Array<{ name: string; count: number }>;
  onClose: () => void;
  onSelectAgent: (a: SelectedAgent) => void;
  onMention: (name: string) => void;
}) {
  const layerLabel: Record<number, string> = {
    0: 'L0 ORCHESTRATOR',
    1: 'L1 수집·인프라',
    2: 'L2 운영 에이전트',
    3: 'L3 Badak 챗봇',
  };
  const layerRole: Record<number, string> = {
    0: '오케스트레이터',
    1: '수집·인프라',
    2: '운영 에이전트',
    3: 'Badak 챗봇',
  };

  const handle1on1 = (a: AgentStatus) => {
    onSelectAgent({
      name: a.name,
      displayName: a.displayName,
      role: layerRole[a.layer] ?? '에이전트',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-96 max-w-[92vw] h-full bg-[#12132a] border-l border-white/10 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <p className="text-[16px] font-semibold text-white">🌌 Universe 단체방</p>
            <p className="text-[13px] text-slate-400 mt-0.5">참여 에이전트 {agents.length}명</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 라우터 통계 — 최근 단체방 호출 Top 5 */}
          {routerStats.length > 0 && (
            <div className="px-4 pt-4 pb-2">
              <p className="text-[12px] text-slate-500 uppercase tracking-widest mb-2">
                최근 라우터가 자주 호출 (Top 5)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {routerStats.map(({ name, count }) => {
                  const agent = agents.find(a => a.name === name);
                  const accent = agentAccent(agent?.layer);
                  return (
                    <button
                      key={name}
                      onClick={() => { onMention(name); onClose(); }}
                      className={`inline-flex items-center gap-1.5 text-[12px] rounded-full px-2.5 py-1 border ${accent.ring} bg-white/[0.04] hover:bg-white/10 transition-colors`}
                      title={`@${name} 로 멘션`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                      <span className="text-white">{agent?.displayName ?? name}</span>
                      <span className="text-slate-500">×{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* layer별 에이전트 그리드 */}
          <div className="px-4 pt-4 pb-4 space-y-5">
            {[0, 1, 2, 3].map(layer => {
              const group = agents.filter(a => a.layer === layer);
              if (!group.length) return null;
              return (
                <div key={layer}>
                  <p className="text-[12px] text-slate-500 mb-2 pl-0.5">{layerLabel[layer]} · {group.length}명</p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.map(a => {
                      const accent = agentAccent(a.layer);
                      const isSelf = selectedAgent.name === a.name;
                      return (
                        <div key={a.name} className={`rounded-xl border bg-white/[0.03] p-2.5 ${isSelf ? 'border-[#FEE500]/40' : 'border-white/[0.07]'}`}>
                          <div className="flex items-center gap-2">
                            <AgentAvatar name={a.name} displayName={a.displayName} layer={a.layer} size={28} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-[13px] font-medium truncate ${a.isActive ? 'text-white' : 'text-slate-500'}`}>
                                {a.displayName}
                              </p>
                              <p className={`text-[11px] truncate ${accent.text}`}>@{a.name}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex gap-1.5">
                            <button
                              onClick={() => { onMention(a.name); onClose(); }}
                              className="flex-1 text-[11px] rounded-md bg-[#FEE500]/10 text-[#FEE500] border border-[#FEE500]/20 hover:bg-[#FEE500]/15 py-1 active:scale-95 transition-all"
                              title={`@${a.name} 멘션 추가`}
                            >
                              @멘션
                            </button>
                            <button
                              onClick={() => handle1on1(a)}
                              className="flex-1 text-[11px] rounded-md bg-white/[0.05] text-slate-300 border border-white/10 hover:bg-white/10 py-1 active:scale-95 transition-all"
                              title="1:1 독대"
                            >
                              1:1
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-shrink-0 px-4 py-3 border-t border-white/10 bg-black/20">
          <p className="text-[11px] text-slate-500 text-center">
            @멘션은 라우터를 우회하고 해당 에이전트만 답합니다. 1:1은 사이드메뉴 &gt; 1:1 독대와 동일.
          </p>
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
  const [participantSheetOpen, setParticipantSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [routerStats, setRouterStats] = useState<Array<{ name: string; count: number }>>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<SelectedAgent>({
    name: '1001',
    displayName: '열시일분',
    role: 'Universe 오케스트레이터',
  });
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = (smooth = true) =>
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });

  // ── 키보드 높이 추적 (카카오톡 방식) ────────────────────────────
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const onViewportChange = () => {
      // window.innerHeight - vv.height = 키보드 + 브라우저 UI 높이
      const kbH = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardHeight(kbH);
      // 키보드 올라올 때 최신 메시지로 스크롤
      if (kbH > 0) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
    };

    vv.addEventListener('resize', onViewportChange);
    vv.addEventListener('scroll', onViewportChange);
    return () => {
      vv.removeEventListener('resize', onViewportChange);
      vv.removeEventListener('scroll', onViewportChange);
    };
  }, []);

  // 28명 에이전트 fetch (1회) — 참여자 시트·자동완성·라우터 통계에서 공유
  useEffect(() => {
    createClient()
      .from('agent_profiles')
      .select('name, display_name, is_active, layer, risk_level')
      .order('layer', { ascending: true })
      .then(({ data }: { data: Array<{ name: string; display_name: string; is_active: boolean; layer: number; risk_level: string }> | null }) => {
        setAgents((data ?? []).map(a => ({
          name: a.name,
          displayName: a.display_name,
          layer: a.layer,
          isActive: a.is_active,
          riskLevel: a.risk_level,
        })));
      });
  }, []);

  // 라우터 통계 — 단체방 모드 진입 시 최근 100개 dokdae_routing 메시지 집계
  useEffect(() => {
    if (selectedAgent.name !== '_group') {
      setRouterStats([]);
      return;
    }
    const sb = createClient();
    sb.auth.getUser().then(async ({ data }: { data: { user: import('@supabase/supabase-js').User | null } }) => {
      if (!data.user) return;
      const { data: rows } = await sb
        .from('agent_messages')
        .select('payload')
        .eq('message_type', 'dokdae_routing')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (!rows?.length) { setRouterStats([]); return; }
      const counter: Record<string, number> = {};
      for (const r of rows as Array<{ payload: { agents?: string[] } }>) {
        for (const name of r.payload?.agents ?? []) counter[name] = (counter[name] ?? 0) + 1;
      }
      const top = Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, 5);
      setRouterStats(top.map(([name, count]) => ({ name, count })));
    });
  }, [selectedAgent.name]);

  // 이전 대화 로드 — selectedAgent 변경 시 재실행 (1:1 ↔ 단체방 분리)
  useEffect(() => {
    setHistoryLoaded(false);
    setMessages([]);
    const sb = createClient();
    const isGroup = selectedAgent.name === '_group';

    sb.auth.getUser().then(async ({ data }: { data: { user: import('@supabase/supabase-js').User | null } }) => {
      if (!data.user) { setHistoryLoaded(true); return; }

      // 단체방: to_agent='group' 메시지 (라우팅+응답+사용자)
      // 1:1: from='user'↔to=agent 또는 from=agent↔to='user' (mode가 'agent'인 것)
      let query = sb
        .from('agent_messages')
        .select('from_agent, to_agent, payload, created_at, message_type')
        .eq('user_id', data.user.id)
        .in('message_type', ['dokdae_chat', 'dokdae_routing'])
        .order('created_at', { ascending: true })
        .limit(80);

      if (isGroup) {
        query = query.eq('to_agent', 'group');
      } else {
        query = query.or(
          `and(from_agent.eq.user,to_agent.eq.${selectedAgent.name}),` +
          `and(from_agent.eq.${selectedAgent.name},to_agent.eq.user)`
        );
      }

      const { data: rows } = await query;

      if (rows?.length) {
        const loaded: Message[] = rows.map((row: {
          from_agent: string;
          to_agent: string;
          payload: Record<string, unknown>;
          created_at: string;
          message_type: string;
        }) => {
          const time = new Date(row.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
          // 라우터 결정 메시지
          if (row.message_type === 'dokdae_routing') {
            const agents = (row.payload as { agents?: string[]; reason?: string }).agents ?? [];
            const reason = (row.payload as { reason?: string }).reason ?? '';
            return {
              id: uid(),
              role: 'router' as const,
              text: `${reason} → ${agents.join(', ')}`,
              time,
            };
          }
          // 사용자 메시지
          if (row.from_agent === 'user') {
            return {
              id: uid(),
              role: 'user' as const,
              text: (row.payload as { text?: string }).text ?? '',
              time,
            };
          }
          // 에이전트 응답
          const payload = row.payload as { text?: string; displayName?: string; layer?: number };
          return {
            id: uid(),
            role: 'ai' as const,
            text: payload.text ?? '',
            time,
            cards: extractCards(row.payload),
            agentName: row.from_agent,
            agentDisplayName: payload.displayName,
            agentLayer: payload.layer,
          };
        });
        setMessages(loaded);
        setHasMore(rows.length >= 80);
      }
      setHistoryLoaded(true);
    });
  }, [selectedAgent.name]);

  useEffect(() => { if (historyLoaded) scrollDown(false); }, [historyLoaded]);
  useEffect(() => { if (!isLoading) scrollDown(); }, [messages.length, isLoading]);

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  const send = useCallback(async (text: string, quickAction?: string) => {
    if (!text.trim() || isLoading) return;

    const isGroup = selectedAgent.name === '_group';

    // @멘션 파싱: @{name} 패턴이 있고 isGroup일 때만 라우터 우회
    let mention: string | undefined;
    if (isGroup) {
      const m = text.match(/@(\w+)/);
      if (m) mention = m[1].toLowerCase();
    }

    setMessages(prev => [...prev, { id: uid(), role: 'user', text: text.trim(), time: timeStr() }]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const res  = await fetch('/api/agent/dokdae', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          mode: isGroup ? 'group' : 'agent',
          ...(isGroup ? {} : { agentName: selectedAgent.name }),
          ...(mention ? { mention } : {}),
          ...(quickAction ? { quickAction } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '서버 오류');
      const data  = json.data ?? json;

      if (isGroup && data.mode === 'group') {
        // 단체방: 라우터 메모 + N개 에이전트 응답을 순서대로 추가
        const groupMsgs: Message[] = [];
        if (data.routerNote) {
          groupMsgs.push({
            id: uid(),
            role: 'router',
            text: `${data.routerNote} → ${(data.replies ?? []).map((r: { displayName: string }) => r.displayName).join(', ')}`,
            time: timeStr(),
          });
        }
        const cards = extractCards(data);
        (data.replies ?? []).forEach((r: { agentName: string; displayName: string; layer: number; response: string }, idx: number) => {
          groupMsgs.push({
            id: uid(),
            role: 'ai',
            text: r.response || '응답 없음',
            time: timeStr(),
            agentName: r.agentName,
            agentDisplayName: r.displayName,
            agentLayer: r.layer,
            cards: idx === (data.replies as unknown[]).length - 1 ? cards : undefined,
          });
        });
        setMessages(prev => [...prev, ...groupMsgs]);
      } else {
        // 1:1
        const cards = extractCards(data);
        setMessages(prev => [...prev, {
          id: uid(), role: 'ai',
          text: data.response || '응답 없음',
          time: timeStr(),
          cards,
          agentName: selectedAgent.name,
          agentDisplayName: selectedAgent.displayName,
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        id: uid(), role: 'ai',
        text: e instanceof Error ? `오류: ${e.message}` : '오류가 발생했습니다.',
        time: timeStr(),
        error: true,
        retryText: text.trim(),
        retryAction: quickAction,
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isLoading, selectedAgent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div
      className="flex flex-col bg-[#0d0e1a]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: keyboardHeight,
        // 키보드 전환 시 자연스럽게
        transition: keyboardHeight > 0 ? 'none' : 'bottom 0.25s ease',
      }}
    >

      {drawerOpen && (
        <SideMenu
          onClose={() => setDrawerOpen(false)}
          onSend={(label, key) => { send(label, key); }}
          selectedAgent={selectedAgent}
          onSelectAgent={(agent) => { setSelectedAgent(agent); setMessages([]); }}
        />
      )}

      {participantSheetOpen && (
        <ParticipantSheet
          agents={agents}
          selectedAgent={selectedAgent}
          routerStats={routerStats}
          onClose={() => setParticipantSheetOpen(false)}
          onSelectAgent={(agent) => { setSelectedAgent(agent); }}
          onMention={(name) => {
            const cur = input.trimEnd();
            setInput(cur ? `${cur} @${name} ` : `@${name} `);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        />
      )}

      {/* 헤더 */}
      <div className="flex-shrink-0 bg-[#0d0e1a] border-b border-white/10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3.5">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-black border border-white/10 flex-shrink-0">
            <Image src="/logo-tenone.png" alt="Ten:One" width={40} height={40} className="object-cover w-full h-full"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-bold text-white leading-none">{selectedAgent.displayName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>
              <p className="text-[13px] text-slate-400 leading-none">{selectedAgent.role}</p>
            </div>
          </div>
          {/* 단체방 전용 참여자 버튼 */}
          {selectedAgent.name === '_group' && (
            <button
              onClick={() => setParticipantSheetOpen(true)}
              className="h-9 px-2.5 flex items-center gap-1.5 rounded-full bg-indigo-400/10 border border-indigo-400/20 text-indigo-200 hover:bg-indigo-400/15 active:scale-95 transition-all"
              title="참여자 보기"
            >
              <span className="text-[14px]">👥</span>
              <span className="text-[13px] font-medium">{agents.length || '...'}</span>
            </button>
          )}
          {/* 검색 버튼 */}
          <button onClick={() => setSearchOpen(s => !s)}
            className={`h-10 w-10 flex items-center justify-center active:scale-90 transition-all ${searchOpen ? 'text-[#FEE500]' : 'text-slate-400 hover:text-white'}`}
            title="메시지 검색"
          >
            <Search size={20}/>
          </button>
          <button onClick={() => setDrawerOpen(true)}
            className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all">
            <Menu size={22}/>
          </button>
        </div>
        {/* 검색 입력 (열렸을 때만) */}
        {searchOpen && (
          <div className="max-w-2xl mx-auto px-4 pb-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="메시지 검색"
                autoFocus
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-9 py-2 text-[14px] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FEE500]/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={14}/>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
        <div className="max-w-2xl mx-auto px-4 py-3">

          {hasMore && (
            <div className="flex justify-center py-3">
              <button
                onClick={async () => {
                  if (loadingMore || messages.length === 0) return;
                  setLoadingMore(true);
                  const sb = createClient();
                  const { data: u } = await sb.auth.getUser();
                  if (!u.user) { setLoadingMore(false); return; }
                  const oldest = messages[0];
                  const { data: rows } = await sb
                    .from('agent_messages')
                    .select('from_agent, payload, created_at')
                    .eq('message_type', 'dokdae_chat')
                    .eq('user_id', u.user.id)
                    .lt('created_at', new Date(Date.now() - messages.length * 60000).toISOString())
                    .order('created_at', { ascending: false })
                    .limit(40);
                  if (rows?.length) {
                    const older: Message[] = rows.reverse().map((row: { from_agent: string; payload: Record<string, unknown>; created_at: string }) => ({
                      id: uid(),
                      role: row.from_agent === 'user' ? 'user' as const : 'ai' as const,
                      text: (row.payload as { text?: string }).text ?? '',
                      time: new Date(row.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                      cards: row.from_agent !== 'user' ? extractCards(row.payload as Record<string, unknown>) : undefined,
                    }));
                    setMessages(prev => [...older, ...prev]);
                    setHasMore(rows.length >= 40);
                  } else {
                    setHasMore(false);
                  }
                  setLoadingMore(false);
                }}
                disabled={loadingMore}
                className="text-[13px] text-slate-500 hover:text-slate-300 border border-white/10 rounded-full px-4 py-1.5 hover:bg-white/[0.05] transition-all disabled:opacity-30"
              >
                {loadingMore ? '불러오는 중...' : '이전 대화 불러오기'}
              </button>
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-black border border-white/10">
                <Image src="/logo-tenone.png" alt="Ten:One" width={64} height={64} className="object-cover w-full h-full"/>
              </div>
              <p className="text-[16px] text-slate-400">지시를 내리거나 Universe 현황을 물어보세요</p>
            </div>
          )}

          {messages.length > 0 && <DateDivider/>}

          {(() => {
            const filtered = searchQuery.trim()
              ? messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase().trim()))
              : messages;
            if (searchQuery.trim() && filtered.length === 0) {
              return (
                <div className="py-8 text-center">
                  <p className="text-[14px] text-slate-500">&ldquo;{searchQuery}&rdquo;에 해당하는 메시지가 없습니다</p>
                </div>
              );
            }
            return filtered.map((msg, i) => {
              const prev = filtered[i - 1];
              // 연속 같은 에이전트면 아바타 생략 (단체방), 단 role 바뀌면 표시
              const sameAgentAsPrev = prev && prev.role === 'ai' && msg.role === 'ai' && prev.agentName === msg.agentName;
              const showAvatar = msg.role === 'ai' && (!prev || prev.role === 'user' || prev.role === 'router' || !sameAgentAsPrev);
              return <Bubble key={msg.id} msg={msg} showAvatar={showAvatar} onRetry={(text, action) => send(text, action)}/>;
            });
          })()}

          {isLoading && (
            selectedAgent.name === '_group' ? (
              <div className="flex justify-center py-2">
                <div className="rounded-full bg-indigo-500/10 border border-indigo-400/20 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 items-center">
                      {[0, 150, 300].map((d, i) => (
                        <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#FEE500] animate-bounce" style={{ animationDelay: `${d}ms` }}/>
                      ))}
                    </div>
                    <span className="text-[13px] text-indigo-200">
                      🌌 Universe 단체방 — <span className="text-[#FEE500]">1001</span>이 라우팅 후 에이전트 응답 작성 중...
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-end gap-2.5 py-1">
                <div className="h-9 w-9 rounded-full overflow-hidden bg-black border border-white/10 flex-shrink-0">
                  <Image src="/logo-tenone.png" alt="Ten:One" width={36} height={36} className="object-cover w-full h-full"/>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-[#222336] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 items-center">
                      {[0, 150, 300].map((d, i) => (
                        <span key={i} className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce"
                          style={{ animationDelay: `${d}ms` }}/>
                      ))}
                    </div>
                    <span className="text-[13px] text-slate-400">{selectedAgent.displayName}이 분석 중...</span>
                  </div>
                </div>
              </div>
            )
          )}

          <div ref={bottomRef}/>
        </div>
      </div>

      {/* 퀵 액션 */}
      <div className="flex-shrink-0 border-t border-white/10 bg-[#0d0e1a]">
        <div className="max-w-2xl mx-auto flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
          {QUICK.map(q => (
            <button key={q.key} onClick={() => send(q.label, q.key)} disabled={isLoading}
              className="flex-shrink-0 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[14px] text-slate-300 hover:text-white hover:border-white/30 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-30">
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* @멘션 자동완성 — 단체방 모드 + 입력 끝에 @{query} 패턴 매칭 시 */}
      {(() => {
        if (selectedAgent.name !== '_group') return null;
        const m = input.match(/@(\w*)$/);
        if (!m) return null;
        const query = m[1].toLowerCase();
        const matches = agents
          .filter(a =>
            a.layer !== 0 && // 1001 제외
            (a.name.toLowerCase().startsWith(query) || a.displayName.toLowerCase().includes(query))
          )
          .slice(0, 6);
        if (matches.length === 0) return null;
        return (
          <div className="flex-shrink-0 bg-[#0d0e1a] border-t border-white/10">
            <div className="max-w-2xl mx-auto px-3 py-2">
              <p className="text-[11px] text-slate-500 px-1 mb-1.5">@{query || '...'} 매칭 {matches.length}명</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {matches.map(a => {
                  const accent = agentAccent(a.layer);
                  return (
                    <button
                      key={a.name}
                      onClick={() => {
                        const replaced = input.replace(/@\w*$/, `@${a.name} `);
                        setInput(replaced);
                        setTimeout(() => inputRef.current?.focus(), 30);
                      }}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-1.5 hover:bg-white/10 active:scale-95 transition-all"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                      <span className="text-[13px] text-white">{a.displayName}</span>
                      <span className={`text-[11px] ${accent.text}`}>@{a.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 입력 바 */}
      <div
        className="flex-shrink-0 bg-[#0d0e1a] border-t border-white/10"
        style={{ paddingBottom: keyboardHeight > 0 ? '4px' : 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-2xl mx-auto flex items-end gap-2.5 px-3 py-2.5">
          <button className="flex-shrink-0 h-10 w-10 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all">
            <Plus size={18}/>
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={selectedAgent.name === '_group' ? '메시지 입력 (특정 에이전트 호출: @mindle)' : '메시지 입력'}
            rows={1}
            className="flex-1 resize-none bg-[#1c1e30] border border-white/10 rounded-2xl px-4 py-2.5 text-[16px] text-white placeholder:text-slate-500 focus:outline-none focus:border-white/20 disabled:opacity-40 leading-relaxed"
            style={{ maxHeight: '100px' }}
          />
          {!input.trim() ? (
            <>
              <button className="flex-shrink-0 h-10 w-10 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all">
                <ImageIcon size={18}/>
              </button>
              <button className="flex-shrink-0 h-10 w-10 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all">
                <Mic size={18}/>
              </button>
            </>
          ) : (
            <button onClick={() => send(input)} disabled={isLoading}
              className="flex-shrink-0 h-10 w-10 rounded-full bg-[#FEE500] flex items-center justify-center active:scale-90 disabled:opacity-30 transition-all shadow-[0_0_16px_rgba(254,229,0,0.25)]">
              {isLoading
                ? <Loader2 size={16} className="animate-spin text-neutral-800"/>
                : <Send size={16} className="text-neutral-900 ml-0.5"/>}
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
    <div className="min-h-[100dvh] bg-[#0d0e1a] flex items-center justify-center">
      <div className="h-5 w-5 border-2 border-slate-700 border-t-[#FEE500] rounded-full animate-spin"/>
    </div>
  );

  if (auth === 'login') return <LoginScreen onSuccess={() => setAuth('ok')}/>;
  return <ChatScreen/>;
}
