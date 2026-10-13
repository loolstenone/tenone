"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STAGE_SUBDOMAIN_MODULE } from "@/lib/hit/stage-modules";
import HitErrorRetry from "@/features/hit/HitErrorRetry";

type EModuleType = 'expertise' | 'leadership' | 'identity' | 'network' | 'seniorReadiness';

interface QuestionItem {
  module: EModuleType;
  id: string;
  text: string;
  subscale: string;
  reverse?: boolean;
  /** 저장할 module 이름 — 신뢰도 점검(DECOY) 문항은 'validity' (모듈 점수에 섞이지 않게, 채점은 question_id로 찾는다) */
  saveModule?: string;
}

interface Response {
  selectedOption: number;
  optionValue: string;
}

const MODULE_NAMES: Record<EModuleType, string> = {
  expertise: '전문성 자산',
  leadership: '리더십 유형',
  identity: '경력 정체성 유연성',
  network: '네트워크 자본',
  seniorReadiness: '고년차 이직 준비도',
};

const TRANSITION_MESSAGES: Record<string, string> = {
  'expertise→leadership': '다음은 리더십 유형을 분석합니다',
  'leadership→identity': '경력 정체성 유연성을 평가합니다',
  'identity→network': '네트워크 자본을 확인합니다',
  'network→seniorReadiness': '마지막 단계: 고년차 이직 준비도를 확인합니다',
};

const MODULE_ORDER: EModuleType[] = ['expertise', 'leadership', 'identity', 'network', 'seniorReadiness'];

const AVG_SECONDS_PER_QUESTION = 6;

