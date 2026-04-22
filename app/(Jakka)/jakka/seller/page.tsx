"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, MessageCircle, Settings, Plus, Edit3, Eye, TrendingUp, Check, Truck, X as XIcon, Clock, BarChart3 } from "lucide-react";
import { PageHeader } from "@/features/jakka/PageHeader";
import {
    getMyCreatorProfile,
    getProductsByCreator,
    getOrdersByCreator,
    getQnasByCreator,
    updateOrderStatus,
    answerProductQuestion,
    type JakkaCreator,
    type JakkaProduct,
    type JakkaOrder,
    type ProductQna,
    type OrderStatus,
} from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";
import { currentLoginHref } from "@/lib/login-href";

type Tab = "home" | "products" | "orders" | "qna" | "settlement" | "settings";

const STATUS_LABEL: Record<OrderStatus, string> = {
    pending: "문의 접수",
    confirmed: "확인",
    paid: "결제 완료",
    shipped: "배송 중",
    completed: "완료",
    cancelled: "취소",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
    pending: "bg-amber-100 text-amber-900",
    confirmed: "bg-blue-100 text-blue-900",
    paid: "bg-indigo-100 text-indigo-900",
    shipped: "bg-purple-100 text-purple-900",
    completed: "bg-green-100 text-green-900",
    cancelled: "bg-neutral-200 text-neutral-700",
};

