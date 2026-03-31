"use client";

import { useState, useEffect } from "react";
import { useBumsFilter } from "../layout";
import { createClient } from "@/lib/supabase/client";
import { Gift, Plus, X, Tag, Percent, DollarSign, Copy, Check } from "lucide-react";

interface Promotion {
    id: string;
    site: string;
    name: string;
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    min_order: number;
    start_date: string;
    end_date: string;
    usage_limit: number;
    used_count: number;
    status: 'active' | 'inactive' | 'expired';
    created_at: string;
}

const PROMO_STATUSES = ['active', 'inactive', 'expired'] as const;

const statusColor: Record<string, string> = {
    active: 'bg-green-50 text-green-700',
    inactive: 'bg-neutral-100 text-neutral-500',
    expired: 'bg-red-50 text-red-600',
};

export default function PromotionPage() {
    const { selectedSiteId } = useBumsFilter();
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '', code: '', type: 'percent' as 'percent' | 'fixed',
        value: '', min_order: '', start_date: '', end_date: '', usage_limit: '',
    });
    const supabase = createClient();

    useEffect(() => { fetchPromos(); }, [selectedSiteId]);

    async function fetchPromos() {
        setLoading(true);
        let q = supabase.from('promotions').select('*').order('created_at', { ascending: false });
        if (selectedSiteId !== 'all') q = q.eq('site', selectedSiteId);
        const { data } = await q;
        setPromos((data || []) as Promotion[]);
        setLoading(false);
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        await supabase.from('promotions').insert({
            site: selectedSiteId === 'all' ? 'tenone' : selectedSiteId,
            name: form.name,
            code: form.code.toUpperCase(),
            type: form.type,
            value: Number(form.value),
            min_order: Number(form.min_order) || 0,
            start_date: form.start_date,
            end_date: form.end_date,
            usage_limit: Number(form.usage_limit) || 0,
            used_count: 0,
            status: 'active',
        });
        setForm({ name: '', code: '', type: 'percent', value: '', min_order: '', start_date: '', end_date: '', usage_limit: '' });
        setShowAdd(false);
        fetchPromos();
    }

    async function updateStatus(id: string, status: string) {
        await supabase.from('promotions').update({ status }).eq('id', id);
        setPromos(prev => prev.map(p => p.id === id ? { ...p, status: status as Promotion['status'] } : p));
    }

    function copyCode(code: string, id: string) {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    }

    const active = promos.filter(p => p.status === 'active').length;
    const totalUsed = promos.reduce((s, p) => s + p.used_count, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">프로모션</h1>
                    <p className="text-sm text-neutral-500 mt-1">할인 코드와 프로모션 이벤트를 관리합니다.</p>
                </div>
                <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white text-xs hover:bg-neutral-700 transition-colors">
                    <Plus className="h-3.5 w-3.5" /> 프로모션 추가
                </button>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                    { label: '전체 프로모션', value: promos.length },
                    { label: '활성', value: active },
                    { label: '총 사용 횟수', value: totalUsed },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-neutral-200 p-4">
                        <p className="text-xl font-bold">{s.value}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* 목록 */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                </div>
            ) : promos.length === 0 ? (
                <div className="bg-white border border-neutral-200 p-12 text-center">
                    <Gift className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">등록된 프로모션이 없습니다</p>
                    <button onClick={() => setShowAdd(true)} className="mt-3 text-xs underline text-neutral-500">첫 프로모션 만들기</button>
                </div>
            ) : (
                <div className="bg-white border border-neutral-200 divide-y divide-neutral-100">
                    {promos.map(p => {
                        const usageRate = p.usage_limit > 0 ? Math.round((p.used_count / p.usage_limit) * 100) : 0;
                        return (
                            <div key={p.id} className="px-5 py-4 hover:bg-neutral-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 font-medium ${statusColor[p.status]}`}>{p.status}</span>
                                            <span className="text-xs text-neutral-400">{p.site}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold">{p.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                                            <button onClick={() => copyCode(p.code, p.id)}
                                                className="flex items-center gap-1 px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded font-mono transition-colors">
                                                <Tag className="h-3 w-3" />
                                                {p.code}
                                                {copiedId === p.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                            </button>
                                            <span className="flex items-center gap-1">
                                                {p.type === 'percent' ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                                                {p.type === 'percent' ? `${p.value}%` : `₩${p.value.toLocaleString()}`} 할인
                                            </span>
                                            {p.min_order > 0 && <span>최소 ₩{p.min_order.toLocaleString()}</span>}
                                            <span>{p.start_date} ~ {p.end_date}</span>
                                        </div>
                                        {p.usage_limit > 0 && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="flex-1 h-1 bg-neutral-100 overflow-hidden">
                                                    <div className="h-full bg-neutral-700" style={{ width: `${usageRate}%` }} />
                                                </div>
                                                <span className="text-[10px] text-neutral-400">{p.used_count}/{p.usage_limit}</span>
                                            </div>
                                        )}
                                    </div>
                                    <select value={p.status} onChange={e => updateStatus(p.id, e.target.value)}
                                        className="text-xs border border-neutral-200 px-2 py-1 bg-white shrink-0">
                                        {PROMO_STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                            <h3 className="font-semibold">프로모션 추가</h3>
                            <button onClick={() => setShowAdd(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="p-5 space-y-3">
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">프로모션 이름 *</label>
                                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="봄 시즌 할인"
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">할인 코드 *</label>
                                    <input required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                        placeholder="SPRING2026"
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-neutral-900" />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">할인 유형</label>
                                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'percent' | 'fixed' }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm bg-white focus:outline-none">
                                        <option value="percent">퍼센트 (%)</option>
                                        <option value="fixed">고정금액 (₩)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">할인 값 *</label>
                                    <input required type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                                        placeholder={form.type === 'percent' ? '10' : '5000'}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">최소 주문금액</label>
                                    <input type="number" value={form.min_order} onChange={e => setForm(p => ({ ...p, min_order: e.target.value }))}
                                        placeholder="0"
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">시작일</label>
                                    <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">종료일</label>
                                    <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">사용 제한 (0 = 무제한)</label>
                                <input type="number" value={form.usage_limit} onChange={e => setForm(p => ({ ...p, usage_limit: e.target.value }))}
                                    placeholder="0"
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
