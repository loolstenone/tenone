'use client';

import { useState } from 'react';
import { MessageSquare, Bell, Calendar, HelpCircle } from 'lucide-react';

type Tab = 'notice' | 'free' | 'calendar' | 'qna';

export default function TalkPage() {
  const [tab, setTab] = useState<Tab>('notice');

  const TABS = [
    { id: 'notice' as Tab, label: '공지사항', icon: Bell },
    { id: 'free' as Tab, label: '자유게시판', icon: MessageSquare },
    { id: 'calendar' as Tab, label: '일정', icon: Calendar },
    { id: 'qna' as Tab, label: 'Q&A', icon: HelpCircle },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">소통</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <MessageSquare size={40} className="mx-auto mb-3 text-slate-600" />
        <p className="text-slate-500">Sprint 2에서 구현 예정</p>
        <p className="text-xs text-slate-600 mt-1">wio_posts + wio_events 테이블 연동</p>
      </div>
    </div>
  );
}
