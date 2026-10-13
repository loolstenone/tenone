'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, MessageCircle, Users, ArrowRight } from 'lucide-react';
import type { MatchReason, MatchMode } from '@/lib/wio/people/matching';

export interface WantsCardData {
  needIds: string[];
  needTexts: string[];
  mode: MatchMode;
  score: number;
  reasons: MatchReason[];
  suggestedTitle: string;
  others: {
    userId: string;
    memberId: string | null;
    displayName: string;
    avatarUrl: string | null;
    jobFunction: string | null;
    experienceYears: number | null;
  }[];
}

const MODE_LABELS: Record<MatchMode, { label: string; color: string }> = {
  needs_match: { label: '같은 니즈', color: '#fbbf24' },
  mutual: { label: '상호 보완', color: '#60a5fa' },
  network: { label: '네트워킹', color: '#86efac' },
};

interface WantsCardProps {
  want: WantsCardData;
  /** 로그인된 내 user_id (Want member_ids에 포함되어야 함) */
  myUserId: string;
  onStartDm: (peerUserId: string) => void;
  onDismiss?: () => void;
}

export function WantsCard({ want, myUserId, onStartDm, onDismiss }: WantsCardProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const modeStyle = MODE_LABELS[want.mode];
  const others = want.others.slice(0, 3);
  const remaining = Math.max(0, want.others.length - others.length);

  const firstNeedId = want.needIds[0];

  // Want을 DB에 영속화한 뒤 모임 생성 페이지로 이동
  const handleCreateGroup = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) {
        setCreating(false);
        return;
      }
      const peerUserIds = want.others.map((o) => o.userId);
      const memberIds = [myUserId, ...peerUserIds];
      const res = await fetch('/api/badak/wants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          needIds: want.needIds,
          memberIds,
          mode: want.mode,
          score: want.score,
          reasons: want.reasons,
          suggestedTitle: want.suggestedTitle,
          action: 'create_group',
        }),
      });
      if (res.ok) {
        const { want: created } = await res.json();
        const params = new URLSearchParams();
        params.set('want_id', created.id);
        if (firstNeedId) params.set('need', firstNeedId);
        router.push(`/badak/groups/create?${params.toString()}`);
      } else {
        // fallback: want 없이 그냥 이동
        const params = new URLSearchParams();
        if (firstNeedId) params.set('need', firstNeedId);
        router.push(`/badak/groups/create?${params.toString()}`);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: `linear-gradient(135deg, ${modeStyle.color}08, rgba(255,255,255,0.02))`,
        borderColor: `${modeStyle.color}30`,
      }}
    >
      {/* 모드 배지 */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: `${modeStyle.color}20`, color: modeStyle.color }}
        >
          {modeStyle.label}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-white/30">
          <Sparkles className="h-3 w-3" />
          매칭 점수 {want.score}
        </div>
      </div>

      {/* 제안 제목 (AI 생성 예정) */}
      <h3 className="mb-3 text-[17px] font-bold leading-snug text-white">
        💡 {want.suggestedTitle}
      </h3>

      {/* 공유 니즈 */}
      {want.needTexts.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {want.needTexts.map((t, i) => (
            <span
              key={i}
              className="rounded-md px-2 py-1 text-[11.5px] text-white/60"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* 상대방 미리보기 */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex -space-x-2">
          {others.map((p) =>
            p.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.userId}
                src={p.avatarUrl}
                alt=""
                className="h-8 w-8 rounded-full border-2 object-cover"
                style={{ borderColor: '#1a1a2e' }}
              />
            ) : (
              <div
                key={p.userId}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                  borderColor: '#1a1a2e',
                }}
              >
                {p.displayName.charAt(0)}
              </div>
            ),
          )}
        </div>
        <div className="min-w-0 flex-1 text-[12.5px] text-white/55">
          {others.map((p) => p.displayName).join(', ')}
          {remaining > 0 && ` 외 ${remaining}명`}
          {others[0]?.jobFunction && (
            <span className="ml-1 text-white/30">· {others[0].jobFunction}</span>
          )}
        </div>
      </div>

      {/* 매칭 근거 (Top 2) */}
      {want.reasons.length > 0 && (
        <div className="mb-5 rounded-xl border border-white/5 bg-white/3 px-3 py-2.5">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            왜 이 사람과?
          </div>
          <div className="space-y-0.5 text-[11.5px] text-white/55">
            {want.reasons.slice(0, 2).map((r, i) => (
              <div key={i}>· {r.label}</div>
            ))}
          </div>
        </div>
      )}

      {/* 액션 */}
      <div className="flex gap-2">
        <button
          onClick={handleCreateGroup}
          disabled={creating}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
          style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
        >
          <Users className="h-4 w-4" /> {creating ? '생성 중...' : '모임 만들기'}
        </button>
        <button
          onClick={() => onStartDm(want.others[0]?.userId ?? '')}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white/65 hover:border-white/25 hover:text-white/90"
        >
          <MessageCircle className="h-4 w-4" /> 대화 신청
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="mt-2 w-full text-center text-[11px] text-white/30 hover:text-white/50"
        >
          이 원츠 숨기기
        </button>
      )}
    </div>
  );
}
