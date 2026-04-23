"use client";

/**
 * Journey Workspace — 로그인 사용자의 커리어 빌드업 도구
 *
 * 탭: Today · Hero Type · 기록 · 매칭
 * 원칙: 모든 탭은 "액션 단위" (see가 아니라 do).
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Flame,
  Target,
  FileText,
  Handshake,
  Briefcase,
  Zap,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  DoorOpen,
  Swords,
  Rocket,
  Crown,
  Star,
  Plus,
  BookOpen,
} from "lucide-react";
import MatchingInbox from "@/features/hero/MatchingInbox";
import { GoalsTab } from "@/features/hero/GoalsTab";
import { JobsTab } from "@/features/hero/JobsTab";
import { CoachingTab } from "@/features/hero/CoachingTab";
import { ReflectionTab } from "@/features/hero/ReflectionTab";
import { RecordTab } from "@/features/hero/RecordTab";

const RED = "#E53935";

type Stage = "Dreamer" | "Challenger" | "Trainee" | "Debut" | "Star" | "Legend";

interface JourneyStatus {
  stage: Stage;
  stageIndex: number;
  conditions: {
    has_hit_a: boolean;
    has_hit_b: boolean;
    has_resume: boolean;
    has_jh: boolean;
    has_match: boolean;
    has_active_match: boolean;
  };
  streak: number;
  todayCheckedIn: boolean;
  todayCheckin: { id: string; energy_level: number; note: string | null } | null;
  pendingMatches: number;
  stageUp?: { from: string; to: string; ucAwarded: number } | null;
}

const STAGES: { key: Stage; label: string; subtitle: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { key: "Dreamer",    label: "Dreamer",    subtitle: "꿈을 품다",     icon: Sparkles },
  { key: "Challenger", label: "Challenger", subtitle: "도전하다",       icon: DoorOpen },
  { key: "Trainee",    label: "Trainee",    subtitle: "훈련하다",       icon: Swords },
  { key: "Debut",      label: "Debut",      subtitle: "데뷔하다",       icon: Rocket },
  { key: "Star",       label: "Star",       subtitle: "빛나다",         icon: Star },
  { key: "Legend",     label: "Legend",     subtitle: "전설이 되다",    icon: Crown },
];

const TABS = [
  { key: "today",     label: "Today",     icon: Flame },
  { key: "herotype",  label: "Hero Type", icon: Target },
  { key: "goals",     label: "목표·성취", icon: Target },
  { key: "record",    label: "기록",      icon: FileText },
  { key: "coaching",    label: "코칭",      icon: BookOpen },
  { key: "reflection",  label: "월간 회고", icon: FileText },
  { key: "jobs",        label: "채용 피드", icon: Briefcase },
  { key: "matching",  label: "매칭",      icon: Handshake },
] as const;

type TabKey = typeof TABS[number]["key"];

export function JourneyWorkspace({ memberId }: { memberId: string }) {
  const [status, setStatus] = useState<JourneyStatus | null>(null);
  const [tab, setTab] = useState<TabKey>("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageUpModal, setStageUpModal] = useState<{ from: string; to: string; ucAwarded: number } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hero/journey/status?memberId=${memberId}`);
      if (res.ok) {
        const data: JourneyStatus = await res.json();
        setStatus(data);
        if (data.stageUp) setStageUpModal(data.stageUp);
      } else {
        const err = await res.json().catch(() => ({ error: "알 수 없는 오류" }));
        setError(err.error ?? `HTTP ${res.status}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-neutral-100 rounded-2xl" />
          <div className="h-24 bg-neutral-100 rounded-2xl" />
          <div className="h-24 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <h3 className="font-bold text-neutral-900 mb-2">Journey 데이터를 불러올 수 없습니다</h3>
          <p className="text-sm text-neutral-600 mb-4">{error ?? "알 수 없는 오류"}</p>
          <button onClick={load} className="px-4 py-2 bg-[#E53935] text-white text-sm font-bold rounded-lg">다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      {stageUpModal && (
        <StageUpModal
          from={stageUpModal.from}
          to={stageUpModal.to}
          ucAwarded={stageUpModal.ucAwarded}
          onClose={() => setStageUpModal(null)}
        />
      )}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Journey 지도 */}
        <JourneyMap status={status} />

        {/* 탭 네비 */}
        <div className="sticky top-16 z-40 bg-white flex gap-1 border-b border-neutral-200 mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? "text-[#E53935] border-[#E53935]"
                  : "text-neutral-500 border-transparent hover:text-neutral-900"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {tab === "today"    && <TodayTab status={status} memberId={memberId} onRefresh={load} />}
        {tab === "herotype" && <HeroTypeTab status={status} />}
        {tab === "goals"    && <GoalsTab memberId={memberId} />}
        {tab === "record"   && <RecordTab memberId={memberId} />}
        {tab === "coaching"    && <CoachingTab memberId={memberId} />}
        {tab === "reflection"  && <ReflectionTab memberId={memberId} />}
        {tab === "jobs"        && <JobsTab memberId={memberId} />}
        {tab === "matching" && <MatchingTab status={status} memberId={memberId} />}
      </div>
    </div>
  );
}

