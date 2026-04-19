"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Sun, Compass, Award, Users, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

const modules = [
  {
    icon: Sun,
    title: "삶의 만족도 & 열정",
    desc: "현재 삶의 만족감과 남아있는 열정, 에너지를 종합 측정합니다.",
    count: "15문항",
    time: "~3분",
  },
  {
    icon: Compass,
    title: "방향 탐색",
    desc: "사회공헌, 창업, 교육/멘토링, 여가 중 나에게 맞는 방향을 탐색합니다.",
    count: "20문항",
    time: "~4분",
  },
  {
    icon: Award,
    title: "레거시 스킬",
    desc: "수십 년간 쌓은 경험과 전문성의 이전 가능성을 평가합니다.",
    count: "15문항",
    time: "~3분",
  },
  {
    icon: Users,
    title: "사회적 연결 & 준비도",
    desc: "사회적 관계 유지 욕구와 인생 2막 준비 정도를 진단합니다.",
    count: "10문항",
    time: "~2분",
  },
];

function HitEIntroContent() {
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
      const res = await fetch("/api/hit/e/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hitAResultId }),
      });
      const data = await res.json();
      if (data.sessionToken) {
        const aParam = hitAResultId ? `&a=${hitAResultId}` : '';
        router.push(`/hero/hit/e/test?s=${data.sessionToken}${aParam}`);
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
      <section className="bg-gradient-to-br from-amber-50 via-white to-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full mb-6">
            HIT E · Second Act
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            인생 2막?
          </h1>
          <p className="text-neutral-500 mb-2">
            삶의 만족도, 남은 열정, 방향성, 레거시 스킬을 종합 분석하여<br />
            나만의 인생 2막 설계 리포트를 제공합니다.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 mt-4">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 약 12분</span>
            <span>·</span>
            <span>60문항</span>
            <span>·</span>
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
                  HIT - E는 HIT - A 결과를 기반으로 인생 2막을 분석합니다.
                  아직 HIT - A를 완료하지 않으셨다면 먼저 진행해주세요.
                </p>
                <button
                  onClick={() => router.push('/hero/hit/a')}
                  className="mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-900"
                >
                  HIT - A 시작하기 →
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
                <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center flex-shrink-0">
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
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-700 text-white font-bold text-lg hover:bg-amber-800 transition-colors rounded-xl disabled:opacity-50"
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

function HitEIntroPageInner() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-neutral-200 border-t-amber-700 rounded-full animate-spin" />
      </div>
    }>
      <HitEIntroContent />
    </Suspense>
  );
}

export default function HitEIntroPage() {
  return (
    <Suspense>
      <HitEIntroPageInner />
    </Suspense>
  );
}
