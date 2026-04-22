"use client";

import { useState, useEffect } from "react";
import { Loader2, Building2, FileText, TrendingUp } from "lucide-react";
import { PageHeader, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

export default function GravityRevenuePage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ activeClients: 0, pendingApps: 0, products: 0 });
    const [clients, setClients] = useState<{ id: string; name: string; industry: string | null; created_at: string }[]>([]);

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("bg_clients").select("*", { count: "exact", head: true }),
            sb.from("bg_apply_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
            sb.from("bg_products").select("*", { count: "exact", head: true }),
            sb.from("bg_clients").select("id, name, industry, created_at").order("created_at", { ascending: false }).limit(10),
        ]).then(([clients, apps, products, clientList]) => {
            setStats({
                activeClients: clients.count ?? 0,
                pendingApps: apps.count ?? 0,
                products: products.count ?? 0,
            });
            setClients((clientList.data ?? []) as { id: string; name: string; industry: string | null; created_at: string }[]);
            setLoading(false);
        });
    }, []);

    return (
        <div>
            <PageHeader title="손익 관리" description="Brand Gravity™ 클라이언트 계약 · 서비스 현황" />

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-neutral-400"><Building2 className="h-4 w-4" /><span className="text-xs">활성 클라이언트</span></div>
                            <p className="text-2xl font-bold">{stats.activeClients}</p>
                        </div>
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-neutral-400"><FileText className="h-4 w-4" /><span className="text-xs">분석 대상 제품</span></div>
                            <p className="text-2xl font-bold">{stats.products}</p>
                        </div>
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-neutral-400"><TrendingUp className="h-4 w-4" /><span className="text-xs">신청 대기</span></div>
                            <p className="text-2xl font-bold text-amber-600">{stats.pendingApps}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="클라이언트 목록" />
                            {clients.length === 0 ? (
                                <p className="text-sm text-neutral-400 py-4 text-center">등록된 클라이언트 없음</p>
                            ) : (
                                <div className="space-y-2">
                                    {clients.map(c => (
                                        <div key={c.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-neutral-900">{c.name}</p>
                                                {c.industry && <p className="text-xs text-neutral-400">{c.industry}</p>}
                                            </div>
                                            <span className="text-xs text-neutral-400">{new Date(c.created_at).toLocaleDateString("ko-KR")}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                        <Card>
                            <SectionTitle title="수익화 구조" />
                            <div className="space-y-3">
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                    <p className="font-semibold mb-1">현재 — 리텐션 컨설팅</p>
                                    <p>클라이언트별 브랜드 분석 · AEO 전략 리포트 제공</p>
                                </div>
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">Phase 2 — SaaS 전환</p>
                                    <p>Gravity Score 자동화 · 월간 구독 모델</p>
                                </div>
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">Phase 3 — WIO 모듈화</p>
                                    <p>AI 브랜드 분석을 WIO 서비스 상품으로 판매</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
