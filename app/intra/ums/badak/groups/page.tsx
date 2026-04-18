'use client';

import { useState, useEffect } from 'react';
import { Check, X, Users, MapPin, Calendar, CheckCircle, TrendingUp } from 'lucide-react';

interface GroupReview {
  id: string;
  title: string;
  description: string | null;
  status: string;
  group_type: string;
  max_members: number;
  current_members: number;
  event_date: string | null;
  location: string | null;
  fee: number;
  tags: string[];
  leader_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  reject_reason: string | null;
  leader: { id: string; display_name: string; job_function: string; experience_years: number } | null;
}

type FilterStatus = 'pending_review' | 'recruiting' | 'rejected' | 'completed';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending_review: { label: '심사 대기', color: '#f59e0b', bg: 'bg-amber-500/10' },
  recruiting:     { label: '모집중',    color: '#22c55e', bg: 'bg-green-500/10' },
  rejected:       { label: '반려',      color: '#ef4444', bg: 'bg-red-500/10' },
  confirmed:      { label: '확정',      color: '#3b82f6', bg: 'bg-blue-500/10' },
  closed:         { label: '마감',      color: '#6b7280', bg: 'bg-neutral-500/10' },
  completed:      { label: '완료',      color: '#8b5cf6', bg: 'bg-violet-500/10' },
};

interface PromotionToast {
  from: string;
  to: string;
  leaderName: string;
}

const LEVEL_NAMES: Record<string, string> = {
  S: 'Specialist', A: 'Veteran', B: 'Badakjang', C: 'Rookie',
};

export default function BadakGroupsReviewPage() {
  const [groups, setGroups] = useState<GroupReview[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('pending_review');
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<PromotionToast | null>(null);

  const fetchGroups = (status: string) => {
    fetch(`/api/badak/groups/review?status=${status}`)
      .then((r) => r.json())
      .then((data) => setGroups(data.groups || []))
      .catch(() => setGroups([]));
  };

  useEffect(() => {
    fetchGroups(filter);
  }, [filter]);

  const handleAction = async (groupId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectReason.trim()) {
      setRejectingId(groupId);
      return;
    }

    setProcessing(groupId);
    const res = await fetch('/api/badak/groups/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, action, rejectReason: rejectReason || null }),
    });

    if (res.ok) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setRejectingId(null);
      setRejectReason('');
    }
    setProcessing(null);
  };

  const handleComplete = async (group: GroupReview) => {
    setProcessing(group.id);
    const res = await fetch('/api/badak/groups/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: group.id, action: 'complete' }),
    });

    if (res.ok) {
      const data = await res.json();
      setGroups((prev) => prev.filter((g) => g.id !== group.id));

      if (data.promoted) {
        const leaderName = (group.leader as GroupReview['leader'])?.display_name ?? '바닥장';
        setToast({ from: data.from, to: data.to, leaderName });
        setTimeout(() => setToast(null), 5000);
      }
    }
    setProcessing(null);
  };

  const FILTER_TABS: FilterStatus[] = ['pending_review', 'recruiting', 'rejected', 'completed'];

  return (
    <div className="space-y-6">
      {/* 승급 토스트 */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-violet-600 px-5 py-4 shadow-xl text-white">
          <TrendingUp className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">{toast.leaderName} 자동 승급!</p>
            <p className="text-xs text-violet-200 mt-0.5">
              {LEVEL_NAMES[toast.from]} → {LEVEL_NAMES[toast.to]}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Badak 모임 관리</h1>
          <p className="text-sm text-neutral-500 mt-1">모임 심사 및 완료 처리</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-400">필터:</span>
          {FILTER_TABS.map((s) => {
            const st = STATUS_LABELS[s];
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === s ? st.bg + ' border' : 'border border-neutral-200 text-neutral-500 hover:border-neutral-400'
                }`}
                style={filter === s ? { color: st.color, borderColor: st.color + '40' } : undefined}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {groups.length === 0 && (
        <div className="py-20 text-center text-sm text-neutral-400">
          {filter === 'pending_review' ? '심사 대기 중인 모임이 없습니다' : '해당 상태의 모임이 없습니다'}
        </div>
      )}

      <div className="space-y-3">
        {groups.map((group) => {
          const leader = group.leader as GroupReview['leader'];
          const st = STATUS_LABELS[group.status] || STATUS_LABELS.pending_review;

          return (
            <div key={group.id} className="rounded-xl border border-neutral-200 bg-white p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.bg}`}
                      style={{ color: st.color }}
                    >
                      {st.label}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(group.created_at).toLocaleDateString('ko-KR')} 개설
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">{group.title}</h3>
                  {group.description && (
                    <p className="text-sm text-neutral-500 mt-1">{group.description}</p>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-neutral-500 mb-4">
                {leader && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-neutral-400" />
                    <span>바닥장 {leader.display_name} ({leader.job_function} {leader.experience_years}년차)</span>
                  </div>
                )}
                {group.event_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    {new Date(group.event_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                  </div>
                )}
                {group.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                    {group.location}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-neutral-400" />
                  최대 {group.max_members}명 / {group.fee > 0 ? `${group.fee.toLocaleString()}원` : '무료'}
                </div>
              </div>

              {/* Leader reason */}
              {group.leader_reason && (
                <div className="rounded-lg bg-neutral-50 p-3 mb-4">
                  <div className="text-[10px] font-medium text-neutral-400 uppercase mb-1">개설 사유</div>
                  <p className="text-sm text-neutral-700">{group.leader_reason}</p>
                </div>
              )}

              {/* Tags */}
              {group.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {group.tags.map((tag) => (
                    <span key={tag} className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Reject reason (if rejected) */}
              {group.reject_reason && (
                <div className="rounded-lg bg-red-50 p-3 mb-4">
                  <div className="text-[10px] font-medium text-red-400 uppercase mb-1">반려 사유</div>
                  <p className="text-sm text-red-700">{group.reject_reason}</p>
                </div>
              )}

              {/* Reject reason input */}
              {rejectingId === group.id && (
                <div className="mb-4">
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력하세요"
                    className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm outline-none focus:border-red-400"
                    autoFocus
                  />
                </div>
              )}

              {/* Actions */}
              {group.status === 'pending_review' && (
                <div className="flex gap-2 pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => handleAction(group.id, 'approve')}
                    disabled={processing === group.id}
                    className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> 승인
                  </button>
                  <button
                    onClick={() => {
                      if (rejectingId === group.id && rejectReason.trim()) {
                        handleAction(group.id, 'reject');
                      } else {
                        setRejectingId(group.id);
                      }
                    }}
                    disabled={processing === group.id}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    {rejectingId === group.id ? '반려 확인' : '반려'}
                  </button>
                </div>
              )}

              {/* 완료 처리 (모집중 / 확정 상태) */}
              {(group.status === 'recruiting' || group.status === 'confirmed') && (
                <div className="flex gap-2 pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => handleComplete(group)}
                    disabled={processing === group.id}
                    className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {processing === group.id ? '처리 중…' : '완료 처리'}
                  </button>
                  <span className="self-center text-[11px] text-neutral-400">
                    완료 시 바닥장 완료 횟수 +1 · 승급 조건 자동 확인
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
