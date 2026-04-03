'use client';

import { useEffect, useState } from 'react';
import HitOptionButton from './HitOptionButton';

interface Option {
  label: string;
  value: string;
}

interface HitQuestionCardProps {
  questionText: string;
  options: Option[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  questionNumber: number;
}

export default function HitQuestionCard({
  questionText,
  options,
  selectedIndex,
  onSelect,
  questionNumber,
}: HitQuestionCardProps) {
  const [visible, setVisible] = useState(true);
  const [displayedQuestion, setDisplayedQuestion] = useState(questionText);
  const [displayedNumber, setDisplayedNumber] = useState(questionNumber);

  useEffect(() => {
    if (questionText !== displayedQuestion) {
      setVisible(false);
      const timer = setTimeout(() => {
        setDisplayedQuestion(questionText);
        setDisplayedNumber(questionNumber);
        setVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [questionText, questionNumber, displayedQuestion]);

  const isGrid = options.length === 2;

  return (
    <div
      className={`transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-xs text-neutral-500 font-medium mb-4">
          Q{displayedNumber}
        </span>
        <p className="text-lg md:text-xl font-medium text-neutral-900 leading-relaxed">
          {displayedQuestion}
        </p>
      </div>

      <div
        className={
          isGrid
            ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
            : 'grid grid-cols-1 md:grid-cols-2 gap-3'
        }
      >
        {options.map((option, idx) => (
          <HitOptionButton
            key={`${displayedNumber}-${idx}`}
            label={option.label}
            selected={selectedIndex === idx}
            onClick={() => onSelect(idx)}
            index={idx}
            shortcut={String(idx + 1)}
          />
        ))}
      </div>
    </div>
  );
}
