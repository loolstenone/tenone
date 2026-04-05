"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Search, Clock, User, AlertTriangle } from "lucide-react";

interface ChatSession {
  session_id: string;
  result_id: string;
  message_count: number;
  first_at: string;
  last_at: string;
}

export default function AICounselingPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const sb = createClient();
      // 세션별 집계
      sb.from('hit_chat_messages')
        .select('session_id, result_id, created_at')
        .order('created_at', { ascending: false })
        .limit(500)
        .then(({ data }) => {
          if (!data) { setLoading(false); return; }
          // 세션별 그룹핑
          const grouped: Record<string, ChatSession> = {};
          data.forEach(m => {
            if (!grouped[m.session_id]) {
              grouped[m.session_id] = {
                session_id: m.session_id,
                result_id: m.result_id,
                message_count: 0,
                first_at: m.created_at,
                last_at: m.created_at,
              };
            }
            grouped[m.session_id].message_count++;
            if (m.created_at < grouped[m.session_id].first_at) grouped[m.session_id].first_at = m.created_at;
            if (m.created_at > grouped[m.session_id].last_at) grouped[m.session_id].last_at = m.created_at;
          });
          setSessions(Object.values(grouped).sort((a, b) => b.last_at.localeCompare(a.last_at)));
          setLoading(false);
        });
    });
  }, []);

  const loadMessages = async (sessionId: string) => {
    setSelectedSession(sessionId);
    const { createClient } = await import('@/lib/supabase/client');
    const sb = createClient();
    const { data } = await sb.from('hit_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">AI 상담 관리</h1>
          <p className="text-sm text-neutral-400 mt-0.5">히어로 AI 상담 대화 내역</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="세션 ID 검색..."
            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-48 focus:outline-none focus:border-neutral-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 세션 목록 */}
        <div className="lg:col-span-1 border border-neutral-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
            <p className="text-xs font-bold text-neutral-500">상담 세션 ({sessions.length})</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="h-5 w-5 border-2 border-neutral-200 border-t-neutral-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="h-8 w-8 text-neutral-200 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">아직 상담 내역이 없습니다</p>
              </div>
            ) : (
              sessions.filter(s => !search || s.session_id.includes(search)).map(s => (
                <button
                  key={s.session_id}
                  onClick={() => loadMessages(s.session_id)}
                  className={`w-full text-left px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${
                    selectedSession === s.session_id ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-neutral-500">{s.session_id.substring(0, 16)}...</span>
                    <span className="text-[10px] text-neutral-300">{s.message_count}건</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-neutral-300" />
                    <span className="text-[10px] text-neutral-400">{s.last_at?.substring(0, 16)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 대화 내용 */}
        <div className="lg:col-span-2 border border-neutral-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
            <p className="text-xs font-bold text-neutral-500">
              {selectedSession ? `대화 내용 (${messages.length}건)` : '세션을 선택하세요'}
            </p>
          </div>
          <div className="max-h-[600px] overflow-y-auto p-4 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  m.role === 'user'
                    ? 'bg-[#E53935] text-white rounded-br-sm'
                    : 'bg-neutral-100 text-neutral-700 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-line">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${m.role === 'user' ? 'text-red-200' : 'text-neutral-300'}`}>
                    {m.created_at?.substring(11, 16)}
                  </p>
                </div>
              </div>
            ))}
            {!selectedSession && (
              <div className="text-center py-12 text-neutral-300">
                <MessageCircle className="h-12 w-12 mx-auto mb-3" />
                <p className="text-sm">왼쪽에서 상담 세션을 선택하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
