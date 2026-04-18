'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

interface SendResult {
  status: string;
  count?: number;
  id?: string;
}

interface NeedsInputProps {
  onSend: (text: string) => Promise<SendResult>;
  sending: boolean;
}

const PLACEHOLDERS = [
  '요즘 어떤 고민이 있으세요?',
  '어떤 걸 함께 배우고 싶으세요?',
  '어떤 사람을 만나고 싶으세요?',
  '지금 가장 필요한 건 뭔가요?',
  '다음 단계로 뭘 준비하고 있어요?',
  '어떤 니즈가 있으신가요?',
];

export function NeedsInput({ onSend, sending }: NeedsInputProps) {
  const [inputText, setInputText] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [result, setResult] = useState<{ text: string; count?: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((p) => (p + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (result) {
      const t = setTimeout(() => setResult(null), 5000);
      return () => clearTimeout(t);
    }
  }, [result]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || result) return;
    const data = await onSend(text);
    setInputText('');
    if (data.status === 'merged' || data.status === 'incremented') {
      setResult({ text, count: data.count });
    } else {
      setResult({ text });
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
    const isMerged = result.count !== undefined;
    return (
      <div className="relative mx-auto" style={{ width: '85%' }}>
        <div
          className="flex flex-col items-center gap-2.5 rounded-2xl px-4 py-3"
          style={{
            border: '1px solid rgba(255,217,61,0.25)',
            background: 'rgba(255,217,61,0.06)',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '18px' }}>{isMerged ? '🔥' : '🙌'}</span>
            <p className="text-sm font-semibold text-amber-300" style={{ letterSpacing: '-0.02em' }}>
              {isMerged
                ? `${result.count}명이 같은 니즈를 갖고 있어요`
                : '바닥에 새 니즈를 올렸어요!'}
            </p>
          </div>
          {!isMerged && (
            <p className="text-[11px] text-white/30">검토 후 클라우드에 공개됩니다</p>
          )}
          <button
            onClick={() => handleShare(result.text)}
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all"
            style={{
              background: 'rgba(255,217,61,0.15)',
              color: 'rgba(255,217,61,0.9)',
              border: '1px solid rgba(255,217,61,0.2)',
            }}
          >
            {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
            {copied ? '복사됐어요!' : '같은 니즈 공유하기'}
          </button>
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
      <p className="mt-1.5 text-center text-[10px] text-white/20" style={{ letterSpacing: '-0.01em' }}>
        내 니즈를 올리면 Badak이 모아서 정리해 드려요
      </p>
    </div>
  );
}
