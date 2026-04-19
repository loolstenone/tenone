"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HitBTestUI from "@/features/hit/HitBTestUI";

function HitBTestContent() {
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get("s");
  const hitAResultId = searchParams.get("a") || undefined;

  if (!sessionToken) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-neutral-400">
          세션을 찾을 수 없습니다.{" "}
          <a href="/hero/hit/b" className="text-[#E53935] underline">
            다시 시작
          </a>
          해 주세요.
        </p>
      </div>
    );
  }

  return <HitBTestUI sessionToken={sessionToken} hitAResultId={hitAResultId} />;
}

function HitBTestPageInner() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" />
        </div>
      }
    >
      <HitBTestContent />
    </Suspense>
  );
}

export default function HitBTestPage() {
  return (
    <Suspense>
      <HitBTestPageInner />
    </Suspense>
  );
}
