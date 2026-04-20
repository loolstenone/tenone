"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, ShoppingBag, Eye, Heart, ExternalLink, Store, TrendingUp } from "lucide-react";

interface Stats {
    productCount: number;
    activeCount: number;
    soldOutCount: number;
    completedRevenue: number;
    orderStats: Record<string, number>;
}

interface ProductRow {
    id: string; title: string; category: string; price: number; currency: string;
    status: string; stock: number | null; is_limited: boolean;
    sold_count: number; likes_count: number; view_count: number;
    created_at: string;
    creator: { handle: string; display_name: string; seller_status: string; seller_commission_rate: number } | null;
}

interface OrderRow {
    id: string; status: string; quantity: number; total_price: number; currency: string;
    buyer_name: string | null; buyer_email: string | null;
    created_at: string; status_changed_at: string;
    product: { id: string; title: string; thumb_url: string | null } | null;
    creator: { handle: string; display_name: string } | null;
}

type Tab = "overview" | "products" | "orders";

const STATUS_STYLE: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900",
    confirmed: "bg-blue-100 text-blue-900",
    paid: "bg-indigo-100 text-indigo-900",
    shipped: "bg-purple-100 text-purple-900",
    completed: "bg-green-100 text-green-900",
    cancelled: "bg-neutral-200 text-neutral-700",
    active: "bg-green-100 text-green-900",
    sold_out: "bg-neutral-200 text-neutral-700",
    hidden: "bg-neutral-100 text-neutral-500",
};

