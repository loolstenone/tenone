'use client';
import Link from 'next/link';
import { MembershipGate } from '@/features/hit/MembershipGate';

export function HitADeepIntroCTA({ resultId }: { resultId: string }) {
  return (
    <MembershipGate feature="HIT_DEEP">
      <Link
        href={`/hero/hit/a/deep/test?resultId=${resultId}`}
        className="block w-full text-center px-6 py-4 rounded-xl bg-[#F5C518] text-black font-semibold text-lg hover:bg-[#E0B000] transition-colors"
      >
        심화 검사 시작 →
      </Link>
    </MembershipGate>
  );
}
