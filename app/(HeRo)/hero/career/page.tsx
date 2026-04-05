"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Map, Sparkles, Target, TrendingUp } from "lucide-react";

const RED = "#E53935";

const steps = [
  { icon: Sparkles, title: "HIT A 검사", desc: "성격/강점 진단 완료" },
  { icon: Target, title: "HIT B 검사", desc: "역량/적성 진단 완료" },
  { icon: Map, title: "AI 상담", desc: "프리미엄 서비스 가입" },
  { icon: TrendingUp, title: "로드맵 생성", desc: "AI가 맞춤 설계" },
];

const includes = [
  "현재 위치 진단 (HIT A+B 기반)",
  "목표 직무/포지션 설정",
  "3개월/6개월/1년 단계별 액션플랜",
  "필요 역량 Gap 분석",
  "추천 학습/경험 리스트",
  "네트워킹 전략",
];

export default function CareerPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-neutral-50" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Map className="h-5 w-5" style={{ color: RED }} />
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: RED }}>Career Roadmap</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 mb-5 leading-tight">
              커리어 로드맵 설계
            </h1>
            <p className="text-lg text-neutral-500 mb-8 leading-relaxed">
              HIT A+B 검사 결과를 바탕으로 AI가 개인 맞춤 커리어 경로를 설계합니다.
              현재 위치에서 목표까지, 단계별 성장 전략을 제시합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-neutral-100">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-12">이용 절차</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-white" style={{ backgroundColor: RED }}>
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-neutral-900 mb-1">Step {i + 1}</p>
                <p className="text-base font-semibold text-neutral-800">{s.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-4">이용 조건</h2>
          <p className="text-center text-neutral-500 mb-10">커리어 로드맵은 프리미엄 서비스에 포함되어 있습니다.</p>
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-4">
            {["HIT A (성격/강점 진단) 완료", "HIT B (역량/적성 진단) 완료", "프리미엄 서비스 가입 (99,000원 / 30일)"].map(t => (
              <div key={t} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <span className="text-[15px] text-neutral-700">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">로드맵에 포함되는 내용</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {includes.map(item => (
              <div key={item} className="flex items-start gap-3 p-4 border border-neutral-200 rounded-xl">
                <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" style={{ color: RED }} />
                <span className="text-[15px] text-neutral-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: RED }} className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">지금 시작하세요</h2>
          <p className="text-red-100 mb-8">HIT 검사부터 시작하면 커리어 로드맵까지 연결됩니다.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/hero/hit" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white font-bold rounded-xl hover:bg-red-50" style={{ color: RED }}>
              HIT 검사 시작하기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/hero/coaching/ai" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10">
              프리미엄 서비스 알아보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
