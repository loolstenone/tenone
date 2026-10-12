"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Compass, Target, Shield, Clock, AlertCircle } from "lucide-react";

import { HIT_STAGES, estimateMinutes, hitStageMinutesLabel } from "@/lib/hit/stages";
import HitStartCTA from "@/features/hit/HitStartCTA";
import { useHitResume, postHitSession } from "@/features/hit/useHitResume";

// 검사 구성·문항 수는 실제 출제(/api/hit/b/questions → hit_questions test_type B)와 같아야 한다 (2026-10-12 재정의 — 전 회원 공통 "역량과 방향")
const modules = [
  { icon: Target, title: "핵심역량 · 직무 트랙 역량", desc: "문제해결·소통·주도성·협업·자기관리·학습민첩성 6가지 + 선택한 직무 트랙의 전문 역량.", count: "60문항", time: `~${estimateMinutes(60)}분` },
  { icon: Shield, title: "효능감 (할 수 있다)", desc: "6가지 일의 유형(RIASEC)을 얼마나 해낼 수 있다고 느끼는지. HIT - Archetype의 흥미(끌린다)와 겹쳐 봅니다.", count: "36문항", time: `~${estimateMinutes(36)}분` },
  { icon: Compass, title: "자기 이해 · 직무 이해", desc: "내 강점과 맞는 환경을 아는 정도, 희망 직무의 일과 경로를 아는 정도.", count: "16문항", time: `~${estimateMinutes(16)}분` },
];
const TOTAL_QUESTIONS = 112;

function HitBIntroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hitAResultId = searchParams.get("a");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  // 'yes' = A 결과 있음, 'no' = 확인했고 없음, 'unknown' = 확인 실패(경고하지 않음 — 시작 시 서버가 다시 확인)
  const [hasHitA, setHasHitA] = useState<"yes" | "no" | "unknown">("unknown");
  const resume = useHitResume("b");

  useEffect(() => {
    // HIT A 완료 확인 — ?a= 가 있으면 그 결과, 없으면 본인 결과 목록에서 (2026-10-12: a 파라미터가 없어도 A를 마친 회원에게 경고하지 않음)
    async function checkHitA() {
      try {
        if (hitAResultId) {
          const res = await fetch(`/api/hit/a/result/${hitAResultId}`);
          if (res.ok) { setHasHitA("yes"); return; }
        }
        const res = await fetch("/api/hit/results");
        if (res.ok) {
          const d = await res.json();
          const has = Array.isArray(d?.results) && d.results.some((r: { stage?: string }) => r.stage === "a");
          setHasHitA(has ? "yes" : "no");
        }
      } catch {
        // 확인 실패 — 경고 없이 진행
      } finally {
        setChecking(false);
      }
    }
    checkHitA();
  }, [hitAResultId]);

  const aParam = hitAResultId ? `&a=${hitAResultId}` : "";

  const handleStart = async (restart = false) => {
    setStarting(true);
    setStartError(null);
    const r = await postHitSession("b", { hitAResultId, restart });
    if (r.error === null) {
      router.push(`/hero/hit/b/test?s=${r.token}${aParam}`);
      return;
    }
    // 서버가 A 미완료로 거절한 경우에도 안내 배너를 띄운다
    if (/Archetype/.test(r.error)) setHasHitA("no");
    setStartError(r.error);
    setStarting(false);
  };

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-50 via-white to-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-[11px] font-semibold text-neutral-400 tracking-wide mb-3">공통 기반</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            {HIT_STAGES.b.code}
          </h1>
          <p className="text-lg font-semibold text-neutral-600 -mt-2 mb-4">{HIT_STAGES.b.name}</p>
          <p className="text-neutral-500 mb-2">
            무엇을 할 수 있고, 어디로 가고 싶은지.<br />
            역량·효능감·자기와 직무에 대한 이해를 진단합니다. HIT - Archetype과 함께 모든 회원의 공통 기반입니다.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 mt-4">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {hitStageMinutesLabel("b")}</span>
            <span>·</span>
            <span>{TOTAL_QUESTIONS}문항</span>
            <span>·</span>
            <span>7점 척도</span>
          </div>
        </div>
      </section>

      {/* HIT A Required Notice */}
      {hasHitA === "no" && (
        <section className="bg-amber-50 border-y border-amber-200">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">HIT - Archetype을 먼저 완료해주세요</p>
                <p className="text-xs text-amber-600 mt-1">
                  효능감을 HIT - Archetype의 흥미 결과와 겹쳐 분석합니다.
                  아직 HIT - Archetype을 완료하지 않으셨다면 먼저 진행해주세요.
                </p>
                <button
                  onClick={() => router.push('/hero/hit/a')}
                  className="mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-900"
                >
                  HIT - Archetype 시작하기 →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modules */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">검사 구성</h2>
          <div className="space-y-4">
            {modules.map((m, i) => (
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
            각 문항에 1(매우 비동의)~7(매우 동의)로 응답합니다. 정답은 없습니다.
          </p>
          <HitStartCTA
            label={`${HIT_STAGES.b.code} 시작하기`}
            resume={resume}
            total={TOTAL_QUESTIONS}
            starting={starting}
            error={startError}
            onStart={handleStart}
            onResume={() => resume && router.push(`/hero/hit/b/test?s=${resume.token}${aParam}`)}
          />
        </div>
      </section>
    </div>
  );
}

function HitBIntroPageInner() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" />
      </div>
    }>
      <HitBIntroContent />
    </Suspense>
  );
}

export default function HitBIntroPage() {
  return (
    <Suspense>
      <HitBIntroPageInner />
    </Suspense>
  );
}
