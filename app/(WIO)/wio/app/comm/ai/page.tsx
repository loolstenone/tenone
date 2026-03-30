'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, FileText, Languages, BarChart3, Plus, Sparkles, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useWIO } from '../../layout';

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  agentName: string;
  createdAt: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  confidence?: number;
  agentName?: string;
};

const QUICK_COMMANDS = [
  { icon: FileText, label: '문서 요약', prompt: '다음 문서를 요약해줘:\n\n' },
  { icon: Languages, label: '번역', prompt: '다음을 영어로 번역해줘:\n\n' },
  { icon: BarChart3, label: '데이터 분석', prompt: '다음 데이터를 분석해줘:\n\n' },
];

function generateId() {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function timeStr() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function createNewConversation(): Conversation {
  return {
    id: generateId(),
    title: '새 대화',
    messages: [],
    agentName: 'compass',
    createdAt: new Date().toISOString(),
  };
}

export default function AIPage() {
  const { tenant } = useWIO();
  const [conversations, setConversations] = useState<Conversation[]>(() => [createNewConversation()]);
  const [selectedId, setSelectedId] = useState<string>(() => conversations[0]?.id || '');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = conversations.find(c => c.id === selectedId);
  const currentMessages = selected?.messages || [];

  // 스크롤 자동 이동
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, isLoading]);

  // 새 대화 생성
  const handleNewConversation = useCallback(() => {
    const conv = createNewConversation();
    setConversations(prev => [conv, ...prev]);
    setSelectedId(conv.id);
    setNewMessage('');
    setError(null);
    inputRef.current?.focus();
  }, []);

  // 대화 삭제
  const handleDeleteConversation = useCallback((convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => {
      const next = prev.filter(c => c.id !== convId);
      if (next.length === 0) {
        const newConv = createNewConversation();
        setSelectedId(newConv.id);
        return [newConv];
      }
      if (selectedId === convId) {
        setSelectedId(next[0].id);
      }
      return next;
    });
  }, [selectedId]);

  // 메시지 전송 → Agent Hub API
  const handleSend = useCallback(async () => {
    const text = newMessage.trim();
    if (!text || isLoading) return;

    setError(null);
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      time: timeStr(),
    };

    // 첫 메시지면 대화 제목 자동 설정
    setConversations(prev => prev.map(c => {
      if (c.id !== selectedId) return c;
      const isFirst = c.messages.length === 0;
      return {
        ...c,
        title: isFirst ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : c.title,
        messages: [...c.messages, userMsg],
      };
    }));
    setNewMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          agentName: selected?.agentName || 'compass',
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `서버 오류 (${res.status})`);
      }

      const aiMsg: Message = {
        id: json.messageId || `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: json.response || '응답을 받지 못했습니다.',
        time: timeStr(),
        confidence: json.confidence,
        agentName: json.agentName,
      };

      setConversations(prev => prev.map(c => {
        if (c.id !== selectedId) return c;
        return { ...c, messages: [...c.messages, aiMsg] };
      }));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errMsg);

      // 에러 메시지도 대화에 표시
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ 오류: ${errMsg}`,
        time: timeStr(),
      };
      setConversations(prev => prev.map(c => {
        if (c.id !== selectedId) return c;
        return { ...c, messages: [...c.messages, errorMsg] };
      }));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [newMessage, isLoading, selectedId, selected?.agentName]);

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">AI 어시스턴트</h1>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드 — Agent Hub 연동 시 실제 AI 응답이 생성됩니다.
        </div>
      )}

      {/* 빠른 명령 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {QUICK_COMMANDS.map(cmd => (
          <button key={cmd.label} onClick={() => { setNewMessage(cmd.prompt); inputRef.current?.focus(); }}
            className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-slate-400 hover:text-white hover:border-white/10 transition-all">
            <cmd.icon size={14} /> {cmd.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-250px)]">
        {/* 대화 목록 */}
        <div className="lg:col-span-1 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-sm font-semibold">대화 목록</span>
            <button onClick={handleNewConversation} className="text-slate-400 hover:text-white transition-colors" title="새 대화">
              <Plus size={15} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <div key={conv.id} onClick={() => { setSelectedId(conv.id); setError(null); }}
                className={`w-full text-left px-4 py-3 transition-colors group relative cursor-pointer ${selectedId === conv.id ? 'bg-indigo-600/10' : 'hover:bg-white/[0.04]'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate pr-6">{conv.title}</span>
                  <span className="text-[10px] text-slate-600 shrink-0">
                    {conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].time : ''}
                  </span>
                </div>
                {conv.messages.length > 0 && (
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {conv.messages[conv.messages.length - 1].text.slice(0, 50)}
                  </div>
                )}
                {conv.messages.length === 0 && (
                  <div className="text-xs text-slate-600 mt-0.5">대화를 시작하세요</div>
                )}
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                  title="대화 삭제"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="lg:col-span-3 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col overflow-hidden">
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                <Bot size={40} className="text-slate-600" />
                <p className="text-sm">AI 어시스턴트에게 질문하세요</p>
                <p className="text-xs text-slate-600">Agent Hub를 통해 최적의 에이전트가 응답합니다</p>
              </div>
            )}

            {currentMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.role === 'assistant' && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 shrink-0 mt-1">
                    <Sparkles size={12} />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/[0.06] text-slate-200'}`}>
                  <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                  <div className={`flex items-center gap-2 mt-1`}>
                    <span className={`text-[10px] ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>{msg.time}</span>
                    {msg.agentName && (
                      <span className="text-[10px] text-indigo-400/60 bg-indigo-500/10 rounded px-1.5 py-0.5">{msg.agentName}</span>
                    )}
                    {msg.confidence != null && msg.confidence > 0 && (
                      <span className="text-[10px] text-slate-500">{Math.round(msg.confidence * 100)}%</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* 로딩 인디케이터 */}
            {isLoading && (
              <div className="flex justify-start gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 shrink-0 mt-1">
                  <Sparkles size={12} />
                </div>
                <div className="rounded-xl px-4 py-3 bg-white/[0.06] text-slate-400">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 size={14} className="animate-spin" />
                    <span>AI가 응답을 생성하고 있습니다...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* 에러 배너 */}
          {error && (
            <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              <AlertCircle size={13} />
              <span className="truncate">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-300 shrink-0">닫기</button>
            </div>
          )}

          {/* 입력 영역 */}
          <div className="p-3 border-t border-white/5 flex gap-2">
            <input
              ref={inputRef}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="AI에게 질문하세요..."
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || isLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
