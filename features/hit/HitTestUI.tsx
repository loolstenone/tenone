'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import HitProgressBar from './HitProgressBar';
import HitQuestionCard from './HitQuestionCard';
import { ufQuestions } from '@/lib/hit/data/base-questions';
import { mbtiQuestions } from '@/lib/hit/data/mbti-questions';
import { discQuestions } from '@/lib/hit/data/disc-questions';

/** UF 7점 리커트 옵션 */
const LIKERT_7_OPTIONS = [
  { label: '전혀 아니다', value: '1' },
  { label: '아니다', value: '2' },
  { label: '약간 아니다', value: '3' },
  { label: '보통이다', value: '4' },
  { label: '약간 그렇다', value: '5' },
  { label: '그렇다', value: '6' },
  { label: '매우 그렇다', value: '7' },
];

type ModuleType = 'base' | 'mbti' | 'disc';

interface QuestionItem {
  module: ModuleType;
  id: string;
  text: string;
  options: { label: string; value: string }[];
}

interface Response {
  selectedOption: number;
  optionValue: string;
}

interface HitTestUIProps {
  sessionToken: string;
}

const MODULE_NAMES: Record<ModuleType, string> = {
  base: '기저요인(UF) 검사',
  mbti: '성격 유형(MBTI) 검사',
  disc: '행동 유형(DISC) 검사',
};

const TRANSITION_MESSAGES: Record<string, string> = {
  'base→mbti': '기저요인 검사가 끝났습니다. 다음은 성격 유형(MBTI) 검사입니다',
  'mbti→disc': '마지막으로 행동 유형(DISC) 검사입니다',
};

const AVG_SECONDS_PER_QUESTION = 8;

