"use client";

import { useParams } from "next/navigation";
import StageResultView from "@/features/hit/StageResultView";

// 결과 화면 공용 컴포넌트 — 저장 컬럼과 화면 필드를 한 곳에서 맞춘다 (2026-10-12)
export default function HitEReportPage() {
  const params = useParams();
  return <StageResultView stage="e" resultId={params.id as string} print />;
}
