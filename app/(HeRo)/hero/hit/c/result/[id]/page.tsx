"use client";

import { useParams } from "next/navigation";
import HitCResultView from "@/features/hit/HitCResultView";

export default function HitCResultPage() {
  const params = useParams();
  return <HitCResultView resultId={params.id as string} />;
}
