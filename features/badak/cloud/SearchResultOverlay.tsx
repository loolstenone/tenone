'use client';

import type { CloudWord } from '@/types/badak';

interface SearchResultOverlayProps {
  inputText: string;
  results: CloudWord[];
  onClose: () => void;
  onSelectWord: (word: CloudWord) => void;
}

export function SearchResultOverlay({
  inputText,
  results,
  onClose,
  onSelectWord,
}: SearchResultOverlayProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[900] mx-auto flex max-w-[860px] flex-col items-center justify-center backdrop-blur-2xl"
      style={{
        background: 'rgba(0,0,0,0.8)',
        padding: '40px 24px',
      }}
    >
      <div className="mb-2 text-[13px] tracking-tight text-white/40">
        &ldquo;{inputText}&rdquo;와 관련된 니즈들
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2.5">
        {results.map((w, i) => (
          <div
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onSelectWord(w);
            }}
            className="cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium"
            style={{
              background: w.hasGroup
                ? 'rgba(255,200,87,0.15)'
                : 'rgba(255,255,255,0.08)',
              border: w.hasGroup
                ? '1px solid rgba(255,200,87,0.3)'
                : '1px solid rgba(255,255,255,0.12)',
              color: w.hasGroup ? '#ffd93d' : '#fff',
              animation: 'badak-fadeUp 0.4s ease both',
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {w.hasGroup && '● '}
            {w.text}
          </div>
        ))}
      </div>

      <div className="text-xs text-white/30">
        탭하면 상세 · 바깥을 누르면 닫기
      </div>
    </div>
  );
}
