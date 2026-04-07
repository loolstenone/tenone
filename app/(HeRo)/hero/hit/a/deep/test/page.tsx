'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { HitDeepTestUI } from '@/features/hit/HitDeepTestUI';

function DeepTestContent() {
  const searchParams = useSearchParams();
  const resultId = searchParams.get('resultId');

  if (!resultId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">먼저 HIT A 검사를 완료해주세요.</p>
          <a href="/hero/hit/a" className="text-[#F5C518] hover:underline">HIT A 검사 시작</a>
        </div>
      </div>
    );
  }

  return <HitDeepTestUI hitAResultId={resultId} />;
}

export default function DeepTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="animate-pulse text-neutral-400">로딩 중...</div>
      </div>
    }>
      <DeepTestContent />
    </Suspense>
  );
}
