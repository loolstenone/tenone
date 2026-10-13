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
  // 7점 척도 + (선택) 뒤에 붙는 '해당 없음' 같은 건너뛰기 선택지 — 척도 아래 작은 버튼으로 (2026-10-13)
  const likertOptions = options.slice(0, 7);
  const skipOptions = options.length > 7 ? options.slice(7) : [];
  const isLikert = options.length >= 7 && likertOptions.every((o, i) => o.value === String(i + 1));

  return (
    <div
      className={`transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* 질문 영역 */}
      <div className="text-center mb-6">
        <p className="text-base md:text-lg font-medium text-neutral-900 leading-relaxed">
          {displayedQuestion}
        </p>
      </div>

      {/* 답변 영역 */}
      {isLikert ? (
        /* 7점 리커트 — 가로 스케일 */
        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-2 px-1">
            <span>전혀 아니다</span>
            <span>보통</span>
            <span>매우 그렇다</span>
          </div>
          <div className="flex gap-2 justify-center">
            {likertOptions.map((option, idx) => {
              const isSelected = selectedIndex === idx;
              const size = idx === 3
                ? 'w-10 h-10'       // 보통(4) — 중간
                : (idx <= 1 || idx >= 5)
                  ? 'w-12 h-12'     // 양 극단 — 크게
                  : 'w-11 h-11';    // 나머지

              return (
                <button
                  key={`${displayedNumber}-${idx}`}
                  onClick={() => onSelect(idx)}
                  className={`rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all
                    ${size}
                    ${isSelected
                      ? 'border-[#E53935] bg-[#E53935] text-white scale-110 shadow-md'
                      : 'border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600'
                    }`}
                >
                  {option.value}
                </button>
              );
            })}
          </div>
          {skipOptions.length > 0 && (
            <div className="flex justify-center gap-2 mt-5">
              {skipOptions.map((option, i) => {
                const idx = 7 + i;
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={`${displayedNumber}-${idx}`}
                    type="button"
                    onClick={() => onSelect(idx)}
                    className={`px-4 py-2 rounded-full border text-xs font-medium transition-colors
                      ${isSelected ? 'border-neutral-800 bg-neutral-800 text-white' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700'}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
}
