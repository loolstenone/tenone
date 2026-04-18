'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { FeedItem } from '@/types/badak';
import { MemberProfileSheet } from '@/features/badak/MemberProfileSheet';

const BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  '모임 확정': { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.2)' },
  '니즈 모이는 중': { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: 'rgba(96,165,250,0.2)' },
  '마감 임박': { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.2)' },
  'Next Stage 스토리': { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
};

interface FeedCardProps {
  item: FeedItem;
  index: number;
}

interface CardInnerProps {
  item: FeedItem;
  linked?: boolean;
  onLeaderClick?: (e: React.MouseEvent) => void;
}

function CardInner({ item, linked = false, onLeaderClick }: CardInnerProps) {
  const DEFAULT_BADGE = { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)' };
  const bs = BADGE_STYLES[item.badge] ?? DEFAULT_BADGE;

  // 리더 이름 파싱 — "바닥장 김도현" → { isLeader: true, name: "김도현" }
  const parseLeader = (raw?: string) => {
    if (!raw) return { isLeader: false, name: raw ?? '?' };
    if (raw.startsWith('바닥장')) {
      return { isLeader: true, name: raw.slice(3).trimStart() || raw };
    }
    return { isLeader: false, name: raw };
  };
  const { isLeader, name: leaderName } = parseLeader(item.leader);

  return (
    <>
      {item.imageUrl && (
        <img src={item.imageUrl} alt="" className="h-40 w-full object-cover" />
      )}
      <div className="p-5">
        {/* Badge */}
        <div className="mb-2.5">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ background: bs.bg, color: bs.color, border: `1px solid ${bs.border}` }}
          >
            {item.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-3 text-[15px] font-semibold leading-[1.45] text-white/85" style={{ letterSpacing: '-0.03em' }}>
          {item.title}
        </h3>

        {/* Group */}
        {item.type === 'group' && (
          <div className="flex flex-col gap-2">
            {/* 리더 — 클릭 가능 */}
            <button
              type="button"
              onClick={onLeaderClick}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 -mx-2 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.06]"
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              >
                {leaderName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-white/80 truncate">{leaderName}</span>
                  {isLeader && (
                    <span
                      className="shrink-0 rounded-full px-1.5 py-px text-[9px] font-bold"
                      style={{ background: 'rgba(255,217,61,0.12)', color: '#ffd93d', border: '1px solid rgba(255,217,61,0.2)' }}
                    >
                      바닥장
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-white/30">{item.leaderJob}</div>
              </div>
            </button>

            <div className="flex flex-wrap gap-3 text-xs text-white/35">
              {item.date && <span>📅 {item.date}</span>}
              {item.location && <span>📍 {item.location}</span>}
              <span style={{ color: (item.members ?? 0) / (item.max ?? 1) > 0.9 ? '#f87171' : undefined }}>
                👥 {item.members ?? 0}/{item.max ?? 0}
              </span>
            </div>
            {/* 상세 보기 화살표 힌트 — 링크 있을 때만 */}
            {linked && (
              <div className="mt-1 flex items-center justify-end gap-1 text-[11px]" style={{ color: 'rgba(255,217,61,0.5)' }}>
                자세히 보기 →
              </div>
            )}
          </div>
        )}

        {/* Needs */}
        {item.type === 'needs' && (
          <div>
            <div className="mb-2 h-1 overflow-hidden rounded-sm" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-sm transition-[width] duration-1000"
                style={{
                  width: `${((item.count ?? 0) / (item.threshold ?? 1)) * 100}%`,
                  background: 'linear-gradient(90deg, #ffd93d, #ff6b6b)',
                }}
              />
            </div>
            <div className="text-xs text-white/35">
              {item.count ?? 0}명이 원해요 · {item.threshold ?? 0}명 모이면 바닥장을 찾아요
            </div>
          </div>
        )}

        {/* Story */}
        {item.type === 'story' && (
          <div className="text-xs text-white/35">
            {item.author} · {item.authorJob}
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-xl px-2 py-0.5 text-[11px] text-white/30"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function FeedCard({ item, index }: FeedCardProps) {
  const [showProfile, setShowProfile] = useState(false);

  const baseClass = "mb-3 block overflow-hidden rounded-2xl border border-white/8 transition-colors hover:border-white/15 hover:bg-white/[0.05]";
  const style = {
    background: 'rgba(255,255,255,0.03)',
    animation: 'badak-fadeUp 0.5s ease both',
    animationDelay: `${index * 0.08}s`,
  };

  // 리더 이름 파싱 (프로필 시트용)
  const parseLeader = (raw?: string) => {
    if (!raw) return { isLeader: false, name: '' };
    if (raw.startsWith('바닥장')) return { isLeader: true, name: raw.slice(3).trimStart() };
    return { isLeader: false, name: raw };
  };
  const { isLeader, name: leaderName } = parseLeader(item.leader);

  const handleLeaderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfile(true);
  };

  // 모임 → 상세 페이지 링크
  if (item.type === 'group' && item.groupId) {
    return (
      <>
        <Link href={`/badak/groups/${item.groupId}`} className={baseClass} style={style}>
          <CardInner item={item} linked onLeaderClick={handleLeaderClick} />
        </Link>
        {showProfile && (
          <MemberProfileSheet
            memberId={item.leaderId ?? null}
            displayName={leaderName || item.leader || '?'}
            job={item.leaderJob}
            isLeader={isLeader}
            onClose={() => setShowProfile(false)}
          />
        )}
      </>
    );
  }

  // 그 외 (니즈, 스토리) — 클릭 불가 카드
  return (
    <>
      <div className={baseClass} style={style}>
        <CardInner item={item} onLeaderClick={handleLeaderClick} />
      </div>
      {showProfile && item.leader && (
        <MemberProfileSheet
          memberId={item.leaderId ?? null}
          displayName={leaderName || item.leader || '?'}
          job={item.leaderJob}
          isLeader={isLeader}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
}
