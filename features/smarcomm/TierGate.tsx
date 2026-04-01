'use client';

import { useState } from 'react';
import { Lock, ChevronRight, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

type Tier = 'starter' | 'growth' | 'pro' | 'enterprise';

const TIER_LABELS: Record<Tier, { name: string; price: string }> = {
  starter: { name: 'Starter', price: '무료~9만원' },
  growth: { name: 'Growth', price: '월 29만원' },
  pro: { name: 'Pro', price: '월 59만원' },
  enterprise: { name: 'Enterprise', price: '맞춤 견적' },
};

interface TierGateProps {
  requiredTier: Tier;
  featureName: string;
  featureDesc?: string;
  features?: string[];
  children: React.ReactNode;
}

// 관리자 이메일 목록 (서버 환경변수로 옮길 것)
const ADMIN_EMAILS = ['admin@smarcomm.com', 'cheonil@tenone.biz', 'tenone@tenone.biz'];

// 티어 결정: Supabase Auth 기반 (staff→enterprise, 관리자→enterprise, 일반→starter)
function useCurrentTier(): Tier {
  const { user } = useAuth();
  if (!user) return 'starter';
  if (user.accountType === 'staff' || user.role === 'Admin') return 'enterprise';
  if (ADMIN_EMAILS.includes(user.email)) return 'enterprise';
  // TODO: 실제 결제 연동 후 members 테이블 또는 subscription 테이블에서 tier 조회
  return 'starter';
}

const TIER_ORDER: Tier[] = ['starter', 'growth', 'pro', 'enterprise'];

export default function TierGate({ requiredTier, featureName, featureDesc, features, children }: TierGateProps) {
  const [showModal, setShowModal] = useState(false);
  const currentTier = useCurrentTier();
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  const requiredIndex = TIER_ORDER.indexOf(requiredTier);

  // 티어가 충분하면 자식 렌더링
  if (currentIndex >= requiredIndex) {
    return <>{children}</>;
  }

  const tierInfo = TIER_LABELS[requiredTier];

  return (
    <>
      {/* 잠금 오버레이 */}
      <div className="relative">
        <div className="pointer-events-none opacity-30 blur-[1px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface">
              <Lock size={20} className="text-text-muted" />
            </div>
            <p className="text-sm font-semibold text-text">{featureName}</p>
            <p className="mt-1 text-xs text-text-muted">{tierInfo.name} 플랜에서 사용 가능</p>
            <button onClick={() => setShowModal(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-text px-4 py-2 text-xs font-semibold text-white hover:bg-accent-sub">
              <Sparkles size={12} /> 업그레이드
            </button>
          </div>
        </div>
      </div>

      {/* 업셀링 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="w-[420px] rounded-2xl border border-border bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-point" />
                <h3 className="text-base font-bold text-text">{featureName}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text"><X size={18} /></button>
            </div>

            {featureDesc && <p className="mb-4 text-sm text-text-sub">{featureDesc}</p>}

            {features && features.length > 0 && (
              <div className="mb-5 space-y-2">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-text-sub">
                    <span className="text-success">✓</span> {f}
                  </div>
                ))}
              </div>
            )}

            <div className="mb-5 rounded-xl bg-surface p-4 text-center">
              <div className="text-xs text-text-muted">{tierInfo.name} 플랜</div>
              <div className="text-xl font-bold text-text">{tierInfo.price}</div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm text-text-sub hover:bg-surface">나중에</button>
              <Link href="/pricing" onClick={() => setShowModal(false)}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
                업그레이드 <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 사이드바용 잠금 아이콘 (메뉴 레이블 옆에 표시)
export function TierBadge({ tier }: { tier: Tier }) {
  const currentTier = useCurrentTier();
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  const requiredIndex = TIER_ORDER.indexOf(tier);
  if (currentIndex >= requiredIndex) return null;
  return <Lock size={10} className="text-text-muted/50" />;
}
