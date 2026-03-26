'use client';

import { useState, useEffect } from 'react';
import { Receipt, FileText, CreditCard, BarChart3, Plus, Check, X, Clock } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchApprovals, createApproval, updateApprovalStatus, fetchExpenses, createExpense } from '@/lib/supabase/wio';

type Tab = 'approval' | 'expenses';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '대기', color: 'text-amber-400 bg-amber-500/10', icon: Clock },
  approved: { label: '승인', color: 'text-emerald-400 bg-emerald-500/10', icon: Check },
  rejected: { label: '반려', color: 'text-red-400 bg-red-500/10', icon: X },
};

export default function FinancePage() {
  const { tenant, member } = useWIO();
  const [tab, setTab] = useState<Tab>('approval');
  const [approvals, setApprovals] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // 결재 폼
  const [apTitle, setApTitle] = useState('');
  const [apContent, setApContent] = useState('');
  const [apType, setApType] = useState('general');

  // 경비 폼
  const [exCategory, setExCategory] = useState('');
  const [exDesc, setExDesc] = useState('');
  const [exAmount, setExAmount] = useState('');

  useEffect(() => {
    if (!tenant) return;
    setLoading(true);
    if (tab === 'approval') {
      fetchApprovals(tenant.id).then(a => { setApprovals(a); setLoading(false); });
    } else {
      fetchExpenses(tenant.id).then(e => { setExpenses(e); setLoading(false); });
    }
  }, [tenant, tab]);

  const handleApproval = async () => {
    if (!tenant || !member || !apTitle.trim()) return;
    await createApproval({ tenantId: tenant.id, type: apType, title: apTitle.trim(), content: apContent.trim(), requesterId: member.id });
    setApTitle(''); setApContent(''); setShowForm(false);
    fetchApprovals(tenant.id).then(setApprovals);
  };

  const handleExpense = async () => {
    if (!tenant || !member || !exDesc.trim() || !exAmount) return;
    await createExpense({ tenantId: tenant.id, memberId: member.id, category: exCategory || '기타', description: exDesc.trim(), amount: Number(exAmount) });
    setExCategory(''); setExDesc(''); setExAmount(''); setShowForm(false);
    fetchExpenses(tenant.id).then(setExpenses);
  };

  const handleApproveReject = async (id: string, status: 'approved' | 'rejected') => {
    await updateApprovalStatus(id, status);
    fetchApprovals(tenant!.id).then(setApprovals);
  };

  const TABS = [
    { id: 'approval' as Tab, label: '전자결재', icon: FileText },
    { id: 'expenses' as Tab, label: '경비관리', icon: CreditCard },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">재무</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> {tab === 'approval' ? '결재 요청' : '경비 신청'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setShowForm(false); }}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* 결재 요청 폼 */}
      {showForm && tab === 'approval' && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <select value={apType} onChange={e => setApType(e.target.value)}
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none">
            <option value="general">일반</option><option value="expense">경비</option><option value="project">프로젝트</option><option value="hr">인사</option>
          </select>
          <input value={apTitle} onChange={e => setApTitle(e.target.value)} placeholder="제목"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          <textarea value={apContent} onChange={e => setApContent(e.target.value)} rows={3} placeholder="내용"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400">취소</button>
            <button onClick={handleApproval} disabled={!apTitle.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">요청</button>
          </div>
        </div>
      )}

      {/* 경비 신청 폼 */}
      {showForm && tab === 'expenses' && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={exCategory} onChange={e => setExCategory(e.target.value)} placeholder="카테고리 (교통, 식비 등)"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="number" value={exAmount} onChange={e => setExAmount(e.target.value)} placeholder="금액 (원)"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <input value={exDesc} onChange={e => setExDesc(e.target.value)} placeholder="사용 내역"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400">취소</button>
            <button onClick={handleExpense} disabled={!exDesc.trim() || !exAmount} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">신청</button>
          </div>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : tab === 'approval' ? (
        approvals.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={36} className="mx-auto mb-3 text-slate-700" />
            <p className="text-sm text-slate-400 mb-1">결재 요청이 없어요</p>
            <p className="text-xs text-slate-600 mb-4">프로젝트 승인, 경비 등 결재를 요청해보세요</p>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors">
              <Plus size={14} /> 결재 요청하기
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {approvals.map((ap: any) => {
              const st = STATUS_MAP[ap.status] || STATUS_MAP.pending;
              const Icon = st.icon;
              return (
                <div key={ap.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{ap.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{ap.requester?.displayName} · {ap.type} · {new Date(ap.createdAt).toLocaleDateString('ko-KR')}</div>
                  </div>
                  {ap.status === 'pending' && member?.role !== 'member' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleApproveReject(ap.id, 'approved')} className="rounded-lg bg-emerald-600/10 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-600/20">승인</button>
                      <button onClick={() => handleApproveReject(ap.id, 'rejected')} className="rounded-lg bg-red-600/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-600/20">반려</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        expenses.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard size={36} className="mx-auto mb-3 text-slate-700" />
            <p className="text-sm text-slate-400 mb-1">경비 내역이 없어요</p>
            <p className="text-xs text-slate-600 mb-4">업무 관련 경비를 신청하세요</p>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors">
              <Plus size={14} /> 경비 신청하기
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((ex: any) => (
              <div key={ex.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{ex.description}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{ex.category} · {ex.member?.displayName} · {new Date(ex.createdAt).toLocaleDateString('ko-KR')}</div>
                </div>
                <span className="text-sm font-bold text-indigo-300">{Number(ex.amount).toLocaleString()}원</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
