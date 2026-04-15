'use client';

import { Briefcase, Sparkles } from 'lucide-react';
import type { MatchReason, MatchMode } from '@/lib/wio/people/matching';

export interface MatchCardData {
  peerId: string;
  memberId: string | null;
  displayName: string;
  avatarUrl: string | null;
  industry: string | null;
  jobFunction: string | null;
  experienceYears: number | null;
  score: number;
  reasons: MatchReason[];
  mode: MatchMode;
}

interface MatchCardProps {
  match: MatchCardData;
  onProfile: () => void;
  onConnect: () => void;
}

export function MatchCard({ match, onProfile, onConnect }: MatchCardProps) {
  const avatarLetter = match.displayName.charAt(0);
  const roleLine = [
    match.jobFunction,
    match.industry,
    match.experienceYears ? `${match.experienceYears}년차` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  // 매칭 근거 Top 3만 표시
  const topReasons = match.reasons.slice(0, 3);

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start gap-4">
        {/* 아바타 */}
        {match.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={match.avatarUrl}
            alt={match.displayName}
            className="h-14 w-14 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {avatarLetter}
          </div>
        )}

        {/* 이름 + 직무 */}
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="text-[16px] font-bold leading-tight text-white">
            {match.displayName}
          </div>
          {roleLine && (
            <div className="mt-1 flex items-center gap-1.5 text-[13px] text-white/50">
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="truncate">{roleLine}</span>
            </div>
          )}
        </div>
      </div>

      {/* 매칭 근거 */}
      {topReasons.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400/70">
            <Sparkles className="h-3 w-3" />
            매칭 근거
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topReasons.map((r, i) => (
              <span
                key={i}
                className="rounded-full px-2.5 py-1 text-[11.5px]"
                style={{
                  background: 'rgba(255,217,61,0.08)',
                  color: '#fcd34d',
                  border: '1px solid rgba(255,217,61,0.2)',
                }}
              >
                {r.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 액션 */}
      <div className="mt-5 flex gap-2">
        <button
          onClick={onProfile}
          className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white/60 hover:border-white/25 hover:text-white/85"
        >
          프로필 보기
        </button>
        <button
          onClick={onConnect}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
          style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}
        >
          관심 보내기
        </button>
      </div>
    </div>
  );
}
