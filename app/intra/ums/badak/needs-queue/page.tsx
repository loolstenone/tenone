'use client';

import { useState, useEffect } from 'react';
import { Check, X, Flame, Heart, Users } from 'lucide-react';

interface NeedReview {
  id: string;
  display_text: string;
  keyword: string | null;
  count: number;
  interest_count: number;
  fire_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

type FilterStatus = 'pending_review' | 'gathering' | 'rejected';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending_review: { label: '심사 대기', color: '#f59e0b', bg: 'bg-amber-500/10' },
  gathering: { label: '승인 (공개 중)', color: '#22c55e', bg: 'bg-green-500/10' },
  rejected: { label: '반려', color: '#ef4444', bg: 'bg-red-500/10' },
  group_created: { label: '모임 개설됨', color: '#3b82f6', bg: 'bg-blue-500/10' },
};

export default function BadakNeedsQueuePage() {
  const [needs, setNeeds] = useState<NeedReview[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('pending_review');
  const [processing, setProcessing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNeeds = (status: string) => {
    setLoading(true);
    fetch(`/api/badak/needs/review?status=${status}`)
      .then((r) => r.json())
      .then((data) => setNeeds(data.needs || []))
      .catch(() => setNeeds([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNeeds(filter);
  }, [filter]);

  const handleAction = async (needId: string, action: 'approve' | 'reject') => {
    setProcessing(needId);
    const res = await fetch('/api/badak/needs/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ needId, action }),
    });

    if (res.ok) {
      setNeeds((prev) => prev.filter((n) => n.id !== needId));
    }
    setProcessing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Badak 니즈 심사</h1>
          <p className="text-sm text-neutral-500 mt-1">사용자가 제출한 새 니즈를 승인/반려합니다</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-400">필터:</span>
          {(['pending_review', 'gathering', 'rejected'] as FilterStatus[]).map((s) => {
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

      {loading && (
        <div className="py-20 text-center text-sm text-neutral-400">불러오는 중...</div>
      )}

      {!loading && needs.length === 0 && (
        <div className="py-20 text-center text-sm text-neutral-400">
          {filter === 'pending_review' ? '심사 대기 중인 니즈가 없습니다' : '해당 상태의 니즈가 없습니다'}
        </div>
      )}

      <div className="space-y-2">
        {needs.map((need) => {
          const st = STATUS_LABELS[need.status] || STATUS_LABELS.pending_review;

          return (
            <div key={need.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.bg}`}
                      style={{ color: st.color }}
                    >
                      {st.label}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(need.created_at).toLocaleDateString('ko-KR', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 truncate">{need.display_text}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> 공감 {need.count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {need.interest_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" /> {need.fire_count}
                    </span>
                  </div>
                </div>

                {need.status === 'pending_review' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(need.id, 'approve')}
                      disabled={processing === need.id}
                      className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> 승인
                    </button>
                    <button
                      onClick={() => handleAction(need.id, 'reject')}
                      disabled={processing === need.id}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> 반려
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
