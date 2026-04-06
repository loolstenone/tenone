"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import {
  hitEModules,
  allEQuestions,
} from "@/lib/hit/data/e-questions";

type EModuleType = 'satisfaction' | 'direction' | 'legacy' | 'social_readiness';

interface QuestionItem {
  module: EModuleType;
  id: string;
  text: string;
  subscale: string;
  reverse?: boolean;
}

interface Response {
  selectedOption: number;
  optionValue: string;
}

const MODULE_NAMES: Record<EModuleType, string> = {
  satisfaction: '삶의 만족도 & 열정',
  direction: '방향 탐색',
  legacy: '레거시 스킬',
  social_readiness: '사회적 연결 & 준비도',
};

const TRANSITION_MESSAGES: Record<string, string> = {
  'satisfaction→direction': '다음은 인생 2막의 방향을 탐색합니다',
  'direction→legacy': '수십 년의 경험, 레거시 스킬을 평가합니다',
  'legacy→social_readiness': '마지막! 사회적 연결과 준비도를 확인합니다',
};

const AVG_SECONDS_PER_QUESTION = 6;

const LIKERT_LABELS = ['매우\n비동의', '보통', '매우\n동의'];

function HitETestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get("s");
  const hitAResultId = searchParams.get("a") || undefined;

  const [sessionId, setSessionId] = useState<string>('');

  // Shuffle function
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Build question list — grouped by module, shuffled within each module
  const allQuestions = useMemo<QuestionItem[]>(() => {
    const result: QuestionItem[] = [];
    for (const mod of hitEModules) {
      const tagged: QuestionItem[] = mod.questions.map((q) => ({
        module: mod.key as EModuleType,
        id: q.id,
        text: q.text,
        subscale: q.subscale,
        reverse: q.reverse,
      }));
      result.push(...shuffle(tagged));
    }
    return result;
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
  const currentModule = currentQuestion?.module ?? 'satisfaction';
  const answeredCount = responses.size;

  // Restore session on mount
  useEffect(() => {
    if (!sessionToken) { setIsRestored(true); return; }
    async function restoreSession() {
      try {
        const res = await fetch(`/api/hit/e/session/${sessionToken}`);
        if (res.ok) {
          const data = await res.json();
          if (data.session?.id) setSessionId(data.session.id);
          if (data.responses && Array.isArray(data.responses)) {
            const restored = new Map<string, Response>();
            for (const r of data.responses) {
              restored.set(r.question_id, { selectedOption: r.selected_option, optionValue: r.option_value });
            }
            setResponses(restored);
            const firstUnanswered = allQuestions.findIndex((q) => !restored.has(q.id));
            if (firstUnanswered >= 0) {
              setCurrentIndex(firstUnanswered);
            }
          }
        }
      } catch {
        // Continue fresh
      } finally {
        setIsRestored(true);
      }
    }
    restoreSession();
  }, [sessionToken, allQuestions]);

  // Keyboard shortcuts
  useEffect(() => {
    if (transitionMessage || isSubmitting || isComplete) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        goBack();
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 7) {
        handleLikertSelect(num);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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
      fetch('/api/hit/e/response', {
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

  const submitResults = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/hit/e/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          hitAResultId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsComplete(true);
        router.push(`/hero/hit/e/result/${data.resultId}`);
      } else {
        setIsSubmitting(false);
      }
    } catch {
      setIsSubmitting(false);
    }
  }, [sessionToken, hitAResultId, router]);

  const handleLikertSelect = useCallback(
    (likertValue: number) => {
      if (!currentQuestion || transitionMessage || isSubmitting) return;

      const q = currentQuestion;
      const reverseFlag = q.reverse ? ':r' : '';
      const optionValue = `${q.subscale}:${likertValue}${reverseFlag}`;

      setResponses((prev) => {
        const next = new Map(prev);
        next.set(q.id, { selectedOption: likertValue - 1, optionValue });
        return next;
      });

      fireAndForgetSave(q.id, q.module, currentIndex, likertValue - 1, optionValue);

      // Auto-advance after 400ms
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);

      autoAdvanceTimer.current = setTimeout(() => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= total) {
          submitResults();
          return;
        }

        const nextQuestion = allQuestions[nextIndex];
        const transKey = `${q.module}→${nextQuestion.module}`;

        if (q.module !== nextQuestion.module && TRANSITION_MESSAGES[transKey]) {
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
    [currentIndex, currentQuestion, transitionMessage, isSubmitting,
     allQuestions, total, fireAndForgetSave, submitResults],
  );

  const remainingQuestions = total - answeredCount;
  const estimatedMinutes = Math.max(1, Math.ceil((remainingQuestions * AVG_SECONDS_PER_QUESTION) / 60));

  // Get current Likert value for current question
  const currentResponse = currentQuestion ? responses.get(currentQuestion.id) : undefined;
  const currentLikertValue = currentResponse ? currentResponse.selectedOption + 1 : null;

  // Progress percent
  const progressPercent = total > 0 ? (answeredCount / total) * 100 : 0;

  if (!sessionToken) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-neutral-400">
          세션을 찾을 수 없습니다.{" "}
          <a href="/hero/hit/e" className="text-amber-700 underline">
            다시 시작
          </a>
          해 주세요.
        </p>
      </div>
    );
  }

  if (!isRestored) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isSubmitting || isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-8 h-8 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500 text-sm">인생 2막 분석 리포트를 생성하고 있습니다...</p>
        <p className="text-neutral-400 text-xs">AI가 분석 중이므로 약 30초 소요됩니다</p>
      </div>
    );
  }

  if (transitionMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl md:text-2xl font-medium text-neutral-900 animate-pulse whitespace-pre-line">
            {transitionMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="w-full max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-neutral-400 tracking-wide">{MODULE_NAMES[currentModule]}</span>
            <span className="text-[11px] text-neutral-400 font-mono">
              {answeredCount}/{total}
            </span>
          </div>
          <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-700 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
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
            <div className="transition-opacity duration-200">
              {/* Question */}
              <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-xs text-neutral-500 font-medium mb-4">
                  Q{currentIndex + 1}
                </span>
                <p className="text-lg md:text-xl font-medium text-neutral-900 leading-relaxed">
                  {currentQuestion.text}
                </p>
              </div>

              {/* Likert Scale — inline */}
              <div className="max-w-md mx-auto">
                <div className="w-full">
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => {
                      const isSelected = currentLikertValue === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleLikertSelect(n)}
                          className={`
                            flex items-center justify-center
                            min-w-[44px] min-h-[44px] w-full
                            rounded-xl text-base font-bold
                            transition-all duration-200
                            ${isSelected
                              ? 'bg-amber-700 text-white scale-110 shadow-lg shadow-amber-200'
                              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700'
                            }
                            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                          `}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[10px] text-neutral-400 text-center whitespace-pre-line leading-tight">
                      {LIKERT_LABELS[0]}
                    </span>
                    <span className="text-[10px] text-neutral-400 text-center whitespace-pre-line leading-tight">
                      {LIKERT_LABELS[1]}
                    </span>
                    <span className="text-[10px] text-neutral-400 text-center whitespace-pre-line leading-tight">
                      {LIKERT_LABELS[2]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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

export default function HitETestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-neutral-200 border-t-amber-700 rounded-full animate-spin" />
        </div>
      }
    >
      <HitETestContent />
    </Suspense>
  );
}
