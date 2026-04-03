'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import HitProgressBar from './HitProgressBar';
import LikertScale from './LikertScale';
import TrackSelector from './TrackSelector';
import { personalityQuestions } from '@/lib/hit/data/personality-questions';
import { riasecQuestions } from '@/lib/hit/data/riasec-questions';
import { competencyQuestions } from '@/lib/hit/data/competency-questions';
import { readinessQuestions } from '@/lib/hit/data/readiness-questions';
import type { CompetencyTrack } from '@/types/hit';

type ModuleType = 'personality' | 'riasec' | 'competency' | 'readiness';

interface QuestionItem {
  module: ModuleType;
  id: string;
  text: string;
  subscale: string;
  reverse?: boolean;
  track?: string;
}

interface Response {
  selectedOption: number; // 0-indexed for compatibility
  optionValue: string;    // 'subscale:value[:r]' format
}

interface HitBTestUIProps {
  sessionToken: string;
  hitAResultId?: string;
}

const MODULE_NAMES: Record<ModuleType, string> = {
  personality: '성격 특성 검사',
  riasec: '직업 흥미(RIASEC) 검사',
  competency: '역량 검사',
  readiness: '준비도 검사',
};

const TRANSITION_MESSAGES: Record<string, string> = {
  'personality→riasec': '다음은 직업 흥미(RIASEC) 검사입니다',
  'riasec→competency': '역량 검사를 시작합니다.\n먼저 전문 트랙을 선택해주세요',
  'competency→readiness': '마지막! 커리어 준비도를 확인합니다',
};

const AVG_SECONDS_PER_QUESTION = 6;

export default function HitBTestUI({ sessionToken, hitAResultId }: HitBTestUIProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('');

  // Track selection state
  const [selectedTrack, setSelectedTrack] = useState<CompetencyTrack | null>(null);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [riasecScores, setRiasecScores] = useState<{ r: number; i: number; a: number; s: number; e: number; c: number } | null>(null);

  // Build question list — competency track questions added after selection
  const allQuestions = useMemo<QuestionItem[]>(() => {
    const tagged = <T extends { id: string; text: string; subscale: string; reverse?: boolean; track?: string }>(
      qs: T[],
      mod: ModuleType,
    ): QuestionItem[] =>
      qs.map((q) => ({
        module: mod,
        id: q.id,
        text: q.text,
        subscale: q.subscale,
        reverse: q.reverse,
        track: 'track' in q ? (q as { track?: string }).track : undefined,
      }));

    const commonCompetency = competencyQuestions.filter(q => !q.track);
    const trackCompetency = selectedTrack
      ? competencyQuestions.filter(q => q.track === selectedTrack)
      : [];

    return [
      ...tagged(personalityQuestions, 'personality'),
      ...tagged(riasecQuestions, 'riasec'),
      ...tagged(commonCompetency, 'competency'),
      ...tagged(trackCompetency, 'competency'),
      ...tagged(readinessQuestions, 'readiness'),
    ];
  }, [selectedTrack]);

  const [responses, setResponses] = useState<Map<string, Response>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = allQuestions.length;
  const currentQuestion = allQuestions[currentIndex];
  const currentModule = currentQuestion?.module ?? 'personality';
  const answeredCount = responses.size;

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch(`/api/hit/b/session/${sessionToken}`);
        if (res.ok) {
          const data = await res.json();
          if (data.session?.id) setSessionId(data.session.id);
          if (data.responses && Array.isArray(data.responses)) {
            const restored = new Map<string, Response>();
            for (const r of data.responses) {
              restored.set(r.question_id, { selectedOption: r.selected_option, optionValue: r.option_value });
            }
            setResponses(restored);
            // Resume from first unanswered
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
    if (transitionMessage || isSubmitting || isComplete || showTrackSelector) return;

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
      fetch('/api/hit/b/response', {
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
      const res = await fetch('/api/hit/b/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          competencyTrack: selectedTrack,
          hitAResultId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsComplete(true);
        router.push(`/hero/hit/b/result/${data.resultId}`);
      } else {
        setIsSubmitting(false);
      }
    } catch {
      setIsSubmitting(false);
    }
  }, [sessionToken, selectedTrack, hitAResultId, router]);

  // Calculate temporary RIASEC scores for track recommendation
  const computeRiasecScores = useCallback(() => {
    const riasecResponses = Array.from(responses.entries())
      .filter(([key]) => key.startsWith('riasec_'));

    const sums: Record<string, number[]> = { R: [], I: [], A: [], S: [], E: [], C: [] };
    for (const [, resp] of riasecResponses) {
      const parts = resp.optionValue.split(':');
      if (parts.length >= 2) {
        const type = parts[0].toUpperCase();
        const val = parseInt(parts[1], 10);
        if (sums[type] && !isNaN(val)) sums[type].push(val);
      }
    }

    const result: Record<string, number> = {};
    for (const [type, values] of Object.entries(sums)) {
      if (values.length === 0) { result[type] = 0; continue; }
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      result[type] = Math.round(((avg - 1) / 6) * 100);
    }

    return {
      r: result.R || 0, i: result.I || 0, a: result.A || 0,
      s: result.S || 0, e: result.E || 0, c: result.C || 0,
    };
  }, [responses]);

  const handleTrackSelect = useCallback((track: CompetencyTrack) => {
    setSelectedTrack(track);
    setShowTrackSelector(false);
    // Continue to next question (common competency already in list)
  }, []);

  const handleLikertSelect = useCallback(
    (likertValue: number) => {
      if (!currentQuestion || transitionMessage || isSubmitting || showTrackSelector) return;

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
          // Special case: riasec → competency needs track selection
          if (transKey === 'riasec→competency' && !selectedTrack) {
            setRiasecScores(computeRiasecScores());
            setTransitionMessage(TRANSITION_MESSAGES[transKey]);
            setTimeout(() => {
              setTransitionMessage(null);
              setShowTrackSelector(true);
            }, 2000);
          } else {
            setTransitionMessage(TRANSITION_MESSAGES[transKey]);
            setTimeout(() => {
              setTransitionMessage(null);
              setCurrentIndex(nextIndex);
            }, 2000);
          }
        } else {
          setCurrentIndex(nextIndex);
        }
      }, 400);
    },
    [currentIndex, currentQuestion, transitionMessage, isSubmitting, showTrackSelector,
     allQuestions, total, fireAndForgetSave, submitResults, selectedTrack, computeRiasecScores],
  );

  const remainingQuestions = total - answeredCount;
  const estimatedMinutes = Math.max(1, Math.ceil((remainingQuestions * AVG_SECONDS_PER_QUESTION) / 60));

  // Get current Likert value for current question
  const currentResponse = currentQuestion ? responses.get(currentQuestion.id) : undefined;
  const currentLikertValue = currentResponse ? currentResponse.selectedOption + 1 : null;

  if (!isRestored) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isSubmitting || isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-8 h-8 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500 text-sm">종합 커리어 리포트를 생성하고 있습니다...</p>
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

  if (showTrackSelector) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
        <TrackSelector
          onSelect={handleTrackSelect}
          riasecScores={riasecScores || undefined}
        />
      </div>
    );
  }

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

              {/* Likert Scale */}
              <div className="max-w-md mx-auto">
                <LikertScale
                  value={currentLikertValue}
                  onChange={handleLikertSelect}
                  disabled={isSubmitting}
                />
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
