'use client';

import { forwardRef } from 'react';
import type { CloudWord } from '@/types/badak';

interface CloudBubbleProps {
  word: CloudWord;
  maxLen?: number;
  onClick: (word: CloudWord) => void;
}

export const CloudBubble = forwardRef<HTMLDivElement, CloudBubbleProps>(
  function CloudBubble({ word, maxLen = 14, onClick }, ref) {
    const display = word.text.length > maxLen ? word.text.slice(0, maxLen) + '…' : word.text;
    return (
      <div
        ref={ref}
        onClick={() => onClick(word)}
        className="absolute cursor-pointer whitespace-nowrap"
        title={word.text.length > maxLen ? word.text : undefined}
        style={{
          display: 'none',
          willChange: 'transform, opacity',
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
        }}
      >
        {display}
      </div>
    );
  }
);
