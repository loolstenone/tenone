"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { JOB_VELOCITY_TABLE } from "@/lib/hit/cvi";

type FModuleType = 'break_context' | 'latent_skills' | 'resilience' | 'reentry';

interface QuestionItem {
  module: FModuleType;
  id: string;
  text: string;
  subscale: string;
  reverse?: boolean;
}

interface Response {
  selectedOption: number;
  optionValue: string;
}

const MODULE_NAMES: Record<FModuleType, string> = {
  break_context: '공백 맥락',
  latent_skills: '잠재 역량',
  resilience: '회복탄력성',
  reentry: '재진입 준비도',
};

const TRANSITION_MESSAGES: Record<string, string> = {
  'break_context\u2192latent_skills': '다음은 잠재 역량을 측정합니다',
  'latent_skills\u2192resilience': '회복탄력성을 평가합니다',
  'resilience\u2192reentry': '마지막! 재진입 준비도를 확인합니다',
};

const MODULE_ORDER: FModuleType[] = ['break_context', 'latent_skills', 'resilience', 'reentry'];

const AVG_SECONDS_PER_QUESTION = 6;

const LIKERT_LABELS = ['매우\n비동의', '보통', '매우\n동의'];

// 직군 선택지
const JOB_CATEGORIES = Object.entries(JOB_VELOCITY_TABLE)
  .filter(([k]) => k !== 'default')
  .map(([key]) => {
    const labels: Record<string, string> = {
      software_dev: 'SW 개발',
      data_science: '데이터 사이언스',
      marketing_digital: '디지털 마케팅',
      marketing_brand: '브랜드 마케팅',
      finance: '금융',
      accounting: '회계',
      hr: 'HR/인사',
      sales: '영업',
      design_ux: 'UX 디자인',
      design_graphic: '그래픽 디자인',
      education: '교육',
      healthcare: '의료/헬스케어',
      legal: '법률',
      manufacturing: '제조',
      consulting: '컨설팅',
      public_sector: '공공/행정',
    };
    return { value: key, label: labels[key] || key };
  });

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function HitFTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get("s");
  const hitAResultId = searchParams.get("a") || undefined;

  const [sessionId, setSessionId] = useState<string>('');

  // Pre-survey: break_months & job_category
  const [preSurveyDone, setPreSurveyDone] = useState(false);
  const [breakMonths, setBreakMonths] = useState<number>(0);
  const [jobCategory, setJobCategory] = useState<string>('');

  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);
  const [responses, setResponses] = useState<Map<string, Response>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = allQuestions.length;
  const currentQuestion = allQuestions[currentIndex];
  const currentModule = currentQuestion?.module ?? 'break_context';
  const answeredCount = responses.size;

  // Load questions from DB then restore session
  useEffect(() => {
    async function init() {
      const sb = createClient();
      const { data: rows } = await sb
        .from('hit_questions')
        .select('id, module, question_text, sub_domain, reverse_scored')
        .eq('test_type', 'F')
        .order('module')
        .order('question_index');

      if (!rows) { setIsRestored(true); return; }

      const grouped = new Map<FModuleType, QuestionItem[]>(MODULE_ORDER.map((m) => [m, []]));
      for (const row of rows) {
        const mod = row.module as FModuleType;
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
      setAllQuestions(questions);

      if (!sessionToken) { setIsRestored(true); return; }
      try {
        const res = await fetch(`/api/hit/f/session/${sessionToken}`);
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
        }
      } catch {
        // Continue fresh
      } finally {
        setIsRestored(true);
      }
    }
    init();
  }, [sessionToken]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!preSurveyDone || transitionMessage || isSubmitting || isComplete) return;

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
      fetch('/api/hit/f/response', {
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
      const res = await fetch('/api/hit/f/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          hitAResultId,
          breakMonths,
          jobCategory,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsComplete(true);
        router.push(`/hero/hit/f/result/${data.resultId}`);
      } else {
        setIsSubmitting(false);
      }
    } catch {
      setIsSubmitting(false);
    }
  }, [sessionToken, hitAResultId, breakMonths, jobCategory, router]);

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

      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);

      autoAdvanceTimer.current = setTimeout(() => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= total) {
          submitResults();
          return;
        }

        const nextQuestion = allQuestions[nextIndex];
        const transKey = `${q.module}\u2192${nextQuestion.module}`;

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
          <a href="/hero/hit/f" className="text-[#E53935] underline">
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
        <div className="w-6 h-6 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Pre-survey: collect break_months and job_category
  if (!preSurveyDone) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-2">HIT F</p>
            <h1 className="text-xl font-extrabold mb-2">기본 정보 입력</h1>
            <p className="text-sm text-neutral-500">CVI(경력유효성지수) 산출에 필요한 정보입니다.</p>
          </div>

          <div className="space-y-6">
            {/* 경력 공백 기간 */}
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                경력 공백 기간 (개월)
              </label>
              <input
                type="number"
                min={1}
                max={360}
                value={breakMonths || ''}
                onChange={(e) => setBreakMonths(parseInt(e.target.value, 10) || 0)}
                placeholder="예: 24"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
              />
              <p className="text-[10px] text-neutral-400 mt-1">마지막 퇴사일부터 현재까지의 개월 수</p>
            </div>

            {/* 직군 선택 */}
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                이전 직군
              </label>
              <select
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent bg-white"
              >
                <option value="">직군을 선택해주세요</option>
                {JOB_CATEGORIES.map(jc => (
                  <option key={jc.value} value={jc.value}>{jc.label}</option>
                ))}
                <option value="default">기타</option>
              </select>
              <p className="text-[10px] text-neutral-400 mt-1">직군별 기술 변화 속도가 CVI에 반영됩니다</p>
            </div>

            <button
              onClick={() => {
                if (breakMonths > 0 && jobCategory) {
                  setPreSurveyDone(true);
                }
              }}
              disabled={breakMonths <= 0 || !jobCategory}
              className="w-full py-3.5 bg-[#E53935] text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              검사 시작
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitting || isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-8 h-8 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500 text-sm">경력 공백 복귀 분석 리포트를 생성하고 있습니다...</p>
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
              className="h-full bg-[#E53935] transition-all duration-300 ease-out rounded-full"
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
                <span className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-xs text-neutral-500 font-medium mb-4">
                  Q{currentIndex + 1}
                </span>
                <p className="text-lg md:text-xl font-medium text-neutral-900 leading-relaxed">
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
                            rounded-xl text-base font-bold
                            transition-all duration-200
                            ${isSelected
                              ? 'bg-[#E53935] text-white scale-110 shadow-lg shadow-red-200'
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

function HitFTestPageInner() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" />
        </div>
      }
    >
      <HitFTestContent />
    </Suspense>
  );
}

export default function HitFTestPage() {
  return (
    <Suspense>
      <HitFTestPageInner />
    </Suspense>
  );
}
