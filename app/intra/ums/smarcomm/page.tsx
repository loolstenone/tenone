"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Users, CreditCard, TrendingUp, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Plan { id: string; name: string; price_monthly: number; service_type: string; }

export default function SmarcommDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ subscribers: 0, pendingInquiries: 0 });
    const [plans, setPlans] = useState<Plan[]>([]);

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("members").select("*", { count: "exact", head: true }).contains("affiliations", ["smarcomm"]),
            sb.from("inquiries").select("*", { count: "exact", head: true }).eq("brand_id", "smarcomm").eq("status", "pending"),
            sb.from("wio_subscription_plans").select("id, name, price_monthly, service_type").eq("service_type", "smarcomm").order("price_monthly"),
        ]).then(([members, inquiries, plansRes]) => {
            setStats({
                subscribers: members.count ?? 0,
                pendingInquiries: inquiries.count ?? 0,
            });
            setPlans((plansRes.data ?? []) as Plan[]);
            setLoading(false);
        });
    }, []);

    return (
        <div>
            <PageHeader title="SmarComm. 대시보드" description="마케팅 자동화 OS 운영 현황">
                <Link href="/smarcomm" target="_blank"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
                </Link>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <StatCard label="구독 회원" value={`${stats.subscribers}명`} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="플랜 구성" value={`${plans.length}개`} icon={<CreditCard className="h-4 w-4" />} />
                        <StatCard label="미답변 문의" value={`${stats.pendingInquiries}건`} icon={<TrendingUp className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="구독 플랜 현황" action="손익 관리" actionHref="/intra/ums/smarcomm/revenue" />
                            {plans.length === 0 ? (
                                <p className="text-sm text-neutral-400 py-4 text-center">플랜 정보 없음</p>
                            ) : (
                                <div className="space-y-2">
                                    {plans.map(p => (
                                        <div key={p.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                                            <p className="text-sm font-medium">{p.name}</p>
                                            <span className="text-sm text-neutral-600">
                                                {p.price_monthly === 0 ? "무료" : `₩${p.price_monthly.toLocaleString()}/월`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card>
                            <SectionTitle title="빠른 이동" />
                            <div className="space-y-2">
                                {[
                                    { label: `구독 회원 ${stats.subscribers}명`, sub: "SmarComm 구독자 관리", href: "/intra/ums/smarcomm/members" },
                                    { label: "손익 관리", sub: "구독 플랜 · 매출 현황", href: "/intra/ums/smarcomm/revenue" },
                                    { label: `미답변 문의 ${stats.pendingInquiries}건`, sub: "고객 문의 응대", href: "/intra/ums/smarcomm/cs" },
                                ].map(({ label, sub, href }) => (
                                    <Link key={href} href={href}
                                        className="block px-4 py-3 border border-neutral-200 hover:border-neutral-900 transition rounded">
                                        <div className="text-sm font-medium text-neutral-900">{label}</div>
                                        <div className="text-xs text-neutral-500 mt-0.5">{sub}</div>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
