"use client";

import { PageHeader } from "@/components/intra/IntraUI";
import { Map, ArrowRight } from "lucide-react";

const FLOW_EXAMPLES = [
  { from: "tenone", to: "madleague", label: "Universe → 동아리 연합" },
  { from: "madleague", to: "hero", label: "동아리 → 취업 플랫폼" },
  { from: "tenone", to: "badak", label: "Universe → 네트워킹" },
  { from: "smarcomm", to: "tenone", label: "마케팅 SaaS → 본사" },
];

export default function JourneyPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="크로스 브랜드 여정" description="브랜드 간 사용자 이동 경로 분석" />

      <div className="border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
        <Map className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-neutral-600">크로스 브랜드 여정 분석</p>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          GA4에 데이터가 충분히 쌓이면 브랜드 간 이동 경로를 분석할 수 있습니다.
          현재는 단일 GA4 속성으로 수집 중이며, GA4 탐색 보고서에서 확인 가능합니다.
        </p>
      </div>

      <div className="border border-neutral-200 bg-white p-6">
        <h3 className="text-sm font-semibold mb-4">예상 주요 여정 경로</h3>
        <div className="space-y-3">
          {FLOW_EXAMPLES.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded">{f.from}</span>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded">{f.to}</span>
              <span className="text-xs text-neutral-400">{f.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-400 mt-5">
          GA4 탐색 보고서 → 유입경로 탐색 → 브랜드별 세그먼트 설정으로 실제 데이터 확인 가능
        </p>
      </div>
    </div>
  );
}
