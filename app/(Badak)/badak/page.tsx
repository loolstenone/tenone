'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { CloudWord } from '@/types/badak';
import { CLOUD_WORDS } from '@/lib/badak-cloud-data';
import { CloudBubble } from '@/features/badak/cloud/CloudBubble';
import { NeedsInput } from '@/features/badak/cloud/NeedsInput';
import { FeedSection } from '@/features/badak/cloud/FeedSection';
import { NeedDetailSheet } from '@/features/badak/cloud/NeedDetailSheet';
import { getTimeBasedSky } from '@/lib/badak-cloud-data';
import { createClient } from '@/lib/supabase/client';
import { Mouse } from 'lucide-react';

const COLORS_GROUP = ['#ffd93d', '#fbbf24', '#f59e0b', '#fcd34d'];
const COLORS_DEFAULT = ['#94a3b8', '#a1a1aa', '#9ca3af', '#cbd5e1'];

export default function BadakNextStage() {
  const [selectedWord, setSelectedWord] = useState<CloudWord | null>(null);
  const [sending, setSending] = useState(false);
  const [skyBg, setSkyBg] = useState('linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)');
  const [cloudWords, setCloudWords] = useState<CloudWord[]>(
    [...CLOUD_WORDS].sort((a, b) => (b.members ?? 0) - (a.members ?? 0)).slice(0, 50)
  );
  const [sphereRadius, setSphereRadius] = useState(180);

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

  const [spark, setSpark] = useState<{ x: number; y: number; tx: number; ty: number } | null>(null);

  // Refs — no setState in hot path
  const rotationRef = useRef({ x: 0, y: 0 });
  const wordRefsRef = useRef<(HTMLDivElement | null)[]>([]);
  const sortedWordsRef = useRef<CloudWord[]>([]);
  const sphereRadiusRef = useRef(180);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const autoRef = useRef<number | undefined>(undefined);
  const feedRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);

  // Sorted words for rendering
  const sortedWords = useMemo(() => {
    const maxWords = sphereRadius < 180 ? 60 : 100;
    return [...cloudWords]
      .sort((a, b) => (b.members ?? 0) - (a.members ?? 0))
      .slice(0, maxWords);
  }, [cloudWords, sphereRadius]);

  // Sync refs when sortedWords or radius change
  useEffect(() => {
    sortedWordsRef.current = sortedWords;
  }, [sortedWords]);
  useEffect(() => {
    sphereRadiusRef.current = sphereRadius;
  }, [sphereRadius]);

  // Time-based sky + responsive sphere radius
  useEffect(() => {
    const sky = getTimeBasedSky();
    setSkyBg(sky.bg);
    const updateRadius = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setSphereRadius(Math.min(170, Math.max(130, Math.floor(w * 0.42))));
      } else {
        setSphereRadius(220);
      }
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // DB에서 니즈 100개 fetch
  useEffect(() => {
    fetch('/api/badak/needs?limit=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.words?.length > 0) {
          setCloudWords(data.words as CloudWord[]);
        }
      })
      .catch(() => {});
  }, []);

  // Animation loop — pure DOM mutation, zero React re-renders
  useEffect(() => {
    const FRICTION = 0.985;
    const IDLE_SPEED = 0.002;
    const MIN_VELOCITY = 0.0001;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;

      // Update rotation
      const rot = rotationRef.current;
      if (!isDragging.current) {
        const vx = velocity.current.x;
        const vy = velocity.current.y;
        if (Math.abs(vx) > MIN_VELOCITY || Math.abs(vy) > MIN_VELOCITY) {
          const friction = Math.pow(FRICTION, dt);
          velocity.current.x *= friction;
          velocity.current.y *= friction;
          rot.x += velocity.current.x * dt;
          rot.y += velocity.current.y * dt;
        } else {
          velocity.current = { x: 0, y: 0 };
          rot.x *= Math.pow(0.97, dt);
          rot.y += IDLE_SPEED * dt;
        }
      }

      // Write positions directly to DOM
      const words = sortedWordsRef.current;
      const refs = wordRefsRef.current;
      const radius = sphereRadiusRef.current;
      const total = words.length;
      if (total === 0) {
        autoRef.current = requestAnimationFrame(animate);
        return;
      }

      const cosY = Math.cos(rot.y), sinY = Math.sin(rot.y);
      const cosX = Math.cos(rot.x), sinX = Math.sin(rot.x);
      const perspective = 600;
      const isSmall = radius < 180;
      const baseFontMax = isSmall ? 13 : 22;
      const baseFontMin = isSmall ? 9 : 14;
      const maxLen = isSmall ? 10 : 14;

      for (let i = 0; i < total; i++) {
        const el = refs[i];
        if (!el) continue;
        const word = words[i];

        const phi = Math.acos(-1 + (2 * i + 1) / total);
        const theta = Math.sqrt(total * Math.PI) * phi;

        let sx = Math.cos(theta) * Math.sin(phi);
        let sy = Math.sin(theta) * Math.sin(phi);
        let sz = Math.cos(phi);

        // Y-axis rotation
        const rx = sx * cosY - sz * sinY;
        sz = sx * sinY + sz * cosY;
        sx = rx;

        // X-axis rotation
        const ry = sy * cosX - sz * sinX;
        sz = sy * sinX + sz * cosX;
        sy = ry;

        const depth = (sz + 1) / 2;

        if (depth < 0.2) {
          if (el.style.display !== 'none') el.style.display = 'none';
          continue;
        }

        const projScale = perspective / (perspective + radius - sz * radius);
        const x = sx * radius * projScale;
        const y = sy * radius * projScale;
        const scale = projScale * (0.5 + depth * 0.5);
        const opacity = Math.pow(depth, 1.5) * 0.9 + 0.1;
        const fontSize = Math.max(baseFontMin, Math.min(baseFontMax, word.size * baseFontMin));
        const color = (word.hasGroup ? COLORS_GROUP : COLORS_DEFAULT)[i % 4];

        // Update text if maxLen changed
        const display = word.text.length > maxLen ? word.text.slice(0, maxLen) + '…' : word.text;
        if (el.textContent !== display) el.textContent = display;

        el.style.display = 'block';
        el.style.left = `calc(50% + ${x.toFixed(1)}px)`;
        el.style.top = `calc(50% + ${y.toFixed(1)}px)`;
        el.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = String(Math.round(depth * 100));
        el.style.fontSize = `${fontSize.toFixed(1)}px`;
        el.style.fontWeight = depth > 0.6 ? '700' : '500';
        el.style.color = color;
        el.style.textShadow = depth > 0.7 ? '0 1px 6px rgba(0,0,0,0.4)' : 'none';
        el.style.filter = depth < 0.35 ? `blur(${((1 - depth * 3) * 2).toFixed(1)}px)` : 'none';
      }

      autoRef.current = requestAnimationFrame(animate);
    };

    autoRef.current = requestAnimationFrame((t) => { lastTime = t; animate(t); });
    return () => {
      if (autoRef.current) cancelAnimationFrame(autoRef.current);
    };
  }, []); // intentionally empty — uses only refs

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
    rotationRef.current.x += vx;
    rotationRef.current.y += vy;
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // 니즈 제출 — spark 애니메이션 + DB POST → 결과 반환
  const handleSend = useCallback(async (text: string) => {
    setSending(true);

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

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = sessionData.session?.access_token;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/badak/needs', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setSending(false);
      return data as { status: string; count?: number; id?: string };
    } catch {
      setSending(false);
      return { status: 'submitted' };
    }
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

        {/* Needs Cloud Sphere */}
        <div
          className="flex-1 flex items-center justify-center"
          style={{ touchAction: 'none', userSelect: 'none', cursor: isDragging.current ? 'grabbing' : 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            style={{
              position: 'relative',
              width: `${Math.round(sphereRadius * 2.4)}px`,
              height: `${Math.round(sphereRadius * 2.4)}px`,
              flexShrink: 0,
            }}
          >
            <div ref={sphereRef} className="absolute inset-0">
              {/* 중앙 레이블 */}
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

              {sortedWords.map((word, i) => (
                <CloudBubble
                  key={word.needId ?? word.text}
                  ref={(el) => { wordRefsRef.current[i] = el; }}
                  word={word}
                  maxLen={sphereRadius < 180 ? 10 : 14}
                  onClick={setSelectedWord}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Needs Input */}
        <div className="sticky bottom-0 z-40 px-4 pb-4 pt-2" style={{ background: 'linear-gradient(transparent 0%, rgba(26,26,46,0.95) 30%)' }}>
          <div ref={inputAreaRef} className="mx-auto max-w-[500px]">
            <NeedsInput onSend={handleSend as (text: string) => Promise<{ status: string; count?: number; id?: string }>} sending={sending} cloudWords={cloudWords} />
          </div>
          <button
            onClick={scrollToFeed}
            className="mx-auto mt-2 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          >
            <Mouse className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </section>

      {/* ===== Feed Section ===== */}
      <div ref={feedRef}>
        <FeedSection />
      </div>

      {/* Spark animation */}
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

      {/* Need Detail */}
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
