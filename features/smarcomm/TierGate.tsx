'use client';

import { useEffect, useState } from 'react';
import { Lock, ChevronRight, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { TIER_LABELS, TIER_ORDER, hasAccess, type UserTier } from '@/lib/smarcomm/tier-policy';

interface TierGateProps {
    requiredTier: UserTier;
    featureName: string;
    featureDesc?: string;
    features?: string[];
    children: React.ReactNode;
}

// /api/smarcomm/me/plan SSOT — staff/master 자동 business, 그 외는 wio_subscriptions
function useCurrentTier(): { tier: UserTier; loading: boolean } {
    const [tier, setTier] = useState<UserTier>('free');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let alive = true;
        fetch('/api/smarcomm/me/plan', { cache: 'no-store' })
            .then(r => r.json())
            .then((d: { plan_key?: string }) => {
                if (!alive) return;
                const k = (d?.plan_key ?? 'free') as UserTier;
                if (TIER_ORDER.includes(k)) setTier(k);
            })
            .catch(() => { })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, []);
    return { tier, loading };
}

export default function TierGate({ requiredTier, featureName, featureDesc, features, children }: TierGateProps) {
    const [showModal, setShowModal] = useState(false);
    const { tier, loading } = useCurrentTier();

    // 로딩 중에는 children 그대로 — 깜빡임 방지 (서버에서 진짜 보호되는 자원은 API가 별도 검사)
    if (loading) return <>{children}</>;
    if (hasAccess(tier, requiredTier)) return <>{children}</>;

    const tierInfo = TIER_LABELS[requiredTier];

    return (
        <>
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
                            <Link href="/smarcomm/pricing" onClick={() => setShowModal(false)}
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

export function TierBadge({ tier: required }: { tier: UserTier }) {
    const { tier, loading } = useCurrentTier();
    if (loading) return null;
    if (hasAccess(tier, required)) return null;
    return <Lock size={10} className="text-text-muted/50" />;
}
