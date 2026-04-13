'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Flame, Star, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FeedItem } from '@/types/badak';

interface HighlightCard {
  type: 'hot' | 'recommended' | 'active';
  label: string;
  icon: React.ReactNode;
  labelColor: string;
  bgColor: string;
  item: FeedItem;
}

interface FeedHighlightsProps {
  items: FeedItem[];
}

export function FeedHighlights({ items }: FeedHighlightsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 카테고리별 분류
  const hotItems = items
    .filter((i) => i.type === 'group' && i.badge === '마감 임박')
    .slice(0, 2);
  const recommendedItems = items
    .filter((i) => i.type === 'group' && i.badge === '모임 확정')
    .slice(0, 2);
  const activeNeeds = items
    .filter((i) => i.type === 'needs')
    .slice(0, 2);

  const highlights: HighlightCard[] = [
    ...hotItems.map((item) => ({
      type: 'hot' as const,
      label: '🔥 Hot',
      icon: <Flame className="h-3.5 w-3.5" />,
      labelColor: '#dc2626',
      bgColor: '#fef2f2',
      item,
    })),
    ...recommendedItems.map((item) => ({
      type: 'recommended' as const,
      label: '⭐ 추천',
      icon: <Star className="h-3.5 w-3.5" />,
      labelColor: '#d97706',
      bgColor: '#fffbeb',
      item,
    })),
    ...activeNeeds.map((item) => ({
      type: 'active' as const,
      label: '🚀 진행중',
      icon: <Users className="h-3.5 w-3.5" />,
      labelColor: '#2563eb',
      bgColor: '#eff6ff',
      item,
    })),
  ];

  if (highlights.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 260;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative mb-6">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-neutral-800">니즈 맞춤 공지</h2>
        <div className="flex gap-1">
          <button onClick={() => scroll('left')} className="rounded-full border border-neutral-200 p-1 text-neutral-400 hover:text-neutral-600">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => scroll('right')} className="rounded-full border border-neutral-200 p-1 text-neutral-400 hover:text-neutral-600">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-none"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {highlights.map((h, i) => (
          <div
            key={i}
            className="w-[240px] shrink-0 overflow-hidden rounded-xl border border-neutral-100"
            style={{ background: h.bgColor, scrollSnapAlign: 'start' }}
          >
            {h.item.imageUrl && (
              <img src={h.item.imageUrl} alt="" className="h-24 w-full object-cover" />
            )}
            <div className="p-4">
            <span
              className="mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ color: h.labelColor, background: 'rgba(255,255,255,0.7)' }}
            >
              {h.label}
            </span>
            <h3 className="mb-2 text-[13px] font-bold leading-snug text-neutral-900 line-clamp-2">
              {h.item.title}
            </h3>
            {h.item.type === 'group' && (
              <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                <span>📅 {h.item.date}</span>
                <span>👥 {h.item.members}/{h.item.max}</span>
              </div>
            )}
            {h.item.type === 'needs' && (
              <div className="text-[11px] text-neutral-500">
                {h.item.count}명이 원해요
              </div>
            )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
