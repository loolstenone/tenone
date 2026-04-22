"use client";

import { useState, useEffect } from "react";
import { TrendingUp, CreditCard } from "lucide-react";
import { Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Plan { id: string; name: string; price_monthly: number; price_yearly: number | null; max_members: number | null; }

export default function SmarcommRevenuePage() {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscribers, setSubscribers] = useState(0);

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("wio_subscription_plans").select("id, name, price_monthly, price_yearly, max_members").eq("service_type", "smarcomm").order("price_monthly"),
            sb.from("members").select("*", { count: "exact", head: true }).contains("affiliations", ["smarcomm"]),
        ]).then(([plansRes, membersRes]) => {
            setPlans((plansRes.data ?? []) as Plan[]);
            setSubscribers(membersRes.count ?? 0);
            setLoading(false);
        });
    }, []);

    const paidPlans = plans.filter(p => p.price_monthly > 0);
    const estimatedMRR = paidPlans.length > 0 && subscribers > 0
        ? Math.round(subscribers * (paidPlans.reduce((s, p) => s + p.price_monthly, 0) / paidPlans.length))
        : 0;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-lg font-bold">손익 관리</h1>
                <p className="text-sm text-neutral-400 mt-0.5">SmarComm 구독 플랜 · 매출 현황</p>
            </div>

            {loading ? (
                <div className="py-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-neutral-400"><TrendingUp className="h-4 w-4" /><span className="text-xs">구독 회원</span></div>
                            <p className="text-2xl font-bold">{subscribers}명</p>
                        </div>
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-neutral-400"><CreditCard className="h-4 w-4" /><span className="text-xs">유료 플랜</span></div>
                            <p className="text-2xl font-bold">{paidPlans.length}개</p>
                        </div>
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-neutral-400"><TrendingUp className="h-4 w-4" /><span className="text-xs">예상 MRR</span></div>
                            <p className="text-2xl font-bold">₩{estimatedMRR.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="플랜별 구성" />
                            {plans.length === 0 ? (
                                <p className="text-sm text-neutral-400 py-4 text-center">플랜 없음</p>
                            ) : (
                                <div className="space-y-3">
                                    {plans.map(p => (
                                        <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium">{p.name}</p>
                                                {p.max_members && <p className="text-xs text-neutral-400">최대 {p.max_members}명</p>}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">
                                                    {p.price_monthly === 0 ? "무료" : `₩${p.price_monthly.toLocaleString()}/월`}
                                                </p>
                                                {p.price_yearly && <p className="text-xs text-neutral-400">₩{p.price_yearly.toLocaleString()}/년</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card>
                            <SectionTitle title="수익화 로드맵" />
                            <div className="space-y-3">
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                    <p className="font-semibold mb-1">현재 — SaaS 구독</p>
                                    <p>Free/Starter/Pro/Business 4개 플랜 · 구독 기반 수익</p>
                                </div>
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">Phase 2 — 에이전시 파트너</p>
                                    <p>B2B 마케팅 대행사 파트너십 · 리셀러 채널</p>
                                </div>
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">Phase 3 — Enterprise</p>
                                    <p>대기업 맞춤 솔루션 · Custom 계약</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
