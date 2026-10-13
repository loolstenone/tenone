"use client";

/**
 * Journey Workspace — 로그인 사용자의 커리어 빌드업 도구
 *
 * 탭: 오늘 · 히어로 유형 · 목표 · 기록 · 코칭 · 회고 · 채용 피드 · 받은 제안
 * 원칙: 모든 탭은 "액션 단위" (see가 아니라 do).
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Flame, Target, FileText, Mail, Briefcase, Zap, CheckCircle2, Circle, ArrowRight, Sparkles, DoorOpen, Swords, Rocket, Crown, Star, Plus, BookOpen } from "lucide-react";
import { labelOf, OFFER_TYPES, RECIPIENT_STATUS_LABEL } from "@/lib/hero/offers";
import { HIT_STAGES, hitStageMinutesLabel } from "@/lib/hit/stages";
import { GoalsTab } from "@/features/hero/GoalsTab";
import { JobsTab } from "@/features/hero/JobsTab";
import { CoachingTab } from "@/features/hero/CoachingTab";
import { ReflectionTab } from "@/features/hero/ReflectionTab";
import { RecordTab } from "@/features/hero/RecordTab";
import { UC_PUBLIC } from "@/lib/uc-visibility";

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
  pendingOffers: number;
  stageUp?: { from: string; to: string; ucAwarded: number } | null;
}

const STAGES: { key: Stage; label: string; subtitle: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { key: "Dreamer",    label: "꿈꾸는 사람", subtitle: "꿈을 품다",     icon: Sparkles },
  { key: "Challenger", label: "도전자",     subtitle: "문을 두드리다",       icon: DoorOpen },
  { key: "Trainee",    label: "연습생",     subtitle: "실력을 쌓다",       icon: Swords },
  { key: "Debut",      label: "데뷔",       subtitle: "무대에 서다",       icon: Rocket },
  { key: "Star",       label: "스타",       subtitle: "인정받다",         icon: Star },
  { key: "Legend",     label: "레전드",     subtitle: "길을 만들다",    icon: Crown },
];

const TABS = [
  { key: "today",     label: "오늘",     icon: Flame },
  { key: "herotype",  label: "히어로 유형", icon: Target },
  { key: "goals",     label: "목표·성취", icon: Target },
  { key: "record",    label: "기록",      icon: FileText },
  { key: "coaching",    label: "코칭",      icon: BookOpen },
  { key: "reflection",  label: "월간 회고", icon: FileText },
  { key: "jobs",        label: "채용 피드", icon: Briefcase },
  { key: "offers",      label: "받은 제안", icon: Mail },
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

  // 탭은 state라 `#offers` 같은 해시 링크로는 이동하지 않는다 — 카드에서 탭을 바꿀 땐 이 콜백 (2026-10-12)
  const goTab = useCallback((k: TabKey) => {
    setTab(k);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-neutral-100 rounded-xs" />
          <div className="h-24 bg-neutral-100 rounded-xs" />
          <div className="h-24 bg-neutral-100 rounded-xs" />
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-neutral-50 border border-neutral-200 rounded-xs p-8">
          <h3 className="font-bold text-neutral-900 mb-2">성장 기록을 불러오지 못했습니다</h3>
          <p className="text-sm text-neutral-600 mb-4">{error ?? "알 수 없는 오류"}</p>
          <button onClick={load} className="px-4 py-2 bg-[#E53935] text-white text-sm font-bold rounded-xs">다시 시도</button>
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
              data-tab={t.key}
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
        {tab === "today"    && <TodayTab status={status} memberId={memberId} onRefresh={load} goTab={goTab} />}
        {tab === "herotype" && <HeroTypeTab status={status} />}
        {tab === "goals"    && <GoalsTab memberId={memberId} />}
        {tab === "record"   && <RecordTab memberId={memberId} />}
        {tab === "coaching"    && <CoachingTab memberId={memberId} />}
        {tab === "reflection"  && <ReflectionTab memberId={memberId} />}
        {tab === "jobs"        && <JobsTab memberId={memberId} />}
        {tab === "offers" && <OffersTab />}
      </div>
    </div>
  );
}

/* ═════════════════════════ Journey 지도 ═════════════════════════ */

