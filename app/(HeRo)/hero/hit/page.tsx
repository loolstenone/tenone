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
            HIT A는 기저요인(UF) · 성격(MBTI) · 행동(DISC) · 인성 · 적성을 통합 측정해 S-Power와 64유형을 도출하고,<br className="hidden sm:block" />
            HIT B에서 역량과 취업준비도를 직무별로 심화합니다.
          </p>
        </div>
      </section>

      {/* HIT 시스템 구성 요약 */}
      <section className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-center text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-6">
            HIT 시스템 구성
          </p>

          {/* 공통 기반: A */}
          <div className="rounded-xl border-2 border-[#E53935] bg-red-50/40 p-5 mb-4 flex items-center gap-4">
            <div className="w-11 h-11 shrink-0 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold">
              A
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold">나에 대한 이해</span>
                <span className="text-[11px] px-2 py-0.5 bg-red-50 text-[#E53935] rounded-full font-medium">공통 기반</span>
              </div>
              <p className="text-xs text-neutral-500">기저요인(UF) · 성격(MBTI) · 행동(DISC) · 인성 · 적성을 교차 분석해 S-Power 강점과 64유형을 도출합니다.</p>
            </div>
          </div>

          {/* 생애주기별 심화: B / C / D / E / F */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { k: "B", t: "신입 · 사회 초년" },
              { k: "C", t: "경력 이직 고민" },
              { k: "D", t: "시니어 리더십 전환" },
              { k: "E", t: "인생 2막 준비" },
              { k: "F", t: "경력 공백 · 복귀" },
            ].map(item => (
              <div key={item.k} className="rounded-xl border border-neutral-200 p-4 text-center">
                <div className="w-9 h-9 mx-auto mb-2 bg-neutral-100 text-neutral-600 rounded-lg flex items-center justify-center font-bold text-sm">
                  {item.k}
                </div>
                <p className="text-xs text-neutral-600 leading-snug">{item.t}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-neutral-400 mt-5">
            A는 모든 이용자의 공통 기반 · B~F는 현재 상황에 맞춰 선택하는 심화 진단
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
                <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                  A
                </div>
                <div>
                  <h2 className="text-xl font-bold">HIT - A</h2>
                  <p className="text-sm text-neutral-500">이 사람이 누구인가?</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Brain className="h-4 w-4 text-neutral-400" />
                  <span>기저요인(UF) · 성격(MBTI) · 행동(DISC) · 인성 · 적성</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Target className="h-4 w-4 text-neutral-400" />
                  <span>결과: S-Power 핵심 강점 + 64유형 프로필</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  <span>UF 50 · MBTI 160 · DISC 40 · 인성 220 · 적성 150</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {["UF", "MBTI", "DISC", "인성", "적성", "S-Power", "64유형"].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">
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
                  <span>인성 · 적성(RIASEC) · 역량 · 취업준비도</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Target className="h-4 w-4" />
                  <span>결과: 직무 적합도 + 준비도 등급</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Clock className="h-4 w-4" />
                  <span>인성 84 · 적성 60 · 역량 48 · 취업 32 · 총 224문항</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {["인성", "적성", "역량", "취업준비도"].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <button type="button" disabled aria-disabled="true" className="flex items-center justify-center gap-2 w-full py-3.5 bg-neutral-100 text-neutral-400 font-medium rounded-xl cursor-not-allowed">
                <Lock className="h-4 w-4" /> HIT - A 완료 후 이용 가능
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 심화 검사 — 생애주기별 */}
      <section className="bg-neutral-50 border-t border-neutral-100">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
              심화 검사
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
              생애주기별 특화 진단
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              HIT - A 완료 이후, 지금 내 상황에 맞는 더 깊은 질문으로 다음 한 걸음을 설계합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* HIT C */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 opacity-60">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-neutral-200 text-neutral-500 rounded-xl flex items-center justify-center font-bold text-lg">
                  C
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-400">HIT - C</h3>
                  <p className="text-sm text-neutral-400">어디로 이직할까?</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Brain className="h-4 w-4" />
                  <span>경력 자본 · 이직 동기 · 전환 가능성 · 준비도</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Target className="h-4 w-4" />
                  <span>결과: 이직 방향 추천 + 준비도 등급</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Clock className="h-4 w-4" />
                  <span>60문항 · 약 12분</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {["경력 자본", "이직 동기", "전환 가능성", "준비도"].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <button type="button" disabled aria-disabled="true" className="flex items-center justify-center gap-2 w-full py-3.5 bg-neutral-100 text-neutral-400 font-medium rounded-xl cursor-not-allowed">
                <Lock className="h-4 w-4" /> HIT - A 완료 후 이용 가능
              </button>
            </div>

            {/* HIT D */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 opacity-60">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-neutral-200 text-neutral-500 rounded-xl flex items-center justify-center font-bold text-lg">
                  D
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-400">HIT - D</h3>
                  <p className="text-sm text-neutral-400">시니어 리더십 전환?</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Brain className="h-4 w-4" />
                  <span>전문성 · 리더십 · 정체성 · 네트워크 · 준비도</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Target className="h-4 w-4" />
                  <span>결과: 리더십 전환 지도</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Clock className="h-4 w-4" />
                  <span>약 15분</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {["전문성", "리더십", "정체성", "네트워크"].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <button type="button" disabled aria-disabled="true" className="flex items-center justify-center gap-2 w-full py-3.5 bg-neutral-100 text-neutral-400 font-medium rounded-xl cursor-not-allowed">
                <Lock className="h-4 w-4" /> HIT - A 완료 후 이용 가능
              </button>
            </div>

            {/* HIT E */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 opacity-60">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-neutral-200 text-neutral-500 rounded-xl flex items-center justify-center font-bold text-lg">
                  E
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-400">HIT - E</h3>
                  <p className="text-sm text-neutral-400">인생 2막?</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Brain className="h-4 w-4" />
                  <span>삶의 만족도 · 방향 탐색 · 레거시 · 사회적 연결 · 준비도</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Target className="h-4 w-4" />
                  <span>결과: 인생 2막 설계 가이드</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Clock className="h-4 w-4" />
                  <span>약 15분</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {["삶의 만족도", "방향 탐색", "레거시", "사회적 연결"].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <button type="button" disabled aria-disabled="true" className="flex items-center justify-center gap-2 w-full py-3.5 bg-neutral-100 text-neutral-400 font-medium rounded-xl cursor-not-allowed">
                <Lock className="h-4 w-4" /> HIT - A 완료 후 이용 가능
              </button>
            </div>

            {/* HIT F */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 opacity-60">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-neutral-200 text-neutral-500 rounded-xl flex items-center justify-center font-bold text-lg">
                  F
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-400">HIT - F</h3>
                  <p className="text-sm text-neutral-400">경력 공백, 복귀할 수 있을까?</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Brain className="h-4 w-4" />
                  <span>공백 맥락 · 잠재 역량 · 회복탄력성 · 재진입 준비도</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Target className="h-4 w-4" />
                  <span>결과: 재진입 로드맵</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Clock className="h-4 w-4" />
                  <span>약 15분</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {["공백 맥락", "잠재 역량", "회복탄력성", "재진입"].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <button type="button" disabled aria-disabled="true" className="flex items-center justify-center gap-2 w-full py-3.5 bg-neutral-100 text-neutral-400 font-medium rounded-xl cursor-not-allowed">
                <Lock className="h-4 w-4" /> HIT - A 완료 후 이용 가능
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flow — 3단계 여정 */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h3 className="text-center text-lg font-bold mb-2">HIT 여정은 이렇게 이어집니다</h3>
          <p className="text-center text-sm text-neutral-500 max-w-xl mx-auto mb-10">
            A로 나를 이해한 뒤, 지금 상황에 맞는 심화를 골라 깊이 더하고, 마지막에 희망 직무로 매칭까지 연결됩니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white border border-neutral-200 p-5 relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">1</span>
                <span className="text-sm font-bold">HIT - A 완료</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                기저요인(UF) · 성격(MBTI) · 행동(DISC) · 인성 · 적성을 통합 측정해 S-Power 강점과 64유형 프로필을 받습니다.
              </p>
            </div>

            <div className="rounded-xl bg-white border border-neutral-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">2</span>
                <span className="text-sm font-bold">B ~ F 중 선택</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                지금 내 상황에 맞는 심화 진단을 선택해 더 깊은 맥락을 얹습니다.
              </p>
            </div>

            <div className="rounded-xl bg-white border border-neutral-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">3</span>
                <span className="text-sm font-bold">희망 직무 등록</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                최종 결과를 받은 뒤 희망 직무를 등록하면 기업 매칭 후보가 됩니다.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/hero/hit/a"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
            >
              HIT - A 시작하기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/hero/jh/write"
              className="inline-flex items-center gap-2 px-5 py-3 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-xl hover:border-neutral-400 transition-colors"
            >
              최종 결과가 나왔다면 · 희망 직무 등록
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
