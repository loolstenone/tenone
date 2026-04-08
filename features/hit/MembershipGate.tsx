'use client';
import type { ReactNode } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { HitFeature } from '@/lib/hit/membership';
import { getUpgradeMessage } from '@/lib/hit/membership';
import { useMembership } from '@/lib/hit/useMembership';

interface MembershipGateProps {
  feature: HitFeature;
  children: ReactNode;
  fallback?: ReactNode;
  blurContent?: boolean;
}

export function MembershipGate({ feature, children, fallback, blurContent = false }: MembershipGateProps) {
  const { tier, loading, can } = useMembership();

  if (loading) {
    return <div className="animate-pulse h-24 bg-neutral-100 rounded-xl" />;
  }

  if (can(feature)) {
    return <>{children}</>;
  }

  const message = getUpgradeMessage(tier, feature);

  if (fallback) return <>{fallback}</>;

  return (
    <div className="relative">
      {blurContent && (
        <div className="pointer-events-none select-none blur-sm opacity-30">{children}</div>
      )}
      <div
        className={
          blurContent
            ? 'absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-white/90 to-white'
            : 'rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm'
        }
      >
        <div className="mx-auto max-w-sm">
          {/* 자물쇠 아이콘 — 미니멀 */}
          <div className="mx-auto mb-5 w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center">
            <Lock size={17} className="text-neutral-400" />
          </div>

          {/* 상태 태그 */}
          <span className="inline-block text-[10px] font-bold text-[#E53935] uppercase tracking-widest border border-[#E53935]/30 bg-[#E53935]/5 px-2.5 py-0.5 rounded-full mb-3">
            HeRo 멤버십 전용
          </span>

          {/* 설명 */}
          <p className="text-sm text-neutral-600 leading-relaxed mb-6">{message}</p>

          {/* CTA */}
          <Link
            href="/hero/pricing"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition-colors"
          >
            멤버십 살펴보기 <ArrowRight size={14} />
          </Link>

          {/* 서브텍스트 */}
          <p className="text-[11px] text-neutral-400 mt-3">
            가입 즉시 이용 가능 · 언제든 해지
          </p>
        </div>
      </div>
    </div>
  );
}
