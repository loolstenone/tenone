'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import HitProgressBar from './HitProgressBar';
import LikertScale from './LikertScale';
import HitInterestSelector from './HitInterestSelector';

/**
 * HIT B "역량과 방향" 검사 UI (2026-10-12 재정의)
 * 흐름: 관심 산업·직무·트랙 선택 → 핵심역량·트랙 역량(competency) → 효능감(efficacy) → 자기·직무 이해(insight)
 */

type ModuleType = 'competency' | 'efficacy' | 'insight';

interface QuestionItem {
  module: ModuleType;
  id: string;
  text: string;
  subscale: string;
  reverse?: boolean;
  track?: string;
}

interface Response {
  selectedOption: number; // 0-indexed
  optionValue: string;    // 'subscale:value[:r]'
}

interface HitBTestUIProps {
  sessionToken: string;
  hitAResultId?: string;
}

const MODULE_NAMES: Record<ModuleType, string> = {
  competency: '역량 검사',
  efficacy: '효능감 검사',
  insight: '자기·직무 이해',
};

const TRANSITION_MESSAGES: Record<string, string> = {
  'competency→efficacy': '역량 검사가 끝났습니다. 다음은 "할 수 있다"를 보는 효능감 검사입니다',
  'efficacy→insight': '마지막! 나와 직무에 대한 이해를 확인합니다',
};