export default function SellerCenterPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [creator, setCreator] = useState<JakkaCreator | null>(null);
    const [tab, setTab] = useState<Tab>("home");
    const [products, setProducts] = useState<JakkaProduct[]>([]);
    const [orders, setOrders] = useState<(JakkaOrder & { product?: JakkaProduct })[]>([]);
    const [qnas, setQnas] = useState<(ProductQna & { product_title?: string })[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async (c: JakkaCreator) => {
        const [p, o, q] = await Promise.all([
            getProductsByCreator(c.id, true),
            getOrdersByCreator(c.id),
            getQnasByCreator(c.id),
        ]);
        setProducts(p);
        setOrders(o);
        setQnas(q);
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || !user) { router.push(currentLoginHref()); return; }
        (async () => {
            const c = await getMyCreatorProfile(user.authId ?? user.id);
            if (!c) { router.push("/jakka/profile"); return; }
            if (c.seller_status !== "approved") { router.push("/jakka/market/apply"); return; }
            setCreator(c);
            await load(c);
            setLoading(false);
        })();
    }, [authLoading, isAuthenticated, user, router, load]);

    async function handleOrderStatusChange(orderId: string, status: OrderStatus) {
        const ok = await updateOrderStatus(orderId, status);
        if (ok && creator) await load(creator);
    }

    async function handleAnswerQna(qnaId: string, answer: string) {
        if (!answer.trim()) return;
        const ok = await answerProductQuestion(qnaId, answer.trim());
        if (ok && creator) await load(creator);
    }

    if (loading || !creator) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
            </div>
        );
    }

    const activeProducts = products.filter((p) => p.status !== "hidden");
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const unansweredQnas = qnas.filter((q) => !q.answer);
    const totalRevenue = orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + Number(o.total_price), 0);
    const totalViews = products.reduce((sum, p) => sum + (p.view_count ?? 0), 0);
    const totalLikes = products.reduce((sum, p) => sum + (p.likes_count ?? 0), 0);

    const tabs: { id: Tab; label: string; icon: typeof Package; badge?: number }[] = [
        { id: "home", label: "홈", icon: TrendingUp },
        { id: "products", label: "상품", icon: Package, badge: activeProducts.length },
        { id: "orders", label: "주문", icon: ShoppingBag, badge: pendingOrders.length },
        { id: "qna", label: "문의", icon: MessageCircle, badge: unansweredQnas.length },
        { id: "settlement", label: "정산", icon: BarChart3 },
        { id: "settings", label: "설정", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                eyebrow="Seller Center"
                title="판매자 센터"
                subtitle={`${creator.display_name} · 수수료 ${Math.round(creator.seller_commission_rate * 100)}%`}
                action={
                    <Link
                        href="/jakka/market/upload"
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-neutral-900 border border-neutral-900 px-3 py-2 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        상품 등록
                    </Link>
                }
            />

            <div className="max-w-5xl mx-auto px-5 py-6">
                {/* 탭 */}
                <div className="sticky top-[44px] md:top-0 z-10 bg-white border-b border-neutral-200 -mx-5 px-5">
                    <div className="flex gap-1 overflow-x-auto scrollbar-none">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`shrink-0 inline-flex items-center gap-1.5 text-[12px] font-bold px-4 py-3 border-b-2 transition-colors ${
                                    tab === t.id
                                        ? "border-neutral-900 text-neutral-900"
                                        : "border-transparent text-neutral-500 hover:text-neutral-700"
                                }`}
                            >
                                <t.icon className="w-3.5 h-3.5" />
                                {t.label}
                                {t.badge !== undefined && t.badge > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-900 text-white rounded-full min-w-[18px] text-center">
                                        {t.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-6">
                    {/* 홈 탭 */}
                    {tab === "home" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <StatCard label="등록 상품" value={activeProducts.length.toString()} unit="점" />
                                <StatCard label="누적 조회" value={totalViews.toLocaleString()} unit="회" />
                                <StatCard label="누적 찜" value={totalLikes.toLocaleString()} unit="회" />
                                <StatCard label="누적 매출" value={totalRevenue.toLocaleString()} unit="원" />
                            </div>

                            {pendingOrders.length > 0 && (
                                <div className="border-l-4 border-amber-500 bg-amber-50 p-4">
                                    <p className="text-[12px] font-bold text-neutral-900 mb-1">⚡ 대기 중 주문 {pendingOrders.length}건</p>
                                    <p className="text-[11px] text-neutral-700">"주문" 탭에서 확인 후 응답해주세요.</p>
                                </div>
                            )}
                            {unansweredQnas.length > 0 && (
                                <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                                    <p className="text-[12px] font-bold text-neutral-900 mb-1">💬 답변 대기 문의 {unansweredQnas.length}건</p>
                                    <p className="text-[11px] text-neutral-700">"문의" 탭에서 답변해주세요.</p>
                                </div>
                            )}

                            <div>
                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-3">최근 주문</p>
                                {orders.slice(0, 5).length === 0 ? (
                                    <p className="text-[12px] text-neutral-500 text-center py-8">아직 주문이 없습니다.</p>
                                ) : (
                                    <div className="divide-y divide-neutral-100">
                                        {orders.slice(0, 5).map((o) => (
                                            <div key={o.id} className="py-3 flex items-center gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-bold text-neutral-900 truncate">{o.product?.title ?? "—"}</p>
                                                    <p className="text-[11px] text-neutral-500">
                                                        {o.buyer_name ?? "—"} · {Number(o.total_price).toLocaleString()}원 · {o.created_at.substring(0, 10)}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 ${STATUS_COLOR[o.status]}`}>
                                                    {STATUS_LABEL[o.status]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 상품 탭 */}
                    {tab === "products" && (
                        <div>
                            {products.length === 0 ? (
                                <div className="text-center py-12 text-[12px] text-neutral-500">
                                    <Package className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                    등록된 상품이 없습니다.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {products.map((p) => (
                                        <div key={p.id} className="border border-neutral-200 p-3 flex gap-3">
                                            <div className="w-20 h-20 bg-neutral-100 shrink-0">
                                                {p.thumb_url && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={p.thumb_url} alt="" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-1">
                                                    <p className="text-[13px] font-bold text-neutral-900 truncate">{p.title}</p>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 shrink-0 ${
                                                        p.status === "active" ? "bg-green-100 text-green-900"
                                                        : p.status === "sold_out" ? "bg-neutral-200 text-neutral-700"
                                                        : "bg-neutral-100 text-neutral-500"
                                                    }`}>
                                                        {p.status === "active" ? "판매중" : p.status === "sold_out" ? "품절" : "비공개"}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] text-neutral-700 mt-0.5">{Number(p.price).toLocaleString()}원 · {p.category}</p>
                                                <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-0.5"><Eye className="w-3 h-3" />{p.view_count ?? 0}</span>
                                                    <span>찜 {p.likes_count ?? 0}</span>
                                                    <span>판매 {p.sold_count}</span>
                                                </p>
                                                <div className="flex gap-1 mt-2">
                                                    <Link href={`/jakka/market/${p.id}`} className="text-[10px] text-neutral-700 border border-neutral-300 px-2 py-0.5 hover:border-neutral-900 hover:text-neutral-900 inline-flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        보기
                                                    </Link>
                                                    <Link href={`/jakka/market/edit/${p.id}`} className="text-[10px] text-neutral-700 border border-neutral-300 px-2 py-0.5 hover:border-neutral-900 hover:text-neutral-900 inline-flex items-center gap-1">
                                                        <Edit3 className="w-3 h-3" />
                                                        수정
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 주문 탭 */}
                    {tab === "orders" && <OrdersPanel orders={orders} onStatusChange={handleOrderStatusChange} />}

                    {/* 문의 탭 */}
                    {tab === "qna" && <QnaPanel qnas={qnas} creatorHandle={creator.handle} onAnswer={handleAnswerQna} />}

                    {/* 정산 탭 */}
                    {tab === "settlement" && (
                        <SettlementPanel
                            orders={orders}
                            commissionRate={creator.seller_commission_rate}
                        />
                    )}

                    {/* 설정 탭 */}
                    {tab === "settings" && (
                        <div className="space-y-4 max-w-xl">
                            <div className="border border-neutral-200 p-4 space-y-3">
                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em]">판매자 정보</p>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-neutral-500">작가명</span>
                                    <span className="text-neutral-900 font-bold">{creator.display_name}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-neutral-500">핸들</span>
                                    <span className="text-neutral-900 font-mono">{creator.handle}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-neutral-500">승인일</span>
                                    <span className="text-neutral-900">{creator.seller_approved_at?.substring(0, 10) ?? "—"}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-neutral-500">플랫폼 수수료</span>
                                    <span className="text-neutral-900 font-bold">{Math.round(creator.seller_commission_rate * 100)}%</span>
                                </div>
                            </div>
                            <div className="border border-neutral-200 p-4">
                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">정산</p>
                                <p className="text-[12px] text-neutral-700 leading-relaxed">
                                    매월 1일·15일 기준 정산됩니다. 정산 계좌·사업자 정보 변경은 운영진(<a href="mailto:lools@tenone.biz" className="underline">lools@tenone.biz</a>)에 요청해주세요.
                                </p>
                            </div>
                            <Link href="/jakka/profile" className="block text-center text-[12px] font-bold text-neutral-900 border border-neutral-900 py-3 hover:bg-neutral-900 hover:text-white">
                                크리에이터 프로필 편집
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
    return (
        <div className="border border-neutral-200 p-3">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-1">{label}</p>
            <p className="text-[18px] font-black text-neutral-900 leading-none">
                {value}<span className="text-[11px] font-normal text-neutral-500 ml-1">{unit}</span>
            </p>
        </div>
    );
}

function OrdersPanel({
    orders,
    onStatusChange,
}: {
    orders: (JakkaOrder & { product?: JakkaProduct })[];
    onStatusChange: (orderId: string, status: OrderStatus) => void;
}) {
    if (orders.length === 0) {
        return (
            <div className="text-center py-12 text-[12px] text-neutral-500">
                <ShoppingBag className="w-8 h-8 mx-auto mb-3 opacity-50" />
                주문이 없습니다.
            </div>
        );
    }
    return (
        <div className="space-y-2">
            {orders.map((o) => {
                const next: OrderStatus[] = o.status === "pending" ? ["confirmed", "cancelled"]
                    : o.status === "confirmed" ? ["paid", "cancelled"]
                    : o.status === "paid" ? ["shipped", "cancelled"]
                    : o.status === "shipped" ? ["completed"]
                    : [];
                return (
                    <div key={o.id} className="border border-neutral-200 p-3">
                        <div className="flex items-start gap-3">
                            <div className="w-14 h-14 bg-neutral-100 shrink-0">
                                {o.product?.thumb_url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={o.product.thumb_url} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-[13px] font-bold text-neutral-900 truncate">{o.product?.title ?? "—"}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 shrink-0 ${STATUS_COLOR[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                                </div>
                                <p className="text-[11px] text-neutral-700 mt-0.5">
                                    {Number(o.total_price).toLocaleString()}원 · {o.quantity}개 · {o.created_at.substring(0, 10)}
                                </p>
                                <p className="text-[11px] text-neutral-500 mt-0.5">
                                    {o.buyer_name ?? "—"} · {o.buyer_phone ?? "—"} · {o.buyer_email ?? "—"}
                                </p>
                                {o.shipping_address1 && (
                                    <p className="text-[11px] text-neutral-500 mt-0.5">
                                        ({o.shipping_postcode}) {o.shipping_address1} {o.shipping_address2 ?? ""}
                                    </p>
                                )}
                                {o.message && (
                                    <div className="mt-2 p-2 bg-neutral-50 border-l-2 border-neutral-300">
                                        <p className="text-[11px] font-bold text-neutral-500 mb-0.5">구매자 메시지</p>
                                        <p className="text-[12px] text-neutral-900 whitespace-pre-line">{o.message}</p>
                                    </div>
                                )}
                                {next.length > 0 && (
                                    <div className="flex gap-1.5 mt-2">
                                        {next.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => onStatusChange(o.id, s)}
                                                className={`text-[11px] font-bold px-2.5 py-1 border inline-flex items-center gap-1 ${
                                                    s === "cancelled"
                                                        ? "border-red-300 text-red-700 hover:bg-red-50"
                                                        : "border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                                                }`}
                                            >
                                                {s === "confirmed" && <Check className="w-3 h-3" />}
                                                {s === "shipped" && <Truck className="w-3 h-3" />}
                                                {s === "completed" && <Check className="w-3 h-3" />}
                                                {s === "cancelled" && <XIcon className="w-3 h-3" />}
                                                {STATUS_LABEL[s]}로 변경
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function QnaPanel({
    qnas,
    creatorHandle,
    onAnswer,
}: {
    qnas: (ProductQna & { product_title?: string })[];
    creatorHandle: string;
    onAnswer: (qnaId: string, answer: string) => void;
}) {
    const [drafts, setDrafts] = useState<Record<string, string>>({});

    if (qnas.length === 0) {
        return (
            <div className="text-center py-12 text-[12px] text-neutral-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                등록된 문의가 없습니다.
            </div>
        );
    }
    return (
        <div className="space-y-2">
            {qnas.map((q) => (
                <div key={q.id} className="border border-neutral-200 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-neutral-500 truncate">
                                <Link href={`/jakka/market/${q.product_id}`} className="hover:underline">{q.product_title ?? "상품"}</Link>
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-bold text-neutral-900">Q.</span>
                                <span className="text-[11px] font-mono text-neutral-500">
                                    {q.asker_handle ? `@${q.asker_handle}` : q.asker_name ?? "익명"}
                                </span>
                                {q.is_private && <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5">비공개</span>}
                                <span className="text-[10px] text-neutral-500">{q.created_at.substring(0, 10)}</span>
                            </div>
                        </div>
                        {!q.answer && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 shrink-0 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                답변 대기
                            </span>
                        )}
                    </div>
                    <p className="text-[13px] text-neutral-900 whitespace-pre-line mb-2">{q.question}</p>

                    {q.answer ? (
                        <div className="mt-2 pt-2 border-t border-neutral-100 bg-neutral-50 -mx-3 -mb-3 px-3 pb-3">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[11px] font-bold text-neutral-900">A.</span>
                                <span className="text-[11px] font-mono text-neutral-500">{creatorHandle}</span>
                                <span className="text-[10px] text-neutral-500">{q.answered_at?.substring(0, 10)}</span>
                            </div>
                            <p className="text-[13px] text-neutral-900 whitespace-pre-line">{q.answer}</p>
                        </div>
                    ) : (
                        <div className="mt-2 pt-2 border-t border-neutral-100">
                            <textarea
                                value={drafts[q.id] ?? ""}
                                onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                                rows={2}
                                placeholder="답변을 작성하세요."
                                className="w-full text-[13px] text-neutral-900 border border-neutral-200 p-2 resize-none focus:outline-none focus:border-neutral-900"
                            />
                            <div className="flex justify-end mt-1">
                                <button
                                    onClick={() => { onAnswer(q.id, drafts[q.id] ?? ""); setDrafts((d) => { const n = { ...d }; delete n[q.id]; return n; }); }}
                                    disabled={!(drafts[q.id] ?? "").trim()}
                                    className="text-[11px] font-bold text-neutral-900 border border-neutral-900 px-2.5 py-1 hover:bg-neutral-900 hover:text-white disabled:opacity-50"
                                >
                                    답변 등록
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ── 정산 패널 ── */
type SettlementPeriod = "this_month" | "last_month" | "all";

function SettlementPanel({
    orders,
    commissionRate,
}: {
    orders: (JakkaOrder & { product?: JakkaProduct })[];
    commissionRate: number;
}) {
    const [period, setPeriod] = useState<SettlementPeriod>("this_month");

    const now = new Date();
    const thisMonth = { year: now.getFullYear(), month: now.getMonth() };
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = { year: lastMonthDate.getFullYear(), month: lastMonthDate.getMonth() };

    const completedOrders = orders.filter((o) => o.status === "completed");

    const filtered = completedOrders.filter((o) => {
        if (period === "all") return true;
        const d = new Date(o.created_at);
        const target = period === "this_month" ? thisMonth : lastMonth;
        return d.getFullYear() === target.year && d.getMonth() === target.month;
    });

    const totalSales = filtered.reduce((s, o) => s + Number(o.total_price), 0);
    const commission = Math.floor(totalSales * commissionRate);
    const settlement = totalSales - commission;

    const PERIODS: { id: SettlementPeriod; label: string }[] = [
        { id: "this_month", label: "이번 달" },
        { id: "last_month", label: "지난 달" },
        { id: "all", label: "전체" },
    ];

    return (
        <div className="space-y-5">
            {/* 기간 필터 */}
            <div className="flex gap-1.5">
                {PERIODS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setPeriod(p.id)}
                        className={`text-[12px] font-bold px-3 py-1.5 border transition-colors ${
                            period === p.id
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-300 text-neutral-500 hover:border-neutral-700"
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "완료 주문", value: `${filtered.length}건` },
                    { label: "총 판매금액", value: `${totalSales.toLocaleString()}원` },
                    { label: `플랫폼 수수료 (${Math.round(commissionRate * 100)}%)`, value: `${commission.toLocaleString()}원` },
                    { label: "정산 예정금액", value: `${settlement.toLocaleString()}원`, highlight: true },
                ].map((s) => (
                    <div key={s.label} className={`border p-3 ${s.highlight ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200"}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.1em] mb-1 ${s.highlight ? "text-neutral-400" : "text-neutral-500"}`}>
                            {s.label}
                        </p>
                        <p className={`text-[15px] font-bold ${s.highlight ? "text-white" : "text-neutral-900"}`}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* 안내 */}
            <div className="bg-neutral-50 border border-neutral-200 p-3 text-[11px] text-neutral-500 leading-relaxed">
                정산은 매월 말일 기준으로 "완료" 상태 주문에 대해 처리됩니다. 결제 시스템 연동 후 자동 정산이 시작됩니다.
            </div>

            {/* 완료 주문 목록 */}
            <div>
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-3">
                    완료 주문 내역
                </p>
                {filtered.length === 0 ? (
                    <div className="text-center py-10 text-[12px] text-neutral-400">
                        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        해당 기간에 완료된 주문이 없습니다.
                    </div>
                ) : (
                    <div className="border border-neutral-200 overflow-hidden">
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                                    <th className="px-3 py-2 font-bold text-neutral-500">날짜</th>
                                    <th className="px-3 py-2 font-bold text-neutral-500">상품명</th>
                                    <th className="px-3 py-2 font-bold text-neutral-500 text-right">판매금액</th>
                                    <th className="px-3 py-2 font-bold text-neutral-500 text-right">수수료</th>
                                    <th className="px-3 py-2 font-bold text-neutral-500 text-right">정산금액</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filtered.map((o) => {
                                    const sale = Number(o.total_price);
                                    const fee = Math.floor(sale * commissionRate);
                                    const net = sale - fee;
                                    return (
                                        <tr key={o.id} className="hover:bg-neutral-50">
                                            <td className="px-3 py-2 text-neutral-500 whitespace-nowrap">{o.created_at.substring(0, 10)}</td>
                                            <td className="px-3 py-2 text-neutral-900 max-w-[140px] truncate">{o.product?.title ?? "—"}</td>
                                            <td className="px-3 py-2 text-right font-medium">{sale.toLocaleString()}원</td>
                                            <td className="px-3 py-2 text-right text-neutral-500">−{fee.toLocaleString()}원</td>
                                            <td className="px-3 py-2 text-right font-bold text-neutral-900">{net.toLocaleString()}원</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-neutral-50 border-t-2 border-neutral-200">
                                    <td colSpan={2} className="px-3 py-2 font-bold text-neutral-900">합계</td>
                                    <td className="px-3 py-2 text-right font-bold">{totalSales.toLocaleString()}원</td>
                                    <td className="px-3 py-2 text-right text-neutral-500">−{commission.toLocaleString()}원</td>
                                    <td className="px-3 py-2 text-right font-bold text-neutral-900">{settlement.toLocaleString()}원</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
