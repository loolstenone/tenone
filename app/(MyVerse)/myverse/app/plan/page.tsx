"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  CheckSquare,
  Square,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";

/* ── Mock Data ── */
const TODAY = "2026년 3월 28일 토요일";

const SCHEDULE = [
  { id: 1, title: "Morning Routine & 독서", start: 8, end: 9, color: "bg-indigo-500/30 border-indigo-500/50" },
  { id: 2, title: "프로젝트 A 개발", start: 10, end: 12, color: "bg-purple-500/30 border-purple-500/50" },
  { id: 3, title: "팀 미팅 (온라인)", start: 14, end: 15, color: "bg-cyan-500/30 border-cyan-500/50" },
  { id: 4, title: "운동 & 산책", start: 18, end: 19, color: "bg-emerald-500/30 border-emerald-500/50" },
];

const TODOS = [
  { id: 1, title: "포트폴리오 사이트 디자인 수정", deadline: "오늘", done: true },
  { id: 2, title: "독서 노트 정리 (Chapter 5)", deadline: "오늘", done: true },
  { id: 3, title: "블로그 글 초안 작성", deadline: "내일", done: false },
  { id: 4, title: "운동 루틴 계획 세우기", deadline: "오늘", done: false },
  { id: 5, title: "주간 회고 작성", deadline: "일요일", done: false },
];

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8AM ~ 10PM

export default function PlanPage() {
  const [todos, setTodos] = useState(TODOS);

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-1">
          <Calendar className="h-4 w-4" />
          내 하루
        </div>
        <h1 className="text-2xl font-bold">{TODAY}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          일정 {SCHEDULE.length}개 / 할 일 {doneCount}/{todos.length} 완료
        </p>
      </div>

      {/* 타임라인 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-semibold text-neutral-300">타임라인</span>
        </div>

        <div className="relative">
          {HOURS.map((hour) => {
            const event = SCHEDULE.find((e) => e.start === hour);
            const isInEvent = SCHEDULE.some(
              (e) => hour > e.start && hour < e.end
            );

            return (
              <div key={hour} className="flex min-h-[44px]">
                {/* 시간 라벨 */}
                <div className="w-14 shrink-0 text-xs text-neutral-500 pt-0.5 text-right pr-3">
                  {isInEvent ? "" : `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"}`}
                </div>

                {/* 라인 */}
                <div className="relative w-px bg-white/10 mr-3">
                  {!isInEvent && (
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/20" />
                  )}
                </div>

                {/* 이벤트 영역 */}
                <div className="flex-1 pb-1">
                  {event && (
                    <div
                      className={`rounded-lg border px-3 py-2 ${event.color}`}
                      style={{
                        minHeight: `${(event.end - event.start) * 44}px`,
                      }}
                    >
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {event.start > 12 ? event.start - 12 : event.start}
                        {event.start >= 12 ? "PM" : "AM"} ~{" "}
                        {event.end > 12 ? event.end - 12 : event.end}
                        {event.end >= 12 ? "PM" : "AM"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 할 일 리스트 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-semibold text-neutral-300">할 일</span>
          </div>
          <span className="text-xs text-neutral-500">
            {doneCount}/{todos.length}
          </span>
        </div>

        {/* 프로그레스 */}
        <div className="h-1.5 rounded-full bg-white/5 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${(doneCount / todos.length) * 100}%` }}
          />
        </div>

        <div className="space-y-2">
          {todos.map((todo) => (
            <button
              key={todo.id}
              onClick={() => toggleTodo(todo.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors text-left"
            >
              {todo.done ? (
                <CheckSquare className="h-4 w-4 text-indigo-400 shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-neutral-600 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    todo.done
                      ? "line-through text-neutral-500"
                      : "text-neutral-200"
                  }`}
                >
                  {todo.title}
                </p>
              </div>
              <span
                className={`text-xs shrink-0 ${
                  todo.deadline === "오늘" && !todo.done
                    ? "text-amber-400"
                    : "text-neutral-600"
                }`}
              >
                {todo.deadline}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 하루 마감 버튼 */}
      <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
        <Moon className="h-4 w-4" />
        하루 마감
      </button>
    </div>
  );
}
