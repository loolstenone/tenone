"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckSquare,
  Square,
  Moon,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchTasks, updateTask, createTask } from "@/lib/myverse-supabase";
import type { MyverseTask } from "@/lib/myverse-supabase";

/* ── 날짜 포맷 ── */
function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatDateKR() {
  const d = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}

/* ── Mock 스케줄 (추후 캘린더 연동) ── */
const SCHEDULE = [
  { id: 1, title: "Morning Routine & 독서", start: 8, end: 9, color: "bg-indigo-500/30 border-indigo-500/50" },
  { id: 2, title: "프로젝트 A 개발", start: 10, end: 12, color: "bg-purple-500/30 border-purple-500/50" },
  { id: 3, title: "팀 미팅 (온라인)", start: 14, end: 15, color: "bg-cyan-500/30 border-cyan-500/50" },
  { id: 4, title: "운동 & 산책", start: 18, end: 19, color: "bg-emerald-500/30 border-emerald-500/50" },
];

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8);

export default function PlanPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [todos, setTodos] = useState<MyverseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // 오늘 할 일 + 미완료 할 일 조회
      const { tasks } = await fetchTasks(user.id);
      setTodos(tasks);
      setLoading(false);
    };
    load();
  }, []);

  // 할 일 토글
  const toggleTodo = async (task: MyverseTask) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    const completedAt = newStatus === "done" ? new Date().toISOString() : null;

    // UI 즉시 반영
    setTodos((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus, completed_at: completedAt } : t))
    );

    // DB 저장
    await updateTask(task.id, { status: newStatus, completed_at: completedAt });
  };

  // 새 할 일 추가
  const handleAdd = async () => {
    if (!newTitle.trim() || !userId) return;
    const { task } = await createTask(userId, {
      title: newTitle.trim(),
      due_date: todayStr(),
      status: "todo",
      priority: "medium",
    });
    if (task) {
      setTodos((prev) => [task, ...prev]);
    }
    setNewTitle("");
    setShowAdd(false);
  };

  const doneCount = todos.filter((t) => t.status === "done").length;

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-1">
          <Calendar className="h-4 w-4" />
          내 하루
        </div>
        <h1 className="text-2xl font-bold">{formatDateKR()}</h1>
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
                <div className="w-14 shrink-0 text-xs text-neutral-500 pt-0.5 text-right pr-3">
                  {isInEvent ? "" : `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"}`}
                </div>
                <div className="relative w-px bg-white/10 mr-3">
                  {!isInEvent && (
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/20" />
                  )}
                </div>
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">
              {doneCount}/{todos.length}
            </span>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 프로그레스 */}
        {todos.length > 0 && (
          <div className="h-1.5 rounded-full bg-white/5 mb-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(doneCount / todos.length) * 100}%` }}
            />
          </div>
        )}

        {/* 새 할 일 입력 */}
        {showAdd && (
          <div className="flex gap-2 mb-3">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="새 할 일..."
              autoFocus
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="px-3 py-2 bg-indigo-500 rounded-lg text-sm font-medium disabled:opacity-30"
            >
              추가
            </button>
          </div>
        )}

        <div className="space-y-2">
          {todos.length > 0 ? todos.map((todo) => (
            <button
              key={todo.id}
              onClick={() => toggleTodo(todo)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors text-left"
            >
              {todo.status === "done" ? (
                <CheckSquare className="h-4 w-4 text-indigo-400 shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-neutral-600 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    todo.status === "done"
                      ? "line-through text-neutral-500"
                      : "text-neutral-200"
                  }`}
                >
                  {todo.title}
                </p>
              </div>
              <span
                className={`text-xs shrink-0 ${
                  todo.due_date === todayStr() && todo.status !== "done"
                    ? "text-amber-400"
                    : "text-neutral-600"
                }`}
              >
                {todo.due_date === todayStr() ? "오늘" : todo.due_date || ""}
              </span>
            </button>
          )) : (
            <p className="text-sm text-slate-500 bg-white/[0.03] rounded-lg px-3 py-4 text-center">
              할 일이 없어요. + 버튼을 눌러 추가하세요.
            </p>
          )}
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
