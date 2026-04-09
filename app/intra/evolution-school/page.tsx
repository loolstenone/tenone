"use client";

import { useState, useMemo, useEffect } from "react";
import clsx from "clsx";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Target,
  FlaskConical,
  BarChart3,
  X,
  Lightbulb,
  Shield,
  Heart,
  Users,
  Megaphone,
  Palette,
  Brain,
  Rocket,
  FolderKanban,
  LineChart,
  Handshake,
  PenTool,
  Sparkles,
  GraduationCap,
  Play,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import * as educationDb from "@/lib/supabase/education";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/intra/IntraUI";
import {
  type CourseStatus,
  type CategoryFilter,
  type StatusFilter,
  type TabId,
  type QuizQuestion,
  type Course,
  initialCourses,
} from "./course-data";
import { QuizModal } from "./quiz-modal";
import { CourseListTab } from "./course-list-tab";

/* ================================================================== */
/*  Icon map                                                           */
/* ================================================================== */

const courseIcons: Record<number, React.ReactNode> = {
  1: <Sparkles className="w-3.5 h-3.5" />,
  2: <BookOpen className="w-3.5 h-3.5" />,
  3: <Heart className="w-3.5 h-3.5" />,
  4: <Target className="w-3.5 h-3.5" />,
  5: <FlaskConical className="w-3.5 h-3.5" />,
  6: <Shield className="w-3.5 h-3.5" />,
  7: <Heart className="w-3.5 h-3.5" />,
  8: <Lightbulb className="w-3.5 h-3.5" />,
  9: <Megaphone className="w-3.5 h-3.5" />,
  10: <BarChart3 className="w-3.5 h-3.5" />,
  11: <Palette className="w-3.5 h-3.5" />,
  12: <PenTool className="w-3.5 h-3.5" />,
  13: <Brain className="w-3.5 h-3.5" />,
  14: <Users className="w-3.5 h-3.5" />,
  15: <Rocket className="w-3.5 h-3.5" />,
  16: <FolderKanban className="w-3.5 h-3.5" />,
  17: <LineChart className="w-3.5 h-3.5" />,
  18: <GraduationCap className="w-3.5 h-3.5" />,
  19: <Handshake className="w-3.5 h-3.5" />,
  20: <PenTool className="w-3.5 h-3.5" />,
};

/* ================================================================== */
/*  Helper components                                                  */
/* ================================================================== */

function CategoryBadge({ cat }: { cat: "필수" | "전문" | "심화" }) {
  const style = {
    필수: "bg-neutral-800 text-white",
    전문: "bg-neutral-200 text-neutral-700",
    심화: "bg-neutral-100 text-neutral-500",
  }[cat];
  return (
    <span className={clsx("px-1.5 py-0.5 rounded text-xs font-medium", style)}>
      {cat}
    </span>
  );
}

