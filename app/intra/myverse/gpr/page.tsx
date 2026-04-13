"use client";

import { useState, useEffect } from "react";
import {
  Target, Plus, Edit2, ChevronRight, ChevronDown, CheckCircle2,
  Users, Star, Save, Clock, MessageSquare, AlertTriangle, BookOpen,
  Building2, UserCircle, ArrowRight, PauseCircle,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { PageHeader, Card, SectionTitle } from "@/components/intra/IntraUI";
import { useAuth } from "@/lib/auth-context";
import * as erpDb from "@/lib/supabase/erp";

// ── Types ──

interface Initiative {
  id: string;
  text: string;
  done: boolean;
}

interface GoalItem {
  id: string;
  goal: string;
  plans: Initiative[];
  result: string;
  progress: number;
  status: "진행중" | "완료" | "미시작" | "라인스톱";
  // 자기평가 3차원
  selfWhat?: number;
  selfWhatComment?: string;
  selfHow?: string;
  selfAttitude?: number;
  // 상사평가 3차원
  mgrWhat?: number;
  mgrWhatComment?: string;
  mgrHow?: string;
  mgrAttitude?: number;
}

interface Subordinate {
  id: string;
  name: string;
  position: string;
  department: string;
  initials: string;
  overallProgress: number;
  grade: string;
  selfEvalDone: boolean;
  goals: GoalItem[];
}

interface ReviewEntry {
  id: string;
  date: string;
  reviewer: string;
  action: string;
  detail: string;
}

// ── Mock Data ──

const companyGoals: string[] = [];
const orgGoals: { dept: string; goal: string }[] = [];

const initialGoals: GoalItem[] = [];

const subordinates: Subordinate[] = [];
const reviewTimeline: ReviewEntry[] = [];

const scoreLabels = ["", "매우 미흡", "미흡", "보통", "우수", "매우 우수"];
const statusStyle: Record<string, string> = {
  "진행중": "bg-neutral-100 text-neutral-600",
  "완료": "bg-neutral-200 text-neutral-800",
  "미시작": "bg-neutral-50 text-neutral-400",
  "라인스톱": "bg-amber-50 text-amber-700",
};
const actionStyle: Record<string, string> = {
  "목표 합의": "bg-neutral-200 text-neutral-700",
  "중간 리뷰": "bg-neutral-100 text-neutral-600",
  "라인 스톱": "bg-amber-100 text-amber-700",
  "자기평가": "bg-neutral-100 text-neutral-600",
  "상사평가": "bg-neutral-100 text-neutral-600",
  "최종 확정": "bg-neutral-800 text-white",
};

// ── Stars Component ──

function Stars({
  value,
  onChange,
  color = "amber",
  size = "sm",
}: {
  value: number;
  onChange?: (v: number) => void;
  color?: "amber" | "blue";
  size?: "sm" | "xs";
}) {
  const sizeClass = size === "xs" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  const fillClass = color === "amber" ? "fill-amber-400 text-amber-400" : "fill-neutral-600 text-neutral-600";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(s)}
          className={clsx(!onChange && "cursor-default")}
        >
          <Star
            className={clsx(
              sizeClass,
              s <= value ? fillClass : "text-neutral-200"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ── Progress Bar ──

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={clsx("h-1.5 bg-neutral-100 rounded-full", className)}>
      <div
        className={clsx(
          "h-1.5 rounded-full transition-all",
          value === 100 ? "bg-neutral-800" : value >= 50 ? "bg-neutral-500" : "bg-neutral-300"
        )}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

// ══════════════════════════════════════
// ── Main Page ──
// ══════════════════════════════════════

export default function MyGPRPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"goals" | "self" | "manager" | "review">("goals");
  const [goals, setGoals] = useState(initialGoals);

  // DB에서 GPR 목표 로드
  useEffect(() => {
    if (!user) return;
    const quarter = "2026 Q1";
    erpDb.fetchGprGoals({ memberId: user.id, quarter })
      .then(data => {
        if (data.length > 0) {
          setGoals(data.map((g: any) => ({
            id: g.id,
            goal: g.goal || '',
            plans: Array.isArray(g.plans) ? g.plans : [],
            result: g.result || '',
            progress: g.progress || 0,
            status: (g.status || '진행중') as GoalItem['status'],
            selfWhat: g.self_what,
            selfWhatComment: g.self_what_comment,
            selfHow: g.self_how,
            selfAttitude: g.self_attitude,
            mgrWhat: g.mgr_what,
            mgrWhatComment: g.mgr_what_comment,
            mgrHow: g.mgr_how,
            mgrAttitude: g.mgr_attitude,
          })));
        }
      })
      .catch(() => {});
  }, [user]);
  const [subs, setSubs] = useState(subordinates);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [selfReflection, setSelfReflection] = useState("");

  const quarter = "2026 Q1";
  const daysLeft = 3;
  const overallProgress = 38;
  const grade = "B+";
  const selfEvalDone = goals.filter((g) => g.selfWhat).length;
  const hasSubordinates = subs.length > 0;

  const toggleGoal = (id: string) => {
    setExpandedGoals((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // self-eval updaters
  const updateSelfWhat = (goalId: string, score: number) =>
    setGoals((p) => p.map((g) => (g.id === goalId ? { ...g, selfWhat: score } : g)));
  const updateSelfWhatComment = (goalId: string, comment: string) =>
    setGoals((p) => p.map((g) => (g.id === goalId ? { ...g, selfWhatComment: comment } : g)));
  const updateSelfHow = (goalId: string, text: string) =>
    setGoals((p) => p.map((g) => (g.id === goalId ? { ...g, selfHow: text } : g)));
  const updateSelfAttitude = (goalId: string, score: number) =>
    setGoals((p) => p.map((g) => (g.id === goalId ? { ...g, selfAttitude: score } : g)));

  // manager-eval updaters
  const updateMgr = (subId: string, goalId: string, field: string, value: number | string) =>
    setSubs((p) =>
      p.map((s) =>
        s.id === subId
          ? { ...s, goals: s.goals.map((g) => (g.id === goalId ? { ...g, [field]: value } : g)) }
          : s
      )
    );

  // 자기평가 DB 저장
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState('');
  const handleSaveSelfEval = async () => {
    if (!user || saving) return;
    setSaving(true);
    let allOk = true;
    for (const g of goals) {
      // DB에 존재하는 goal만 업데이트 (id가 UUID 형식인 경우)
      if (!g.id || g.id.startsWith('g')) continue; // Mock ID 스킵
      try {
        await erpDb.updateGprGoal(g.id, {
          self_what: g.selfWhat ?? null,
          self_what_comment: g.selfWhatComment ?? null,
          self_how: g.selfHow ?? null,
          self_attitude: g.selfAttitude ?? null,
          progress: g.progress,
          result: g.result,
        });
      } catch {
        allOk = false;
      }
    }
    setSaving(false);
    setSaveToast(allOk ? '자기평가가 저장되었습니다.' : '일부 저장 실패');
    setTimeout(() => setSaveToast(''), 2500);
  };

  const tabs = [
    { key: "goals" as const, label: "목표 현황" },
    { key: "self" as const, label: "자기평가" },
    { key: "manager" as const, label: "상사평가", badge: subs.length },
    { key: "review" as const, label: "GPR 리뷰" },
  ];

  return (
    <div>
      {/* ── Header ── */}
      <PageHeader title="GPR" description={`목표 현황 · 자기평가 · 상사평가 · GPR 리뷰 (${quarter})`}>
        <Link
          href="/intra/erp/gpr"
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700"
        >
          GPR 전체 현황 <ChevronRight className="h-3 w-3" />
        </Link>
      </PageHeader>

      {/* ── GPR Philosophy Banner ── */}
      <div className="mb-5 border border-neutral-200 bg-neutral-50 px-4 py-3">
        <p className="text-xs text-neutral-500 mb-1.5 font-medium">GPR 성장 철학</p>
        <div className="flex gap-6 text-xs text-neutral-500">
          <span>
            <span className="font-bold text-neutral-700">G</span>oal = 원대한 꿈
          </span>
          <span>
            <span className="font-bold text-neutral-700">P</span>lan = 가설 (수정 가능)
          </span>
          <span>
            <span className="font-bold text-neutral-700">R</span>esult = 학습 (성패가 아닌 배움)
          </span>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className={clsx("grid gap-3 mb-5", hasSubordinates ? "grid-cols-4" : "grid-cols-3")}>
        <Card padding={false} className="p-3.5">
          <p className="text-xs text-neutral-400 mb-1">종합 진행률</p>
          <p className="text-xl font-bold">{overallProgress}%</p>
          <ProgressBar value={overallProgress} className="mt-1.5" />
        </Card>
        <Card padding={false} className="p-3.5">
          <p className="text-xs text-neutral-400 mb-1">현재 등급</p>
          <p className="text-xl font-bold">{grade}</p>
          <p className="text-[11px] text-neutral-400 mt-1">
            {goals.length}개 목표 중 {goals.filter((g) => g.status === "완료").length}개 완료
          </p>
        </Card>
        <Card padding={false} className="p-3.5">
          <p className="text-xs text-neutral-400 mb-1">자기평가 진행</p>
          <p className="text-xl font-bold">
            {selfEvalDone}/{goals.length}
            <span className="text-xs font-normal text-neutral-400 ml-1">완료</span>
          </p>
          <p className="text-[11px] text-amber-500 mt-1 font-medium">마감 D-{daysLeft}</p>
        </Card>
        {hasSubordinates && (
          <Card padding={false} className="p-3.5">
            <p className="text-xs text-neutral-400 mb-1">부하 평가</p>
            <p className="text-xl font-bold">
              {subs.filter((s) => s.goals.every((g) => g.mgrWhat)).length}/{subs.length}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">직속 {subs.length}명</p>
          </Card>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-neutral-200 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "px-4 py-2.5 text-xs font-medium border-b-2 transition-colors",
              activeTab === tab.key
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            )}
          >
            {tab.label}
            {tab.badge != null && (
              <span className="ml-1.5 text-[11px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════ */}
      {/* ── Tab 1: 목표 현황 ── */}
      {/* ══════════════════════════════════════ */}
      {activeTab === "goals" && (
        <div className="space-y-6">
          {/* 우리의 방향 (회사 목표) */}
          <section>
            <div className="flex items-center gap-2 mb-2.5">
              <Building2 className="h-3.5 w-3.5 text-neutral-400" />
              <h2 className="text-sm font-medium text-neutral-700">우리의 방향</h2>
              <span className="text-[11px] text-neutral-400">CEO가 설정한 회사 목표 (읽기 전용)</span>
            </div>
            <div className="space-y-1.5">
              {companyGoals.map((g, i) => (
                <div key={i} className="border border-neutral-100 bg-neutral-50 px-4 py-2.5">
                  <p className="text-xs text-neutral-600">{g}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 조직의 과제 */}
          <section>
            <div className="flex items-center gap-2 mb-2.5">
              <Users className="h-3.5 w-3.5 text-neutral-400" />
              <h2 className="text-sm font-medium text-neutral-700">조직의 과제</h2>
              <span className="text-[11px] text-neutral-400">부문/팀 핵심 과제 (읽기 전용)</span>
            </div>
            <div className="space-y-1.5">
              {orgGoals.map((item, i) => (
                <div key={i} className="border border-neutral-100 bg-neutral-50 px-4 py-2.5 flex items-center gap-3">
                  <span className="text-[11px] text-neutral-400 shrink-0 w-16">{item.dept}</span>
                  <ArrowRight className="h-3 w-3 text-neutral-300 shrink-0" />
                  <p className="text-xs text-neutral-600">{item.goal}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 개인의 역할 */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <UserCircle className="h-3.5 w-3.5 text-neutral-400" />
                <h2 className="text-sm font-medium text-neutral-700">개인의 역할</h2>
                <span className="text-[11px] text-neutral-400">전천일 (CEO) · {goals.length}개 목표</span>
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-neutral-200 hover:bg-neutral-50">
                <Plus className="h-3 w-3" /> 목표 추가
              </button>
            </div>
            <div className="space-y-2">
              {goals.map((goal) => {
                const isOpen = expandedGoals.has(goal.id);
                return (
                  <Card key={goal.id} padding={false}>
                    <button
                      onClick={() => toggleGoal(goal.id)}
                      className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-neutral-50 transition-colors"
                    >
                      <div className="pt-0.5">
                        {isOpen ? (
                          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-neutral-400">G</span>
                          <span className="text-xs font-medium">{goal.goal}</span>
                          <span
                            className={clsx(
                              "text-[10px] px-1.5 py-0.5 rounded",
                              statusStyle[goal.status]
                            )}
                          >
                            {goal.status}
                          </span>
                        </div>
                        <ProgressBar value={goal.progress} className="mt-1" />
                      </div>
                      <span className="text-sm font-bold text-neutral-600 shrink-0">
                        {goal.progress}%
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-neutral-100 px-4 py-3 space-y-3 bg-neutral-50/30">
                        {/* Plan */}
                        <div>
                          <p className="text-xs font-bold text-neutral-400 mb-1.5">
                            P <span className="font-normal">(Plan = 가설)</span>
                          </p>
                          <div className="space-y-1">
                            {goal.plans.map((p) => (
                              <div key={p.id} className="flex items-center gap-2 text-xs text-neutral-600">
                                <CheckCircle2
                                  className={clsx(
                                    "h-3.5 w-3.5 shrink-0",
                                    p.done ? "text-neutral-600" : "text-neutral-300"
                                  )}
                                />
                                <span className={clsx(p.done && "line-through text-neutral-400")}>
                                  {p.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Result */}
                        <div>
                          <p className="text-xs font-bold text-neutral-400 mb-1">
                            R <span className="font-normal">(Result = 학습)</span>
                          </p>
                          <p className="text-xs text-neutral-600 bg-white border border-neutral-100 px-3 py-2">
                            {goal.result}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* ── Tab 2: 자기평가 ── */}
      {/* ══════════════════════════════════════ */}
      {activeTab === "self" && (
        <div className="space-y-4">
          {/* Save Toast */}
          {saveToast && (
            <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-neutral-900 text-white text-xs rounded-lg shadow-lg">
              {saveToast}
            </div>
          )}
          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-700">자기평가 마감 D-{daysLeft}</p>
              <p className="text-xs text-amber-600">
                각 목표별 3차원 평가를 완료하세요: 목표 달성도(What) + 성장 기여도(How) + 프로세스 충실도(Attitude)
              </p>
            </div>
          </div>

          {/* Eval per goal */}
          {goals.map((goal) => (
            <Card key={goal.id} padding={false}>
              <div className="px-4 py-3 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{goal.goal}</span>
                    <span className={clsx("text-[10px] px-1.5 py-0.5 rounded", statusStyle[goal.status])}>
                      {goal.status}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-neutral-500">{goal.progress}%</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">{goal.result}</p>
              </div>
              <div className="px-4 py-3 space-y-4">
                {/* Dimension 1: What */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                      What
                    </span>
                    <span className="text-xs text-neutral-400">목표 달성도 (결과)</span>
                  </div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <Stars value={goal.selfWhat || 0} onChange={(v) => updateSelfWhat(goal.id, v)} />
                    {goal.selfWhat ? (
                      <span className="text-[11px] text-neutral-400">{scoreLabels[goal.selfWhat]}</span>
                    ) : null}
                  </div>
                  <textarea
                    value={goal.selfWhatComment || ""}
                    onChange={(e) => updateSelfWhatComment(goal.id, e.target.value)}
                    rows={2}
                    placeholder="달성 수준과 근거를 서술하세요..."
                    className="w-full px-3 py-2 text-[11px] border border-neutral-200 rounded resize-none focus:outline-none focus:border-neutral-400"
                  />
                </div>

                {/* Dimension 2: How */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                      How
                    </span>
                    <span className="text-xs text-neutral-400">성장 기여도 (과정)</span>
                  </div>
                  <p className="text-xs text-neutral-400 mb-1">이 목표를 통해 무엇을 배웠는가?</p>
                  <textarea
                    value={goal.selfHow || ""}
                    onChange={(e) => updateSelfHow(goal.id, e.target.value)}
                    rows={3}
                    placeholder="이 목표를 추진하면서 성장한 점, 새로 배운 점, 얻은 인사이트를 서술하세요..."
                    className="w-full px-3 py-2 text-[11px] border border-neutral-200 rounded resize-none focus:outline-none focus:border-neutral-400"
                  />
                </div>

                {/* Dimension 3: Attitude */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                      Attitude
                    </span>
                    <span className="text-xs text-neutral-400">프로세스 충실도 (태도)</span>
                  </div>
                  <p className="text-xs text-neutral-400 mb-1.5">Plan을 얼마나 성실히 실행했는가?</p>
                  <div className="flex items-center gap-3">
                    <Stars value={goal.selfAttitude || 0} onChange={(v) => updateSelfAttitude(goal.id, v)} />
                    {goal.selfAttitude ? (
                      <span className="text-[11px] text-neutral-400">{scoreLabels[goal.selfAttitude]}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Overall Self-Reflection */}
          <Card padding={false} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
              <p className="text-xs font-medium">분기 회고</p>
            </div>
            <p className="text-xs text-neutral-400 mb-2">
              이번 분기를 통해 가장 크게 성장한 점은 무엇인가?
            </p>
            <textarea
              value={selfReflection}
              onChange={(e) => setSelfReflection(e.target.value)}
              rows={4}
              placeholder="이번 분기 전체를 돌아보며 자신의 성장, 변화, 깨달음을 자유롭게 서술하세요..."
              className="w-full px-3 py-2 text-[11px] border border-neutral-200 rounded resize-none focus:outline-none focus:border-neutral-400"
            />
          </Card>

          <div className="flex gap-2">
            <button
              onClick={handleSaveSelfEval}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-neutral-100 text-neutral-700 text-xs font-medium rounded hover:bg-neutral-200 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? '저장 중...' : '임시저장'}
            </button>
            <button className="flex-1 py-2.5 bg-neutral-900 text-white text-xs font-medium rounded hover:bg-neutral-800">
              자기평가 제출
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* ── Tab 3: 상사평가 ── */}
      {/* ══════════════════════════════════════ */}
      {activeTab === "manager" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-medium">직속 부하 ({subs.length}명)</span>
          </div>
          {subs.map((sub) => {
            const isExpanded = expandedSub === sub.id;
            const evalDone = sub.goals.every((g) => g.mgrWhat);
            return (
              <Card key={sub.id} padding={false}>
                <button
                  onClick={() => setExpandedSub(isExpanded ? null : sub.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-400 shrink-0">
                    {sub.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{sub.name}</span>
                      <span className="text-[11px] text-neutral-400">{sub.position}</span>
                      {sub.selfEvalDone ? (
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                          자기평가 완료
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">
                          자기평가 미제출
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {sub.department} · 진행률 {sub.overallProgress}% · {sub.grade}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {evalDone ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" /> 평가완료
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                        {sub.goals.filter((g) => g.mgrWhat).length}/{sub.goals.length}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-neutral-100 px-4 py-3 space-y-4 bg-neutral-50/30">
                    {sub.goals.map((goal) => (
                      <ManagerGoalEval
                        key={goal.id}
                        goal={goal}
                        subId={sub.id}
                        onUpdate={updateMgr}
                      />
                    ))}
                    <button className="w-full py-2 bg-neutral-900 text-white text-xs font-medium rounded hover:bg-neutral-800">
                      {sub.name} 평가 확정
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* ── Tab 4: GPR 리뷰 ── */}
      {/* ══════════════════════════════════════ */}
      {activeTab === "review" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span className="text-sm font-medium">GPR 리뷰 타임라인</span>
              <span className="text-[11px] text-neutral-400">{quarter}</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded">
              <PauseCircle className="h-3.5 w-3.5" />
              라인 스톱 요청
            </button>
          </div>

          <div className="border border-neutral-100 bg-neutral-50 px-4 py-2.5 mb-3">
            <p className="text-xs text-neutral-500">
              <span className="font-medium text-neutral-600">라인 스톱이란?</span>{" "}
              현재 계획(Plan)이 유효하지 않다고 판단될 때 사용합니다. Plan은 가설이므로 언제든 수정할 수 있습니다.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-neutral-200" />
            <div className="space-y-4">
              {reviewTimeline.map((entry) => (
                <div key={entry.id} className="flex gap-4 relative">
                  <div className="relative z-10 mt-1.5">
                    <div
                      className={clsx(
                        "h-4 w-4 rounded-full border-2",
                        entry.action === "라인 스톱"
                          ? "bg-amber-100 border-amber-400"
                          : entry.action === "최종 확정"
                          ? "bg-neutral-800 border-neutral-800"
                          : "bg-white border-neutral-300"
                      )}
                    />
                  </div>
                  <Card className="flex-1" padding={false}><div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-neutral-400">{entry.date}</span>
                      <span
                        className={clsx(
                          "text-[11px] px-1.5 py-0.5 rounded font-medium",
                          actionStyle[entry.action] || "bg-neutral-100 text-neutral-600"
                        )}
                      >
                        {entry.action}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-0.5">{entry.reviewer}</p>
                    <p className="text-xs text-neutral-700">{entry.detail}</p>
                  </div></Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// ── Manager Goal Evaluation Card ──
// ══════════════════════════════════════

function ManagerGoalEval({
  goal,
  subId,
  onUpdate,
}: {
  goal: GoalItem;
  subId: string;
  onUpdate: (subId: string, goalId: string, field: string, value: number | string) => void;
}) {
  const [editing, setEditing] = useState(!goal.mgrWhat);

  return (
    <div className="border border-neutral-200 bg-white rounded">
      {/* Goal header */}
      <div className="px-3 py-2.5 border-b border-neutral-100">
        <div className="flex items-start justify-between mb-1">
          <span className="text-[11px] font-medium">{goal.goal}</span>
          <span className="text-xs font-bold text-neutral-500">{goal.progress}%</span>
        </div>
        <p className="text-xs text-neutral-400">{goal.result}</p>
      </div>

      {/* Self-eval display */}
      {goal.selfWhat && (
        <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-100 space-y-1.5">
          <p className="text-[11px] font-medium text-neutral-500">자기평가</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] text-neutral-400 mb-0.5">What (달성도)</p>
              <div className="flex items-center gap-1">
                <Stars value={goal.selfWhat} size="xs" />
                <span className="text-[10px] text-neutral-400">{scoreLabels[goal.selfWhat]}</span>
              </div>
              {goal.selfWhatComment && (
                <p className="text-[11px] text-neutral-500 mt-0.5">{goal.selfWhatComment}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 mb-0.5">How (성장)</p>
              <p className="text-[11px] text-neutral-500">{goal.selfHow || "미작성"}</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 mb-0.5">Attitude (태도)</p>
              {goal.selfAttitude ? (
                <div className="flex items-center gap-1">
                  <Stars value={goal.selfAttitude} size="xs" />
                  <span className="text-[10px] text-neutral-400">{scoreLabels[goal.selfAttitude]}</span>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-400">미작성</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manager eval */}
      <div className="px-3 py-2.5 space-y-3">
        <p className="text-[11px] font-medium text-neutral-500">상사평가</p>
        {editing ? (
          <>
            {/* What */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-1 py-0.5 rounded">
                  What
                </span>
                <span className="text-[11px] text-neutral-400">목표 달성도</span>
                {goal.selfWhat && (
                  <span className="text-[10px] text-neutral-300 ml-auto">
                    자기평가:{" "}
                    <Stars value={goal.selfWhat} size="xs" color="amber" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Stars
                  value={goal.mgrWhat || 0}
                  onChange={(v) => onUpdate(subId, goal.id, "mgrWhat", v)}
                  color="blue"
                />
                {goal.mgrWhat ? (
                  <span className="text-[10px] text-neutral-400">{scoreLabels[goal.mgrWhat]}</span>
                ) : null}
              </div>
              <input
                value={goal.mgrWhatComment || ""}
                onChange={(e) => onUpdate(subId, goal.id, "mgrWhatComment", e.target.value)}
                placeholder="달성도에 대한 코멘트..."
                className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400"
              />
            </div>

            {/* How */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-1 py-0.5 rounded">
                  How
                </span>
                <span className="text-[11px] text-neutral-400">성장 기여도</span>
              </div>
              <input
                value={goal.mgrHow || ""}
                onChange={(e) => onUpdate(subId, goal.id, "mgrHow", e.target.value)}
                placeholder="성장과 학습에 대한 코멘트..."
                className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none focus:border-neutral-400"
              />
            </div>

            {/* Attitude */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-1 py-0.5 rounded">
                  Attitude
                </span>
                <span className="text-[11px] text-neutral-400">프로세스 충실도</span>
                {goal.selfAttitude && (
                  <span className="text-[10px] text-neutral-300 ml-auto">
                    자기평가:{" "}
                    <Stars value={goal.selfAttitude} size="xs" color="amber" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Stars
                  value={goal.mgrAttitude || 0}
                  onChange={(v) => onUpdate(subId, goal.id, "mgrAttitude", v)}
                  color="blue"
                />
                {goal.mgrAttitude ? (
                  <span className="text-[10px] text-neutral-400">{scoreLabels[goal.mgrAttitude]}</span>
                ) : null}
              </div>
            </div>

            <button
              onClick={() => setEditing(false)}
              disabled={!goal.mgrWhat}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-neutral-900 text-white disabled:opacity-30"
            >
              <Save className="h-3 w-3" /> 저장
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-neutral-400 mb-0.5">What</p>
                <div className="flex items-center gap-1">
                  <Stars value={goal.mgrWhat || 0} color="blue" size="xs" />
                </div>
                {goal.mgrWhatComment && (
                  <p className="text-[11px] text-neutral-500 mt-0.5">{goal.mgrWhatComment}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 mb-0.5">How</p>
                <p className="text-[11px] text-neutral-500">{goal.mgrHow || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 mb-0.5">Attitude</p>
                <Stars value={goal.mgrAttitude || 0} color="blue" size="xs" />
              </div>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] text-neutral-400 hover:text-neutral-700"
            >
              수정
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
