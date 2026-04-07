import Link from 'next/link';
import { Suspense } from 'react';
import { HitADeepIntroCTA } from './HitADeepIntroCTA';

interface Props {
  searchParams: Promise<{ resultId?: string }>;
}

export default async function HitADeepIntroPage({ searchParams }: Props) {
  const { resultId } = await searchParams;

  if (!resultId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">HIT A 검사가 필요합니다</h1>
          <p className="text-neutral-400 mb-6">심화 검사를 받으려면 먼저 HIT A 검사를 완료해주세요.</p>
          <Link
            href="/hero/hit/a"
            className="inline-block px-6 py-3 rounded-lg bg-[#F5C518] text-black font-semibold hover:bg-[#E0B000]"
          >
            HIT A 검사 시작
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link href={`/hero/hit/a/result/${resultId}`} className="text-sm text-neutral-500 hover:text-[#F5C518]">
            ← 기본 결과로 돌아가기
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">HIT A 심화 검사</h1>
        <p className="text-neutral-400 mb-10">
          CH 심화 45문항 + AP 심화 30문항 = 총 75문항 · 약 13분 소요
        </p>

        <div className="space-y-4 mb-12">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="text-[#F5C518] font-semibold mb-2">14 하위영역 정밀 프로파일</div>
            <div className="text-sm text-neutral-400">
              인성 Core 5영역을 14개 세부 하위영역으로 분해해 정밀 분석합니다.
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="text-[#F5C518] font-semibold mb-2">흥미-자기효능감 매트릭스</div>
            <div className="text-sm text-neutral-400">
              어느 영역이 최적영역 / 탐색학습필요 / 소진리스크 / 비관심영역인지 교차 분석합니다.
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="text-[#F5C518] font-semibold mb-2">5영역 정밀 재산출</div>
            <div className="text-sm text-neutral-400">
              심화 데이터를 반영해 Core 5영역 점수를 재산출합니다.
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="h-32 bg-neutral-900/50 rounded-xl animate-pulse" />}>
          <HitADeepIntroCTA resultId={resultId} />
        </Suspense>
      </div>
    </div>
  );
}
