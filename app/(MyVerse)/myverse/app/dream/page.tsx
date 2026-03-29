"use client";

import { useState, useEffect } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { fetchDreams, upsertDream, fetchProfile, upsertProfile } from "@/lib/myverse-supabase";
import type { MyverseDream } from "@/lib/myverse-supabase";

/* ── Mock 버킷리스트 (추후 별도 테이블) ── */
const INITIAL_BUCKET = [
  { id: 1, title: "제주도 한 달 살기", done: false },
  { id: 2, title: "마라톤 완주", done: true },
  { id: 3, title: "개인 앱 스토어 출시", done: false },
  { id: 4, title: "일본어 JLPT N2 합격", done: false },
  { id: 5, title: "TEDx 무대에 서기", done: false },
];

export default function DreamPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [vision, setVision] = useState("");
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [goals, setGoals] = useState<MyverseDream[]>([]);
  const [subGoals, setSubGoals] = useState<MyverseDream[]>([]);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [bucketList, setBucketList] = useState(INITIAL_BUCKET);
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [profileRes, dreamsRes] = await Promise.all([
        fetchProfile(user.id),
        fetchDreams(user.id),
      ]);

      // 비전 = profile.values_text
      if (profileRes.profile?.values_text) {
        setVision(profileRes.profile.values_text);
      }

      // 연간 목표 (dream_type === 'year') vs 하위 목표
      const yearGoals = dreamsRes.dreams.filter(d => d.dream_type === 'year');
      const subs = dreamsRes.dreams.filter(d => d.dream_type === 'quarter' || d.dream_type === 'month');
      setGoals(yearGoals);
      setSubGoals(subs);

      setLoading(false);
    };
    load();
  }, []);

  const toggleGoal = (id: string) => {
    setExpandedGoal((prev) => (prev === id ? null : id));
  };

  const toggleBucket = (id: number) => {
    setBucketList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, done: !b.done } : b))
    );
  };

  // 비전 저장
  const saveVision = async () => {
    setVision(editValue);
    setEditing(false);
    if (userId) {
      await upsertProfile(userId, { values_text: editValue });
    }
  };

  // 목표 진행률 업데이트
  const updateGoalProgress = async (dreamId: string, newProgress: number) => {
    if (!userId) return;
    setGoals(prev => prev.map(g => g.id === dreamId ? { ...g, progress: newProgress } : g));
    await upsertDream(userId, { id: dreamId, progress: newProgress });
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 색상 팔레트
  const COLORS = [
    "from-indigo-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-red-500",
  ];

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
                onClick={() => { setEditValue(vision); setEditing(true); }}
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
                onKeyDown={(e) => e.key === "Enter" && saveVision()}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50"
                autoFocus
                placeholder="나의 비전을 적어보세요"
              />
              <button
                onClick={saveVision}
                className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
              >
                <Check className="h-4 w-4 text-purple-400" />
              </button>
            </div>
          ) : vision ? (
            <p className="text-lg font-semibold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent leading-relaxed">
              &ldquo;{vision}&rdquo;
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              연필 아이콘을 눌러 나의 비전을 적어보세요.
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

        {goals.length > 0 ? (
          <div className="space-y-3">
            {goals.map((goal, gi) => {
              const color = COLORS[gi % COLORS.length];
              const children = subGoals.filter(s => s.parent_id === goal.id);
              return (
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
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-neutral-400 w-8 text-right">
                        {goal.progress}%
                      </span>
                    </div>
                  </button>

                  {expandedGoal === goal.id && children.length > 0 && (
                    <div className="mt-1 ml-4 pl-4 border-l border-white/5 space-y-2 py-2">
                      {children.map((q) => (
                        <div key={q.id} className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-neutral-500 w-6">
                            {q.dream_type === 'quarter' ? 'Q' : 'M'}
                          </span>
                          {q.status === 'completed' ? (
                            <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
                          )}
                          <span
                            className={`text-xs ${
                              q.status === 'completed'
                                ? "text-neutral-500 line-through"
                                : "text-neutral-300"
                            }`}
                          >
                            {q.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500 bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
            아직 연간 목표가 없어요. AI 탭에서 목표 설정을 도와받아 보세요.
          </p>
        )}
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
              {goals.length > 0
                ? `현재 ${goals.length}개 연간 목표 중 평균 진행률 ${Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length)}%. 꾸준히 잘 하고 있어요!`
                : "DREAM 탭에서 올해 목표를 설정하면, AI가 달성 전략을 제안해드려요."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