const AVG_SECONDS_PER_QUESTION = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HitBTestUI({ sessionToken, hitAResultId }: HitBTestUIProps) {
  const router = useRouter();

  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedJobFunction, setSelectedJobFunction] = useState<string>('');
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [responses, setResponses] = useState<Map<string, Response>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 트랙 선택 후 문항 로드 (모듈 안에서만 섞고, 모듈 순서는 고정)
  useEffect(() => {
    if (!selectedTrack) return;
    type ApiQ = { id: string; text: string; subscale: string; reverse: boolean; track: string | null };
    const toItem = (mod: ModuleType) => (q: ApiQ): QuestionItem =>
      ({ module: mod, id: q.id, text: q.text, subscale: q.subscale, reverse: q.reverse, track: q.track ?? undefined });
    fetch(`/api/hit/b/questions?trackId=${encodeURIComponent(selectedTrack)}`)
      .then(r => r.json())
      .then(data => {
        setAllQuestions([
          ...shuffle(((data.competency ?? []) as ApiQ[]).map(toItem('competency'))),
          ...shuffle(((data.efficacy ?? []) as ApiQ[]).map(toItem('efficacy'))),
          ...shuffle(((data.insight ?? []) as ApiQ[]).map(toItem('insight'))),
        ]);
      })
      .catch(() => setAllQuestions([]))
      .finally(() => setQuestionsLoaded(true));
  }, [selectedTrack]);

  // 진행 중 세션 복원
  useEffect(() => {
    if (!questionsLoaded || allQuestions.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/hit/b/session/${sessionToken}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.responses) && !cancelled) {
            const restored = new Map<string, Response>();
            for (const r of data.responses) restored.set(r.question_id, { selectedOption: r.selected_option, optionValue: r.option_value });
            setResponses(restored);
            const firstUnanswered = allQuestions.findIndex((q) => !restored.has(q.id));
            if (firstUnanswered >= 0) setCurrentIndex(firstUnanswered);
          }
        }
      } catch { /* fresh */ } finally { if (!cancelled) setIsRestored(true); }
    })();
    return () => { cancelled = true; };
  }, [sessionToken, questionsLoaded, allQuestions]);

  const total = allQuestions.length;
  const currentQuestion = allQuestions[currentIndex];
  const currentModule = currentQuestion?.module ?? 'competency';
  const answeredCount = responses.size;

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      if (autoAdvanceTimer.current) { clearTimeout(autoAdvanceTimer.current); autoAdvanceTimer.current = null; }
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const fireAndForgetSave = useCallback(
    (questionId: string, module: string, questionIndex: number, selectedOption: number, optionValue: string) => {
      fetch('/api/hit/b/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, questionId, module, questionIndex, selectedOption, optionValue }),
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
        body: JSON.stringify({ sessionToken, competencyTrack: selectedTrack, hitAResultId, interestIndustry: selectedIndustry, interestJobFunction: selectedJobFunction }),
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
  }, [sessionToken, selectedTrack, hitAResultId, selectedIndustry, selectedJobFunction, router]);

  const handleLikertSelect = useCallback(
    (likertValue: number) => {
      if (!currentQuestion || transitionMessage || isSubmitting) return;
      const q = currentQuestion;
      const optionValue = `${q.subscale}:${likertValue}${q.reverse ? ':r' : ''}`;
      setResponses((prev) => { const next = new Map(prev); next.set(q.id, { selectedOption: likertValue - 1, optionValue }); return next; });
      fireAndForgetSave(q.id, q.module, currentIndex, likertValue - 1, optionValue);

      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= total) { submitResults(); return; }
        const nextQ = allQuestions[nextIndex];
        const transKey = `${q.module}→${nextQ.module}`;
        if (q.module !== nextQ.module && TRANSITION_MESSAGES[transKey]) {
          setTransitionMessage(TRANSITION_MESSAGES[transKey]);
          setTimeout(() => { setTransitionMessage(null); setCurrentIndex(nextIndex); }, 2000);
        } else {
          setCurrentIndex(nextIndex);
        }
      }, 400);
    },
    [currentIndex, currentQuestion, transitionMessage, isSubmitting, allQuestions, total, fireAndForgetSave, submitResults],
  );

  // 키보드: 1~7 응답, ← 이전
  useEffect(() => {
    if (transitionMessage || isSubmitting || isComplete || !selectedTrack) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') { goBack(); return; }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 7) handleLikertSelect(n);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [transitionMessage, isSubmitting, isComplete, selectedTrack, goBack, handleLikertSelect]);

  const remaining = total - answeredCount;
  const estimatedMinutes = Math.max(1, Math.ceil((remaining * AVG_SECONDS_PER_QUESTION) / 60));
  const currentResponse = currentQuestion ? responses.get(currentQuestion.id) : undefined;
  const currentLikertValue = useMemo(() => (currentResponse ? currentResponse.selectedOption + 1 : null), [currentResponse]);

  // 1) 트랙 선택
  if (!selectedTrack) {
    return (
      <div className="min-h-screen bg-white">
        <HitInterestSelector
          onSelect={(industry, jobFunction, trackId) => {
            setSelectedIndustry(industry);
            setSelectedJobFunction(jobFunction);
            setSelectedTrack(trackId ?? 'startup_general'); // 맞는 트랙이 없으면 종합 트랙
          }}
        />
      </div>
    );
  }

  if (!questionsLoaded || !isRestored) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 text-center">
        <p className="text-sm text-neutral-500">문항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
      </div>
    );
  }

  if (isSubmitting || isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-8 h-8 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500 text-sm">역량과 방향 리포트를 만들고 있습니다...</p>
        <p className="text-neutral-400 text-xs">AI 분석에 약 30초 걸립니다</p>
      </div>
    );
  }

  if (transitionMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl md:text-2xl font-medium text-neutral-900 animate-pulse whitespace-pre-line text-center px-6">{transitionMessage}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 pt-4 pb-2">
        <HitProgressBar current={answeredCount} total={total} moduleName={MODULE_NAMES[currentModule]} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {currentIndex > 0 && (
            <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> 이전 질문
            </button>
          )}
          {currentQuestion && (
            <div className="transition-opacity duration-200">
              <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-xs text-neutral-500 font-medium mb-4">Q{currentIndex + 1}</span>
                <p className="text-lg md:text-xl font-medium text-neutral-900 leading-relaxed">{currentQuestion.text}</p>
              </div>
              <div className="max-w-md mx-auto">
                <LikertScale value={currentLikertValue} onChange={handleLikertSelect} disabled={isSubmitting} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="pb-6 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400"><Clock className="w-3.5 h-3.5" /> 약 {estimatedMinutes}분 남음</span>
      </div>
    </div>
  );
}
