'use client';

import { useState } from 'react';
import { Stamp, Plus, Clock, Check, X, FileText, ChevronRight, Filter, AlertCircle } from 'lucide-react';
import { useWIO } from '../layout';

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'draft';
type ApprovalType = '지출' | '휴가' | '구매' | '계약' | '기타';
type Tab = 'received' | 'sent' | 'all';

interface ApprovalItem {
  id: string;
  title: string;
  type: ApprovalType;
  requester: string;
  amount?: number;
  status: ApprovalStatus;
  createdAt: string;
  description: string;
  approvers: { name: string; status: ApprovalStatus }[];
}

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string; icon: any }> = {
  pending: { label: '대기', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  approved: { label: '승인', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Check },
  rejected: { label: '반려', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: X },
  draft: { label: '초안', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', icon: FileText },
};

const MOCK_APPROVALS: ApprovalItem[] = [
  { id: 'a1', title: 'MADLeague S7 시상금 집행', type: '지출', requester: '전천일', amount: 3500000, status: 'pending', createdAt: '2026-03-25',
    description: 'MADLeague 시즌7 대상(200만) + 최우수상(100만) + 우수상(50만) 시상금', approvers: [{ name: '김관리', status: 'approved' }, { name: '이재무', status: 'pending' }] },
  { id: 'a2', title: '연차 휴가 신청 (3/31~4/2)', type: '휴가', requester: 'Sarah Kim', status: 'approved', createdAt: '2026-03-24',
    description: '개인 사유 연차 3일', approvers: [{ name: '전천일', status: 'approved' }] },
  { id: 'a3', title: 'Figma Enterprise 라이선스 구매', type: '구매', requester: '최디자인', amount: 1800000, status: 'pending', createdAt: '2026-03-23',
    description: '디자인팀 Figma Enterprise 연간 라이선스 (5석)', approvers: [{ name: '전천일', status: 'pending' }] },
  { id: 'a4', title: 'SmarComm 클라이언트 계약', type: '계약', requester: '전천일', amount: 12000000, status: 'approved', createdAt: '2026-03-20',
    description: 'A사 마케팅 대행 6개월 계약', approvers: [{ name: '김관리', status: 'approved' }, { name: '이재무', status: 'approved' }] },
  { id: 'a5', title: '장비 구매 — 모니터 2대', type: '구매', requester: '정개발', amount: 1200000, status: 'rejected', createdAt: '2026-03-18',
    description: '개발팀 32인치 모니터 2대', approvers: [{ name: '전천일', status: 'rejected' }] },
];

export default function ApprovalPage() {
  const { tenant, member } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tab, setTab] = useState<Tab>('received');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const types: ApprovalType[] = ['지출', '휴가', '구매', '계약', '기타'];
  const filtered = MOCK_APPROVALS.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    return true;
  });

  const stats = {
    pending: MOCK_APPROVALS.filter(a => a.status === 'pending').length,
    approved: MOCK_APPROVALS.filter(a => a.status === 'approved').length,
    rejected: MOCK_APPROVALS.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Stamp className="w-5 h-5 text-indigo-400" /> 전자결재</h1>
          <p className="text-sm text-slate-500 mt-0.5">결재 요청, 승인, 반려{isDemo ? ' (데모)' : ''}</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors">
          <Plus size={14} /> 결재 요청
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">대기</div>
          <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">승인</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.approved}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">반려</div>
          <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
        </div>
      </div>

      {/* Tabs + Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {([['received', '받은 결재'], ['sent', '보낸 결재'], ['all', '전체']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${tab === id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              {label} {id === 'received' && stats.pending > 0 && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{stats.pending}</span>}
            </button>
          ))}
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 focus:outline-none">
          <option value="all" className="bg-[#0F0F23]">전체 유형</option>
          {types.map(t => <option key={t} value={t} className="bg-[#0F0F23]">{t}</option>)}
        </select>
      </div>

      {/* Approval List */}
      <div className="space-y-3">
        {filtered.map(item => {
          const st = STATUS_CONFIG[item.status];
          const StatusIcon = st.icon;
          return (
            <div key={item.id} className="border border-white/5 rounded-xl bg-white/[0.02] p-5 hover:border-indigo-500/20 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${st.color}`}>
                      <StatusIcon className="w-2.5 h-2.5 inline mr-0.5" />{st.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{item.type}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>요청: {item.requester}</span>
                  <span>{item.createdAt}</span>
                  {item.amount && <span className="text-indigo-400 font-mono">₩{(item.amount / 10000).toFixed(0)}만</span>}
                </div>
                <div className="flex items-center gap-1">
                  {item.approvers.map((ap, i) => {
                    const apSt = STATUS_CONFIG[ap.status];
                    return (
                      <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded ${apSt.color}`}>{ap.name}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <Stamp className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">결재 내역이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
