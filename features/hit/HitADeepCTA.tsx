'use client';
import Link from 'next/link';
import { MembershipGate } from './MembershipGate';

interface Props {
  resultId: string;
  hasDeep: boolean;
}

export function HitADeepCTA({ resultId, hasDeep }: Props) {
  return (
    <section className="mt-16 mb-10">
      <MembershipGate feature="HIT_DEEP">
        {hasDeep ? (
          <Link
            href={`/hero/hit/a/deep/result/${resultId}`}
            className="block rounded-2xl border border-[#F5C518]/30 bg-[#F5C518]/5 p-8 text-center hover:bg-[#F5C518]/10 transition-colors"
          >
            <div className="text-sm text-neutral-400 mb-2">심화 검사 완료</div>
            <div className="text-2xl font-bold mb-2">심화 분석 결과 보기</div>
            <div className="text-sm text-[#F5C518]">14 하위영역 + 흥미-효능감 매트릭스 →</div>
          </Link>
        ) : (
          <Link
            href={`/hero/hit/a/deep?resultId=${resultId}`}
            className="block rounded-2xl border border-[#F5C518]/30 bg-[#F5C518]/5 p-8 text-center hover:bg-[#F5C518]/10 transition-colors"
          >
            <div className="text-sm text-neutral-400 mb-2">더 깊이 있는 분석</div>
            <div className="text-2xl font-bold mb-2">HIT A 심화 검사 받기</div>
            <div className="text-sm text-neutral-400 mb-4">
              추가 75문항 · 약 13분 · 14 하위영역 정밀 프로파일 + 흥미-자기효능감 매트릭스
            </div>
            <div className="text-sm text-[#F5C518]">시작하기 →</div>
          </Link>
        )}
      </MembershipGate>
    </section>
  );
}
