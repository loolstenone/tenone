'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { FeedItem } from '@/types/badak';
import { FeedCard } from './FeedCard';
import { FeedHighlights } from './FeedHighlights';
import { QuoteBanner } from './QuoteBanner';
import { ParticipationBanner } from './ParticipationBanner';
import { X, Loader2, CheckCircle } from 'lucide-react';

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
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // API 피드 로드 (탭 전환 시 재호출)
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
    fetch(`/api/badak/feed?filter=${encodeURIComponent(activeTab)}`)
      .then((r) => r.json())
      .then((data) => { setFeedItems((data.feed as FeedItem[]) ?? []); })
      .catch(() => {});
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

      {/* 문의하기 */}
      <div className="mt-4 pt-6 border-t border-white/5 text-center">
        <p className="text-[11px] text-white/20 mb-2">궁금한 점이 있으신가요?</p>
        <button
          onClick={() => setShowInquiry(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/30 hover:text-white/60 hover:border-white/20 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          문의하기
        </button>
      </div>

      {showInquiry && <InquiryModal onClose={() => setShowInquiry(false)} />}
    </div>
  );
}

function InquiryModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState('일반');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const CATEGORIES = ['일반', '모임 참여', '바닥장 신청', '계정/탈퇴', '오류 신고', '기타'];

  const canSubmit = name.trim().length > 0 && message.trim().length >= 5;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const isEmail = contact.includes('@');
      const res = await fetch('/api/badak/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: isEmail ? contact.trim() : null,
          phone: !isEmail ? contact.trim() : null,
          category,
          message: message.trim(),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || '제출 실패');
      } else {
        setDone(true);
      }
    } catch {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[480px] rounded-t-2xl sm:rounded-2xl p-5 pb-8 sm:pb-5"
        style={{ background: '#1e1e30', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">문의하기</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <CheckCircle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white mb-1">문의가 접수됐어요</p>
            <p className="text-xs text-white/40">빠른 시일 내에 답변드릴게요</p>
            <button
              onClick={onClose}
              className="mt-5 px-6 py-2 rounded-full text-sm font-medium text-white/60 border border-white/10 hover:border-white/20 transition-colors"
            >
              닫기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-white/40 mb-1">이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-400/40"
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/40 mb-1">연락처 (이메일 또는 전화번호)</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email@example.com 또는 010-0000-0000"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-400/40"
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/40 mb-1">문의 유형</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="px-2.5 py-1 rounded-full text-[11px] border transition-colors"
                    style={{
                      border: category === c ? '1px solid rgba(255,217,61,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      background: category === c ? 'rgba(255,217,61,0.1)' : 'transparent',
                      color: category === c ? '#ffd93d' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-white/40 mb-1">문의 내용 *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="궁금한 점이나 불편한 점을 자유롭게 적어주세요"
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-400/40 resize-none"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full rounded-xl py-2.5 text-sm font-bold transition-all"
              style={{
                background: canSubmit ? 'linear-gradient(135deg, #ffd93d, #f59e0b)' : 'rgba(255,255,255,0.08)',
                color: canSubmit ? '#1a1a2e' : 'rgba(255,255,255,0.2)',
              }}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : '문의 보내기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
