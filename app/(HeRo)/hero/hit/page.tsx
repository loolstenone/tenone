"use client";

import Link from "next/link";
import { Brain, Target, Clock, ArrowRight, Lock } from "lucide-react";

export default function HitOverviewPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-50 via-white to-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:py-28 text-center">
          <p className="text-sm font-bold text-[#E53935] uppercase tracking-widest mb-4">
            HeRo Integrated Test
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            나를 알아가는 여정
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            HIT는 성격, 역량, 적성을 통합 진단하여 64가지 영웅 유형 중<br className="hidden sm:block" />
            나만의 프로필을 찾아줍니다.
          </p>
        </div>
      </section>

      {/* A vs B */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* HIT A */}
            <div className="border-2 border-[#E53935] rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#E53935] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                  A
                </div>
                <div>
                  <h2 className="text-xl font-bold">HIT - A</h2>
                  <p className="text-sm text-neutral-500">이 사람이 누구인가?</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Brain className="h-4 w-4 text-[#E53935]" />
                  <span>기저요인 → DISC 성격 → MBTI 성향 → S-Power 강점</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Target className="h-4 w-4 text-[#E53935]" />
                  <span>결과: 64유형 통합 프로필</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Clock className="h-4 w-4 text-[#E53935]" />
                  <span>127문항 · 약 20분</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {["기저요인", "MBTI", "DISC", "S-Power", "64유형"].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-red-50 text-[#E53935] rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href="/hero/hit/a"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#E53935] text-white font-medium hover:bg-red-700 transition-colors rounded-xl"
              >
                HIT - A 시작하기 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* HIT B */}
            <div className="border border-neutral-200 rounded-2xl p-8 opacity-60">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-neutral-200 text-neutral-500 rounded-xl flex items-center justify-center font-bold text-lg">
                  B
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-400">HIT - B</h2>
                  <p className="text-sm text-neutral-400">무엇을 할 수 있는가?</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Brain className="h-4 w-4" />
                  <span>인성 → 적성(RIASEC) → 역량 → 취업준비도</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Target className="h-4 w-4" />
                  <span>결과: 역량 레이더 + 준비도 등급</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Clock className="h-4 w-4" />
                  <span>220문항 · 약 30분</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {["인성", "RIASEC", "역량", "준비도"].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 w-full py-3.5 bg-neutral-100 text-neutral-400 font-medium rounded-xl">
                <Lock className="h-4 w-4" /> HIT - A 완료 후 이용 가능
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h3 className="text-lg font-bold mb-2">HIT는 어떻게 작동하나요?</h3>
          <p className="text-sm text-neutral-500 max-w-xl mx-auto mb-8">
            HIT - A에서 나의 성격과 행동 유형을 파악하고, HIT - B에서 역량과 준비도를 진단합니다.
            두 검사를 모두 완료하면 HeRo 오디션 지원이 가능합니다.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#E53935]" /> HIT - A: 누구인가
            </span>
            <span>→</span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-neutral-300" /> HIT - B: 무엇을 할 수 있는가
            </span>
            <span>→</span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-neutral-300" /> 통합 프로필
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
