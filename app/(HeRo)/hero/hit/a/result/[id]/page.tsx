"use client";

import { useParams } from "next/navigation";
import HitAResultView from "@/features/hit/HitAResultView";

export default function HitAResultPage() {
  const params = useParams();
  return <HitAResultView resultId={params.id as string} />;
}