function streakBadge(streak: number): { label: string } | null {
  if (streak >= 100) return { label: "100일 전설" };
  if (streak >= 30)  return { label: "30일 챔피언" };
  if (streak >= 7)   return { label: "7일 달성" };
  return null;
}

function JourneyMap({ status }: { status: JourneyStatus }) {
  const currentIdx = status.stageIndex - 1;
  const badge = streakBadge(status.streak);
  return (
    <div className="bg-white border border-neutral-200 rounded-xs p-6 md:p-8 mb-6">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1 rounded-none bg-red-50 text-[#E53935] text-xs font-bold">
          <Flame className="w-3.5 h-3.5" />
          연속 체크인 {status.streak}일
        </div>
        {badge && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-none border border-neutral-900 text-neutral-900 text-xs font-bold">
            {badge.label}
          </div>
        )}
        <div className="text-xs text-neutral-500">
          현재 단계: <span className="font-bold text-neutral-900">{STAGES[currentIdx]?.label}</span> · {STAGES[currentIdx]?.subtitle}
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
                  className={`w-12 h-12 rounded-none flex items-center justify-center transition-all z-10 ${
                    isCurrent ? "scale-110" : ""
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

type GoTab = (k: TabKey) => void;

/** 카드 안 링크 — 탭 키(`#offers`)면 탭 전환, 그 외는 일반 링크 */
function CardLink({ href, goTab, className, children }: { href: string; goTab: GoTab; className?: string; children: React.ReactNode }) {
  const tabKey = href.startsWith("#") ? (TABS.find(t => t.key === href.slice(1))?.key ?? null) : null;
  if (tabKey) {
    return <button type="button" onClick={() => goTab(tabKey)} className={`${className ?? ""} text-left w-full`}>{children}</button>;
  }
  return <Link href={href} className={className}>{children}</Link>;
}

function TodayTab({ status, memberId, onRefresh, goTab }: { status: JourneyStatus; memberId: string; onRefresh: () => void; goTab: GoTab }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <NextStageCard status={status} goTab={goTab} />
        <CheckinCard status={status} memberId={memberId} onRefresh={onRefresh} />
      </div>
      <div className="space-y-6">
        <TodayMissionCard status={status} goTab={goTab} />
        <OffersSummaryCard status={status} goTab={goTab} />
      </div>
    </div>
  );
}

function NextStageCard({ status, goTab }: { status: JourneyStatus; goTab: GoTab }) {
  const nextIdx = status.stageIndex; // 다음 스테이지 (현재 index는 1-based, 다음은 그대로 0-based index)
  const next = STAGES[nextIdx];
  const conditions = status.conditions;

  const checklistByStage: Record<string, { label: string; done: boolean; href: string }[]> = {
    Challenger: [
      { label: "기본 성향 검사 완료", done: conditions.has_hit_a, href: "/hero/hit/a" },
    ],
    Trainee: [
      { label: "기본 성향 검사 완료", done: conditions.has_hit_a, href: "/hero/hit/a" },
      { label: "역량·방향 검사 완료", done: conditions.has_hit_b, href: "/hero/hit/b" },
      { label: "이력서 작성", done: conditions.has_resume, href: "/hero/resume/workspace" },
    ],
    Debut: [
      { label: "기본 성향 검사 + 역량·방향 검사 완료", done: conditions.has_hit_a && conditions.has_hit_b, href: "/hero/hit" },
      { label: "이력서 작성", done: conditions.has_resume, href: "/hero/resume/workspace" },
      { label: "희망 직무 설문 작성", done: conditions.has_jh, href: "/hero/jh/write" },
      { label: "첫 제안 받기", done: conditions.has_match, href: "#offers" },
    ],
    Star: [
      { label: "기업 제안에 응하기", done: conditions.has_active_match, href: "#offers" },
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
      <div className="bg-white border border-neutral-200 rounded-xs p-6">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-neutral-600" />
          <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">레전드</span>
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">마지막 단계에 올랐습니다</h3>
        <p className="text-sm text-neutral-600">이제 당신이 다음 세대의 영웅을 만들 차례입니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xs p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">다음 단계</p>
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <next.icon className="w-5 h-5" style={{ color: RED }} />
            {next.label} <span className="text-sm font-normal text-neutral-500">· {next.subtitle}</span>
          </h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: RED }}>{progressPct}%</div>
          <div className="text-[10px] text-neutral-400">해금까지</div>
        </div>
      </div>
      <div className="h-2 bg-neutral-100 rounded-none overflow-hidden mb-4">
        <div className="h-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: RED }} />
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <CardLink
            key={it.label}
            href={it.href}
            goTab={goTab}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xs text-sm transition-colors ${
              it.done ? "bg-neutral-50 text-neutral-600" : "hover:bg-neutral-50 text-neutral-700"
            }`}
          >
            {it.done ? (
              <CheckCircle2 className="w-4 h-4 text-neutral-600 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-neutral-300 shrink-0" />
            )}
            <span className={`flex-1 ${it.done ? "line-through" : ""}`}>{it.label}</span>
            {!it.done && <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />}
          </CardLink>
        ))}
      </div>
    </div>
  );
}

function TodayMissionCard({ status, goTab }: { status: JourneyStatus; goTab: GoTab }) {
  // 오늘의 미션: 사용자가 다음 스테이지로 가기 위해 가장 먼저 해야 할 것
  const c = status.conditions;
  // reward는 실제로 지급되는 것만 (2026-10-12 — HIT·이력서·JH·매칭 확인은 규칙만 있고 지급 코드가 없어 약속만 하던 상태). 지급을 연결하면 그때 표기
  let mission: { title: string; desc: string; href: string; reward: string | null } | null = null;

  if (!c.has_hit_a) {
    mission = { title: "기본 성향 검사", desc: `${hitStageMinutesLabel("a")}이면 영웅 유형이 나와요`, href: "/hero/hit/a", reward: null };
  } else if (!c.has_hit_b) {
    mission = { title: "역량·방향 검사", desc: `역량·효능감이 더해져요 (${hitStageMinutesLabel("b")})`, href: "/hero/hit/b", reward: null };
  } else if (!c.has_resume) {
    mission = { title: "이력서 작성", desc: "연습생 단계로 올라가는 조건", href: "/hero/resume/workspace", reward: null };
  } else if (!c.has_jh) {
    mission = { title: "희망 직무 12문항 작성", desc: "나와 맞는 회사를 알려 드리려면 필요해요", href: "/hero/jh/write", reward: null };
  } else if (status.pendingOffers > 0) {
    mission = { title: `새 제안 ${status.pendingOffers}건 확인`, desc: "기업이 면접·인터뷰를 제안했어요", href: "#offers", reward: null };
  } else {
    mission = { title: "오늘 체크인", desc: "30초면 충분해요", href: "#checkin", reward: UC_PUBLIC ? "UC 적립" : null };
  }

  return (
    <div className="rounded-xs p-6 text-white" style={{ background: RED }}>
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4" />
        <span className="text-xs font-bold tracking-wider uppercase">오늘의 미션</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{mission.title}</h3>
      <p className="text-sm text-white/80 mb-5">{mission.desc}</p>
      <div className="flex items-center justify-between">
        {mission.reward ? <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-none">{mission.reward}</span> : <span />}
        <CardLink
          href={mission.href}
          goTab={goTab}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#E53935] text-sm font-bold rounded-xs hover:bg-neutral-100 transition-colors !w-auto"
        >
          지금 시작 <ArrowRight className="w-3.5 h-3.5" />
        </CardLink>
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
        if (UC_PUBLIC && totalUC > 0) {
          setToast(hasStreak ? `연속 체크인 +${totalUC} UC 적립` : `+${totalUC} UC 적립`);
          setTimeout(() => setToast(null), 3500);
        }
        onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="checkin" className="bg-white border border-neutral-200 rounded-xs p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">30초 체크인</p>
          <h3 className="text-lg font-bold text-neutral-900">오늘 나의 에너지는?</h3>
        </div>
        {status.todayCheckedIn && (
          <span className="text-xs font-bold text-neutral-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 오늘 완료
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mb-4 px-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setEnergy(n)}
            className={`w-10 h-10 rounded-none font-bold text-sm transition-all ${
              energy === n ? "text-white scale-110" : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
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
        className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xs mb-3 focus:outline-none focus:border-[#E53935]"
      />
      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-xs text-white font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
        style={{ backgroundColor: RED }}
      >
        {saving ? "저장 중..." : status.todayCheckedIn ? "갱신" : "저장"}
      </button>
      {toast && (
        <div className="mt-3 px-3 py-2 bg-white border border-neutral-200 rounded-xs text-center text-sm font-bold text-neutral-800 animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}

function OffersSummaryCard({ status, goTab }: { status: JourneyStatus; goTab: GoTab }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xs p-6">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4" style={{ color: RED }} />
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">받은 제안</span>
      </div>
      {status.pendingOffers > 0 ? (
        <>
          <p className="text-lg font-bold text-neutral-900 mb-1">새 제안 {status.pendingOffers}건</p>
          <p className="text-sm text-neutral-500 mb-4">기업이 면접·인터뷰를 제안했어요</p>
          <button
            type="button"
            onClick={() => goTab("offers")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E53935] hover:gap-2 transition-all"
          >
            보러 가기 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-3">
            아직 받은 제안이 없어요. 제안 받기를 켜 두면 조건에 맞는 기업이 먼저 면접·인터뷰를 제안합니다.
          </p>
          <Link
            href="/hero/offers/settings"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E53935] hover:gap-2 transition-all"
          >
            제안 받기 설정 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </>
      )}
    </div>
  );
}

/* ═════════════════════════ Hero Type 탭 ═════════════════════════ */

function HeroTypeTab({ status }: { status: JourneyStatus }) {
  // 결과는 /api/hit/results (세션 기준) — 단계별 가장 최근 결과로 바로 연결
  const [latest, setLatest] = useState<Record<string, string> | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch("/api/hit/results")
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => {
        if (!alive) return;
        const m: Record<string, string> = {};
        for (const it of (d.results ?? []) as { stage: string; id: string }[]) if (!m[it.stage]) m[it.stage] = it.id; // 최신순
        setLatest(m);
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  // 검사 체계 SSOT (lib/hit/stages.ts)
  const tests = Object.values(HIT_STAGES).map(st => {
    const resultId = latest?.[st.key];
    const done = !!resultId || (failed && (st.key === "a" ? status.conditions.has_hit_a : st.key === "b" ? status.conditions.has_hit_b : false));
    return {
      key: st.key, label: st.code, subtitle: st.name, done,
      href: resultId ? `/hero/hit/${st.key}/result/${resultId}` : `/hero/hit/${st.key}`,
    };
  });
  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-xs p-6">
        <h3 className="text-lg font-bold text-neutral-900 mb-1">HIT 검사 관리</h3>
        <p className="text-sm text-neutral-500 mb-6">마친 검사가 많을수록 코칭과 해설이 내 상황에 더 가까워집니다.</p>
        {failed && <p className="text-xs text-neutral-700 mb-3">결과 목록을 불러오지 못해 일부 검사는 완료 여부가 정확하지 않을 수 있습니다.</p>}
        <div className="grid md:grid-cols-2 gap-3">
          {tests.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`flex items-center justify-between gap-3 p-4 rounded-xs border transition-all ${
                t.done ? "border-neutral-200 bg-neutral-50" : "border-neutral-200 hover:border-[#E53935]"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900">{t.label}</span>
                  {t.done && <CheckCircle2 className="w-4 h-4 text-neutral-600 shrink-0" />}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 break-keep">{t.subtitle}</p>
              </div>
              <span className="text-xs font-bold shrink-0" style={{ color: RED }}>
                {!latest && !failed ? "" : t.done ? "결과 보기 →" : "시작 →"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}



/* ═════════════════════════ 받은 제안 탭 (2026-10-13 매칭 인박스 통합) ═════════════════════════ */

interface OfferInboxItem {
  id: string;
  status: string;
  created_at: string;
  hero_offers: { title: string; offer_type: string; respond_by: string | null; hero_companies: { company_name: string } | null } | null;
}

function OffersTab() {
  const [items, setItems] = useState<OfferInboxItem[] | null>(null);
  useEffect(() => {
    fetch("/api/hero/offers/inbox").then(r => r.json()).then(d => setItems(d.items ?? [])).catch(() => setItems([]));
  }, []);

  return (
    <div id="offers" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600 break-keep">기업의 면접·인터뷰 제안입니다. 응하면 고른 이력서와 연락처만 그 기업에 전달되고, 검사 결과는 전달되지 않습니다.</p>
        <Link href="/hero/offers/settings" className="text-sm font-bold text-neutral-700 underline">제안 받기 설정</Link>
      </div>
      {items === null ? (
        <div className="py-12 flex justify-center"><span className="text-sm text-mute">불러오는 중</span></div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xs p-8 text-center text-sm text-neutral-500">아직 받은 제안이 없어요.</div>
      ) : (
        <ul className="space-y-2">
          {items.map(it => (
            <li key={it.id}>
              <Link href={`/hero/offers/${it.id}`} className="flex items-center justify-between gap-4 bg-white border border-neutral-200 rounded-xs p-4 transition-">
                <div className="min-w-0">
                  <p className="text-xs text-neutral-500">{it.hero_offers?.hero_companies?.company_name ?? "기업"} · {labelOf(OFFER_TYPES, it.hero_offers?.offer_type ?? "")}</p>
                  <p className="font-bold truncate">{it.hero_offers?.title}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-none ${it.status === "sent" ? "bg-red-50 text-[#E53935] font-bold" : "bg-neutral-100 text-neutral-600"}`}>
                  {RECIPIENT_STATUS_LABEL[it.status] ?? it.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/hero/offers" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E53935]">받은 제안 전체 보기 <ArrowRight className="w-3.5 h-3.5" /></Link>
    </div>
  );
}

/* ═════════════════════════ 스테이지 승급 모달 ═════════════════════════ */

// 화면 표기는 한국어 (2026-10-13 — 영어 이름만으로는 이해하기 어려움). key는 DB 값 그대로
const STAGE_LABEL: Record<string, string> = Object.fromEntries(STAGES.map(s => [s.key, s.label]));
const STAGE_SUBTITLE: Record<string, string> = {
  Dreamer: "꿈을 품다", Challenger: "문을 두드리다", Trainee: "실력을 쌓다",
  Debut: "무대에 서다", Star: "인정받다", Legend: "길을 만들다",
};

function StageUpModal({ from, to, ucAwarded, onClose }: {
  from: string; to: string; ucAwarded: number; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xs max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* 상단 배너 */}
        <div className="bg-[#E53935] px-8 py-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-1">다음 단계로 올라갔습니다.</h2>
          <p className="text-white/80 text-sm">{STAGE_LABEL[to] ?? to} · {STAGE_SUBTITLE[to] ?? ""}</p>
        </div>

        {/* 본문 */}
        <div className="px-8 py-6 space-y-4">
          {/* 승급 경로 */}
          <div className="flex items-center justify-center gap-3 py-3 bg-neutral-50 rounded-xs">
            <span className="text-sm font-bold text-neutral-500">{STAGE_LABEL[from] ?? from}</span>
            <span className="text-[#E53935] font-bold">→</span>
            <span className="text-sm font-bold text-neutral-900">{STAGE_LABEL[to] ?? to}</span>
          </div>

          {/* UC 적립 */}
          {UC_PUBLIC && ucAwarded > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-100 rounded-xs">
              <div>
                <p className="text-xs font-bold text-[#E53935] uppercase tracking-wider mb-0.5">UC 적립</p>
                <p className="text-lg font-bold text-neutral-900">+{ucAwarded.toLocaleString()} UC</p>
              </div>
            </div>
          )}

          <p className="text-sm text-neutral-500 text-center leading-relaxed">
            성장 기록을 계속 쌓아 보세요.<br />다음 단계도 함께 준비해요.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xs text-white text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#E53935" }}
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
