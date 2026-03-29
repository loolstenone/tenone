"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Plus,
  FolderKanban,
  Globe2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchProjects, fetchTasks, createProject, updateTask } from "@/lib/myverse-supabase";
import type { MyverseProject, MyverseTask } from "@/lib/myverse-supabase";

/* ── 프로젝트 카드 컴포넌트 ── */
function ProjectCard({
  project,
  tasks,
  onToggleTask,
}: {
  project: MyverseProject;
  tasks: MyverseTask[];
  onToggleTask: (task: MyverseTask) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const isOrbi = !!project.orbi_project_id;

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
      {/* 카드 헤더 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-medium truncate">
                {project.title}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  project.status === "completed"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {project.status === "completed" ? (
                  <CheckCircle2 className="h-2.5 w-2.5" />
                ) : (
                  <Circle className="h-2.5 w-2.5" />
                )}
                {project.status === "completed" ? "완료" : "진행중"}
              </span>

              {isOrbi && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-medium">
                  <Globe2 className="h-2.5 w-2.5" />
                  Orbi
                </span>
              )}
            </div>
          </div>

          {expanded ? (
            <ChevronDown className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
          ) : (
            <ChevronRight className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
          )}
        </div>

        {/* 프로그레스 바 */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isOrbi
                  ? "bg-gradient-to-r from-orange-500 to-amber-500"
                  : "bg-gradient-to-r from-indigo-500 to-cyan-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-neutral-500 w-8 text-right">
            {progress}%
          </span>
        </div>
      </button>

      {/* 태스크 리스트 (펼침) */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
              Tasks
            </span>
            <span className="text-[10px] text-neutral-500">
              {doneTasks}/{tasks.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {tasks.length > 0 ? tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onToggleTask(task)}
                className="w-full flex items-center gap-2.5 text-left"
              >
                {task.status === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
                )}
                <span
                  className={`text-xs ${
                    task.status === "done"
                      ? "text-neutral-500 line-through"
                      : "text-neutral-300"
                  }`}
                >
                  {task.title}
                </span>
              </button>
            )) : (
              <p className="text-xs text-slate-500">태스크 없음</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 메인 페이지 ── */
export default function WorkPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<MyverseProject[]>([]);
  const [tasks, setTasks] = useState<MyverseTask[]>([]);
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [projectsRes, tasksRes] = await Promise.all([
        fetchProjects(user.id),
        fetchTasks(user.id),
      ]);

      setProjects(projectsRes.projects);
      setTasks(tasksRes.tasks);
      setLoading(false);
    };
    load();
  }, []);

  // 태스크 토글
  const handleToggleTask = async (task: MyverseTask) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    const completedAt = newStatus === "done" ? new Date().toISOString() : null;

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus, completed_at: completedAt } : t));
    await updateTask(task.id, { status: newStatus, completed_at: completedAt });
  };

  // 개인 프로젝트 vs Orbi 프로젝트
  const myProjects = projects.filter(p => !p.orbi_project_id);
  const orbiProjects = projects.filter(p => !!p.orbi_project_id);

  // 프로젝트별 태스크
  const getProjectTasks = (projectId: string) =>
    tasks.filter(t => t.project_id === projectId);

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-1">
          <Briefcase className="h-4 w-4" />
          내가 하는 일
        </div>
        <h1 className="text-2xl font-bold">WORK</h1>
      </div>

      {/* 섹션 1: 내 프로젝트 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <FolderKanban className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-semibold text-neutral-300">
            내 프로젝트
          </span>
          <span className="text-xs text-neutral-600 ml-auto">
            {myProjects.length}개
          </span>
        </div>

        {myProjects.length > 0 ? (
          <div className="space-y-3">
            {myProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                tasks={getProjectTasks(project.id)}
                onToggleTask={handleToggleTask}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
            아직 프로젝트가 없어요.
          </p>
        )}
      </section>

      {/* 섹션 2: Orbi 프로젝트 */}
      {orbiProjects.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <Globe2 className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-semibold text-neutral-300">
              Orbi 프로젝트
            </span>
            <span className="text-xs text-neutral-600 ml-auto">
              {orbiProjects.length}개
            </span>
          </div>

          <div className="space-y-3">
            {orbiProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                tasks={getProjectTasks(project.id)}
                onToggleTask={handleToggleTask}
              />
            ))}
          </div>
        </section>
      )}

      {/* + 새 프로젝트 버튼 */}
      <button className="w-full py-3.5 rounded-xl border border-dashed border-white/10 text-sm text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-300 hover:border-white/20 transition-all flex items-center justify-center gap-2">
        <Plus className="h-4 w-4" />
        새 프로젝트
      </button>
    </div>
  );
}
