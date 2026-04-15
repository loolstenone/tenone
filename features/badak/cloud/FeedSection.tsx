'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { FeedItem } from '@/types/badak';
import { FEED_ITEMS } from '@/lib/badak-cloud-data';
import { FeedCard } from './FeedCard';
import { FeedHighlights } from './FeedHighlights';
import { QuoteBanner } from './QuoteBanner';
import { ParticipationBanner } from './ParticipationBanner';

const TABS = ['전체', '모임 확정', '니즈 모이는 중', '마감 임박', '스토리'];
const PAGE_SIZE = 4; // 첫 로드 수
const LOAD_MORE = 3; // 스크롤 시 추가 로드 수

function filterItems(items: FeedItem[], tab: string): FeedItem[] {
  if (tab === '전체') return items;
  if (tab === '스토리') return items.filter((i) => i.type === 'story');
  return items.filter((i) => i.badge === tab);
}

export function FeedSection() {
  const [activeTab, setActiveTab] = useState('전체');
  const [feedItems, setFeedItems] = useState<FeedItem[]>(FEED_ITEMS);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // API 피드 로드
  useEffect(() => {
    fetch('/api/badak/feed')
      .then((r) => r.json())
      .then((data) => {
        if (data.feed?.length > 0) setFeedItems(data.feed as FeedItem[]);
      })
      .catch(() => {});
  }, []);

  // 탭 전환 시 displayCount 초기화
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [activeTab]);

  // IntersectionObserver — 센티넬이 보이면 더 로드
  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    // 실제 API라면 여기서 page+1 fetch. 현재는 mock 시뮬레이션
    setTimeout(() => {
      setDisplayCount((prev) => prev + LOAD_MORE);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { threshold: 0.1, rootMargin: '0px 0px 80px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  const allItems = filterItems(feedItems, activeTab);
  const visibleItems = allItems.slice(0, displayCount);
  const hasMore = displayCount < allItems.length;

  return (
    <div className="border-t border-white/8 px-4 pb-24 pt-8" style={{ background: '#1a1a2e' }}>
      {/* Highlights — Hot/추천/진행중 좌우 슬라이드 */}
      <FeedHighlights items={feedItems} />

      {/* Filter tabs */}
      <div className="mb-5 flex gap-2 pb-1" style={{ overflowX: 'scroll', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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

      {/* Cards — 배너 삽입 규칙
          i=1 뒤: 참여 독려 배너
          i=3 뒤: 격언 배너 (QuoteBanner)
          i=6 뒤: 참여 독려 배너 (offset 다른 문구)
          i=9 뒤: 격언 배너 반복
      */}
      {visibleItems.map((item, i) => (
        <div key={`${item.type}-${item.badge}-${i}`}>
          <FeedCard item={item} index={i} />
          {i === 1 && <ParticipationBanner offset={0} />}
          {i === 3 && <QuoteBanner />}
          {i === 6 && <ParticipationBanner offset={7} />}
          {i === 9 && <QuoteBanner />}
          {i === 12 && <ParticipationBanner offset={4} />}
        </div>
      ))}

      {/* 빈 상태 */}
      {allItems.length === 0 && (
        <div className="py-16 text-center text-sm text-white/20">
          해당하는 항목이 없습니다
        </div>
      )}

      {/* 무한 스크롤 센티넬 */}
      {hasMore && (
        <div ref={sentinelRef} className="py-6 flex justify-center">
          {loadingMore ? (
            <div className="flex items-center gap-2 text-[12px] text-white/25">
              <span
                className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-amber-400/60 animate-spin"
                style={{ animationDuration: '0.8s' }}
              />
              불러오는 중...
            </div>
          ) : (
            <div className="h-1 w-1" /> // 보이지 않는 센티넬
          )}
        </div>
      )}

      {/* 모든 항목 표시 후 */}
      {!hasMore && allItems.length > 0 && (
        <div className="py-8 text-center text-[11px] text-white/15">
          모든 모임을 확인했어요 ·{' '}
          <button
            onClick={() => setDisplayCount(PAGE_SIZE)}
            className="underline underline-offset-2 hover:text-white/30"
          >
            처음으로
          </button>
        </div>
      )}
    </div>
  );
}
