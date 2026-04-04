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
      {/* 질문 영역 — 컴팩트하게 */}
      <div className="text-center mb-6">
        <p className="text-base md:text-lg font-medium text-neutral-900 leading-relaxed">
          {displayedQuestion}
        </p>
      </div>

      {/* 답변 영역 — 넓게 */}
      <div className={isGrid ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-2.5'}>
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
