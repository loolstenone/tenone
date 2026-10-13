"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HitCTestUI from "@/features/hit/HitCTestUI";

function HitCTestContent() {
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get("s");
  if (!sessionToken) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center border border-neutral-200 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-neutral-900 mb-2">검사 세션이 없습니다</h2>
          <p className="text-sm text-neutral-500 mb-6">검사는 시작 페이지에서 세션을 만든 뒤 진행됩니다.</p>
          <a href="/hero/hit/c" className="inline-flex items-center justify-center px-6 py-3 bg-[#E53935] text-white font-bold rounded-xl hover:bg-red-700 transition-colors">시작 페이지로</a>
        </div>
      </div>
    );
  }
  return <HitCTestUI sessionToken={sessionToken} />;
}

export default function HitCTestPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="h-8 w-8 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" /></div>}>
      <HitCTestContent />
    </Suspense>
  );
}
