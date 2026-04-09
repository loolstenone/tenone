"use client";

import clsx from "clsx";
import {
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  FlaskConical,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { Course, CategoryFilter, StatusFilter, CourseStatus } from "./course-data";

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

interface CourseListTabProps {
  filteredCourses: Course[];
  categoryFilter: CategoryFilter;
  setCategoryFilter: (f: CategoryFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (f: StatusFilter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
  categoryCounts: { 필수: number; 전문: number; 심화: number };
  startLearning: (id: number) => void;
  openQuiz: (id: number) => void;
  retakeQuiz: (id: number) => void;
}

export function CourseListTab({
  filteredCourses,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  expandedId,
  setExpandedId,
  categoryCounts,
  startLearning,
  openQuiz,
  retakeQuiz,
}: CourseListTabProps) {
  return (
    <>
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Category */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-neutral-400 mr-1">구분</span>
          {(["전체", "필수", "전문", "심화"] as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={clsx(
                "px-2 py-1 rounded text-[11px] font-medium transition-colors",
                categoryFilter === cat
                  ? "bg-neutral-800 text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              )}
            >
              {cat}
              {cat !== "전체" && (
                <span className="ml-0.5 opacity-60">({categoryCounts[cat]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-neutral-400 mr-1">상태</span>
          {(["전체", "미이수", "학습중", "이수완료"] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={clsx(
                "px-2 py-1 rounded text-[11px] font-medium transition-colors",
                statusFilter === st
                  ? "bg-neutral-800 text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              )}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
          <input
            type="text"
            placeholder="과정 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md w-48 focus:outline-none focus:border-neutral-400 bg-white"
          />
        </div>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredCourses.map((course) => {
          const isExpanded = expandedId === course.id;
          return (
            <div
              key={course.id}
              className="border border-neutral-200 bg-white overflow-hidden"
            >
              {/* Card header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : course.id)}
                className="w-full text-left p-3.5 hover:bg-neutral-50/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Number badge */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600">
                    <span className="text-xs font-bold">
                      {String(course.id).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-medium text-neutral-900 truncate">
                        {course.title}
                      </h3>
                      <CategoryBadge cat={course.category} />
                    </div>
                    <p className="text-xs text-neutral-400 mb-1.5">{course.subtitle}</p>
                    <p className="text-[11px] text-neutral-500 line-clamp-1">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                        <Clock className="w-3 h-3" /> {course.duration}
                      </span>
                      <StatusBadge status={course.status} />
                      {course.status === "이수완료" && course.score !== null && (
                        <span className="text-xs font-medium text-emerald-600">
                          {course.score}/100
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand icon */}
                  <div className="flex-shrink-0 text-neutral-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-neutral-100 p-4 bg-neutral-50/30">
                  <div className="space-y-3">
                    {/* Description */}
                    <div>
                      <h4 className="text-[11px] font-semibold text-neutral-700 mb-1">강의 설명</h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Objectives */}
                    <div>
                      <h4 className="text-[11px] font-semibold text-neutral-700 mb-1">학습 목표</h4>
                      <ul className="space-y-0.5">
                        {course.objectives.map((obj, i) => (
                          <li key={i} className="text-xs text-neutral-600 flex items-start gap-1.5">
                            <span className="text-neutral-400 mt-0.5">-</span>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-neutral-400">대상</span>
                        <p className="text-neutral-700 mt-0.5">{course.targetAudience}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400">소요 시간</span>
                        <p className="text-neutral-700 mt-0.5">{course.duration}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400">강사/출처</span>
                        <p className="text-neutral-700 mt-0.5">{course.instructor}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      {course.status === "미이수" && (
                        <button
                          onClick={() => startLearning(course.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-800 text-white rounded-md text-xs font-medium hover:bg-neutral-700 transition-colors"
                        >
                          <Play className="w-3 h-3" /> 학습 시작
                        </button>
                      )}
                      {course.status === "학습중" && (
                        <button
                          onClick={() => openQuiz(course.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-800 text-white rounded-md text-xs font-medium hover:bg-neutral-700 transition-colors"
                        >
                          <FlaskConical className="w-3 h-3" /> 학습 완료 &rarr; 퀴즈
                        </button>
                      )}
                      {course.status === "이수완료" && (
                        <button
                          onClick={() => retakeQuiz(course.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-50 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> 재시험
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 text-neutral-400 text-xs">
          조건에 맞는 과정이 없습니다.
        </div>
      )}
    </>
  );
}
