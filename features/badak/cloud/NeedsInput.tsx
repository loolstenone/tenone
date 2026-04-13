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
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={PLACEHOLDERS[promptIndex]}
          className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none shadow-sm placeholder:text-neutral-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          style={{ letterSpacing: '-0.02em' }}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border-none text-base font-bold transition-all duration-300"
          style={{
            background: hasText ? '#2563eb' : '#f3f4f6',
            color: hasText ? '#fff' : '#d1d5db',
          }}
        >
          ↑
        </button>
      </div>

      {sending && (
        <div
          className="absolute -top-4 left-1/2 z-[200] h-1.5 w-1.5 rounded-full"
          style={{
            background: '#2563eb',
            boxShadow: '0 0 12px #2563eb, 0 0 24px rgba(37,99,235,0.4)',
            animation: 'badak-sendLight 1.2s linear forwards',
          }}
        />
      )}
    </div>
  );
}
