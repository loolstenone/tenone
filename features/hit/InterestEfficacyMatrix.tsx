"use client";

import { HOLLAND_LABELS, HOLLAND_TYPES, type HollandType } from "@/lib/hit/scoring-b";
import { MATRIX_CELL_INFO } from "./hit-b-result-mapper";
import type { HitBResult } from "@/types/hit";

/** 흥미(HIT A) × 효능감(HIT B) 6유형 매트릭스 — 결과·보고서 공용 */
export default function InterestEfficacyMatrix({ matrix, efficacy }: { matrix: HitBResult["matrix"]; efficacy: Record<string, number> }) {
  if (!matrix) {
    return <p className="text-sm text-neutral-500">기본 성향 검사 흥미 결과가 없어 교차 분석을 할 수 없습니다. 효능감 점수만 표시합니다.</p>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {HOLLAND_TYPES.map((t: HollandType) => {
        const cell = matrix.cells[t] ?? "미측정";
        const info = MATRIX_CELL_INFO[cell];
        return (
          <div key={t} className={`rounded-xl border p-4 ${info.tone}`}>
            <p className="text-xs font-semibold opacity-70">{t} · {HOLLAND_LABELS[t]}</p>
            <p className="text-sm font-bold mt-1">{info.label}</p>
            <p className="text-[11px] mt-1 opacity-80">효능감 {efficacy[t] ?? 0}</p>
            <p className="text-[11px] mt-2 leading-snug opacity-80">{info.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
