"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Briefcase, Target, RefreshCw, CheckCircle, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

const modules = [
  {
    icon: Briefcase,
    title: "경력 자본",
    desc: "전문성, 네트워크, 조직 이해력, 핵심 역량을 종합 측정합니다.",
    count: "20문항",
    time: "~4분",
  },
  {
    icon: Target,
    title: "이직 동기",
    desc: "현직 불만족(Push) vs 새로운 기회(Pull) 동기를 분석합니다.",
    count: "15문항",
    time: "~3분",
  },
  {
    icon: RefreshCw,
    title: "전환 가능성",
    desc: "스킬 이동성, 산업 적응력, 학습 민첩성을 평가합니다.",
    count: "15문항",
    time: "~3분",
  },
  {
    icon: CheckCircle,
    title: "준비도",
    desc: "경력전환 준비 정도와 갭 인식 수준을 진단합니다.",
    count: "10문항",
    time: "~2분",
  },
];

function HitCIntroContent() {
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
      const res = await fetch("/api/hit/c/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hitAResultId }),
      });
      const data = await res.json();
      if (data.sessionToken) {
        const aParam = hitAResultId ? `&a=${hitAResultId}` : '';
        router.push(`/hero/hit/c/test?s=${data.sessionToken}${aParam}`);
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
            HIT C · Career Transition
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            어디로 이직할까?
          </h1>
          <p className="text-neutral-500 mb-2">
            경력 자본, 이직 동기, 전환 가능성, 준비도를 종합 분석하여<br />
            맞춤형 경력전환 리포트를 제공합니다.
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
                  HIT - C는 HIT - A 결과를 기반으로 경력전환을 분석합니다.
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

export default function HitCIntroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" />
      </div>
    }>
      <HitCIntroContent />
    </Suspense>
  );
}
