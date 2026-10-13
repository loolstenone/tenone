"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HitTestUI from "@/features/hit/HitTestUI";

function HitTestContent() {
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get("s");

  if (!sessionToken) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center border border-neutral-200 rounded-xs p-8">
          <h2 className="text-lg font-bold text-neutral-900 mb-2">검사 세션이 없습니다</h2>
          <p className="text-sm text-neutral-500 mb-6">검사는 시작 페이지에서 세션을 만든 뒤 진행됩니다. 하던 검사가 있다면 시작 페이지에서 이어서 할 수 있습니다.</p>
          <a href="/hero/hit/a" className="inline-flex items-center justify-center px-6 py-3 bg-[#E53935] text-white font-bold rounded-xs hover:bg-red-700 transition-colors">기본 성향 검사 시작 페이지로</a>
        </div>
      </div>
    );
  }

  return <HitTestUI sessionToken={sessionToken} />;
}

function HitATestPageInner() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-sm text-mute">불러오는 중</span>
      </div>
    }>
      <HitTestContent />
    </Suspense>
  );
}

export default function HitATestPage() {
  return (
    <Suspense>
      <HitATestPageInner />
    </Suspense>
  );
}
