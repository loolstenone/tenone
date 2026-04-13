'use client';

import type { FeedItem } from '@/types/badak';

const BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  '모임 확정': { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  '니즈 모이는 중': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  '마감 임박': { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  'Next Stage 스토리': { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
};

interface FeedCardProps {
  item: FeedItem;
  index: number;
}

export function FeedCard({ item, index }: FeedCardProps) {
  const bs = BADGE_STYLES[item.badge] ?? BADGE_STYLES['니즈 모이는 중'];

  return (
    <div
      className="mb-3 overflow-hidden rounded-2xl border border-neutral-100 bg-white"
      style={{
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
      <h3 className="mb-3 text-[15px] font-semibold leading-[1.45] text-neutral-900" style={{ letterSpacing: '-0.03em' }}>
        {item.title}
      </h3>

      {/* Group */}
      {item.type === 'group' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {item.leader.charAt(4)}
            </div>
            <div>
              <div className="text-[13px] font-medium text-neutral-800">{item.leader}</div>
              <div className="text-[11px] text-neutral-400">{item.leaderJob}</div>
            </div>
          </div>
          <div className="flex gap-3 text-xs text-neutral-400">
            <span>📅 {item.date}</span>
            <span>📍 {item.location}</span>
            <span style={{ color: item.members / item.max > 0.9 ? '#dc2626' : undefined }}>
              👥 {item.members}/{item.max}
            </span>
          </div>
        </div>
      )}

      {/* Needs */}
      {item.type === 'needs' && (
        <div>
          <div className="mb-2 h-1 overflow-hidden rounded-sm bg-neutral-100">
            <div
              className="h-full rounded-sm transition-[width] duration-1000"
              style={{
                width: `${(item.count / item.threshold) * 100}%`,
                background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
              }}
            />
          </div>
          <div className="text-xs text-neutral-400">
            {item.count}명이 원해요 · {item.threshold}명 모이면 바닥장을 찾아요
          </div>
        </div>
      )}

      {/* Story */}
      {item.type === 'story' && (
        <div className="text-xs text-neutral-400">
          {item.author} · {item.authorJob}
        </div>
      )}

      {/* Tags */}
      {item.tags && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span key={tag} className="rounded-xl bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-400">
              #{tag}
            </span>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
