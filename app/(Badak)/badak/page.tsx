'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CloudWord } from '@/types/badak';
import { CLOUD_WORDS } from '@/lib/badak-cloud-data';
import { CloudBubble } from '@/features/badak/cloud/CloudBubble';
import { NeedsInput } from '@/features/badak/cloud/NeedsInput';
import { FeedSection } from '@/features/badak/cloud/FeedSection';
import { NeedDetailSheet } from '@/features/badak/cloud/NeedDetailSheet';
import { getTimeBasedSky } from '@/lib/badak-cloud-data';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown } from 'lucide-react';

export default function BadakNextStage() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [selectedWord, setSelectedWord] = useState<CloudWord | null>(null);
  const [sending, setSending] = useState(false);
  const [skyBg, setSkyBg] = useState('linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)');
  const [cloudWords, setCloudWords] = useState<CloudWord[]>(CLOUD_WORDS);

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
  const autoRef = useRef<number | undefined>(undefined);
  const feedRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);

  // Time-based sky + responsive sphere radius
  useEffect(() => {
    const sky = getTimeBasedSky();
    setSkyBg(sky.bg);
    const updateRadius = () => {
      const w = window.innerWidth;
      // 컨테이너 정사각형 크기 = radius * 2.2 (단어 extension 포함)
      // 모바일: 화면 폭의 60% 기준 (140~180px) — 너무 크면 단어가 화면 밖으로 나감
      //         Math.min으로 너무 큰 화면에서도 과도하지 않게 cap
      if (w < 640) {
        const r = Math.min(170, Math.max(130, Math.floor(w * 0.42)));
        setSphereRadius(r);
      } else {
        setSphereRadius(220);
      }
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // DB에서 니즈 100개 fetch (실패 시 Mock 유지)
  useEffect(() => {
    fetch('/api/badak/needs?limit=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.words?.length > 0) setCloudWords(data.words);
      })
      .catch(() => {});
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
            // x-tilt를 서서히 0으로 복귀 → 항상 수평 궤도로 자연스럽게 돌아옴
            x: prev.x * Math.pow(0.97, dt),
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

  // 니즈 제출 — spark 애니메이션 + DB POST
  const handleSend = useCallback((text: string) => {
    setSending(true);

    // spark: 입력창 → 구 중심으로 날아가는 애니메이션
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

    // DB에 니즈 제출 (실패해도 UX 차단 없음, 인증 토큰 첨부)
    void (async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const token = sessionData.session?.access_token;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        await fetch('/api/badak/needs', {
          method: 'POST',
          headers,
          body: JSON.stringify({ text }),
        });
      } catch { /* silent */ }
    })();

    setTimeout(() => setSending(false), 800);
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

        {/* Needs Cloud — Sphere
            ① flex-1 wrapper: 남은 세로 공간 채우며 구체를 수직 중앙 배치
            ② 정사각형 inner: 구체 reference frame을 완벽한 정사각형으로 고정
               → left/top 50%가 항상 같은 픽셀 기준을 가짐 = 찌그러짐 방지
        */}
        <div
          className="flex-1 flex items-center justify-center"
          style={{ touchAction: 'none', userSelect: 'none', cursor: isDragging.current ? 'grabbing' : 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* 완전한 정사각형 컨테이너 — radius*2.4 = 구 지름(2r) + 단어 extension 여유 */}
          <div
            style={{
              position: 'relative',
              width: `${Math.round(sphereRadius * 2.4)}px`,
              height: `${Math.round(sphereRadius * 2.4)}px`,
              flexShrink: 0,
            }}
          >
            <div ref={sphereRef} className="absolute inset-0">
              {/* 클라우드 중앙 레이블 */}
              <div
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none"
                style={{ zIndex: 0 }}
              >
                <span
                  className="font-black tracking-widest uppercase"
                  style={{
                    fontSize: `${Math.round(sphereRadius * 0.18)}px`,
                    color: 'rgba(255,255,255,0.06)',
                    letterSpacing: '0.25em',
                  }}
                >
                  Needs
                </span>
              </div>
              {(() => {
                // 모바일(radius<180)에서는 50개만 표시, 그 외 80개
                // 관심도(members) 높은 순으로 정렬
                const maxWords = sphereRadius < 180 ? 50 : 80;
                const sorted = [...cloudWords]
                  .sort((a, b) => (b.members ?? 0) - (a.members ?? 0))
                  .slice(0, maxWords);
                return sorted.map((word, i) => (
                  <CloudBubble
                    key={word.text}
                    word={word}
                    index={i}
                    total={sorted.length}
                    rotation={rotation}
                    radius={sphereRadius}
                    onClick={setSelectedWord}
                  />
                ));
              })()}
            </div>
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
          allWords={cloudWords}
          onClose={() => setSelectedWord(null)}
          onSelectWord={setSelectedWord}
        />
      )}

    </div>
  );
}
