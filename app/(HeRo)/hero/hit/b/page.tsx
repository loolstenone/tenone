"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Brain, Compass, Target, Shield, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const modules = [
  {
    icon: Brain,
    title: "성격 특성 검사",
    desc: "15가지 성격 하위척도를 심층 측정합니다.",
    count: "80문항",
    time: "~8분",
  },
  {
    icon: Compass,
    title: "직업 흥미 (RIASEC)",
    desc: "6가지 직업 흥미 유형을 분석합니다.",
    count: "60문항",
    time: "~6분",
  },
  {
    icon: Target,
    title: "역량 검사",
    desc: "공통 역량 + 전문 트랙 역량을 평가합니다.",
    count: "48문항",
    time: "~5분",
  },
  {
    icon: Shield,
    title: "커리어 준비도",
    desc: "취업/커리어 전환 준비 상태를 진단합니다.",
    count: "32문항",
    time: "~3분",
  },
];

function HitBIntroContent() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const hitAResultId = searchParams.get("a");
  const [starting, setStarting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasHitA, setHasHitA] = useState(false);

  useEffect(() => {
    // HIT A 완료 확인
    async function checkHitA() {
      if (hitAResultId) {
        // URL에 결과 ID가 있으면 확인
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
      const res = await fetch("/api/hit/b/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hitAResultId, memberId: user?.id }),
      });
      const data = await res.json();
      if (data.sessionToken) {
        const aParam = hitAResultId ? `&a=${hitAResultId}` : '';
        router.push(`/hero/hit/b/test?s=${data.sessionToken}${aParam}`);
      } else if (data.error) {
        // HIT A 미완료
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
            HIT B · Career Assessment
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            나의 커리어를 설계하세요
          </h1>
          <p className="text-neutral-500 mb-2">
            성격, 흥미, 역량, 준비도를 종합 분석하여<br />
            맞춤형 커리어 리포트를 제공합니다.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 mt-4">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 약 22분</span>
            <span>·</span>
            <span>220문항</span>
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
                  HIT - B는 HIT - A 결과를 기반으로 종합 분석합니다.
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
              <>HIT B 시작하기 <ArrowRight className="h-5 w-5" /></>
            )}
          </button>
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
