'use client';

import { useState } from 'react';
import { Bot, Send, FileText, Languages, BarChart3, Clock, Plus, Sparkles } from 'lucide-react';
import { useWIO } from '../../layout';

type Conversation = { id: string; title: string; lastMessage: string; time: string; messageCount: number };
type Message = { id: string; role: 'user' | 'assistant'; text: string; time: string };

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'c1', title: '3월 매출 데이터 분석', lastMessage: '3월 매출은 전월 대비 18% 증가했으며...', time: '14:20', messageCount: 6 },
  { id: 'c2', title: '프로젝트 제안서 요약', lastMessage: '핵심 요약: 1) 시장 기회 분석...', time: '11:30', messageCount: 4 },
  { id: 'c3', title: '영문 이메일 번역', lastMessage: '번역 완료했습니다. 확인해 주세요.', time: '어제', messageCount: 3 },
  { id: 'c4', title: 'WIO 기능 비교표 생성', lastMessage: '요청하신 비교표를 생성했습니다.', time: '2일 전', messageCount: 5 },
  { id: 'c5', title: '회의록 정리', lastMessage: '회의 주요 결정사항을 정리했습니다.', time: '3일 전', messageCount: 2 },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: 'am1', role: 'user', text: '3월 매출 데이터를 분석해줘', time: '14:10' },
    { id: 'am2', role: 'assistant', text: '3월 매출 데이터를 분석했습니다.\n\n- 총 매출: 2.4억원 (전월 대비 +18%)\n- 주요 성장 부문: SaaS 구독 (+25%), 컨설팅 (+12%)\n- 신규 고객: 12사 (전월 8사)\n- MRR: 8,500만원\n\n특히 SaaS 구독 매출의 성장이 두드러지며, WIO 도입 기업이 증가한 것이 주요 요인입니다.', time: '14:12' },
    { id: 'am3', role: 'user', text: '경쟁사 대비 어떤 포지션이야?', time: '14:15' },
    { id: 'am4', role: 'assistant', text: '시장 포지셔닝 분석 결과:\n\n1. 가격 경쟁력: 중상위 (경쟁사 대비 10-15% 저렴)\n2. 기능 커버리지: 상위 (통합 솔루션 강점)\n3. 고객 만족도: 4.2/5 (업계 평균 3.8)\n4. 성장률: 업계 평균 대비 1.5배\n\n차별화 포인트는 "올인원 통합 플랫폼"과 "AI 자동화" 기능입니다.', time: '14:18' },
  ],
  c2: [
    { id: 'am5', role: 'user', text: 'MAD League 프로젝트 제안서 핵심만 요약해줘', time: '11:20' },
    { id: 'am6', role: 'assistant', text: '핵심 요약:\n\n1. 시장 기회: 대학생 커뮤니티 시장 연 3,000억 규모\n2. 차별점: 실전 프로젝트 기반 대학 연합 네트워크\n3. 수익 모델: 기업 채용 연계 + 프로젝트 매칭 수수료\n4. 목표: 1년 내 50개 대학, 5,000명 멤버\n5. 필요 투자: 초기 2억 (플랫폼 + 마케팅)', time: '11:25' },
  ],
};

const QUICK_COMMANDS = [
  { icon: FileText, label: '문서 요약', prompt: '다음 문서를 요약해줘:' },
  { icon: Languages, label: '번역', prompt: '다음을 영어로 번역해줘:' },
  { icon: BarChart3, label: '데이터 분석', prompt: '다음 데이터를 분석해줘:' },
];

export default function AIPage() {
  const { tenant } = useWIO();
  const [conversations] = useState(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selectedConv, setSelectedConv] = useState<string>('c1');
  const [newMessage, setNewMessage] = useState('');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const currentMessages = messages[selectedConv] || [];

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const userMsg: Message = { id: `msg${Date.now()}`, role: 'user', text: newMessage.trim(), time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) };
    const aiMsg: Message = { id: `msg${Date.now() + 1}`, role: 'assistant', text: '요청을 처리 중입니다. 데모 모드에서는 실제 AI 응답이 생성되지 않습니다. 실제 환경에서는 Agent Hub와 연동하여 지능적인 응답을 제공합니다.', time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => ({ ...prev, [selectedConv]: [...(prev[selectedConv] || []), userMsg, aiMsg] }));
    setNewMessage('');
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">AI 어시스턴트</h1>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다. 실제 AI 응답은 생성되지 않습니다.
        </div>
      )}

      {/* 빠른 명령 */}
      <div className="flex gap-2 mb-4">
        {QUICK_COMMANDS.map(cmd => (
          <button key={cmd.label} onClick={() => setNewMessage(cmd.prompt)}
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
            <button className="text-slate-400 hover:text-white"><Plus size={15} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <button key={conv.id} onClick={() => setSelectedConv(conv.id)}
                className={`w-full text-left px-4 py-3 transition-colors ${selectedConv === conv.id ? 'bg-indigo-600/10' : 'hover:bg-white/[0.04]'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{conv.title}</span>
                  <span className="text-[10px] text-slate-600 shrink-0">{conv.time}</span>
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="lg:col-span-3 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.role === 'assistant' && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 shrink-0 mt-1">
                    <Sparkles size={12} />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/[0.06] text-slate-200'}`}>
                  <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                  <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-white/5 flex gap-2">
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="AI에게 질문하세요..."
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            <button onClick={handleSend} disabled={!newMessage.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors">
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