export default function HitTestUI({ sessionToken }: HitTestUIProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('');

  const allQuestions = useMemo<QuestionItem[]>(() => {
    // 셔플 함수
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    // UF 문항: LikertQuestion → QuestionItem (7점 리커트 옵션 부여)
    const ufTagged: QuestionItem[] = ufQuestions.map((q) => ({
      module: 'base' as ModuleType,
      id: q.id,
      text: q.text,
      options: LIKERT_7_OPTIONS,
    }));

    // MBTI/DISC: 기존 4지선다
    const taggedMbti: QuestionItem[] = mbtiQuestions.map((q) => ({
      module: 'mbti' as ModuleType, id: q.id, text: q.text, options: q.options,
    }));
    const taggedDisc: QuestionItem[] = discQuestions.map((q) => ({
      module: 'disc' as ModuleType, id: q.id, text: q.text, options: q.options,
    }));

    // 단계별 셔플 (단계 간 순서: base → mbti → disc)
    return [
      ...shuffle(ufTagged),
      ...shuffle(taggedMbti),
      ...shuffle(taggedDisc),
    ];
  }, []);

  const [responses, setResponses] = useState<Map<string, Response>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = allQuestions.length;
  const currentQuestion = allQuestions[currentIndex];
  const currentModule = currentQuestion?.module ?? 'base';
  const answeredCount = responses.size;

  const localStorageKey = `hit_a_${sessionToken}`;

  // Restore session on mount: localStorage first (faster), server as fallback
  useEffect(() => {
    async function restoreSession() {
      let localRestored = false;

      // 1. Try localStorage first (instant)
      try {
        const saved = localStorage.getItem(localStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, Response>;
          const restoredMap = new Map<string, Response>(Object.entries(parsed));
          if (restoredMap.size > 0) {
            setResponses(restoredMap);
            const firstUnanswered = allQuestions.findIndex((q) => !restoredMap.has(q.id));
            if (firstUnanswered >= 0) {
              setCurrentIndex(firstUnanswered);
            }
            localRestored = true;
          }
        }
      } catch {
        // localStorage unavailable or corrupted — fall through to server
      }

      // 2. Server restore (fallback, or to get sessionId)
      try {
        const res = await fetch(`/api/hit/a/session/${sessionToken}`);
        if (res.ok) {
          const data = await res.json();
          if (data.session?.id) setSessionId(data.session.id);
          // Only apply server responses if localStorage had nothing
          if (!localRestored && data.responses && Array.isArray(data.responses)) {
            const restored = new Map<string, Response>();
            for (const r of data.responses) {
              restored.set(r.question_id, { selectedOption: r.selected_option, optionValue: r.option_value });
            }
            if (restored.size > 0) {
              setResponses(restored);
              const firstUnanswered = allQuestions.findIndex((q) => !restored.has(q.id));
              if (firstUnanswered >= 0) {
                setCurrentIndex(firstUnanswered);
              }
              // Sync server data to localStorage
              try {
                localStorage.setItem(localStorageKey, JSON.stringify(Object.fromEntries(restored)));
              } catch { /* quota exceeded — ignore */ }
            }
          }
        }
      } catch {
        // Continue with whatever we have
      } finally {
        setIsRestored(true);
      }
    }
    restoreSession();
  }, [sessionToken, allQuestions, localStorageKey]);

  // Persist responses to localStorage on every change
  useEffect(() => {
    if (responses.size > 0) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(Object.fromEntries(responses)));
      } catch { /* quota exceeded — ignore */ }
    }
  }, [responses, localStorageKey]);

  // Keyboard shortcuts
  useEffect(() => {
    if (transitionMessage || isSubmitting || isComplete) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        goBack();
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= (currentQuestion?.options.length ?? 0)) {
        handleSelect(num - 1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, transitionMessage, isSubmitting, isComplete, currentQuestion]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = null;
      }
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const fireAndForgetSave = useCallback(
    (questionId: string, module: string, questionIndex: number, selectedOption: number, optionValue: string) => {
      fetch('/api/hit/a/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          questionId,
          module,
          questionIndex,
          selectedOption,
          optionValue,
        }),
      }).catch(() => {});
    },
    [sessionToken],
  );

  const [error, setError] = useState<string | null>(null);

  const submitResults = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/hit/a/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken }),
      });
      const data = await res.json();
      if (res.ok && data.resultId) {
        // Clear localStorage on successful completion
        try { localStorage.removeItem(localStorageKey); } catch { /* ignore */ }
        setIsComplete(true);
        router.push(`/hero/hit/a/result/${data.resultId}`);
      } else {
        setError(data.error || '결과 생성에 실패했습니다. 다시 시도해 주세요.');
        setIsSubmitting(false);
      }
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsSubmitting(false);
    }
  }, [sessionToken, router]);

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (!currentQuestion || transitionMessage || isSubmitting) return;

      const q = currentQuestion;
      const optionValue = q.options[optionIndex].value;

      setResponses((prev) => {
        const next = new Map(prev);
        next.set(q.id, { selectedOption: optionIndex, optionValue });
        return next;
      });

      fireAndForgetSave(q.id, q.module, currentIndex, optionIndex, optionValue);

      // Auto-advance after 400ms
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);

      autoAdvanceTimer.current = setTimeout(() => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= total) {
          submitResults();
          return;
        }

        const nextModule = allQuestions[nextIndex].module;
        const transKey = `${q.module}→${nextModule}`;

        if (q.module !== nextModule && TRANSITION_MESSAGES[transKey]) {
          setTransitionMessage(TRANSITION_MESSAGES[transKey]);
          setTimeout(() => {
            setTransitionMessage(null);
            setCurrentIndex(nextIndex);
          }, 2000);
        } else {
          setCurrentIndex(nextIndex);
        }
      }, 400);
    },
    [currentIndex, currentQuestion, transitionMessage, isSubmitting, allQuestions, total, fireAndForgetSave, submitResults],
  );

  const remainingQuestions = total - answeredCount;
  const estimatedMinutes = Math.max(1, Math.ceil((remainingQuestions * AVG_SECONDS_PER_QUESTION) / 60));

  if (!isRestored) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isSubmitting || isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        {error ? (
          <>
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={submitResults}
              className="px-6 py-2 bg-[#E53935] text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-500 text-sm">결과를 분석하고 있습니다...</p>
          </>
        )}
      </div>
    );
  }

  if (transitionMessage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-2 h-2 rounded-full bg-[#E53935] animate-pulse" />
          </div>
          <p className="text-base font-medium text-neutral-700">
            {transitionMessage}
          </p>
        </div>
      </div>
    );
  }

  const selectedResponse = currentQuestion ? responses.get(currentQuestion.id) : undefined;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 pt-4 pb-2">
        <HitProgressBar
          current={answeredCount}
          total={total}
          moduleName={MODULE_NAMES[currentModule]}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          {/* Back button */}
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              이전 질문
            </button>
          )}

          {currentQuestion && (
            <HitQuestionCard
              questionText={currentQuestion.text}
              options={currentQuestion.options}
              selectedIndex={selectedResponse?.selectedOption ?? null}
              onSelect={handleSelect}
              questionNumber={currentIndex + 1}
            />
          )}
        </div>
      </div>

      {/* Time estimate */}
      <div className="pb-6 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
          <Clock className="w-3.5 h-3.5" />
          약 {estimatedMinutes}분 남음
        </span>
      </div>
    </div>
  );
}
