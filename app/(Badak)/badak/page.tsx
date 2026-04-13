'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CloudWord } from '@/types/badak';
import { CLOUD_WORDS } from '@/lib/badak-cloud-data';
import { CloudBubble } from '@/features/badak/cloud/CloudBubble';
import { NeedsInput } from '@/features/badak/cloud/NeedsInput';
import { FeedSection } from '@/features/badak/cloud/FeedSection';
import { NeedDetailSheet } from '@/features/badak/cloud/NeedDetailSheet';
import { SearchResultOverlay } from '@/features/badak/cloud/SearchResultOverlay';
import { getTimeBasedSky } from '@/lib/badak-cloud-data';
import { ChevronDown } from 'lucide-react';

export default function BadakNextStage() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [selectedWord, setSelectedWord] = useState<CloudWord | null>(null);
  const [sending, setSending] = useState(false);
  const [searchResults, setSearchResults] = useState<CloudWord[] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [skyBg, setSkyBg] = useState('linear-gradient(180deg, #f5f5f5 0%, #fff 100%)');

  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const autoRef = useRef<number>();
  const feedRef = useRef<HTMLDivElement>(null);

  // Time-based sky
  useEffect(() => {
    const sky = getTimeBasedSky();
    setSkyBg(sky.bg);
  }, []);

  // Auto-rotate sphere
  useEffect(() => {
    const animate = () => {
      if (!isDragging.current) {
        setRotation((prev) => ({
          x: prev.x,
          y: prev.y + 0.002,
        }));
      }
      autoRef.current = requestAnimationFrame(animate);
    };
    autoRef.current = requestAnimationFrame(animate);
    return () => {
      if (autoRef.current) cancelAnimationFrame(autoRef.current);
    };
  }, []);

  // Mouse/touch drag for sphere rotation
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setRotation((prev) => ({
      x: prev.x + dy * 0.005,
      y: prev.y + dx * 0.005,
    }));
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Search / send need
  const handleSend = useCallback((text: string) => {
    setSending(true);
    setSearchText(text);
    setTimeout(() => {
      setSending(false);
      // Match words containing similar keywords
      const lower = text.toLowerCase();
      const results = CLOUD_WORDS.filter(
        (w) =>
          w.text.includes(text) ||
          text.split('').some((c) => w.text.includes(c) && c.match(/[가-힣]/))
      ).slice(0, 6);
      setSearchResults(results.length > 0 ? results : CLOUD_WORDS.slice(0, 4));
    }, 1200);
  }, []);

  const scrollToFeed = () => {
    feedRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="mx-auto w-full max-w-[860px]">
      {/* ===== Hero Section ===== */}
      <section
        className="relative flex flex-col"
        style={{ minHeight: '100vh', background: skyBg }}
      >
        {/* Slogan */}
        <div className="px-6 pt-24 text-center" style={{ animation: 'badak-fadeUp 0.6s ease both' }}>
          <h1
            className="text-[28px] font-black leading-[1.3] text-neutral-900 sm:text-[36px]"
            style={{ letterSpacing: '-0.04em' }}
          >
            지식도 취미도 다 좋은데<br />
            난 좀 더 <span className="text-blue-600">성장</span>하고 싶어
          </h1>
          <p
            className="mt-3 text-[14px] text-neutral-500 sm:text-[16px]"
            style={{ letterSpacing: '-0.02em' }}
          >
            회사 밖에서도 통하는 사람이 되고 싶어.
          </p>
        </div>

        {/* Needs Cloud — Sphere */}
        <div
          className="relative mx-auto flex-1"
          style={{
            width: '100%',
            maxWidth: '500px',
            minHeight: '360px',
            cursor: isDragging.current ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {CLOUD_WORDS.map((word, i) => (
              <CloudBubble
                key={word.text}
                word={word}
                index={i}
                total={CLOUD_WORDS.length}
                rotation={rotation}
                onClick={setSelectedWord}
              />
            ))}
          </div>
        </div>

        {/* Needs Input — Fixed at bottom of hero */}
        <div className="sticky bottom-0 z-40 px-4 pb-4 pt-2" style={{ background: 'linear-gradient(transparent 0%, rgba(255,255,255,0.95) 30%)' }}>
          <div className="mx-auto max-w-[500px]">
            <NeedsInput onSend={handleSend} sending={sending} />
          </div>
          {/* Scroll to feed button */}
          <button
            onClick={scrollToFeed}
            className="mx-auto mt-2 flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          >
            진행 중인 모임 보기 <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </section>

      {/* ===== Feed Section ===== */}
      <div ref={feedRef}>
        <FeedSection />
      </div>

      {/* ===== Modals ===== */}
      {selectedWord && (
        <NeedDetailSheet
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}

      {searchResults && (
        <SearchResultOverlay
          inputText={searchText}
          results={searchResults}
          onClose={() => setSearchResults(null)}
          onSelectWord={(w) => {
            setSearchResults(null);
            setSelectedWord(w);
          }}
        />
      )}
    </div>
  );
}
