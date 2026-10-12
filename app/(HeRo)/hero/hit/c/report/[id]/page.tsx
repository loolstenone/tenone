"use client";

import { useParams } from "next/navigation";
import HitCResultView from "@/features/hit/HitCResultView";

export default function HitCReportPage() {
  const params = useParams();
  return <HitCResultView resultId={params.id as string} print />;
}
