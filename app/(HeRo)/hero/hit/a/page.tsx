"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Users, Target, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const modules = [
  {
    icon: Users,
    title: "기저요인 검사",
    desc: "성장 환경과 양육 배경을 확인합니다.",
    count: "7문항",
    time: "~2분",
  },
  {
    icon: Brain,
    title: "성격 유형 (MBTI)",
    desc: "인식과 판단 방식, 에너지 방향을 파악합니다.",
    count: "80문항",
    time: "~15분",
  },
  {
    icon: Target,
    title: "행동 유형 (DISC)",
    desc: "업무 상황에서의 행동 패턴을 측정합니다.",
    count: "40문항",
    time: "~5분",
  },
];

export default function HitAIntroPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [starting, setStarting] = useState(false);
  const [pageLoadTime] = useState(Date.now());

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/hit/a/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: user?.id, _ts: pageLoadTime, _hp: "" }),
      });
      const data = await res.json();
      if (data.sessionToken) {
        router.push(`/hero/hit/a/test?s=${data.sessionToken}`);
      }
    } catch {
      setStarting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-50 via-white to-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-[#E53935] text-xs font-bold rounded-full mb-6">
            HIT - A · Personality Assessment
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            내가 누구인지 알아보세요
          </h1>
          <p className="text-neutral-500 mb-2">
            기질, 성격, 행동유형을 통합 분석하여<br />
            64가지 영웅 유형 중 나만의 프로필을 찾습니다.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 mt-4">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 약 20분</span>
            <span>·</span>
            <span>127문항</span>
            <span>·</span>
            <span>무료</span>
          </div>
        </div>
      </section>

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
            로그인 없이 바로 시작할 수 있습니다. 결과는 고유 URL로 저장됩니다.
          </p>
          <button
            onClick={handleStart}
            disabled={starting}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#E53935] text-white font-bold text-lg hover:bg-red-700 transition-colors rounded-xl disabled:opacity-50"
          >
            {starting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> 준비 중...</>
            ) : (
              <>HIT - A 시작하기 <ArrowRight className="h-5 w-5" /></>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
