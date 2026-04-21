"use client";

import { useEffect, useState } from "react";
import { Package, Loader2, Check, X } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Plan {
    id: string;
    service: string;
    plan_key: string;
    display_name: string | null;
    price_monthly: number | null;
    price_yearly: number | null;
    max_members: number | null;
    is_active: boolean;
    is_popular: boolean;
    sort_order: number | null;
    service_type: string | null;
}

interface Flag {
    id: string;
    plan_id: string;
    feature_key: string;
    enabled: boolean;
    limit_value: number | null;
    description: string | null;
}

export default function WioPlansStandardPage() {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [flags, setFlags] = useState<Flag[]>([]);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const [pRes, fRes] = await Promise.all([
                sb.from("wio_subscription_plans").select("*").order("service").order("sort_order"),
                sb.from("wio_feature_flags").select("*"),
            ]);
            setPlans(pRes.data ?? []);
            setFlags(fRes.data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    // 서비스별 그룹핑
    const services = Array.from(new Set(plans.map(p => p.service)));

    // plan_id → features
    const flagsByPlan: Record<string, Flag[]> = {};
    flags.forEach(f => {
        if (!flagsByPlan[f.plan_id]) flagsByPlan[f.plan_id] = [];
        flagsByPlan[f.plan_id].push(f);
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="WIO 요금제 · 기능 플래그"
                description={`${plans.length} 플랜 × ${flags.length} 피쳐 · wio_subscription_plans × wio_feature_flags SSOT`}
            />

            {/* Philosophy */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-blue-200" />
                    <span className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold">WIO 2-Tier 모델</span>
                </div>
                <p className="text-[11px] text-blue-100 leading-relaxed">
                    <strong>규격 서비스</strong>(Subscription): 등급별 기능 제한, 셀프서비스 · feature flag로 관리
                    <span className="mx-2">·</span>
                    <strong>맞춤 서비스</strong>(Custom): 클라이언트 최적화 용역 · 별도 테넌트 설정
                </p>
            </div>

            {/* Plans by Service */}
            {services.map(service => {
                const svcPlans = plans.filter(p => p.service === service);
                const allFeatureKeys = Array.from(new Set(
                    svcPlans.flatMap(p => (flagsByPlan[p.id] ?? []).map(f => f.feature_key))
                )).sort();

                return (
                    <div key={service}>
                        <h2 className="text-sm font-semibold text-neutral-900 mb-3 capitalize flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-neutral-900 rounded-full" />
                            {service}
                            <span className="text-[11px] text-neutral-500 font-normal">({svcPlans.length} 플랜)</span>
                        </h2>

                        <div className="bg-white border border-neutral-200 rounded-lg overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600 sticky left-0 bg-neutral-50">기능</th>
                                        {svcPlans.map(p => (
                                            <th key={p.id} className="px-3 py-2 text-center font-semibold text-neutral-900">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <span>{p.display_name || p.plan_key}</span>
                                                        {p.is_popular && <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded">인기</span>}
                                                    </div>
                                                    <span className="text-[10px] text-neutral-500 font-normal">
                                                        {p.price_monthly ? `₩${p.price_monthly.toLocaleString()}/월` : "Free"}
                                                    </span>
                                                    {p.max_members && (
                                                        <span className="text-[9px] text-neutral-400 font-normal">최대 {p.max_members}명</span>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {allFeatureKeys.map(fk => (
                                        <tr key={fk} className="border-b border-neutral-100 last:border-0">
                                            <td className="px-3 py-1.5 font-mono text-[10px] text-neutral-700 sticky left-0 bg-white">{fk}</td>
                                            {svcPlans.map(p => {
                                                const flag = (flagsByPlan[p.id] ?? []).find(f => f.feature_key === fk);
                                                return (
                                                    <td key={p.id} className="px-3 py-1.5 text-center">
                                                        {flag ? (
                                                            flag.limit_value !== null ? (
                                                                <span className="text-[10px] font-semibold text-neutral-900">{flag.limit_value.toLocaleString()}</span>
                                                            ) : flag.enabled ? (
                                                                <Check className="inline h-3.5 w-3.5 text-emerald-600" />
                                                            ) : (
                                                                <X className="inline h-3.5 w-3.5 text-neutral-300" />
                                                            )
                                                        ) : (
                                                            <span className="text-neutral-200">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-[11px] text-neutral-700">
                <p className="font-semibold mb-1">Tech Flywheel 원칙 (CLAUDE.md §1.7)</p>
                <p>맞춤 서비스 개발 기술 → 일반화 가능 기능은 WIO 코어로 흡수 → 규격 서비스 업그레이드 (반복)</p>
            </div>
        </div>
    );
}