export default function IntraJakkaMarketPage() {
    const [tab, setTab] = useState<Tab>("overview");
    const [stats, setStats] = useState<Stats | null>(null);
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const [s, p, o] = await Promise.all([
            fetch("/api/intra/jakka/market?kind=stats").then((r) => r.json()),
            fetch("/api/intra/jakka/market?kind=products").then((r) => r.json()),
            fetch("/api/intra/jakka/market?kind=orders").then((r) => r.json()),
        ]);
        setStats(s);
        setProducts(p.products ?? []);
        setOrders(o.orders ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const commissionRevenue = orders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + Number(o.total_price) * 0.15, 0);

    return (
        <div className="min-h-screen bg-neutral-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 mb-1">
                    <Store className="w-5 h-5 text-neutral-900" />
                    <h1 className="text-[20px] font-black text-neutral-900">Jakka 마켓 관리</h1>
                </div>
                <p className="text-[12px] text-neutral-600 mb-6">상품·주문 전체 현황 · 수수료 집계</p>

                <div className="flex gap-1 mb-4 border-b border-neutral-200">
                    {(["overview", "products", "orders"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`text-[12px] font-bold px-4 py-2.5 border-b-2 -mb-px transition-colors ${
                                tab === t ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-700"
                            }`}
                        >
                            {t === "overview" && "개요"}
                            {t === "products" && `상품 (${products.length})`}
                            {t === "orders" && `주문 (${orders.length})`}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12 text-[12px] text-neutral-500">로딩 중…</div>
                ) : tab === "overview" ? (
                    <div className="space-y-6">
                        {/* 상품 통계 */}
                        <section>
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-3">상품</p>
                            <div className="grid grid-cols-3 gap-3">
                                <StatCard icon={Package} label="전체 상품" value={stats?.productCount ?? 0} />
                                <StatCard icon={TrendingUp} label="판매 중" value={stats?.activeCount ?? 0} />
                                <StatCard icon={Package} label="품절" value={stats?.soldOutCount ?? 0} />
                            </div>
                        </section>

                        {/* 주문 통계 */}
                        <section>
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-3">주문 상태</p>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                {Object.entries(stats?.orderStats ?? {}).map(([k, v]) => (
                                    <div key={k} className="border border-neutral-200 bg-white p-3 text-center">
                                        <p className={`text-[10px] font-bold px-2 py-0.5 inline-block mb-1 ${STATUS_STYLE[k] ?? "bg-neutral-100"}`}>{k}</p>
                                        <p className="text-[18px] font-black text-neutral-900">{v}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 매출 */}
                        <section>
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-3">매출 (완료 주문 기준)</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="border border-neutral-200 bg-white p-4">
                                    <p className="text-[11px] text-neutral-500 mb-1">누적 매출</p>
                                    <p className="text-[22px] font-black text-neutral-900">{Math.round(stats?.completedRevenue ?? 0).toLocaleString()}원</p>
                                </div>
                                <div className="border border-neutral-200 bg-neutral-900 text-white p-4">
                                    <p className="text-[11px] text-neutral-400 mb-1">플랫폼 수수료 추정 (15%)</p>
                                    <p className="text-[22px] font-black">{Math.round(commissionRevenue).toLocaleString()}원</p>
                                </div>
                            </div>
                        </section>
                    </div>
                ) : tab === "products" ? (
                    products.length === 0 ? (
                        <div className="text-center py-12 text-[12px] text-neutral-500">상품이 없습니다.</div>
                    ) : (
                        <div className="border border-neutral-200 bg-white">
                            <table className="w-full text-[12px]">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="text-left px-3 py-2 font-bold text-neutral-500">작품</th>
                                        <th className="text-left px-3 py-2 font-bold text-neutral-500">작가</th>
                                        <th className="text-left px-3 py-2 font-bold text-neutral-500">카테고리</th>
                                        <th className="text-right px-3 py-2 font-bold text-neutral-500">가격</th>
                                        <th className="text-center px-3 py-2 font-bold text-neutral-500">상태</th>
                                        <th className="text-right px-3 py-2 font-bold text-neutral-500">조회</th>
                                        <th className="text-right px-3 py-2 font-bold text-neutral-500">찜</th>
                                        <th className="text-right px-3 py-2 font-bold text-neutral-500">판매</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {products.map((p) => (
                                        <tr key={p.id} className="hover:bg-neutral-50">
                                            <td className="px-3 py-2 font-bold text-neutral-900 truncate max-w-[200px]">{p.title}</td>
                                            <td className="px-3 py-2 text-neutral-700">{p.creator?.display_name ?? "—"} <span className="text-neutral-400 font-mono">{p.creator?.handle}</span></td>
                                            <td className="px-3 py-2 text-neutral-700">{p.category}</td>
                                            <td className="px-3 py-2 text-right text-neutral-900 font-bold">{Number(p.price).toLocaleString()}원</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 ${STATUS_STYLE[p.status] ?? "bg-neutral-100"}`}>{p.status}</span>
                                            </td>
                                            <td className="px-3 py-2 text-right text-neutral-700"><span className="inline-flex items-center gap-0.5"><Eye className="w-3 h-3" />{p.view_count}</span></td>
                                            <td className="px-3 py-2 text-right text-neutral-700"><span className="inline-flex items-center gap-0.5"><Heart className="w-3 h-3" />{p.likes_count}</span></td>
                                            <td className="px-3 py-2 text-right text-neutral-700">{p.sold_count}</td>
                                            <td className="px-3 py-2">
                                                <Link href={`/jakka/market/${p.id}`} target="_blank" className="text-neutral-500 hover:text-neutral-900">
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-[12px] text-neutral-500">주문이 없습니다.</div>
                ) : (
                    <div className="border border-neutral-200 bg-white">
                        <table className="w-full text-[12px]">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-bold text-neutral-500">주문</th>
                                    <th className="text-left px-3 py-2 font-bold text-neutral-500">작가</th>
                                    <th className="text-left px-3 py-2 font-bold text-neutral-500">구매자</th>
                                    <th className="text-right px-3 py-2 font-bold text-neutral-500">금액</th>
                                    <th className="text-center px-3 py-2 font-bold text-neutral-500">상태</th>
                                    <th className="text-left px-3 py-2 font-bold text-neutral-500">일시</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {orders.map((o) => (
                                    <tr key={o.id} className="hover:bg-neutral-50">
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                {o.product?.thumb_url && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={o.product.thumb_url} alt="" className="w-8 h-8 object-cover" />
                                                )}
                                                <span className="font-bold text-neutral-900 truncate max-w-[180px]">{o.product?.title ?? "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-neutral-700">{o.creator?.display_name}</td>
                                        <td className="px-3 py-2 text-neutral-700">{o.buyer_name ?? "—"} <span className="text-[10px] text-neutral-400">{o.buyer_email}</span></td>
                                        <td className="px-3 py-2 text-right text-neutral-900 font-bold">{Number(o.total_price).toLocaleString()}원 <span className="text-[10px] text-neutral-400">×{o.quantity}</span></td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 ${STATUS_STYLE[o.status] ?? "bg-neutral-100"}`}>{o.status}</span>
                                        </td>
                                        <td className="px-3 py-2 text-neutral-500">{o.created_at.substring(0, 10)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
    return (
        <div className="border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mb-1"><Icon className="w-3.5 h-3.5" />{label}</div>
            <p className="text-[22px] font-black text-neutral-900">{value.toLocaleString()}</p>
        </div>
    );
}
