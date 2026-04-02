"use client";

import { useState, useEffect } from "react";
import { useBumsFilter } from "../layout";
import { createClient } from "@/lib/supabase/client";
import { ShoppingCart, Package, Plus, X, Tag, RefreshCw } from "lucide-react";

interface Product {
    id: string;
    site: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    status: 'active' | 'inactive' | 'soldout';
    image_url?: string;
    created_at: string;
}

interface Order {
    id: string;
    site: string;
    product_name: string;
    buyer_name: string;
    buyer_email: string;
    amount: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    created_at: string;
}

const PRODUCT_STATUSES = ['active', 'inactive', 'soldout'] as const;
const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

const orderStatusColor: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700',
    paid: 'bg-blue-50 text-blue-700',
    shipped: 'bg-purple-50 text-purple-700',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-600',
};

const productStatusColor: Record<string, string> = {
    active: 'bg-green-50 text-green-700',
    inactive: 'bg-neutral-100 text-neutral-500',
    soldout: 'bg-red-50 text-red-600',
};

export default function ShopPage() {
    const { selectedSiteId } = useBumsFilter();
    const [tab, setTab] = useState<'products' | 'orders'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', price: '', stock: '', category: '' });
    const supabase = createClient();

    useEffect(() => { fetchAll(); }, [selectedSiteId, tab]);

    async function fetchAll() {
        setLoading(true);
        if (tab === 'products') {
            let q = supabase.from('shop_products').select('*').order('created_at', { ascending: false });
            if (selectedSiteId !== 'all') q = q.eq('site', selectedSiteId);
            const { data } = await q;
            setProducts((data || []) as Product[]);
        } else {
            let q = supabase.from('shop_orders').select('*').order('created_at', { ascending: false }).limit(50);
            if (selectedSiteId !== 'all') q = q.eq('site', selectedSiteId);
            const { data } = await q;
            setOrders((data || []) as Order[]);
        }
        setLoading(false);
    }

    async function handleAddProduct(e: React.FormEvent) {
        e.preventDefault();
        await supabase.from('shop_products').insert({
            site: selectedSiteId === 'all' ? 'tenone' : selectedSiteId,
            name: form.name,
            price: Number(form.price),
            stock: Number(form.stock) || 0,
            category: form.category || '기타',
            status: 'active',
        });
        setForm({ name: '', price: '', stock: '', category: '' });
        setShowAdd(false);
        fetchAll();
    }

    async function updateOrderStatus(id: string, status: string) {
        await supabase.from('shop_orders').update({ status }).eq('id', id);
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as Order['status'] } : o));
    }

    async function updateProductStatus(id: string, status: string) {
        await supabase.from('shop_products').update({ status }).eq('id', id);
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: status as Product['status'] } : p));
    }

    const totalRevenue = orders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status)).reduce((s, o) => s + o.amount, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">쇼핑 관리</h1>
                    <p className="text-sm text-neutral-500 mt-1">상품, 주문, 결제를 관리합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchAll} className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 text-xs hover:bg-neutral-50 transition-colors">
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    {tab === 'products' && (
                        <button onClick={() => setShowAdd(true)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white text-xs hover:bg-neutral-700 transition-colors">
                            <Plus className="h-3.5 w-3.5" /> 상품 추가
                        </button>
                    )}
                </div>
            </div>

            {/* 요약 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: '상품 수', value: products.length },
                    { label: '총 주문', value: orders.length },
                    { label: '처리 대기', value: pendingOrders },
                    { label: '총 매출', value: `₩${Math.round(totalRevenue / 10000).toLocaleString()}만` },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-neutral-200 p-4">
                        <p className="text-xl font-bold">{s.value}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* 탭 */}
            <div className="flex border-b border-neutral-200">
                {(['products', 'orders'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
                        {t === 'products' ? '상품 관리' : '주문 관리'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                </div>
            ) : tab === 'products' ? (
                products.length === 0 ? (
                    <div className="bg-white border border-neutral-200 p-12 text-center">
                        <Package className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                        <p className="text-sm text-neutral-400">등록된 상품이 없습니다</p>
                        <button onClick={() => setShowAdd(true)} className="mt-3 text-xs underline text-neutral-500">첫 상품 추가</button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map(p => (
                            <div key={p.id} className="bg-white border border-neutral-200 p-4 hover:border-neutral-400 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 ${productStatusColor[p.status]}`}>{p.status}</span>
                                    <select value={p.status} onChange={e => updateProductStatus(p.id, e.target.value)}
                                        className="text-xs border border-neutral-200 px-1.5 py-0.5 bg-white">
                                        {PRODUCT_STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <h3 className="text-sm font-semibold mb-1">{p.name}</h3>
                                <div className="flex items-center gap-3 text-xs text-neutral-500">
                                    <span className="font-medium text-neutral-900">₩{p.price.toLocaleString()}</span>
                                    <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{p.category}</span>
                                    <span>재고 {p.stock}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                orders.length === 0 ? (
                    <div className="bg-white border border-neutral-200 p-12 text-center">
                        <ShoppingCart className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                        <p className="text-sm text-neutral-400">주문 내역이 없습니다</p>
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 divide-y divide-neutral-100">
                        {orders.map(o => (
                            <div key={o.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-neutral-50 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-medium truncate">{o.product_name}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 shrink-0 ${orderStatusColor[o.status]}`}>{o.status}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                                        <span>{o.buyer_name}</span>
                                        <span>{o.buyer_email}</span>
                                        <span className="font-medium text-neutral-700">₩{o.amount.toLocaleString()}</span>
                                        <span>{o.created_at.split('T')[0]}</span>
                                    </div>
                                </div>
                                <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                                    className="text-xs border border-neutral-200 px-2 py-1 bg-white shrink-0">
                                    {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Add Product Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-sm">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                            <h3 className="font-semibold">상품 추가</h3>
                            <button onClick={() => setShowAdd(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleAddProduct} className="p-5 space-y-3">
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">상품명 *</label>
                                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">가격 (원) *</label>
                                    <input required type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                        placeholder="10000"
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">재고</label>
                                    <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                                        placeholder="0"
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">카테고리</label>
                                <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                    placeholder="굿즈, 디지털, 서비스 등"
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowAdd(false)}
                                    className="flex-1 border border-neutral-200 py-2 text-sm hover:bg-neutral-50">취소</button>
                                <button type="submit"
                                    className="flex-1 bg-neutral-900 text-white py-2 text-sm hover:bg-neutral-700">추가</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
