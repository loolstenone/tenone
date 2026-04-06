"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Clock as ClockIcon, Timer, Brain, Battery, Rocket, ArrowRight, Loader2, AlertCircle } from "lucide-react";

const modules = [
  {
    icon: Timer,
    title: "공백 맥락",
    desc: "경력 단절 상황과 사유를 분석하여 공백의 맥락을 파악합니다.",
    count: "10문항",
    time: "~2분",
  },
  {
    icon: Brain,
    title: "잠재 역량",
    desc: "기술 유지도, 소프트 스킬, 지속적 학습 활동을 종합 측정합니다.",
    count: "20문항",
    time: "~4분",
  },
  {
    icon: Battery,
    title: "회복탄력성",
    desc: "정서적 회복력, 자신감, 적응력을 평가합니다.",
    count: "15문항",
    time: "~3분",
  },
  {
    icon: Rocket,
    title: "재진입 준비도",
    desc: "실질적 복귀 준비와 동기 수준을 진단합니다.",
    count: "10문항",
    time: "~2분",
  },
];

function HitFIntroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hitAResultId = searchParams.get("a");
  const [starting, setStarting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasHitA, setHasHitA] = useState(false);

  useEffect(() => {
    async function checkHitA() {
      if (hitAResultId) {
        try {
          const res = await fetch(`/api/hit/a/result/${hitAResultId}`);
          if (res.ok) {
            setHasHitA(true);
          }
        } catch {
          // ignore
        }
      }
      setChecking(false);
    }
    checkHitA();
  }, [hitAResultId]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/hit/f/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hitAResultId }),
      });
      const data = await res.json();
      if (data.sessionToken) {
        const aParam = hitAResultId ? `&a=${hitAResultId}` : '';
        router.push(`/hero/hit/f/test?s=${data.sessionToken}${aParam}`);
      } else if (data.error) {
        setHasHitA(false);
        setStarting(false);
      }
    } catch {
      setStarting(false);
    }
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-[#E53935] text-xs font-bold rounded-full mb-6">
            HIT F &middot; Career Break Recovery
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            경력 공백, 복귀할 수 있을까?
          </h1>
          <p className="text-neutral-500 mb-2">
            경력 유효성(CVI), 잠재 역량, 회복탄력성, 재진입 준비도를<br />
            종합 분석하여 맞춤형 복귀 전략을 제시합니다.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 mt-4">
            <span className="flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" /> 약 10분</span>
            <span>&middot;</span>
            <span>55문항</span>
            <span>&middot;</span>
            <span>7점 척도</span>
          </div>
        </div>
      </section>

      {/* HIT A Required Notice */}
      {!hasHitA && !hitAResultId && (
        <section className="bg-amber-50 border-y border-amber-200">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">HIT - A를 먼저 완료해주세요</p>
                <p className="text-xs text-amber-600 mt-1">
                  HIT - F는 HIT - A 결과를 기반으로 경력 공백 복귀를 분석합니다.
                  아직 HIT - A를 완료하지 않으셨다면 먼저 진행해주세요.
                </p>
                <button
                  onClick={() => router.push('/hero/hit/a')}
                  className="mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-900"
                >
                  HIT - A 시작하기 &rarr;
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
                <div className="w-10 h-10 bg-red-50 text-[#E53935] rounded-lg flex items-center justify-center flex-shrink-0">
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
          <button
            onClick={handleStart}
            disabled={starting}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#E53935] text-white font-bold text-lg hover:bg-red-700 transition-colors rounded-xl disabled:opacity-50"
          >
            {starting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> 준비 중...</>
            ) : (
              <>진단 시작하기 <ArrowRight className="h-5 w-5" /></>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function HitFIntroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" />
      </div>
    }>
      <HitFIntroContent />
    </Suspense>
  );
}
