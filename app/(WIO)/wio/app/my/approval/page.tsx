'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Check, X, Clock, ChevronDown, ChevronUp,
  ArrowRight, MessageSquare, Filter, Send, Ban,
} from 'lucide-react';
import Link from 'next/link';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

/* ── MY 탭 네비게이션 ── */
const MY_TABS = [
  { label: '대시보드', href: '/wio/app/my' },
  { label: '인사기록', href: '/wio/app/my/hr' },
  { label: '내 평가', href: '/wio/app/my/evaluation' },
  { label: '내 업무', href: '/wio/app/my/work' },
  { label: '기안/결재', href: '/wio/app/my/approval' },
];

type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type ApprovalType = '지출' | '휴가' | '출장' | '일반';
type MainTab = 'my_drafts' | 'my_approvals';

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};
const STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: '대기',
  approved: '승인',
  rejected: '반려',
};

const TYPE_COLORS: Record<ApprovalType, string> = {
  '지출': 'bg-indigo-500/10 text-indigo-400',
  '휴가': 'bg-emerald-500/10 text-emerald-400',
  '출장': 'bg-amber-500/10 text-amber-400',
  '일반': 'bg-slate-500/10 text-slate-400',
};

interface Draft {
  id: string;
  title: string;
  type: ApprovalType;
  amount?: number;
  status: ApprovalStatus;
  date: string;
  approvalLine: { name: string; role: string; status: ApprovalStatus }[];
}

interface IncomingApproval {
  id: string;
  title: string;
  type: ApprovalType;
  requester: string;
  amount?: number;
  date: string;
  comment: string;
}

/* ── Mock data ── */
const MOCK_DRAFTS: Draft[] = [
  {
    id: 'd1', title: '출장비 청구 - 부산 고객 미팅', type: '지출', amount: 450000, status: 'approved', date: '2026-03-20',
    approvalLine: [
      { name: '이영수 팀장', role: '1차 결재', status: 'approved' },
      { name: '박정훈 본부장', role: '2차 결재', status: 'approved' },
    ],
  },
  {
    id: 'd2', title: '마케팅 도구 구독료', type: '지출', amount: 1200000, status: 'pending', date: '2026-03-25',
    approvalLine: [
      { name: '이영수 팀장', role: '1차 결재', status: 'approved' },
      { name: '박정훈 본부장', role: '2차 결재', status: 'pending' },
    ],
  },
  {
    id: 'd3', title: '연차 휴가 (4/7~4/8)', type: '휴가', status: 'pending', date: '2026-03-27',
    approvalLine: [
      { name: '이영수 팀장', role: '1차 결재', status: 'pending' },
    ],
  },
  {
    id: 'd4', title: '서울 컨퍼런스 출장 신청', type: '출장', amount: 300000, status: 'approved', date: '2026-03-15',
    approvalLine: [
      { name: '이영수 팀장', role: '1차 결재', status: 'approved' },
      { name: '박정훈 본부장', role: '2차 결재', status: 'approved' },
    ],
  },
  {
    id: 'd5', title: '팀 워크숍 비용 청구', type: '지출', amount: 800000, status: 'approved', date: '2026-03-10',
    approvalLine: [
      { name: '이영수 팀장', role: '1차 결재', status: 'approved' },
      { name: '박정훈 본부장', role: '2차 결재', status: 'approved' },
    ],
  },
  {
    id: 'd6', title: '디자인 외주 계약 검토', type: '일반', status: 'rejected', date: '2026-03-05',
    approvalLine: [
      { name: '이영수 팀장', role: '1차 결재', status: 'approved' },
      { name: '박정훈 본부장', role: '2차 결재', status: 'rejected' },
    ],
  },
];