const LIKERT_LABELS = ['매우\n비동의', '보통', '매우\n동의'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function HitETestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get("s");
  const hitAResultId = searchParams.get("a") || undefined;

  const [sessionId, setSessionId] = useState<string>('');
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);
  const [responses, setResponses] = useState<Map<string, Response>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadTick, setLoadTick] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = allQuestions.length;
  const currentQuestion = allQuestions[currentIndex];
  const currentModule = currentQuestion?.module ?? 'expertise';
  const answeredCount = responses.size;

  // Load questions from DB then restore session
  useEffect(() => {
    async function init() {
      setLoadError(null);
      setIsRestored(false);
      const sb = createClient();
      // 신뢰도 점검(DECOY) 문항은 DB test_type이 'E_checklist' — 같이 가져와 섞어 출제한다 (2026-10-12)
      const { data: rows, error } = await sb
        .from('hit_questions')
        .select('id, module, test_type, question_text, sub_domain, reverse_scored')
        .in('test_type', ['E', 'E_checklist'])
        .order('module')
        .order('question_index');

      if (error || !rows) {
        setLoadError('문항을 불러오지 못했습니다. 네트워크를 확인하고 다시 시도해 주세요.');
        setIsRestored(true);
        return;
      }

      const grouped = new Map<EModuleType, QuestionItem[]>(MODULE_ORDER.map((m) => [m, []]));
      const decoys: { id: string; text: string }[] = [];
      for (const row of rows) {
        if (row.sub_domain === 'DECOY') {
          if (row.test_type === 'E_checklist') decoys.push({ id: row.id, text: row.question_text });
          continue;
        }
        const mod = STAGE_SUBDOMAIN_MODULE.e[row.sub_domain ?? ''] as EModuleType | undefined;
        if (!mod || row.test_type !== 'E') continue;
        grouped.get(mod)?.push({
          module: mod,
          id: row.id,
          text: row.question_text,
          subscale: row.sub_domain ?? '',
          reverse: row.reverse_scored ?? false,
        });
      }
      const questions: QuestionItem[] = [];
      for (const mod of MODULE_ORDER) questions.push(...shuffle(grouped.get(mod)!));
      if (questions.length === 0) {
        setLoadError('문항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        setIsRestored(true);
        return;
      }
      // 미끼 문항을 1/3·2/3 지점에 끼운다 (맨 끝에 두면 눈에 띄고, 이어하기 때 건너뛰기 쉽다). 화면 표시 모듈은 앞 문항을 따른다.
      shuffle(decoys).forEach((d, i, arr) => {
        const pos = Math.min(questions.length, Math.floor((questions.length * (i + 1)) / (arr.length + 1)));
        const host = questions[Math.max(0, pos - 1)];
        questions.splice(pos, 0, { module: host.module, id: d.id, text: d.text, subscale: 'DECOY', reverse: false, saveModule: 'validity' });
      });
      setAllQuestions(questions);

      if (!sessionToken) { setIsRestored(true); return; }
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
            const firstUnanswered = questions.findIndex((q) => !restored.has(q.id));
            if (firstUnanswered >= 0) setCurrentIndex(firstUnanswered);
          }
        } else {
          // 내 세션이 아니거나 없는 세션 — 답해도 저장되지 않으므로 안내한다
          setLoadError('검사 세션을 찾을 수 없습니다. 소개 화면에서 다시 시작해 주세요.');
        }
      } catch {
        setLoadError('검사 세션을 불러오지 못했습니다. 네트워크를 확인하고 다시 시도해 주세요.');
      } finally {
        setIsRestored(true);
      }
    }
    init();
  }, [sessionToken, loadTick]);

  // Keyboard shortcuts
  useEffect(() => {
    if (transitionMessage || isSubmitting || isComplete || submitError) return;

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
    setSubmitError(null);
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
        const err = await res.json().catch(() => ({}));
        setSubmitError(err?.error || '결과 생성에 실패했습니다. 다시 시도해 주세요.');
        setIsSubmitting(false);
      }
    } catch {
      setSubmitError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
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

      fireAndForgetSave(q.id, q.saveModule ?? q.module, currentIndex, likertValue - 1, optionValue);

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

  const currentResponse = currentQuestion ? responses.get(currentQuestion.id) : undefined;
  const currentLikertValue = currentResponse ? currentResponse.selectedOption + 1 : null;

  const progressPercent = total > 0 ? (answeredCount / total) * 100 : 0;

  if (!sessionToken) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-neutral-400">
          세션을 찾을 수 없습니다.{" "}
          <a href="/hero/hit/e" className="text-[#E53935] underline">
            다시 시작
          </a>
          해 주세요.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <HitErrorRetry message={loadError} onRetry={() => setLoadTick((n) => n + 1)} />
      </div>
    );
  }

  if (!isRestored) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-sm text-mute">불러오는 중</span>
      </div>
    );
  }

  if (submitError && !isSubmitting) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <HitErrorRetry message={submitError} onRetry={submitResults} />
      </div>
    );
  }

  if (isSubmitting || isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="text-sm text-mute">불러오는 중</span>
        <p className="text-neutral-500 text-sm">시니어 리더십 전환 리포트를 생성하고 있습니다...</p>
        <p className="text-neutral-400 text-xs">리포트를 만들고 있습니다 (약 30초)</p>
      </div>
    );
  }

  if (transitionMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl md:text-2xl font-normal text-neutral-900 animate-pulse whitespace-pre-line">
            {transitionMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress */}
      <div className="sticky top-0 z-10 bg-white/95 px-4 pt-4 pb-2">
        <div className="w-full max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-neutral-400 tracking-wide">{MODULE_NAMES[currentModule]}</span>
            <span className="text-[11px] text-neutral-400 font-mono">
              {answeredCount}/{total}
            </span>
          </div>
          <div className="h-1 w-full bg-neutral-100 rounded-none overflow-hidden">
            <div
              className="h-full bg-[#E53935] transition-all duration-300 ease-out rounded-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
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
              <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 rounded-none bg-neutral-100 text-xs text-neutral-500 font-normal mb-4">
                  Q{currentIndex + 1}
                </span>
                <p className="text-lg md:text-xl font-normal text-neutral-900 leading-relaxed">
                  {currentQuestion.text}
                </p>
              </div>

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
                            rounded-xs text-base font-bold
                            transition-all duration-200
                            ${isSelected
                              ? 'bg-[#E53935] text-white scale-110'
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

function HitETestPageInner() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <span className="text-sm text-mute">불러오는 중</span>
        </div>
      }
    >
      <HitETestContent />
    </Suspense>
  );
}

export default function HitETestPage() {
  return (
    <Suspense>
      <HitETestPageInner />
    </Suspense>
  );
}
