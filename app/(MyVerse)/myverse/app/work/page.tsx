"use client";

import { useState } from "react";
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

/* ── Mock Data ── */
interface Task {
  id: number;
  title: string;
  done: boolean;
}

interface Project {
  id: number;
  title: string;
  status: "진행중" | "완료";
  progress: number;
  tasks: Task[];
  org?: string;
  isOrbi?: boolean;
}

const MY_PROJECTS: Project[] = [
  {
    id: 1,
    title: "개인 포트폴리오 리뉴얼",
    status: "진행중",
    progress: 70,
    tasks: [
      { id: 1, title: "디자인 시안 확정", done: true },
      { id: 2, title: "메인 페이지 퍼블리싱", done: true },
      { id: 3, title: "프로젝트 상세 페이지", done: false },
      { id: 4, title: "반응형 QA", done: false },
    ],
  },
  {
    id: 2,
    title: "사이드 프로젝트 - 습관 트래커 앱",
    status: "진행중",
    progress: 35,
    tasks: [
      { id: 1, title: "DB 스키마 설계", done: true },
      { id: 2, title: "API 엔드포인트 구현", done: false },
      { id: 3, title: "UI 컴포넌트 개발", done: false },
    ],
  },
];

const ORBI_PROJECTS: Project[] = [
  {
    id: 3,
    title: "WIO 대시보드 v2",
    status: "진행중",
    progress: 55,
    org: "Ten:One",
    isOrbi: true,
    tasks: [
      { id: 1, title: "Timesheet 모듈 연동", done: true },
      { id: 2, title: "Finance 리포트 차트", done: true },
      { id: 3, title: "알림 시스템 구현", done: false },
      { id: 4, title: "권한 관리 페이지", done: false },
      { id: 5, title: "배포 & QA", done: false },
    ],
  },
  {
    id: 4,
    title: "MAD League 커뮤니티 플랫폼",
    status: "완료",
    progress: 100,
    org: "MAD League",
    isOrbi: true,
    tasks: [
      { id: 1, title: "멤버 프로필 시스템", done: true },
      { id: 2, title: "프로젝트 보드", done: true },
      { id: 3, title: "채팅 기능", done: true },
    ],
  },
];

/* ── 프로젝트 카드 컴포넌트 ── */
function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const doneTasks = project.tasks.filter((t) => t.done).length;

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
              {/* 상태 뱃지 */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  project.status === "완료"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {project.status === "완료" ? (
                  <CheckCircle2 className="h-2.5 w-2.5" />
                ) : (
                  <Circle className="h-2.5 w-2.5" />
                )}
                {project.status}
              </span>

              {/* Orbi 뱃지 */}
              {project.isOrbi && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-medium">
                  <Globe2 className="h-2.5 w-2.5" />
                  Orbi
                </span>
              )}

              {/* 조직명 */}
              {project.org && (
                <span className="text-[10px] text-neutral-500">
                  {project.org}
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
                project.isOrbi
                  ? "bg-gradient-to-r from-orange-500 to-amber-500"
                  : "bg-gradient-to-r from-indigo-500 to-cyan-500"
              }`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs text-neutral-500 w-8 text-right">
            {project.progress}%
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
              {doneTasks}/{project.tasks.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2.5">
                {task.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
                )}
                <span
                  className={`text-xs ${
                    task.done
                      ? "text-neutral-500 line-through"
                      : "text-neutral-300"
                  }`}
                >
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 메인 페이지 ── */
export default function WorkPage() {
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
            {MY_PROJECTS.length}개
          </span>
        </div>

        <div className="space-y-3">
          {MY_PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* 섹션 2: Orbi 프로젝트 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <Globe2 className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-semibold text-neutral-300">
            Orbi 프로젝트
          </span>
          <span className="text-xs text-neutral-600 ml-auto">
            {ORBI_PROJECTS.length}개
          </span>
        </div>

        <div className="space-y-3">
          {ORBI_PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* + 새 프로젝트 버튼 */}
      <button className="w-full py-3.5 rounded-xl border border-dashed border-white/10 text-sm text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-300 hover:border-white/20 transition-all flex items-center justify-center gap-2">
        <Plus className="h-4 w-4" />
        새 프로젝트
      </button>
    </div>
  );
}