/* ═════════════════════════ Journey 지도 ═════════════════════════ */

function streakBadge(streak: number): { label: string; emoji: string } | null {
  if (streak >= 100) return { label: "100일 전설", emoji: "🏆" };
  if (streak >= 30)  return { label: "30일 챔피언", emoji: "⭐" };
  if (streak >= 7)   return { label: "7일 달성", emoji: "🔥" };
  return null;
}

function JourneyMap({ status }: { status: JourneyStatus }) {
  const currentIdx = status.stageIndex - 1;
  const badge = streakBadge(status.streak);
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 mb-6">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#E53935] text-xs font-bold">
          <Flame className="w-3.5 h-3.5" />
          {status.streak}일째 방문
        </div>
        {badge && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 text-xs font-bold">
            <span>{badge.emoji}</span>
            {badge.label}
          </div>
        )}
        <div className="text-xs text-neutral-500">
          현재 스테이지: <span className="font-bold text-neutral-900">{STAGES[currentIdx]?.label}</span> · {STAGES[currentIdx]?.subtitle}
        </div>
      </div>

      {/* 6단계 스테이지 라인 */}
      <div className="relative">
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-neutral-200" />
        <div
          className="absolute top-6 left-0 h-0.5 transition-all"
          style={{
            width: `${(currentIdx / (STAGES.length - 1)) * 100}%`,
            backgroundColor: RED,
          }}
        />
        <div className="grid grid-cols-6 gap-2 relative">
          {STAGES.map((s, i) => {
            const isPast = i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={s.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 ${
                    isCurrent ? "scale-110 shadow-lg" : ""
                  }`}
                  style={
                    isCurrent
                      ? { backgroundColor: RED, boxShadow: `0 6px 20px ${RED}40` }
                      : isPast
                      ? { backgroundColor: `${RED}20` }
                      : { backgroundColor: "#F5F5F5" }
                  }
                >
                  <s.icon
                    className="w-5 h-5"
                    style={isCurrent ? { color: "white" } : isPast ? { color: RED } : { color: "#A3A3A3" }}
                  />
                </div>
                <p className={`mt-2 text-[11px] font-bold ${isCurrent || isPast ? "text-neutral-900" : "text-neutral-400"}`}>
                  {s.label}
                </p>
                <p className="text-[10px] text-neutral-400 hidden md:block">{s.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════ Today 탭 ═════════════════════════ */

function TodayTab({ status, memberId, onRefresh }: { status: JourneyStatus; memberId: string; onRefresh: () => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <NextStageCard status={status} />
        <CheckinCard status={status} memberId={memberId} onRefresh={onRefresh} />
      </div>
      <div className="space-y-6">
        <TodayMissionCard status={status} />
        <MatchingSummaryCard status={status} />
      </div>
    </div>
  );
}

function NextStageCard({ status }: { status: JourneyStatus }) {
  const nextIdx = status.stageIndex; // 다음 스테이지 (현재 index는 1-based, 다음은 그대로 0-based index)
  const next = STAGES[nextIdx];
  const conditions = status.conditions;

  const checklistByStage: Record<string, { label: string; done: boolean; href: string }[]> = {
    Challenger: [
      { label: "HIT A 검사 완료", done: conditions.has_hit_a, href: "/hero/hit/a" },
    ],
    Trainee: [
      { label: "HIT A 검사 완료", done: conditions.has_hit_a, href: "/hero/hit/a" },
      { label: "HIT B 검사 완료", done: conditions.has_hit_b, href: "/hero/hit/b" },
      { label: "이력서 작성", done: conditions.has_resume, href: "/hero/resume/workspace" },
    ],
    Debut: [
      { label: "HIT A+B 완료", done: conditions.has_hit_a && conditions.has_hit_b, href: "/hero/hit" },
      { label: "이력서 작성", done: conditions.has_resume, href: "/hero/resume/workspace" },
      { label: "JH 12문항 작성", done: conditions.has_jh, href: "/hero/jh/write" },
      { label: "첫 매칭 수신", done: conditions.has_match, href: "#matching" },
    ],
    Star: [
      { label: "매칭 성사 (계약 또는 트라이얼)", done: conditions.has_active_match, href: "#matching" },
    ],
    Legend: [
      { label: "멘토 등록 / 후배 추천", done: false, href: "/hero/mentor" },
    ],
  };

  const items = next ? checklistByStage[next.key] ?? [] : [];
  const doneCount = items.filter(i => i.done).length;
  const progressPct = items.length ? Math.round((doneCount / items.length) * 100) : 100;

  if (!next) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-amber-600" />
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Legend</span>
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">여정의 정점에 도달했습니다</h3>
        <p className="text-sm text-neutral-600">이제 당신이 다음 세대의 영웅을 만들 차례입니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">다음 스테이지</p>
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <next.icon className="w-5 h-5" style={{ color: RED }} />
            {next.label} <span className="text-sm font-medium text-neutral-500">· {next.subtitle}</span>
          </h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: RED }}>{progressPct}%</div>
          <div className="text-[10px] text-neutral-400">해금까지</div>
        </div>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-4">
        <div className="h-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: RED }} />
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              it.done ? "bg-green-50 text-neutral-600" : "hover:bg-neutral-50 text-neutral-700"
            }`}
          >
            {it.done ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-neutral-300 shrink-0" />
            )}
            <span className={`flex-1 ${it.done ? "line-through" : ""}`}>{it.label}</span>
            {!it.done && <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />}
          </Link>
        ))}
      </div>
    </div>
  );
}

