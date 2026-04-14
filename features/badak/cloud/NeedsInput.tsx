'use client';

import { useState, useEffect } from 'react';
import { PROMPTS } from '@/lib/badak-cloud-data';

interface NeedsInputProps {
  onSend: (text: string) => void;
  sending: boolean;
}

const PLACEHOLDERS = [
  ...PROMPTS,
  '스크롤하시면 진행중인 모임을 볼 수 있습니다 ↓',
];

export function NeedsInput({ onSend, sending }: NeedsInputProps) {
  const [inputText, setInputText] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((p) => (p + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!inputText.trim() || sending) return;
    onSend(inputText);
  };

  const hasText = inputText.trim().length > 0;

  return (
    <div className="relative mx-auto" style={{ width: '80%' }}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={PLACEHOLDERS[promptIndex]}
          className="w-full rounded-full border border-white/15 bg-white/8 py-3 pl-4 pr-12 text-sm font-medium text-white outline-none placeholder:text-white/30 focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/10"
          style={{ letterSpacing: '-0.02em' }}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="absolute right-1.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none text-sm font-bold transition-all duration-300"
          style={{
            background: hasText ? '#ffd93d' : 'rgba(255,255,255,0.1)',
            color: hasText ? '#1a1a2e' : 'rgba(255,255,255,0.2)',
          }}
        >
          ↑
        </button>
      </div>

    </div>
  );
}
