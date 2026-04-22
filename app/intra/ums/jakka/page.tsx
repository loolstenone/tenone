"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Users, ShoppingBag, Megaphone, ImageIcon, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

export default function JakkaDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        creators: 0, publicCreators: 0, pendingSellers: 0,
        activeListings: 0, showcases: 0, notices: 0,
    });
    const [recentCreators, setRecentCreators] = useState<{ id: string; display_name: string; handle: string; field: string | null; created_at: string }[]>([]);

    useEffect(() => {
        const sb = createClient();
        Promise.all([
            sb.from("jakka_creators").select("*", { count: "exact", head: true }),
            sb.from("jakka_creators").select("*", { count: "exact", head: true }).eq("is_public", true),
            sb.from("jakka_seller_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
            sb.from("jakka_market_items").select("*", { count: "exact", head: true }).eq("status", "active"),
            sb.from("jakka_showcases").select("*", { count: "exact", head: true }),
            sb.from("jakka_notices").select("*", { count: "exact", head: true }).eq("is_active", true),
            sb.from("jakka_creators").select("id, display_name, handle, field, created_at").order("created_at", { ascending: false }).limit(5),
        ]).then(([creators, publicC, sellers, listings, showcases, notices, recent]) => {
            setStats({
                creators: creators.count ?? 0,
                publicCreators: publicC.count ?? 0,
                pendingSellers: sellers.count ?? 0,
                activeListings: listings.count ?? 0,
                showcases: showcases.count ?? 0,
                notices: notices.count ?? 0,
            });
            setRecentCreators((recent.data ?? []) as { id: string; display_name: string; handle: string; field: string | null; created_at: string }[]);
            setLoading(false);
        });
    }, []);

    return (
        <div>
            <PageHeader title="JAKKA 대시보드" description="창작자 네트워크 · 마켓플레이스 운영 현황">
                <Link href="/jakka" target="_blank"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> 사이트 바로가기
                </Link>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        <StatCard label="전체 창작자" value={`${stats.creators}명`}
                            sub={`공개 ${stats.publicCreators}명`} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="판매자 심사 대기" value={`${stats.pendingSellers}건`}
                            sub="승인 필요" icon={<ShoppingBag className="h-4 w-4" />} />
                        <StatCard label="활성 공고" value={`${stats.notices}개`}
                            sub="광고·이벤트" icon={<Megaphone className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="최근 창작자" action="전체 보기" actionHref="/intra/ums/jakka/members" />
                            <div className="space-y-2">
                                {recentCreators.map(c => (
                                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-800">{c.display_name}</p>
                                            <p className="text-[11px] text-neutral-400">{c.handle}{c.field && ` · ${c.field}`}</p>
                                        </div>
                                        <span className="text-[10px] text-neutral-400">
                                            {new Date(c.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <SectionTitle title="빠른 이동" />
                            <div className="space-y-2">
                                {[
                                    { label: `판매자 심사 ${stats.pendingSellers}건`, sub: "승인 대기 중인 마켓 판매자", href: "/intra/ums/jakka/sellers" },
                                    { label: `마켓 상품 ${stats.activeListings}건`, sub: "활성 상품 관리", href: "/intra/ums/jakka/market" },
                                    { label: `쇼케이스 ${stats.showcases}개`, sub: "기간제 쇼케이스 운영", href: "/intra/ums/jakka/showcases" },
                                    { label: `광고 공고 ${stats.notices}개`, sub: "활성 공고·이벤트 관리", href: "/intra/ums/jakka/notices" },
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