function TodayMissionCard({ status }: { status: JourneyStatus }) {
  // 오늘의 미션: 사용자가 다음 스테이지로 가기 위해 가장 먼저 해야 할 것
  const c = status.conditions;
  let mission: { title: string; desc: string; href: string; reward: string } | null = null;

  if (!c.has_hit_a) {
    mission = { title: "HIT A 검사", desc: "10분이면 영웅 유형이 나와요", href: "/hero/hit/a", reward: "+1,000 UC" };
  } else if (!c.has_hit_b) {
    mission = { title: "HIT B 검사", desc: "역량 분포가 더해져요 (12분)", href: "/hero/hit/b", reward: "+1,500 UC" };
  } else if (!c.has_resume) {
    mission = { title: "이력서 작성", desc: "Trainee 스테이지 해금 조건", href: "/hero/resume/workspace", reward: "+500 UC" };
  } else if (!c.has_jh) {
    mission = { title: "JH 12문항 작성", desc: "매칭을 받으려면 필요해요", href: "/hero/jh/write", reward: "+500 UC" };
  } else if (status.pendingMatches > 0) {
    mission = { title: `받은 매칭 ${status.pendingMatches}건 확인`, desc: "큐레이션이 도착했어요", href: "#matching", reward: "+100 UC" };
  } else {
    mission = { title: "오늘 체크인", desc: "30초면 충분해요", href: "#checkin", reward: "+50 UC" };
  }

  return (
    <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${RED}, #FF6F6F)` }}>
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4" />
        <span className="text-xs font-bold tracking-wider uppercase">오늘의 미션</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{mission.title}</h3>
      <p className="text-sm text-white/80 mb-5">{mission.desc}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">{mission.reward}</span>
        <Link
          href={mission.href}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#E53935] text-sm font-bold rounded-lg hover:bg-neutral-100 transition-colors"
        >
          지금 시작 <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function CheckinCard({ status, memberId, onRefresh }: { status: JourneyStatus; memberId: string; onRefresh: () => void }) {
  const [energy, setEnergy] = useState<number>(status.todayCheckin?.energy_level ?? 3);
  const [note, setNote] = useState<string>(status.todayCheckin?.note ?? "");
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/hero/journey/checkin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ memberId, energyLevel: energy, note }),
      });
      if (res.ok) {
        const data = await res.json() as { earned?: { action: string; amount: number }[] };
        const totalUC = (data.earned ?? []).reduce((s, e) => s + e.amount, 0);
        const hasStreak = (data.earned ?? []).some(e => e.action.startsWith("hero_streak_"));
        if (totalUC > 0) {
          setToast(hasStreak ? `🎉 스트릭 달성! +${totalUC} UC 적립` : `+${totalUC} UC 적립`);
          setTimeout(() => setToast(null), 3500);
        }
        onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="checkin" className="bg-white border border-neutral-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">30초 체크인</p>
          <h3 className="text-lg font-bold text-neutral-900">오늘 나의 에너지는?</h3>
        </div>
        {status.todayCheckedIn && (
          <span className="text-xs font-bold text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 오늘 완료
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mb-4 px-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setEnergy(n)}
            className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
              energy === n ? "text-white scale-110 shadow-lg" : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
            }`}
            style={energy === n ? { backgroundColor: RED } : undefined}
          >
            {n}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="오늘 한 일 한 줄 (선택)"
        className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg mb-3 focus:outline-none focus:border-[#E53935]"
      />
      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-lg text-white font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
        style={{ backgroundColor: RED }}
      >
        {saving ? "저장 중..." : status.todayCheckedIn ? "갱신" : "저장 +50 UC"}
      </button>
      {toast && (
        <div className="mt-3 px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg text-center text-sm font-bold text-amber-800 animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}

function MatchingSummaryCard({ status }: { status: JourneyStatus }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Handshake className="w-4 h-4" style={{ color: RED }} />
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">받은 매칭</span>
      </div>
      {status.pendingMatches > 0 ? (
        <>
          <p className="text-lg font-bold text-neutral-900 mb-1">확인 안 한 매칭 {status.pendingMatches}건</p>
          <p className="text-sm text-neutral-500 mb-4">큐레이션이 도착했어요</p>
          <Link
            href="#matching"
            onClick={(e) => { e.preventDefault(); document.querySelector('[data-tab="matching"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); }}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E53935] hover:gap-2 transition-all"
          >
            보러 가기 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-3">
            아직 받은 매칭이 없어요. JH를 작성하면 매칭 후보에 올라갑니다.
          </p>
          {!status.conditions.has_jh && (
            <Link
              href="/hero/jh/write"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E53935] hover:gap-2 transition-all"
            >
              JH 작성하기 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </>
      )}
    </div>
  );
}

/* ═════════════════════════ Hero Type 탭 ═════════════════════════ */

function HeroTypeTab({ status }: { status: JourneyStatus }) {
  const tests = [
    { key: "a", label: "HIT A",  subtitle: "본질 · 영웅 유형",     done: status.conditions.has_hit_a },
    { key: "b", label: "HIT B",  subtitle: "역량 · 준비도",          done: status.conditions.has_hit_b },
    { key: "c", label: "HIT C",  subtitle: "경력 전환 (심화)",       done: false },
    { key: "d", label: "HIT D",  subtitle: "시니어 커리어 (심화)",  done: false },
    { key: "e", label: "HIT E",  subtitle: "2막 설계 (심화)",        done: false },
    { key: "f", label: "HIT F",  subtitle: "복귀 설계 (심화)",       done: false },
  ];
  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-neutral-900 mb-1">HIT 검사 관리</h3>
        <p className="text-sm text-neutral-500 mb-6">검사를 완료할수록 당신의 데이터는 두꺼워지고, 매칭·코칭 정확도가 올라갑니다.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {tests.map((t) => (
            <Link
              key={t.key}
              href={`/hero/hit/${t.key}`}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                t.done ? "border-green-200 bg-green-50" : "border-neutral-200 hover:border-[#E53935] hover:shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900">{t.label}</span>
                  {t.done && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">{t.subtitle}</p>
              </div>
              <span className="text-xs font-bold" style={{ color: RED }}>
                {t.done ? "결과 보기" : "시작"} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}



/* ═════════════════════════ 매칭 탭 ═════════════════════════ */

function MatchingTab({ status, memberId }: { status: JourneyStatus; memberId: string }) {
  return (
    <div id="matching" className="space-y-6">
      {!status.conditions.has_jh && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">먼저 JH 작성</span>
          </div>
          <h3 className="font-bold text-neutral-900 mb-1">매칭을 받으려면 JH가 필요해요</h3>
          <p className="text-sm text-neutral-600 mb-4">12문항 · 약 5분. 작성하면 매칭 후보에 올라갑니다.</p>
          <Link
            href="/hero/jh/write"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: RED }}
          >
            JH 작성하기 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
      <MatchingInbox side="talent" memberId={memberId} />
    </div>
  );
}

/* ═════════════════════════ 스테이지 승급 모달 ═════════════════════════ */

const STAGE_EMOJI: Record<string, string> = {
  Dreamer: "✨", Challenger: "🚪", Trainee: "⚔️", Debut: "🚀", Star: "⭐", Legend: "👑",
};
const STAGE_SUBTITLE: Record<string, string> = {
  Dreamer: "꿈을 품다", Challenger: "도전하다", Trainee: "훈련하다",
  Debut: "데뷔하다", Star: "빛나다", Legend: "전설이 되다",
};

function StageUpModal({ from, to, ucAwarded, onClose }: {
  from: string; to: string; ucAwarded: number; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* 상단 배너 */}
        <div className="bg-[#E53935] px-8 py-10 text-center">
          <p className="text-5xl mb-3">{STAGE_EMOJI[to] ?? "🎉"}</p>
          <h2 className="text-2xl font-black text-white mb-1">스테이지 승급!</h2>
          <p className="text-white/80 text-sm">{to} · {STAGE_SUBTITLE[to] ?? ""}</p>
        </div>

        {/* 본문 */}
        <div className="px-8 py-6 space-y-4">
          {/* 승급 경로 */}
          <div className="flex items-center justify-center gap-3 py-3 bg-neutral-50 rounded-xl">
            <span className="text-sm font-bold text-neutral-500">{from}</span>
            <span className="text-[#E53935] font-black">→</span>
            <span className="text-sm font-black text-neutral-900">{to}</span>
          </div>

          {/* UC 적립 */}
          {ucAwarded > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <div>
                <p className="text-xs font-bold text-[#E53935] uppercase tracking-wider mb-0.5">UC 적립</p>
                <p className="text-lg font-black text-neutral-900">+{ucAwarded.toLocaleString()} UC</p>
              </div>
              <span className="text-2xl">🎁</span>
            </div>
          )}

          <p className="text-sm text-neutral-500 text-center leading-relaxed">
            Journey를 계속 쌓아가세요.<br />다음 스테이지가 기다리고 있어요!
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#E53935" }}
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
