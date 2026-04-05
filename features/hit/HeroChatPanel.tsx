'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import type { HitMode } from '@/lib/hit/hero-agent-system';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface HeroChatPanelProps {
  resultId: string;
  mode: HitMode;
  greeting: string;
  quickQuestions?: string[];
}

/**
 * 히어로 AI 상담 채팅 패널 — 결과 화면 내 인라인
 */
export default function HeroChatPanel({ resultId, mode, greeting, quickQuestions }: HeroChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: greeting },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // 스트리밍 응답
    try {
      const res = await fetch('/api/hit/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          resultId,
          mode,
          history: messages.filter(m => m !== messages[0]),
          sessionId: `chat_${resultId}_${Date.now()}`,
        }),
      });

      if (!res.ok) throw new Error('stream failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      // 빈 assistant 메시지 추가 (스트리밍으로 채워감)
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                assistantContent += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                  return updated;
                });
              }
              if (data.done) break;
              if (data.error) {
                assistantContent = data.error;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }

      if (!assistantContent) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: '응답을 받지 못했습니다.' };
          return updated;
        });
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '네트워크 오류가 발생했습니다. 다시 시도해 주세요.' }]);
    }
    setLoading(false);
  };

  // 플로팅 버튼
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#E53935] text-white rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center"
        title="히어로에게 물어보기"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-[360px] sm:h-[520px] bg-white border-0 sm:border sm:border-neutral-200 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#E53935] text-white">
        <div>
          <p className="text-sm font-bold">히어로 AI 상담</p>
          <p className="text-[10px] opacity-80">HeRo Talent Agency</p>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#E53935] text-white rounded-br-sm'
                : 'bg-neutral-100 text-neutral-700 rounded-bl-sm'
            }`}>
              {msg.content.split('\n').map((line, j) => (
                <p key={j} className={j > 0 ? 'mt-1' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 bg-neutral-100 rounded-xl rounded-bl-sm">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          </div>
        )}
      </div>

      {/* 빠른 질문 */}
      {messages.length <= 2 && quickQuestions && quickQuestions.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="text-[11px] px-2.5 py-1 border border-neutral-200 rounded-full text-neutral-500 hover:border-[#E53935] hover:text-[#E53935] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 입력 */}
      <div className="px-3 py-2 border-t border-neutral-100">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="히어로에게 물어보세요..."
            className="flex-1 text-sm px-3 py-2 bg-neutral-50 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-[#E53935]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-[#E53935] text-white rounded-lg disabled:opacity-30 hover:bg-red-700 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
