// SmarComm Plan Gate — wio_subscription_plans 기반 실제 플랜 게이트
// 사용법: <SmarCommPlanGate requiredPlan="pro" feature="creative_studio"> ... </SmarCommPlanGate>

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, Loader2, Sparkles } from 'lucide-react';

type Plan = 'free' | 'starter' | 'pro' | 'business';

interface Props {
    requiredPlan: Plan;
    feature?: string;
    children: React.ReactNode;
}

interface CheckResult {
    plan: Plan | null;
    allowed: boolean;
    reason?: string;
    requiredPlan?: Plan;
}

const PLAN_LABEL: Record<Plan, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    business: 'Business',
};

export function SmarCommPlanGate({ requiredPlan, feature, children }: Props) {
    const [result, setResult] = useState<CheckResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams({ requiredPlan });
        if (feature) params.set('feature', feature);
        fetch(`/api/smarcomm/plan-check?${params}`)
            .then(r => r.json())
            .then(setResult)
            .catch(() => setResult({ plan: null, allowed: false, reason: 'network_error' }))
            .finally(() => setLoading(false));
    }, [requiredPlan, feature]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 size={20} className="animate-spin text-text-muted" />
            </div>
        );
    }

    if (result?.allowed) {
        return <>{children}</>;
    }

    // 차단 — 업그레이드 안내
    const isUnauth = result?.reason === 'unauthenticated';
    const currentPlan = result?.plan;

    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center px-6">
            <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-text/5">
                    <Lock size={22} className="text-text-sub" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-text">
                    {PLAN_LABEL[requiredPlan]} 플랜 전용 기능
                </h2>
                <p className="mb-1 text-sm text-text-sub">
                    {isUnauth
                        ? '이 기능을 이용하려면 로그인이 필요합니다.'
                        : `현재 플랜: ${currentPlan ? PLAN_LABEL[currentPlan] : 'Free'}`}
                </p>
                <p className="mb-6 text-sm text-text-muted">
                    {PLAN_LABEL[requiredPlan]} 플랜 이상에서 사용 가능합니다.
                </p>

                <div className="flex items-center justify-center gap-2">
                    {isUnauth ? (
                        <Link
                            href="/login"
                            className="rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
                        >
                            로그인
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/smarcomm#pricing"
                                className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
                            >
                                <Sparkles size={14} />
                                업그레이드
                            </Link>
                            <Link
                                href="/smarcomm/dashboard"
                                className="rounded-xl border border-border px-4 py-2.5 text-sm text-text-sub hover:bg-surface transition-colors"
                            >
                                대시보드로
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