const MOCK_INCOMING: IncomingApproval[] = [
  { id: 'i1', title: '노트북 구매 요청', type: '지출', requester: '최수진', amount: 2100000, date: '2026-03-28', comment: '업무용 노트북 교체가 필요합니다.' },
  { id: 'i2', title: '반차 신청 (3/31 오후)', type: '휴가', requester: '김하늘', date: '2026-03-29', comment: '병원 진료 예약' },
  { id: 'i3', title: '광주 출장 신청', type: '출장', requester: '박지민', amount: 250000, date: '2026-03-29', comment: '고객사 현장 방문' },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

export default function MyApprovalPage() {
  const { member, isDemo } = useWIO();
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<MainTab>('my_drafts');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [incoming, setIncoming] = useState<IncomingApproval[]>([]);
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
  const [approvalComment, setApprovalComment] = useState<Record<string, string>>({});
  const [showNewDraft, setShowNewDraft] = useState(false);
  const [newDraftType, setNewDraftType] = useState<ApprovalType>('지출');

  // Supabase에서 결재 데이터 로드
  const loadApprovals = useCallback(async () => {
    if (isDemo) {
      setDrafts(MOCK_DRAFTS);
      setIncoming(MOCK_INCOMING);
      setLoading(false);
      return;
    }
    try {
      const sb = createClient();
      const memberId = member?.id;
      const tenantId = member?.tenantId;
      if (!tenantId || !memberId) { setLoading(false); return; }

      // 내가 올린 기안 (requester_id = 나)
      const { data: myDrafts } = await sb
        .from('wio_approvals')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('requester_id', memberId)
        .order('created_at', { ascending: false });

      // 나에게 온 결재 (approver_id = 나, status = pending)
      const { data: myIncoming } = await sb
        .from('wio_approvals')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('approver_id', memberId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // 내 기안 매핑
      const typeMap: Record<string, ApprovalType> = { expense: '지출', hr: '휴가', general: '일반', project: '출장' };
      if (myDrafts && myDrafts.length > 0) {
        setDrafts(myDrafts.map((r: any) => ({
          id: r.id,
          title: r.title || '',
          type: typeMap[r.type] || '일반',
          amount: r.amount || undefined,
          status: (r.status || 'pending') as ApprovalStatus,
          date: r.created_at?.split('T')[0] || '',
          approvalLine: r.approver_id
            ? [{ name: r.approver_id, role: '결재자', status: (r.status || 'pending') as ApprovalStatus }]
            : [],
        })));
      } else {
        setDrafts(MOCK_DRAFTS);
      }

      // 나에게 온 결재 매핑
      if (myIncoming && myIncoming.length > 0) {
        setIncoming(myIncoming.map((r: any) => ({
          id: r.id,
          title: r.title || '',
          type: typeMap[r.type] || '일반',
          requester: r.requester_id || '',
          amount: r.amount || undefined,
          date: r.created_at?.split('T')[0] || '',
          comment: r.content || '',
        })));
      } else {
        setIncoming(MOCK_INCOMING);
      }
    } catch {
      setDrafts(MOCK_DRAFTS);
      setIncoming(MOCK_INCOMING);
    } finally {
      setLoading(false);
    }
  }, [isDemo, member]);

  useEffect(() => { loadApprovals(); }, [loadApprovals]);

  // 결재 승인
  const handleApprove = async (id: string) => {
    if (!isDemo) {
      try {
        const sb = createClient();
        await sb.from('wio_approvals').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
      } catch { /* 실패 시 무시 */ }
    }
    setIncoming(prev => prev.filter(i => i.id !== id));
  };

  // 결재 반려
  const handleReject = async (id: string) => {
    if (!isDemo) {
      try {
        const sb = createClient();
        await sb.from('wio_approvals').update({ status: 'rejected' }).eq('id', id);
      } catch { /* 실패 시 무시 */ }
    }
    setIncoming(prev => prev.filter(i => i.id !== id));
  };

  const filteredDrafts = statusFilter === 'all'
    ? drafts
    : drafts.filter(d => d.status === statusFilter);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">기안/결재</h1>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* MY 탭 */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {MY_TABS.map(tab => (
          <Link key={tab.href} href={tab.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors ${
              tab.href === '/wio/app/my/approval'
                ? 'bg-indigo-600/10 text-indigo-400 font-semibold'
                : 'text-slate-400 hover:bg-white/5'
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">기안/결재</h1>
          <p className="text-xs text-slate-500 mt-0.5">MY-APR | 결재 관리</p>
        </div>
        <button onClick={() => setShowNewDraft(!showNewDraft)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors">
          <Plus size={14} /> 새 기안
        </button>
      </div>

      {/* 새 기안 폼 */}
      {showNewDraft && (
        <div className="mb-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">새 기안 작성</span>
            <button onClick={() => setShowNewDraft(false)} className="text-slate-500 hover:text-white"><X size={14} /></button>
          </div>
          <div className="flex gap-2 mb-3">
            {(['지출', '휴가', '출장', '일반'] as ApprovalType[]).map(t => (
              <button key={t} onClick={() => setNewDraftType(t)}
                className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  newDraftType === t ? `${TYPE_COLORS[t]} font-semibold` : 'text-slate-400 hover:bg-white/5'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">기안 작성 기능은 준비 중입니다. (Demo)</p>
        </div>
      )}

      {/* 2탭: 내 기안 | 결재 */}
      <div className="flex gap-1 mb-4">
        <button onClick={() => setMainTab('my_drafts')}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            mainTab === 'my_drafts' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5'
          }`}>
          <FileText size={14} className="inline mr-1.5" />내가 올린 기안
          <span className="ml-1.5 text-[10px] bg-white/5 px-1.5 py-0.5 rounded-full">{drafts.length}</span>
        </button>
        <button onClick={() => setMainTab('my_approvals')}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            mainTab === 'my_approvals' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5'
          }`}>
          <Check size={14} className="inline mr-1.5" />나에게 온 결재
          {incoming.length > 0 && <span className="ml-1.5 text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">{incoming.length}</span>}
        </button>
      </div>

      {/* 내 기안 탭 */}
      {mainTab === 'my_drafts' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02]">
          {/* 상태 필터 */}
          <div className="flex gap-1 px-5 py-3 border-b border-white/5 overflow-x-auto">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  statusFilter === s ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5'
                }`}>
                {s === 'all' ? '전체' : STATUS_LABELS[s]}
                <span className="ml-1 text-[10px] text-slate-500">
                  {s === 'all' ? drafts.length : drafts.filter(d => d.status === s).length}
                </span>
              </button>
            ))}
          </div>

          {/* 기안 목록 */}
          <div className="divide-y divide-white/5">
            {filteredDrafts.map(d => (
              <div key={d.id}>
                <button onClick={() => setExpandedDraft(expandedDraft === d.id ? null : d.id)}
                  className="w-full px-5 py-3.5 hover:bg-white/[0.02] transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{d.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${TYPE_COLORS[d.type]}`}>{d.type}</span>
                        {d.amount && <span>{formatCurrency(d.amount)}</span>}
                        <span>{d.date}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLES[d.status]}`}>
                      {STATUS_LABELS[d.status]}
                    </span>
                    {expandedDraft === d.id ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </div>
                </button>

                {/* 결재라인 펼침 */}
                {expandedDraft === d.id && (
                  <div className="px-5 pb-4">
                    <div className="rounded-lg bg-white/[0.02] p-4">
                      <div className="text-xs text-slate-500 mb-3">결재 라인</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-slate-300 bg-white/5 rounded-lg px-3 py-2">
                          <Send size={12} className="text-indigo-400" />
                          <span>기안자 (나)</span>
                        </div>
                        {d.approvalLine.map((step, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <ArrowRight size={12} className="text-slate-600 shrink-0" />
                            <div className={`flex items-center gap-1 text-xs rounded-lg px-3 py-2 border ${
                              step.status === 'approved' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' :
                              step.status === 'rejected' ? 'border-red-500/20 bg-red-500/5 text-red-400' :
                              'border-amber-500/20 bg-amber-500/5 text-amber-400'
                            }`}>
                              {step.status === 'approved' ? <Check size={12} /> :
                               step.status === 'rejected' ? <Ban size={12} /> :
                               <Clock size={12} />}
                              <div>
                                <div className="font-medium">{step.name}</div>
                                <div className="text-[10px] opacity-70">{step.role}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredDrafts.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-500">해당 상태의 기안이 없습니다</div>
            )}
          </div>
        </div>
      )}

      {/* 나에게 온 결재 탭 */}
      {mainTab === 'my_approvals' && (
        <div className="space-y-3">
          {incoming.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] py-12 text-center">
              <Check size={32} className="mx-auto mb-3 text-emerald-400 opacity-30" />
              <p className="text-sm text-slate-400">대기 중인 결재가 없습니다</p>
              <p className="text-xs text-slate-600 mt-1">모든 결재를 처리했어요!</p>
            </div>
          ) : (
            incoming.map(item => (
              <div key={item.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${TYPE_COLORS[item.type]}`}>{item.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>요청자: {item.requester}</span>
                      {item.amount && <span>| {formatCurrency(item.amount)}</span>}
                      <span>| {item.date}</span>
                    </div>
                  </div>
                </div>

                {item.comment && (
                  <div className="rounded-lg bg-white/[0.02] p-3 mb-3 text-xs text-slate-400 flex items-start gap-2">
                    <MessageSquare size={12} className="text-slate-500 shrink-0 mt-0.5" />
                    {item.comment}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    value={approvalComment[item.id] || ''}
                    onChange={e => setApprovalComment(prev => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="코멘트 (선택)"
                    className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none" />
                  <button onClick={() => handleApprove(item.id)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium hover:bg-emerald-500 transition-colors">
                    <Check size={12} /> 승인
                  </button>
                  <button onClick={() => handleReject(item.id)}
                    className="flex items-center gap-1 rounded-lg bg-red-600/80 px-3 py-2 text-xs font-medium hover:bg-red-500 transition-colors">
                    <X size={12} /> 반려
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
