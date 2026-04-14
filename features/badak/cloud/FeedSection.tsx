'use client';

import { useState, useEffect } from 'react';
import type { FeedItem } from '@/types/badak';
import { FEED_ITEMS } from '@/lib/badak-cloud-data';
import { FeedCard } from './FeedCard';
import { FeedHighlights } from './FeedHighlights';

const TABS = ['전체', '모임 확정', '니즈 모이는 중', '마감 임박', '스토리'];

function filterItems(items: FeedItem[], tab: string): FeedItem[] {
  if (tab === '전체') return items;
  if (tab === '스토리') return items.filter((i) => i.type === 'story');
  return items.filter((i) => i.badge === tab);
}

export function FeedSection() {
  const [activeTab, setActiveTab] = useState('전체');
  const [feedItems, setFeedItems] = useState<FeedItem[]>(FEED_ITEMS);

  useEffect(() => {
    fetch('/api/badak/feed')
      .then((r) => r.json())
      .then((data) => {
        if (data.feed?.length > 0) {
          setFeedItems(data.feed as FeedItem[]);
        }
      })
      .catch(() => {}); // fallback to mock
  }, []);

  const items = filterItems(feedItems, activeTab);

  return (
    <div className="border-t border-white/8 px-4 pb-24 pt-8" style={{ background: '#1a1a2e' }}>
      {/* Highlights — Hot/추천/진행중 좌우 슬라이드 */}
      <FeedHighlights items={feedItems} />

      {/* Filter tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium"
              style={{
                border: isActive ? '1px solid rgba(255,217,61,0.4)' : '1px solid rgba(255,255,255,0.1)',
                background: isActive ? 'rgba(255,217,61,0.1)' : 'transparent',
                color: isActive ? '#ffd93d' : 'rgba(255,255,255,0.4)',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {items.map((item, i) => (
        <FeedCard key={`${item.badge}-${i}`} item={item} index={i} />
      ))}

      {items.length === 0 && (
        <div className="py-16 text-center text-sm text-white/20">
          해당하는 항목이 없습니다
        </div>
      )}
    </div>
  );
}
