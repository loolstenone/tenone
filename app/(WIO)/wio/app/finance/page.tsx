'use client';

import { useState } from 'react';
import { Receipt, FileText, CreditCard, BarChart3 } from 'lucide-react';

type Tab = 'approval' | 'expenses' | 'settlement' | 'report';

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('approval');

  const TABS = [
    { id: 'approval' as Tab, label: '전자결재', icon: FileText },
    { id: 'expenses' as Tab, label: '경비관리', icon: CreditCard },
    { id: 'settlement' as Tab, label: '정산', icon: Receipt },
    { id: 'report' as Tab, label: '경영관리', icon: BarChart3 },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">재무</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <Receipt size={40} className="mx-auto mb-3 text-slate-600" />
        <p className="text-slate-500">Sprint 2에서 구현 예정</p>
        <p className="text-xs text-slate-600 mt-1">wio_approvals + wio_expenses 테이블 연동</p>
      </div>
    </div>
  );
}
