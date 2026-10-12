"use client";

import { useParams } from "next/navigation";
import HitBResultView from "@/features/hit/HitBResultView";

/** HIT B 보고서 (인쇄·PDF) — 결과 화면과 같은 틀 (features/hit/HitBResultView print) */
export default function HitBReportPage() {
  const params = useParams();
  return <HitBResultView resultId={params.id as string} print />;
}
