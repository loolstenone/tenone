'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { Flame, Star, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FeedItem } from '@/types/badak';

interface HighlightCard {
  type: 'hot' | 'recommended' | 'active';
  label: string;
  labelColor: string;
  bgColor: string;
  item: FeedItem;
}

interface FeedHighlightsProps {
  items: FeedItem[];
}

export function FeedHighlights({ items }: FeedHighlightsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const hotItems = items.filter((i) => i.type === 'group' && i.badge === '마감 임박').slice(0, 2);
  const recommendedItems = items.filter((i) => i.type === 'group' && i.badge === '모임 확정').slice(0, 2);
  const activeNeeds = items.filter((i) => i.type === 'needs').slice(0, 2);

  const highlights: HighlightCard[] = [
    ...hotItems.map((item) => ({
      type: 'hot' as const,
      label: '🔥 Hot',
      labelColor: '#f87171',
      bgColor: 'rgba(239,68,68,0.06)',
      item,
    })),
    ...recommendedItems.map((item) => ({
      type: 'recommended' as const,
      label: '⭐ 추천',
      labelColor: '#fbbf24',
      bgColor: 'rgba(255,217,61,0.06)',
      item,
    })),
    ...activeNeeds.map((item) => ({
      type: 'active' as const,
      label: '🚀 진행중',
      labelColor: '#60a5fa',
      bgColor: 'rgba(96,165,250,0.06)',
      item,
    })),
  ];

  if (highlights.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  };

  return (
    <div className="relative mb-6">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-white/70">니즈 맞춤 공지</h2>
        <div className="flex gap-1">
          <button onClick={() => scroll('left')} className="rounded-full border border-white/10 p-1 text-white/30 hover:text-white/60">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => scroll('right')} className="rounded-full border border-white/10 p-1 text-white/30 hover:text-white/60">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3"
        style={{
          overflowX: 'scroll',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {highlights.map((h, i) => {
          const isGroupLink = h.item.type === 'group' && h.item.groupId;
          const CardWrapper = ({ children }: { children: React.ReactNode }) =>
            isGroupLink ? (
              <Link
                href={`/badak/groups/${h.item.groupId}`}
                className="block w-[240px] shrink-0 overflow-hidden rounded-xl border border-white/8 transition-colors hover:border-white/20"
                style={{ background: h.bgColor, scrollSnapAlign: 'start' }}
              >
                {children}
              </Link>
            ) : (
              <div
                className="w-[240px] shrink-0 overflow-hidden rounded-xl border border-white/8"
                style={{ background: h.bgColor, scrollSnapAlign: 'start' }}
              >
                {children}
              </div>
            );

          return (
            <CardWrapper key={i}>
              {h.item.imageUrl && (
                <img src={h.item.imageUrl} alt="" className="h-24 w-full object-cover" />
              )}
              <div className="p-4">
                <span
                  className="mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ color: h.labelColor, background: 'rgba(255,255,255,0.08)' }}
                >
                  {h.label}
                </span>
                <h3 className="mb-2 text-[13px] font-bold leading-snug text-white/80 line-clamp-2">
                  {h.item.title}
                </h3>
                {h.item.type === 'group' && (
                  <div className="flex items-center gap-2 text-[11px] text-white/35">
                    <span>📅 {h.item.date}</span>
                    <span>👥 {h.item.members}/{h.item.max}</span>
                  </div>
                )}
                {h.item.type === 'needs' && (
                  <div className="text-[11px] text-white/35">
                    {h.item.count}명이 원해요
                  </div>
                )}
                {isGroupLink && (
                  <div className="mt-2 text-[11px]" style={{ color: 'rgba(255,217,61,0.5)' }}>
                    자세히 보기 →
                  </div>
                )}
              </div>
            </CardWrapper>
          );
        })}
      </div>
    </div>
  );
}
