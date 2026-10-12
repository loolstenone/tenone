"use client";

import { useParams } from "next/navigation";
import HitAResultView from "@/features/hit/HitAResultView";

/** HIT A 보고서 (인쇄·PDF) — 결과 화면과 같은 틀 (features/hit/HitAResultView print) */
export default function HitAReportPage() {
  const params = useParams();
  return <HitAResultView resultId={params.id as string} print />;
}
