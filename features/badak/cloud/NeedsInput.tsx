'use client';

import { useState, useEffect } from 'react';

interface NeedsInputProps {
  onSend: (text: string) => void;
  sending: boolean;
}

// 방문자가 공감할 수 있는 니즈 예시 (placeholder 순환)
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
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((p) => (p + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // 제출 후 2.5초 뒤 초기화
  useEffect(() => {
    if (submitted) {
      const t = setTimeout(() => {
        setSubmitted(false);
        setInputText('');
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [submitted]);

  const handleSend = () => {
    if (!inputText.trim() || sending || submitted) return;
    onSend(inputText.trim());
    setSubmitted(true);
  };

  const hasText = inputText.trim().length > 0;

  // 제출 완료 상태
  if (submitted) {
    return (
      <div className="relative mx-auto" style={{ width: '80%' }}>
        <div
          className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium"
          style={{
            border: '1px solid rgba(255,217,61,0.25)',
            background: 'rgba(255,217,61,0.06)',
            color: 'rgba(255,217,61,0.9)',
            letterSpacing: '-0.02em',
          }}
        >
          <span>🙌</span>
          <span>바닥에 올렸어요! Badak이 정리 중이에요</span>
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
      {/* 안내 문구 */}
      <p className="mt-1.5 text-center text-[10px] text-white/20" style={{ letterSpacing: '-0.01em' }}>
        내 니즈를 올리면 Badak이 모아서 정리해 드려요
      </p>
    </div>
  );
}
