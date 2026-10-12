"use client";

/**
 * HIT 다음 검사 안내 — 보고서 본문이 끝난 뒤 회색 띠로 분리해 보여 준다 (2026-10-12)
 * 결과 화면(A·B·C)과 보고서(A)가 같은 부품을 쓴다. 검사 이름·설명은 lib/hit/stages.ts가 원천. 인쇄 시 숨김.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HIT_STAGES, HIT_LIFE_STAGES, HIT_SITUATIONS } from "@/lib/hit/stages";

export function HitNextSteps({ from, aId, bId, children }: { from: "a" | "b" | "stage"; aId?: string; bId?: string; children?: ReactNode }) {
  const query = bId ? `?b=${bId}` : aId ? `?a=${aId}` : "";
  const lead = from === "a"
    ? "먼저 공통 검사 B를 마치고, 그다음 지금 내 상황에 맞는 검사 하나를 고르세요."
    : from === "b"
      ? "공통 검사(A·B)를 마쳤습니다. 지금 내 상황에 맞는 검사 하나를 고르세요."
      : "상황이 바뀌면 다른 단계 검사를 다시 할 수 있습니다.";

  return (
    <section className="no-print bg-neutral-50 border-t border-neutral-200">
      <div className="mx-auto max-w-2xl px-5 sm:px-6 py-16">
        <p className="text-xs font-semibold text-neutral-400 text-center">보고서 끝 · 다음 검사</p>
        <h2 className="text-2xl font-extrabold text-neutral-900 text-center mt-2">여기서 한 걸음 더</h2>
        <p className="text-[15px] text-neutral-500 text-center mt-3 leading-[1.8]">{lead}</p>

        {from === "a" && (
          <Link href={`/hero/hit/b${aId ? `?a=${aId}` : ""}`} className="mt-10 flex items-center gap-4 rounded-2xl border-2 border-[#E53935] bg-white p-5 hover:shadow-md transition-shadow">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-neutral-400">{HIT_STAGES.b.code} · 공통 · 다음 순서</p>
              <p className="font-bold text-neutral-900 mt-0.5">{HIT_STAGES.b.name}</p>
              <p className="text-[13px] text-neutral-500 mt-1 leading-relaxed">{HIT_STAGES.b.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#E53935] shrink-0" />
          </Link>
        )}

        <p className="text-xs font-semibold text-neutral-400 mt-10 mb-3">생애주기 · 상황 검사 (1개 선택)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[...HIT_LIFE_STAGES, ...HIT_SITUATIONS].map(s => (
            <Link key={s.key} href={`/hero/hit/${s.key}${query}`} className="group flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-neutral-400">{s.code}{s.group === "situation" ? " · 상황" : ""}</p>
                <p className="text-[15px] font-bold text-neutral-900 mt-0.5">{s.name}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-700 transition-colors shrink-0" />
            </Link>
          ))}
        </div>

        {children && <div className="mt-10 pt-8 border-t border-neutral-200">{children}</div>}
      </div>
    </section>
  );
}
