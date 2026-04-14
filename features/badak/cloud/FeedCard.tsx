'use client';

import type { FeedItem } from '@/types/badak';

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

export function FeedCard({ item, index }: FeedCardProps) {
  const bs = BADGE_STYLES[item.badge] ?? BADGE_STYLES['니즈 모이는 중'];

  return (
    <div
      className="mb-3 overflow-hidden rounded-2xl border border-white/8"
      style={{
        background: 'rgba(255,255,255,0.03)',
        animation: 'badak-fadeUp 0.5s ease both',
        animationDelay: `${index * 0.08}s`,
      }}
    >
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
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
              {item.leader.charAt(4)}
            </div>
            <div>
              <div className="text-[13px] font-medium text-white/70">{item.leader}</div>
              <div className="text-[11px] text-white/30">{item.leaderJob}</div>
            </div>
          </div>
          <div className="flex gap-3 text-xs text-white/35">
            <span>📅 {item.date}</span>
            <span>📍 {item.location}</span>
            <span style={{ color: item.members / item.max > 0.9 ? '#f87171' : undefined }}>
              👥 {item.members}/{item.max}
            </span>
          </div>
        </div>
      )}

      {/* Needs */}
      {item.type === 'needs' && (
        <div>
          <div className="mb-2 h-1 overflow-hidden rounded-sm" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-sm transition-[width] duration-1000"
              style={{
                width: `${(item.count / item.threshold) * 100}%`,
                background: 'linear-gradient(90deg, #ffd93d, #ff6b6b)',
              }}
            />
          </div>
          <div className="text-xs text-white/35">
            {item.count}명이 원해요 · {item.threshold}명 모이면 바닥장을 찾아요
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
      {item.tags && (
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
    </div>
  );
}
