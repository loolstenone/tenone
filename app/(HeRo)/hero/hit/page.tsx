"use client";

import Link from "next/link";
import { ArrowRight, Clock, ListChecks } from "lucide-react";
import { HIT_STAGES, HIT_COMMON, HIT_LIFE_STAGES, HIT_SITUATIONS, type HitStageDef } from "@/lib/hit/stages";

/**
 * HIT 안내 — 체계 SSOT는 lib/hit/stages.ts (2026-10-12 재편)
 *   공통(A·B, 전 회원) → 생애주기(C~F, 1인 1개) → 상황 모듈(GAP, 해당자만)
 * 검사 이름이 주 표기, 기호(HIT A~F)는 보조. 회원 전용.
 */

function StageCard({ s, primary = false, href }: { s: HitStageDef; primary?: boolean; href?: string }) {
  return (
    <Link
      href={href ?? `/hero/hit/${s.key}`}
      className={`group block rounded-2xl p-6 bg-white transition-shadow hover:shadow-lg ${primary ? "border-2 border-[#E53935]" : "border border-neutral-200"}`}
    >
      <p className="text-[11px] font-semibold text-neutral-400 tracking-wide">{s.code}{s.group === "situation" ? " · 상황 모듈" : ""}</p>
      <h3 className="text-lg font-bold text-neutral-900 mt-1 break-keep">{s.name}</h3>
      <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{s.desc}</p>
      <div className="flex items-center justify-between mt-5">
        <span className="inline-flex items-center gap-1 text-xs text-neutral-400"><Clock className="h-3.5 w-3.5" /> 약 {s.approxQuestions}문항</span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-700 group-hover:text-[#E53935]">시작 <ArrowRight className="h-4 w-4" /></span>
      </div>
    </Link>
  );
}

export default function HitOverviewPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-red-50 via-white to-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:py-28 text-center">
          <p className="text-sm font-bold text-[#E53935] uppercase tracking-widest mb-4">HeRo Integrated Test</p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">나를 알아가는 여정</h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto break-keep">
            모든 회원이 같은 두 검사로 시작합니다 — 나는 누구인가(A), 무엇을 할 수 있는가(B).
            그다음 지금 내 생애주기에 맞는 검사 하나를 고릅니다.
          </p>
        </div>
      </section>

      {/* 공통 */}
      <section className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">공통 기반 · 전 회원</p>
            <h2 className="text-2xl font-extrabold tracking-tight">A 다음 B, 순서대로</h2>
            <p className="text-sm text-neutral-500 mt-2">B의 효능감은 A의 흥미와 겹쳐 분석하므로 A를 먼저 합니다. 회원 전용이며 결과는 내 계정에 남습니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HIT_COMMON.map((s, i) => <StageCard key={s.key} s={s} primary={i === 0} />)}
          </div>
        </div>
      </section>

      {/* 생애주기 */}
      <section className="bg-neutral-50 border-b border-neutral-100">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">생애주기 · 1인 1개 선택</p>
            <h2 className="text-2xl font-extrabold tracking-tight">지금 내 단계에 맞는 검사</h2>
            <p className="text-sm text-neutral-500 mt-2">A·B를 마친 뒤, 현재 상황에 맞는 하나를 고릅니다. 상황이 바뀌면 다른 단계를 다시 할 수 있습니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HIT_LIFE_STAGES.map(s => <StageCard key={s.key} s={s} />)}
          </div>
          <div className="mt-6">
            {HIT_SITUATIONS.map(s => <StageCard key={s.key} s={s} />)}
          </div>
        </div>
      </section>

      {/* 체크리스트 안내 */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="rounded-2xl border border-neutral-200 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0"><ListChecks className="h-6 w-6" /></div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-neutral-900">준비 체크리스트는 검사가 아니라 할 일입니다</h3>
              <p className="text-sm text-neutral-500 mt-1 leading-relaxed break-keep">
                이력서·면접·타이밍·재정 같은 "지금까지 한 일"은 점수로 재지 않고 나의 저니에서 예/아니오로 관리합니다. 완료할수록 단계 검사의 준비도가 올라갑니다.
              </p>
            </div>
            <Link href="/hero/journey" className="inline-flex items-center gap-2 px-5 py-3 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-xl hover:border-neutral-400 transition-colors shrink-0">나의 저니 <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={`/hero/hit/${HIT_STAGES.a.key}`} className="inline-flex items-center gap-2 px-5 py-3 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
              {HIT_STAGES.a.name} 시작하기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/hero/jh/write" className="inline-flex items-center gap-2 px-5 py-3 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-xl hover:border-neutral-400 transition-colors">
              A·B를 마쳤다면 · 희망 직무 등록
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
