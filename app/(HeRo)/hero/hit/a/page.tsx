"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Users, Target, Clock, ArrowRight, Loader2, Sparkles, RotateCcw, Sprout } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { HIT_A_UF_COUNT, HIT_A_TOTAL_COUNT } from "@/lib/hit/a-modules";
import { HIT_STAGES, estimateMinutes, hitStageMinutesLabel } from "@/lib/hit/stages";
import HitErrorRetry from "@/features/hit/HitErrorRetry";
import { RESTART_CONFIRM } from "@/features/hit/useHitResume";

// 검사 구성·문항 수는 실제 출제(/api/hit/a/questions → hit_questions test_type A)와 같아야 한다 (2026-10-12 — 화면마다 127·172·620으로 달랐음)
// HIT는 회원 전용 — UF(성장 배경)가 첫 파트. lib/hit/a-modules.ts
const ufModule = {
  icon: Sprout,
  title: "성장 배경 (UF)",
  desc: "가정·또래·경험 등 지금의 나를 만든 배경을 돌아봅니다. 결과는 본인 리포트에만 표시되고, 강점 점수·기업 매칭에는 쓰지 않습니다.",
  count: `${HIT_A_UF_COUNT}문항`,
  time: `~${estimateMinutes(HIT_A_UF_COUNT)}분`,
};
const modules = [
  {
    icon: Brain,
    title: "성격 유형 (PT)",
    desc: "인식과 판단 방식, 에너지 방향을 파악합니다.",
    count: "62문항",
    time: `~${estimateMinutes(62)}분`,
  },
  {
    icon: Target,
    title: "행동 유형 (BT)",
    desc: "업무 상황에서의 행동 패턴을 측정합니다.",
    count: "40문항",
    time: `~${estimateMinutes(40)}분`,
  },
  {
    icon: Users,
    title: "핵심 성품 (CH)",
    desc: "일과 관계에서 드러나는 성품을 확인합니다.",
    count: "40문항",
    time: `~${estimateMinutes(40)}분`,
  },
  {
    icon: Sparkles,
    title: "핵심 적성 (AP)",
    desc: "어떤 일에 자연스럽게 끌리는지 측정합니다.",
    count: "30문항",
    time: `~${estimateMinutes(30)}분`,
  },
];
const LAST_SESSION_KEY = "hit_a_last_session";

export default function HitAIntroPage() {
  const router = useRouter();
  const { user } = useAuth();
  const TOTAL_QUESTIONS = HIT_A_TOTAL_COUNT;
  const shownModules = [ufModule, ...modules];
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [pageLoadTime] = useState(Date.now());
  // 진행 중 세션 — 검사를 중단했다 돌아온 사람이 처음부터 다시 하지 않게 (2026-10-12)
  const [resume, setResume] = useState<{ token: string; answered: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let token: string | null = null;
        try { token = localStorage.getItem(LAST_SESSION_KEY); } catch { /* ignore */ }
        if (!token && user?.id) {
          const r = await fetch("/api/hit/a/session");
          if (r.ok) token = (await r.json())?.sessionToken ?? null;
        }
        if (!token) return;
        const r = await fetch(`/api/hit/a/session/${token}`);
        if (!r.ok) { try { localStorage.removeItem(LAST_SESSION_KEY); } catch { /* ignore */ } return; }
        const d = await r.json();
        const answered = Array.isArray(d?.responses) ? d.responses.length : 0;
        if (!cancelled && d?.session?.status === "in_progress" && answered > 0) setResume({ token, answered });
      } catch { /* 이어하기 제안만 생략 */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // restart=true: 진행 중이던 세션을 닫고 새로 시작 (확인 필수)
  const handleStart = async (restart = false) => {
    if (restart && !window.confirm(RESTART_CONFIRM)) return;
    setStarting(true);
    setStartError(null);
    try {
      const res = await fetch("/api/hit/a/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restart, _ts: pageLoadTime, _hp: "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.sessionToken) {
        try { localStorage.setItem(LAST_SESSION_KEY, data.sessionToken); } catch { /* ignore */ }
        // 새로 시작이면 이전 세션의 임시 저장 답변을 버린다
        if (restart) { try { localStorage.removeItem(`hit_a_${resume?.token}`); } catch { /* ignore */ } }
        router.push(`/hero/hit/a/test?s=${data.sessionToken}`);
        return;
      }
      setStartError(res.status === 401 ? "로그인이 필요합니다. 로그인 후 다시 시도해 주세요." : (data.message || data.error || "시작할 수 없습니다. 잠시 후 다시 시도해 주세요."));
    } catch {
      setStartError("네트워크 오류로 시작할 수 없습니다. 연결을 확인하고 다시 시도해 주세요.");
    }
    setStarting(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-50 via-white to-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-[#E53935] text-xs font-bold rounded-full mb-6">
            {HIT_STAGES.a.code} · 공통 기반
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            내가 누구인지 알아보세요
          </h1>
          <p className="text-neutral-500 mb-2">
            기질, 성격, 행동유형을 통합 분석하여<br />
            64가지 영웅 유형 중 나만의 프로필을 찾습니다.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 mt-4">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {hitStageMinutesLabel("a")}</span>
            <span>·</span>
            <span>{TOTAL_QUESTIONS}문항</span>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">검사 구성</h2>
          <div className="space-y-4">
            {shownModules.map((m, i) => (
              <div key={i} className="flex items-start gap-4 p-5 border border-neutral-200 rounded-xl">
                <div className="w-10 h-10 bg-neutral-100 text-neutral-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm">{m.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span>{m.count}</span>
                      <span>{m.time}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-neutral-100">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="text-xs text-neutral-400 mb-4">
            결과는 내 계정에 저장되며 본인만 볼 수 있습니다.
          </p>
          {startError && <HitErrorRetry message={startError} onRetry={() => handleStart(false)} className="mb-4" />}
          {resume ? (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => router.push(`/hero/hit/a/test?s=${resume.token}`)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#E53935] text-white font-bold text-lg hover:bg-red-700 transition-colors rounded-xl"
              >
                이어서 하기 <span className="text-sm font-medium opacity-80">({resume.answered}/{TOTAL_QUESTIONS} 답변)</span> <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleStart(true)}
                disabled={starting}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-50"
              >
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} 처음부터 다시 하기
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleStart(false)}
              disabled={starting}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#E53935] text-white font-bold text-lg hover:bg-red-700 transition-colors rounded-xl disabled:opacity-50"
            >
              {starting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> 시작하는 중...</>
              ) : (
                <>{HIT_STAGES.a.ko} 시작하기 <ArrowRight className="h-5 w-5" /></>
              )}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
