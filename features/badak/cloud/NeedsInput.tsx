'use client';

import { useState, useEffect } from 'react';
import { Share2, Check } from 'lucide-react';
import Link from 'next/link';
import type { CloudWord } from '@/types/badak';

interface SendResult {
  status: string;
  count?: number;
  id?: string;
}

interface NeedsInputProps {
  onSend: (text: string) => Promise<SendResult>;
  sending: boolean;
  cloudWords?: CloudWord[];
}

const PLACEHOLDERS = [
  '요즘 어떤 고민이 있으세요?',
  '어떤 걸 함께 배우고 싶으세요?',
  '어떤 사람을 만나고 싶으세요?',
  '지금 가장 필요한 건 뭔가요?',
  '다음 단계로 뭘 준비하고 있어요?',
  '어떤 니즈가 있으신가요?',
];

export function NeedsInput({ onSend, sending, cloudWords = [] }: NeedsInputProps) {
  const [inputText, setInputText] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [result, setResult] = useState<{ text: string; count?: number; id?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((p) => (p + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || result) return;
    const data = await onSend(text);
    setInputText('');
    if (data.status === 'merged' || data.status === 'incremented') {
      setResult({ text, count: data.count, id: data.id });
    } else {
      setResult({ text, id: data.id });
    }
  };

  const handleShare = async (text: string) => {
    const shareText = `Badak에서 이 니즈를 공유했어요 👇\n"${text}"\nbadak.biz`;
    if (navigator.share) {
      try { await navigator.share({ text: shareText, url: 'https://badak.biz' }); } catch { /* cancel */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasText = inputText.trim().length > 0;

  if (result) {
    const isMerged = result.count !== undefined && result.count >= 2;

    const sortedWords = [...cloudWords].sort((a, b) => (b.members ?? 0) - (a.members ?? 0));
    const myIndex = result.id ? sortedWords.findIndex(w => w.needId === result.id) : -1;
    const rank = myIndex >= 0 ? myIndex + 1 : null;
    const neighborAbove = myIndex > 0 ? sortedWords[myIndex - 1] : null;
    const neighborBelow = myIndex >= 0 && myIndex < sortedWords.length - 1 ? sortedWords[myIndex + 1] : null;

    const topNeeds = sortedWords.filter(w => w.needId !== result.id).slice(0, 3);

    return (
      <div className="mx-auto" style={{ width: '90%' }}>
        <div
          className="flex flex-col gap-3 rounded-2xl px-4 py-4"
          style={{
            border: '1px solid rgba(255,217,61,0.3)',
            background: 'linear-gradient(135deg, rgba(255,217,61,0.08) 0%, rgba(255,168,0,0.04) 100%)',
          }}
        >
          {/* Header */}
          <div className="flex items-start gap-2.5">
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{isMerged ? '🔥' : '🙌'}</span>
            <div>
              <p className="text-sm font-bold text-amber-300 leading-snug" style={{ letterSpacing: '-0.03em' }}>
                {isMerged
                  ? `${result.count}명이 같은 니즈를 갖고 있어요`
                  : '바닥에 새 니즈를 올렸어요!'}
              </p>
              {!isMerged && (
                <p className="text-xs text-white/35 mt-0.5">검토 후 클라우드에 공개됩니다</p>
              )}
            </div>
          </div>

          {/* Rank context — merged */}
          {isMerged && (
            <div
              className="rounded-xl px-3 py-2.5 flex flex-col gap-1.5"
              style={{ background: 'rgba(0,0,0,0.25)' }}
            >
              {neighborAbove ? (
                <div className="flex items-center justify-between text-[11px] text-white/30">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0 text-white/15">#{rank! - 1}</span>
                    <span className="truncate">{neighborAbove.text}</span>
                  </span>
                  <span className="shrink-0 ml-2">{neighborAbove.members ?? 0}명</span>
                </div>
              ) : null}

              <div
                className="flex items-center justify-between text-[12px] font-semibold rounded-lg px-2.5 py-1.5"
                style={{ background: 'rgba(255,217,61,0.14)', color: '#ffd93d' }}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  {rank && <span className="shrink-0" style={{ color: 'rgba(255,217,61,0.45)' }}>#{rank}</span>}
                  <span className="truncate">{result.text}</span>
                </span>
                <span className="shrink-0 ml-2">{result.count}명</span>
              </div>

              {neighborBelow ? (
                <div className="flex items-center justify-between text-[11px] text-white/30">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0 text-white/15">#{rank! + 1}</span>
                    <span className="truncate">{neighborBelow.text}</span>
                  </span>
                  <span className="shrink-0 ml-2">{neighborBelow.members ?? 0}명</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Top needs — new */}
          {!isMerged && topNeeds.length > 0 && (
            <div
              className="rounded-xl px-3 py-2.5 flex flex-col gap-1.5"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            >
              <p className="text-xs text-white/30 mb-0.5">지금 가장 많은 니즈</p>
              {topNeeds.map((w, i) => (
                <div key={w.needId ?? w.text} className="flex items-center justify-between text-[11px] text-white/35">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0 text-white/15">#{i + 1}</span>
                    <span className="truncate">{w.text}</span>
                  </span>
                  <span className="shrink-0 ml-2">{w.members ?? 0}명</span>
                </div>
              ))}
            </div>
          )}

          {/* 바닥장 CTA */}
          {isMerged && (result.count ?? 0) >= 5 ? (
            <Link
              href={`/badak/apply${result.id ? `?needId=${result.id}` : ''}`}
              className="flex items-center justify-center rounded-full py-2 text-xs font-bold transition-opacity hover:opacity-80"
              style={{
                background: 'rgba(255,217,61,0.18)',
                color: '#ffd93d',
                border: '1px solid rgba(255,217,61,0.28)',
                letterSpacing: '-0.02em',
              }}
            >
              이 니즈의 바닥장이 될래요?
            </Link>
          ) : isMerged ? (
            <div
              className="flex items-center justify-center gap-1.5 rounded-full py-2 text-xs"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                letterSpacing: '-0.02em',
              }}
            >
              <span>5명이 되면 바닥장 신청 가능</span>
              <span style={{ color: 'rgba(255,217,61,0.4)' }}>({result.count}/5)</span>
            </div>
          ) : (
            <Link
              href="/badak/apply"
              className="flex items-center justify-center rounded-full py-2 text-xs font-bold transition-opacity hover:opacity-80"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.1)',
                letterSpacing: '-0.02em',
              }}
            >
              먼저 바닥장이 되어 모임 열기
            </Link>
          )}

          {/* Share + dismiss */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleShare(result.text)}
              className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
              {copied ? '복사됐어요!' : '공유하기'}
            </button>
            <button
              onClick={() => setResult(null)}
              className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto" style={{ width: '80%' }}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={PLACEHOLDERS[promptIndex]}
          maxLength={60}
          className="w-full rounded-full border border-white/15 bg-white/8 py-3 pl-4 pr-12 text-sm font-medium text-white outline-none placeholder:text-white/30 focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/10"
          style={{ letterSpacing: '-0.02em' }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !hasText}
          className="absolute right-1.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none text-sm font-bold transition-all duration-300"
          style={{
            background: hasText ? '#ffd93d' : 'rgba(255,255,255,0.1)',
            color: hasText ? '#1a1a2e' : 'rgba(255,255,255,0.2)',
            cursor: hasText ? 'pointer' : 'default',
          }}
          title="니즈 올리기"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
