'use client';
import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
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
    return <div className="animate-pulse h-32 bg-neutral-800/50 rounded-lg" />;
  }

  if (can(feature)) {
    return <>{children}</>;
  }

  const message = getUpgradeMessage(tier, feature);

  if (fallback) return <>{fallback}</>;

  return (
    <div className="relative">
      {blurContent && (
        <div className="pointer-events-none select-none blur-sm opacity-40">{children}</div>
      )}
      <div
        className={
          blurContent
            ? 'absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-neutral-950/80 to-neutral-950'
            : 'rounded-xl border border-[#F5C518]/20 bg-[#F5C518]/5 p-8 text-center'
        }
      >
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[#F5C518]/15 flex items-center justify-center">
            <Lock size={20} className="text-[#F5C518]" />
          </div>
          <p className="text-sm text-neutral-300 mb-4">{message}</p>
          <Link
            href="/hero/pricing"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#F5C518] text-black text-sm font-semibold hover:bg-[#E0B000] transition-colors"
          >
            멤버십 업그레이드
          </Link>
        </div>
      </div>
    </div>
  );
}