function StatusBadge({ status }: { status: CourseStatus }) {
  const style = {
    미이수: "bg-neutral-100 text-neutral-500",
    학습중: "bg-amber-50 text-amber-700 border border-amber-200",
    이수완료: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  }[status];
  const icon = {
    미이수: <XCircle className="w-3 h-3" />,
    학습중: <Play className="w-3 h-3" />,
    이수완료: <CheckCircle2 className="w-3 h-3" />,
  }[status];
  return (
    <span className={clsx("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium", style)}>
      {icon} {status}
    </span>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function EvolutionSchoolPage() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [activeTab, setActiveTab] = useState<TabId>("전체 과정");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("전체");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Quiz state
  const [quizCourseId, setQuizCourseId] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // ── Auth & DB sync ──
  const { user } = useAuth();

  useEffect(() => {
    educationDb.fetchCourses().then(({ courses: dbCourses }) => {
      if (dbCourses && dbCourses.length > 0) {
        const mapped: Course[] = dbCourses.map((dc: Record<string, unknown>) => ({
          id: Number(dc.id),
          title: String(dc.title ?? ""),
          subtitle: String(dc.subtitle ?? ""),
          category: (dc.category as Course["category"]) ?? "필수",
          duration: String(dc.duration ?? ""),
          durationMin: Number(dc.duration_min ?? 0),
          status: (dc.status as CourseStatus) ?? "미이수",
          score: dc.score != null ? Number(dc.score) : null,
          completedDate: dc.completed_date ? String(dc.completed_date) : null,
          description: String(dc.description ?? ""),
          objectives: Array.isArray(dc.objectives) ? dc.objectives as string[] : [],
          targetAudience: String(dc.target_audience ?? ""),
          instructor: String(dc.instructor ?? ""),
          quiz: Array.isArray(dc.quiz) ? dc.quiz as QuizQuestion[] : [],
        }));
        setCourses(mapped);
      }
    }).catch(() => {
      // DB 실패 시 Mock 데이터 유지
    });
  }, []);

  // ── Derived stats ──
  const stats = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter((c) => c.status === "이수완료");
    const completedCount = completed.length;
    const avgScore =
      completed.length > 0
        ? Math.round(completed.reduce((s, c) => s + (c.score ?? 0), 0) / completed.length)
        : 0;
    const mandatoryIncomplete = courses.filter(
      (c) => c.category === "필수" && c.status !== "이수완료"
    ).length;
    return { total, completedCount, avgScore, mandatoryIncomplete };
  }, [courses]);

  const categoryCounts = useMemo(() => {
    const m = courses.filter((c) => c.category === "필수").length;
    const p = courses.filter((c) => c.category === "전문").length;
    const a = courses.filter((c) => c.category === "심화").length;
    return { 필수: m, 전문: p, 심화: a };
  }, [courses]);

  const completionByCategory = useMemo(() => {
    const calc = (cat: "필수" | "전문" | "심화") => {
      const all = courses.filter((c) => c.category === cat);
      const done = all.filter((c) => c.status === "이수완료");
      return { done: done.length, total: all.length };
    };
    return { 필수: calc("필수"), 전문: calc("전문"), 심화: calc("심화") };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (categoryFilter !== "전체" && c.category !== categoryFilter) return false;
      if (statusFilter !== "전체" && c.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.subtitle.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [courses, categoryFilter, statusFilter, searchQuery]);

  // ── Actions ──
  const startLearning = (id: number) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "학습중" as CourseStatus } : c))
    );
    if (user?.id) {
      educationDb.enrollCourse(user.id, String(id)).catch(() => {});
    }
  };

  const openQuiz = (id: number) => {
    setQuizCourseId(id);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const submitQuiz = () => {
    if (quizCourseId === null) return;
    const course = courses.find((c) => c.id === quizCourseId);
    if (!course) return;

    let correct = 0;
    course.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) correct++;
    });

    const totalQ = 10;
    const mockBonus = 7;
    const finalScore = Math.round(((correct + mockBonus) / totalQ) * 100);

    setQuizScore(finalScore);
    setQuizSubmitted(true);

    if (finalScore >= 80) {
      const today = new Date().toISOString().split("T")[0];
      setCourses((prev) =>
        prev.map((c) =>
          c.id === quizCourseId
            ? { ...c, status: "이수완료" as CourseStatus, score: finalScore, completedDate: today }
            : c
        )
      );
      if (user?.id) {
        educationDb.completeEnrollment(String(quizCourseId), finalScore).catch(() => {});
      }
    }
  };

  const closeQuiz = () => {
    setQuizCourseId(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const retakeQuiz = (id: number) => {
    openQuiz(id);
  };

  // ── Tab config ──
  const tabs: TabId[] = ["전체 과정", "내 수료 현황", "VRIEF", "GPR"];
  const quizCourse = quizCourseId !== null ? courses.find((c) => c.id === quizCourseId) : null;

  return (
    <div className="p-6">
      <PageHeader title="Evolution School" description="Ten:One™ 교육 과정 · 역량 개발" />

      {/* ── Top Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "전체 과정", value: `${stats.total}개`, icon: <BookOpen className="w-3.5 h-3.5" /> },
          {
            label: "내 이수",
            value: `${stats.completedCount}/${stats.total}`,
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          },
          { label: "평균 점수", value: `${stats.avgScore}점`, icon: <Award className="w-3.5 h-3.5" /> },
          {
            label: "필수 미이수",
            value: `${stats.mandatoryIncomplete}건`,
            icon: <AlertTriangle className="w-3.5 h-3.5" />,
            warn: stats.mandatoryIncomplete > 0,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={clsx(
              "border rounded-lg p-3",
              s.warn ? "border-amber-200 bg-amber-50/50" : "border-neutral-200 bg-white"
            )}
          >
            <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
              {s.icon}
              <span className="text-xs font-medium uppercase tracking-wide">{s.label}</span>
            </div>
            <p className={clsx("text-sm font-semibold", s.warn ? "text-amber-700" : "text-neutral-900")}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-neutral-200 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-3 py-2 text-xs font-medium border-b-2 transition-colors",
              activeTab === tab
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ════════ TAB 1: 전체 과정 ════════ */}
      {activeTab === "전체 과정" && (
        <CourseListTab
          filteredCourses={filteredCourses}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          categoryCounts={categoryCounts}
          startLearning={startLearning}
          openQuiz={openQuiz}
          retakeQuiz={retakeQuiz}
        />
      )}

      {/* ════════ TAB 2: 내 수료 현황 ════════ */}
      {activeTab === "내 수료 현황" && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">이수 현황 요약</h3>

            {/* Overall progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                <span>전체 이수율</span>
                <span>
                  {stats.completedCount}/{stats.total} (
                  {Math.round((stats.completedCount / stats.total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div
                  className="bg-neutral-800 rounded-full h-2 transition-all"
                  style={{ width: `${(stats.completedCount / stats.total) * 100}%` }}
                />
              </div>
            </div>

            {/* By category */}
            <div className="grid grid-cols-3 gap-3">
              {(["필수", "전문", "심화"] as const).map((cat) => {
                const d = completionByCategory[cat];
                return (
                  <div key={cat} className="bg-neutral-50 rounded-md p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CategoryBadge cat={cat} />
                      <span className="text-[11px] text-neutral-500">
                        {d.done}/{d.total}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                      <div
                        className="bg-neutral-600 rounded-full h-1.5 transition-all"
                        style={{ width: d.total > 0 ? `${(d.done / d.total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completed courses table */}
          <div className="border border-neutral-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900">이수 완료 과정</h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500">
                  <th className="text-left px-4 py-2 font-medium">#</th>
                  <th className="text-left px-4 py-2 font-medium">과정명</th>
                  <th className="text-left px-4 py-2 font-medium">구분</th>
                  <th className="text-left px-4 py-2 font-medium">이수일</th>
                  <th className="text-left px-4 py-2 font-medium">점수</th>
                  <th className="text-left px-4 py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {courses
                  .filter((c) => c.status === "이수완료")
                  .map((c) => (
                    <tr key={c.id} className="border-t border-neutral-100 hover:bg-neutral-50/50">
                      <td className="px-4 py-2.5 text-neutral-400 font-mono">
                        {String(c.id).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-800 font-medium">{c.title}</td>
                      <td className="px-4 py-2.5">
                        <CategoryBadge cat={c.category} />
                      </td>
                      <td className="px-4 py-2.5 text-neutral-500">{c.completedDate}</td>
                      <td className="px-4 py-2.5 text-emerald-600 font-medium">{c.score}/100</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                {courses.filter((c) => c.status === "이수완료").length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-neutral-400">
                      이수 완료한 과정이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Incomplete courses table */}
          <div className="border border-neutral-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900">미이수 과정</h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500">
                  <th className="text-left px-4 py-2 font-medium">#</th>
                  <th className="text-left px-4 py-2 font-medium">과정명</th>
                  <th className="text-left px-4 py-2 font-medium">구분</th>
                  <th className="text-left px-4 py-2 font-medium">소요 시간</th>
                  <th className="text-left px-4 py-2 font-medium">상태</th>
                  <th className="text-left px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {courses
                  .filter((c) => c.status !== "이수완료")
                  .map((c) => (
                    <tr key={c.id} className="border-t border-neutral-100 hover:bg-neutral-50/50">
                      <td className="px-4 py-2.5 text-neutral-400 font-mono">
                        {c.category === "필수" && c.status === "미이수" && (
                          <span className="mr-1" title="필수 미이수">⚠️</span>
                        )}
                        {String(c.id).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-800 font-medium">{c.title}</td>
                      <td className="px-4 py-2.5">
                        <CategoryBadge cat={c.category} />
                      </td>
                      <td className="px-4 py-2.5 text-neutral-500">{c.duration}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        {c.status === "미이수" ? (
                          <button
                            onClick={() => startLearning(c.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-800 text-white rounded text-xs font-medium hover:bg-neutral-700"
                          >
                            <Play className="w-2.5 h-2.5" /> 학습 시작
                          </button>
                        ) : c.status === "학습중" ? (
                          <button
                            onClick={() => openQuiz(c.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-800 text-white rounded text-xs font-medium hover:bg-neutral-700"
                          >
                            <FlaskConical className="w-2.5 h-2.5" /> 퀴즈
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════ TAB 3: VRIEF ════════ */}
      {activeTab === "VRIEF" && (
        <div className="space-y-5">
          <div className="border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-semibold text-neutral-900">VRIEF 프레임워크</h3>
            </div>
            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              VRIEF는 Ten:One의 핵심 전략 수립 프레임워크로, 데이터 기반 의사결정을 위한 5단계
              프로세스를 제공합니다. 모든 기획·전략 업무에 VRIEF를 적용하여 체계적인 성과를
              도출합니다.
            </p>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {[
                { step: "V", label: "Verify", desc: "현상 확인 및 조사" },
                { step: "R", label: "Research", desc: "가설 수립 및 검증" },
                { step: "I", label: "Insight", desc: "핵심 인사이트 도출" },
                { step: "E", label: "Execute", desc: "전략 수립 및 실행" },
                { step: "F", label: "Feedback", desc: "결과 측정 및 환류" },
              ].map((s, i) => (
                <div key={s.step} className="text-center">
                  <div className="w-8 h-8 mx-auto rounded-full bg-neutral-800 text-white flex items-center justify-center text-xs font-bold mb-1">
                    {s.step}
                  </div>
                  <p className="text-xs font-medium text-neutral-700">{s.label}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{s.desc}</p>
                  {i < 4 && (
                    <ArrowRight className="w-3 h-3 text-neutral-300 mx-auto mt-1 hidden lg:block" />
                  )}
                </div>
              ))}
            </div>

            <a
              href="/intra/wiki"
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Wiki에서 VRIEF 전체 가이드 보기
            </a>
          </div>

          {(() => {
            const vrief = courses.find((c) => c.id === 5);
            if (!vrief) return null;
            return (
              <div className="border border-neutral-200 bg-white overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600">
                      <span className="text-xs font-bold">05</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-medium text-neutral-900">{vrief.title}</h3>
                        <CategoryBadge cat={vrief.category} />
                        <StatusBadge status={vrief.status} />
                        {vrief.score !== null && (
                          <span className="text-xs font-medium text-emerald-600">
                            {vrief.score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">{vrief.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-neutral-100 p-4 bg-neutral-50/30 space-y-3">
                  <div>
                    <h4 className="text-[11px] font-semibold text-neutral-700 mb-1">강의 설명</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">{vrief.description}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-neutral-700 mb-1">학습 목표</h4>
                    <ul className="space-y-0.5">
                      {vrief.objectives.map((o, i) => (
                        <li key={i} className="text-xs text-neutral-600 flex items-start gap-1.5">
                          <span className="text-neutral-400 mt-0.5">-</span> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-neutral-400">대상</span>
                      <p className="text-neutral-700 mt-0.5">{vrief.targetAudience}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400">소요 시간</span>
                      <p className="text-neutral-700 mt-0.5">{vrief.duration}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400">강사/출처</span>
                      <p className="text-neutral-700 mt-0.5">{vrief.instructor}</p>
                    </div>
                  </div>
                  {vrief.status === "이수완료" && (
                    <div className="pt-1">
                      <button
                        onClick={() => retakeQuiz(vrief.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-50"
                      >
                        <RotateCcw className="w-3 h-3" /> 재시험
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ════════ TAB 4: GPR ════════ */}
      {activeTab === "GPR" && (
        <div className="space-y-5">
          <div className="border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-semibold text-neutral-900">GPR 성장 철학</h3>
            </div>
            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              GPR(Goal &middot; Plan &middot; Result)은 Ten:One 구성원의 개인 및 팀 성장을 위한
              핵심 프레임워크입니다. 명확한 목표 설정, 실행 가능한 계획 수립, 측정 가능한 결과
              도출의 사이클을 반복하여 지속적인 성장을 추구합니다.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                {
                  step: "G",
                  label: "Goal",
                  desc: "SMART한 목표를 설정합니다. 구체적이고 측정 가능하며 달성 가능한 목표를 수립합니다.",
                },
                {
                  step: "P",
                  label: "Plan",
                  desc: "목표 달성을 위한 구체적인 실행 계획을 수립합니다. 마일스톤과 타임라인을 정합니다.",
                },
                {
                  step: "R",
                  label: "Result",
                  desc: "결과를 측정하고 회고합니다. 학습한 것을 다음 Goal에 반영하여 성장 사이클을 완성합니다.",
                },
              ].map((s) => (
                <div key={s.step} className="bg-neutral-50 rounded-md p-3">
                  <div className="w-7 h-7 rounded-full bg-neutral-800 text-white flex items-center justify-center text-xs font-bold mb-2">
                    {s.step}
                  </div>
                  <p className="text-[11px] font-semibold text-neutral-700 mb-1">{s.label}</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            <a
              href="/intra/wiki"
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Wiki에서 GPR 가이드북 보기
            </a>
          </div>

          {(() => {
            const gpr = courses.find((c) => c.id === 4);
            if (!gpr) return null;
            return (
              <div className="border border-neutral-200 bg-white overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600">
                      <span className="text-xs font-bold">04</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-medium text-neutral-900">{gpr.title}</h3>
                        <CategoryBadge cat={gpr.category} />
                        <StatusBadge status={gpr.status} />
                        {gpr.score !== null && (
                          <span className="text-xs font-medium text-emerald-600">
                            {gpr.score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">{gpr.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-neutral-100 p-4 bg-neutral-50/30 space-y-3">
                  <div>
                    <h4 className="text-[11px] font-semibold text-neutral-700 mb-1">강의 설명</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">{gpr.description}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-neutral-700 mb-1">학습 목표</h4>
                    <ul className="space-y-0.5">
                      {gpr.objectives.map((o, i) => (
                        <li key={i} className="text-xs text-neutral-600 flex items-start gap-1.5">
                          <span className="text-neutral-400 mt-0.5">-</span> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-neutral-400">대상</span>
                      <p className="text-neutral-700 mt-0.5">{gpr.targetAudience}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400">소요 시간</span>
                      <p className="text-neutral-700 mt-0.5">{gpr.duration}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400">강사/출처</span>
                      <p className="text-neutral-700 mt-0.5">{gpr.instructor}</p>
                    </div>
                  </div>
                  {gpr.status === "이수완료" && (
                    <div className="pt-1">
                      <button
                        onClick={() => retakeQuiz(gpr.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-50"
                      >
                        <RotateCcw className="w-3 h-3" /> 재시험
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ════════ Quiz Modal ════════ */}
      {quizCourse && (
        <QuizModal
          quizCourse={quizCourse}
          quizAnswers={quizAnswers}
          setQuizAnswers={setQuizAnswers}
          quizSubmitted={quizSubmitted}
          setQuizSubmitted={setQuizSubmitted}
          quizScore={quizScore}
          setQuizScore={setQuizScore}
          submitQuiz={submitQuiz}
          closeQuiz={closeQuiz}
        />
      )}
    </div>
  );
}
