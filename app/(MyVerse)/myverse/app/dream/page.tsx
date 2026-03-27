"use client";

import { useState } from "react";
import {
  Star,
  Target,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  Sparkles,
  Pencil,
  Check,
  Flame,
} from "lucide-react";

/* ── Mock Data ── */
const INITIAL_VISION = "기술과 창의력으로 세상에 임팩트를 남기는 사람이 되자";

const GOALS = [
  {
    id: 1,
    title: "사이드 프로젝트 런칭",
    progress: 65,
    color: "from-indigo-500 to-cyan-500",
    quarters: [
      { q: "Q1", task: "아이디어 검증 & 프로토타입", done: true },
      { q: "Q2", task: "MVP 개발 & 베타 테스트", done: false },
      { q: "Q3", task: "정식 출시 & 마케팅", done: false },
      { q: "Q4", task: "유저 1,000명 달성", done: false },
    ],
  },
  {
    id: 2,
    title: "영어 비즈니스 회화 마스터",
    progress: 40,
    color: "from-purple-500 to-pink-500",
    quarters: [
      { q: "Q1", task: "기초 회화 패턴 100개", done: true },
      { q: "Q2", task: "영어 미팅 참여 시작", done: false },
      { q: "Q3", task: "프레젠테이션 영어", done: false },
      { q: "Q4", task: "해외 컨퍼런스 발표", done: false },
    ],
  },
  {
    id: 3,
    title: "체지방률 15% 달성",
    progress: 82,
    color: "from-emerald-500 to-teal-500",
    quarters: [
      { q: "Q1", task: "운동 습관 만들기 (주3회)", done: true },
      { q: "Q2", task: "식단 관리 시작", done: true },
      { q: "Q3", task: "체지방 18% 도달", done: true },
      { q: "Q4", task: "15% 달성 & 유지", done: false },
    ],
  },
];

const BUCKET_LIST = [
  { id: 1, title: "제주도 한 달 살기", done: false },
  { id: 2, title: "마라톤 완주", done: true },
  { id: 3, title: "개인 앱 스토어 출시", done: false },
  { id: 4, title: "일본어 JLPT N2 합격", done: false },
  { id: 5, title: "TEDx 무대에 서기", done: false },
];

export default function DreamPage() {
  const [vision, setVision] = useState(INITIAL_VISION);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(vision);
  const [expandedGoal, setExpandedGoal] = useState<number | null>(null);
  const [bucketList, setBucketList] = useState(BUCKET_LIST);

  const toggleGoal = (id: number) => {
    setExpandedGoal((prev) => (prev === id ? null : id));
  };

  const toggleBucket = (id: number) => {
    setBucketList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, done: !b.done } : b))
    );
  };

  const saveVision = () => {
    setVision(editValue);
    setEditing(false);
  };

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-1">
          <Star className="h-4 w-4" />
          내가 꿈꾸는 것
        </div>
        <h1 className="text-2xl font-bold">DREAM</h1>
      </div>

      {/* 인생 비전 카드 */}
      <section className="mb-8">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-purple-300 uppercase tracking-wider">
              My Vision
            </span>
            {!editing && (
              <button
                onClick={() => {
                  setEditValue(vision);
                  setEditing(true);
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5 text-neutral-400" />
              </button>
            )}
          </div>

          {editing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50"
                autoFocus
              />
              <button
                onClick={saveVision}
                className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
              >
                <Check className="h-4 w-4 text-purple-400" />
              </button>
            </div>
          ) : (
            <p className="text-lg font-semibold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent leading-relaxed">
              &ldquo;{vision}&rdquo;
            </p>
          )}
        </div>
      </section>

      {/* 연간 목표 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-semibold text-neutral-300">
            2026 연간 목표
          </span>
        </div>

        <div className="space-y-3">
          {GOALS.map((goal) => (
            <div key={goal.id}>
              <button
                onClick={() => toggleGoal(goal.id)}
                className="w-full rounded-xl bg-white/[0.03] border border-white/5 p-4 hover:bg-white/[0.06] transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{goal.title}</span>
                  {expandedGoal === goal.id ? (
                    <ChevronDown className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-neutral-500" />
                  )}
                </div>

                {/* 프로그레스 바 */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${goal.color} transition-all duration-700`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-neutral-400 w-8 text-right">
                    {goal.progress}%
                  </span>
                </div>
              </button>

              {/* 분기별 하위 목표 */}
              {expandedGoal === goal.id && (
                <div className="mt-1 ml-4 pl-4 border-l border-white/5 space-y-2 py-2">
                  {goal.quarters.map((q, qi) => (
                    <div key={qi} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-neutral-500 w-6">
                        {q.q}
                      </span>
                      {q.done ? (
                        <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
                      )}
                      <span
                        className={`text-xs ${
                          q.done
                            ? "text-neutral-500 line-through"
                            : "text-neutral-300"
                        }`}
                      >
                        {q.task}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 버킷리스트 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-semibold text-neutral-300">
            버킷리스트
          </span>
          <span className="text-xs text-neutral-600">
            {bucketList.filter((b) => b.done).length}/{bucketList.length}
          </span>
        </div>

        <div className="space-y-2">
          {bucketList.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleBucket(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors text-left"
            >
              {item.done ? (
                <CheckSquare className="h-4 w-4 text-purple-400 shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-neutral-600 shrink-0" />
              )}
              <span
                className={`text-sm ${
                  item.done
                    ? "line-through text-neutral-500"
                    : "text-neutral-200"
                }`}
              >
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Powered by GPR */}
      <div className="flex justify-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[10px] text-neutral-500 uppercase tracking-wider">
          Powered by <span className="text-purple-400 font-semibold">GPR</span>
        </span>
      </div>

      {/* AI 제안 */}
      <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-purple-500/20 shrink-0">
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-purple-300 mb-1">AI 제안</p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              지난주 목표 달성률 72%. 이번 주는 &lsquo;사이드 프로젝트&rsquo;에 집중해 보는 건 어때요?
              MVP 완성까지 3개 태스크 남았어요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
