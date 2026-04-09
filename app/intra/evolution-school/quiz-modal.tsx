"use client";

import clsx from "clsx";
import { X, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import type { Course } from "./course-data";

interface QuizModalProps {
  quizCourse: Course;
  quizAnswers: Record<number, number>;
  setQuizAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  quizSubmitted: boolean;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  quizScore: number | null;
  setQuizScore: React.Dispatch<React.SetStateAction<number | null>>;
  submitQuiz: () => void;
  closeQuiz: () => void;
}

export function QuizModal({
  quizCourse,
  quizAnswers,
  setQuizAnswers,
  quizSubmitted,
  setQuizSubmitted,
  quizScore,
  setQuizScore,
  submitQuiz,
  closeQuiz,
}: QuizModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl mx-4">
        {/* Modal header */}
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-3 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              퀴즈: {quizCourse.title}
            </h3>
            <p className="text-xs text-neutral-400">10문제 / 80점 이상 이수</p>
          </div>
          <button
            onClick={closeQuiz}
            className="p-1 hover:bg-neutral-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Real questions (3) */}
          {quizCourse.quiz.map((q, i) => (
            <div key={i} className="space-y-2">
              <p className="text-xs font-medium text-neutral-800">
                <span className="text-neutral-400 mr-1">Q{i + 1}.</span> {q.q}
              </p>
              <div className="space-y-1 pl-4">
                {q.options.map((opt, oi) => {
                  const selected = quizAnswers[i] === oi;
                  const isCorrect = quizSubmitted && q.answer === oi;
                  const isWrong = quizSubmitted && selected && q.answer !== oi;
                  return (
                    <label
                      key={oi}
                      className={clsx(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded text-xs cursor-pointer transition-colors",
                        selected && !quizSubmitted && "bg-neutral-100",
                        isCorrect && "bg-emerald-50 text-emerald-700",
                        isWrong && "bg-red-50 text-red-600",
                        !selected && !isCorrect && !isWrong && "hover:bg-neutral-50"
                      )}
                    >
                      <input
                        type="radio"
                        name={`q-${i}`}
                        disabled={quizSubmitted}
                        checked={selected}
                        onChange={() =>
                          setQuizAnswers((prev) => ({ ...prev, [i]: oi }))
                        }
                        className="w-3 h-3 accent-neutral-800"
                      />
                      <span>{opt}</span>
                      {isCorrect && (
                        <CheckCircle2 className="w-3 h-3 ml-auto text-emerald-500" />
                      )}
                      {isWrong && <XCircle className="w-3 h-3 ml-auto text-red-400" />}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Placeholder questions (Q4~Q10) */}
          {[4, 5, 6, 7, 8, 9, 10].map((n) => (
            <div key={n} className="space-y-1">
              <p className="text-xs text-neutral-300">
                <span className="mr-1">Q{n}.</span> 추가 문제 준비 중...
              </p>
              <div className="pl-4">
                {[1, 2, 3, 4].map((o) => (
                  <div key={o} className="flex items-center gap-2 px-2.5 py-1 text-xs text-neutral-200">
                    <div className="w-3 h-3 rounded-full border border-neutral-200" />
                    <div className="h-2 w-24 bg-neutral-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-5 py-3 rounded-b-xl">
          {!quizSubmitted ? (
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                {Object.keys(quizAnswers).length}/3 답변 완료 (나머지 7문제는 자동 정답 처리)
              </p>
              <button
                onClick={submitQuiz}
                disabled={Object.keys(quizAnswers).length < 3}
                className={clsx(
                  "px-4 py-1.5 rounded-md text-xs font-medium transition-colors",
                  Object.keys(quizAnswers).length >= 3
                    ? "bg-neutral-800 text-white hover:bg-neutral-700"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                )}
              >
                제출
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={clsx(
                    "text-sm font-semibold",
                    quizScore !== null && quizScore >= 80
                      ? "text-emerald-600"
                      : "text-red-500"
                  )}
                >
                  {quizScore !== null && quizScore >= 80
                    ? "이수 완료!"
                    : "미달 (80점 미만)"}
                </p>
                <p className="text-xs text-neutral-400">점수: {quizScore}/100</p>
              </div>
              <div className="flex gap-2">
                {quizScore !== null && quizScore < 80 && (
                  <button
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                      setQuizScore(null);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-800 text-white rounded-md text-xs font-medium hover:bg-neutral-700"
                  >
                    <RefreshCw className="w-3 h-3" /> 재시도
                  </button>
                )}
                <button
                  onClick={closeQuiz}
                  className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-50"
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
