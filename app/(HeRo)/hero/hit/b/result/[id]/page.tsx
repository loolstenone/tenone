"use client";

import { useParams } from "next/navigation";
import HitBResultView from "@/features/hit/HitBResultView";

export default function HitBResultPage() {
  const params = useParams();
  return <HitBResultView resultId={params.id as string} />;
}
