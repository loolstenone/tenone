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
  const [skyBg, setSkyBg] = useState('linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)');

  const SUB_COPIES = [
    '회사 밖에서도 통하는 사람이 되고 싶어.',
    'Next Stage를 준비하고 싶어.',
    '사수를 만들고 싶어.',
    '내가 알거든, 후배들 도와 주고 싶어.',
    '약한 연결고리가 만드는 강력한 기회.',
    '긍정적인 사람을 만나고 싶어.',
    '나는 어디 가서 경력을 쌓으란 말인가?',
    '사수라는게 있는 걸까? 우리 회사에는 없던데.',
  ];
  const [subCopy] = useState(() => SUB_COPIES[Math.floor(Math.random() * SUB_COPIES.length)]);

  const [sphereRadius, setSphereRadius] = useState(180);
  const [spark, setSpark] = useState<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const autoRef = useRef<number>();
  const feedRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);

  // Time-based sky + responsive sphere radius
  useEffect(() => {
    const sky = getTimeBasedSky();
    setSkyBg(sky.bg);
    const updateRadius = () => {
      setSphereRadius(window.innerWidth < 640 ? 120 : 200);
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // Animation loop — auto-rotate idle + inertia after drag
  useEffect(() => {
    const FRICTION = 0.985;
    const IDLE_SPEED = 0.002;
    const MIN_VELOCITY = 0.0001;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 3); // normalize to 60fps, cap at 3x
      lastTime = now;

      if (!isDragging.current) {
        const vx = velocity.current.x;
        const vy = velocity.current.y;
        const hasInertia = Math.abs(vx) > MIN_VELOCITY || Math.abs(vy) > MIN_VELOCITY;

        if (hasInertia) {
          const friction = Math.pow(FRICTION, dt);
          velocity.current.x *= friction;
          velocity.current.y *= friction;
          setRotation((prev) => ({
            x: prev.x + velocity.current.x * dt,
            y: prev.y + velocity.current.y * dt,
          }));
        } else {
          velocity.current = { x: 0, y: 0 };
          setRotation((prev) => ({
            x: prev.x,
            y: prev.y + IDLE_SPEED * dt,
          }));
        }
      }
      autoRef.current = requestAnimationFrame(animate);
    };
    autoRef.current = requestAnimationFrame((t) => { lastTime = t; animate(t); });
    return () => {
      if (autoRef.current) cancelAnimationFrame(autoRef.current);
    };
  }, []);

  // Mouse/touch drag — Google Earth style
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    velocity.current = { x: 0, y: 0 };
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    const vx = -dy * 0.004;
    const vy = dx * 0.004;
    velocity.current = { x: vx, y: vy };
    setRotation((prev) => ({
      x: prev.x + vx,
      y: prev.y + vy,
    }));
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    // velocity remains — inertia picks up in animation loop
  }, []);

  // Search / send need — spark flies to sphere center
  const handleSend = useCallback((text: string) => {
    setSending(true);
    setSearchText(text);

    // Calculate spark start (input) and target (sphere center)
    if (inputAreaRef.current && sphereRef.current) {
      const inputRect = inputAreaRef.current.getBoundingClientRect();
      const sphereRect = sphereRef.current.getBoundingClientRect();
      setSpark({
        x: inputRect.left + inputRect.width / 2,
        y: inputRect.top,
        tx: sphereRect.left + sphereRect.width / 2,
        ty: sphereRect.top + sphereRect.height / 2,
      });
      setTimeout(() => setSpark(null), 900);
    }

    setTimeout(() => {
      setSending(false);
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
    <div className="mx-auto w-full max-w-[860px] pt-14">
      {/* ===== Hero Section ===== */}
      <section
        className="relative flex flex-col"
        style={{ minHeight: 'calc(100vh - 56px)', background: skyBg }}
      >
        {/* Slogan */}
        <div className="px-6 pt-12 text-center sm:pt-16" style={{ animation: 'badak-fadeUp 0.6s ease both' }}>
          <h1
            className="text-[20px] font-black leading-[1.3] text-white sm:text-[26px]"
            style={{ letterSpacing: '-0.04em' }}
          >
            독서도 취미도 다 좋은데<br />
            난 좀 더 <span className="text-amber-400">성장</span>하고 싶어
          </h1>
          <p
            className="mt-2 text-[12px] text-white/40 sm:text-[14px]"
            style={{ letterSpacing: '-0.02em' }}
          >
            {subCopy}
          </p>
        </div>

        {/* Needs Cloud — Sphere */}
        <div
          className="relative mx-auto flex-1"
          style={{
            width: '100%',
            maxWidth: '500px',
            minHeight: sphereRadius < 150 ? '320px' : '480px',
            cursor: isDragging.current ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div ref={sphereRef} className="absolute inset-0 flex justify-center" style={{ alignItems: 'flex-start', paddingTop: '5%' }}>
            {CLOUD_WORDS.map((word, i) => (
              <CloudBubble
                key={word.text}
                word={word}
                index={i}
                total={CLOUD_WORDS.length}
                rotation={rotation}
                radius={sphereRadius}
                onClick={setSelectedWord}
              />
            ))}
          </div>
        </div>

        {/* Needs Input — Fixed at bottom of hero */}
        <div className="sticky bottom-0 z-40 px-4 pb-4 pt-2" style={{ background: 'linear-gradient(transparent 0%, rgba(26,26,46,0.95) 30%)' }}>
          <div ref={inputAreaRef} className="mx-auto max-w-[500px]">
            <NeedsInput onSend={handleSend} sending={sending} />
          </div>
          {/* Scroll to feed button */}
          <button
            onClick={scrollToFeed}
            className="mx-auto mt-2 flex items-center gap-1 rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            진행 중인 모임 보기 <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </section>

      {/* ===== Feed Section ===== */}
      <div ref={feedRef}>
        <FeedSection />
      </div>

      {/* ===== Spark animation — flies to sphere center ===== */}
      {spark && (
        <div
          className="pointer-events-none fixed z-[999] h-2 w-2 rounded-full"
          style={{
            left: spark.x,
            top: spark.y,
            background: '#ffd93d',
            boxShadow: '0 0 12px #ffd93d, 0 0 24px rgba(255,217,61,0.5)',
            animation: 'badak-sparkFly 0.7s cubic-bezier(0.1, 0.4, 0.2, 1) forwards',
            '--spark-tx': `${spark.tx - spark.x}px`,
            '--spark-ty': `${spark.ty - spark.y}px`,
          } as React.CSSProperties}
        />
      )}

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
