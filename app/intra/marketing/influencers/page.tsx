"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Star, TrendingUp, Plus, Instagram, Youtube, X } from "lucide-react";

interface Influencer {
    id: string;
    name: string;
    platform: string;
    tier: string;
    status: string;
    handle?: string;
    followers: number;
    engagement_rate: number;
    fee: number;
    category?: string;
    notes?: string;
}

const TIERS = ['Mega', 'Macro', 'Mid', 'Micro', 'Nano'];
const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Blog', 'Twitter'];
const STATUSES = ['Prospect', 'Contacted', 'Active', 'Completed', 'Declined'];

const tierColor: Record<string, string> = {
    Mega: 'bg-purple-50 text-purple-700',
    Macro: 'bg-blue-50 text-blue-700',
    Mid: 'bg-green-50 text-green-700',
    Micro: 'bg-yellow-50 text-yellow-700',
    Nano: 'bg-neutral-100 text-neutral-500',
};

const statusColor: Record<string, string> = {
    Prospect: 'bg-neutral-100 text-neutral-500',
    Contacted: 'bg-blue-50 text-blue-700',
    Active: 'bg-green-50 text-green-700',
    Completed: 'bg-neutral-100 text-neutral-400',
    Declined: 'bg-red-50 text-red-600',
};

const PlatformIcon = ({ platform }: { platform: string }) => {
    if (platform === 'Instagram') return <Instagram className="h-3.5 w-3.5" />;
    if (platform === 'YouTube') return <Youtube className="h-3.5 w-3.5" />;
    return <Star className="h-3.5 w-3.5" />;
};

export default function InfluencersPage() {
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', platform: 'Instagram', tier: 'Micro', handle: '', followers: '', fee: '', category: '', notes: '' });
    const supabase = createClient();

    useEffect(() => {
        fetchInfluencers();
    }, []);

    async function fetchInfluencers() {
        setLoading(true);
        const { data } = await supabase
            .from('mkt_influencers')
            .select('*')
            .order('created_at', { ascending: false });
        setInfluencers(data || []);
        setLoading(false);
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        await supabase.from('mkt_influencers').insert({
            name: form.name,
            platform: form.platform,
            tier: form.tier,
            status: 'Prospect',
            handle: form.handle || null,
            followers: Number(form.followers) || 0,
            fee: Number(form.fee) || 0,
            category: form.category || null,
            notes: form.notes || null,
        });
        setForm({ name: '', platform: 'Instagram', tier: 'Micro', handle: '', followers: '', fee: '', category: '', notes: '' });
        setShowAdd(false);
        fetchInfluencers();
    }

    async function updateStatus(id: string, status: string) {
        await supabase.from('mkt_influencers').update({ status }).eq('id', id);
        setInfluencers(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    }

    const filtered = filter === 'all' ? influencers : influencers.filter(i => i.tier === filter || i.status === filter);

    const totalFee = influencers.filter(i => i.status === 'Active').reduce((s, i) => s + i.fee, 0);
    const activeCount = influencers.filter(i => i.status === 'Active').length;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Influencers</h2>
                    <p className="mt-1 text-sm text-neutral-500">인플루언서 협업 관리</p>
                </div>
                <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white text-xs hover:bg-neutral-700 transition-colors">
                    <Plus className="h-3.5 w-3.5" /> 추가
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: '전체', value: influencers.length, icon: Users },
                    { label: 'Active', value: activeCount, icon: TrendingUp },
                    { label: '활성 예산', value: `₩${(totalFee / 10000).toLocaleString()}만`, icon: Star },
                    { label: '평균 팔로워', value: influencers.length > 0 ? `${Math.round(influencers.reduce((s, i) => s + i.followers, 0) / influencers.length / 1000)}K` : '0', icon: Users },
                ].map(stat => (
                    <div key={stat.label} className="border border-neutral-200 bg-white p-4">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-neutral-500">{stat.label}</p>
                            <stat.icon className="h-4 w-4 text-neutral-300" />
                        </div>
                        <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {['all', ...TIERS, ...STATUSES].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`text-xs px-2.5 py-1 border transition-colors ${filter === f ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}>
                        {f === 'all' ? '전체' : f}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-neutral-400">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">등록된 인플루언서가 없습니다</p>
                    <button onClick={() => setShowAdd(true)} className="mt-3 text-xs underline">첫 인플루언서 추가</button>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(inf => (
                        <div key={inf.id} className="border border-neutral-200 bg-white p-4 hover:border-neutral-400 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <PlatformIcon platform={inf.platform} />
                                        <h3 className="text-sm font-semibold">{inf.name}</h3>
                                    </div>
                                    {inf.handle && <p className="text-xs text-neutral-400">@{inf.handle}</p>}
                                </div>
                                <span className={`text-xs px-1.5 py-0.5 ${tierColor[inf.tier] || 'bg-neutral-100 text-neutral-500'}`}>{inf.tier}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                                <span>{(inf.followers / 1000).toFixed(1)}K 팔로워</span>
                                <span>·</span>
                                <span>참여율 {inf.engagement_rate}%</span>
                                {inf.fee > 0 && <><span>·</span><span>₩{(inf.fee / 10000).toLocaleString()}만</span></>}
                            </div>
                            {inf.category && <p className="text-xs text-neutral-400 mb-2">{inf.category}</p>}
                            <div className="flex items-center justify-between">
                                <span className={`text-xs px-1.5 py-0.5 ${statusColor[inf.status] || 'bg-neutral-100 text-neutral-500'}`}>{inf.status}</span>
                                <select value={inf.status} onChange={e => updateStatus(inf.id, e.target.value)}
                                    className="text-xs border border-neutral-200 px-1.5 py-0.5 bg-white text-neutral-600">
                                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                            <h3 className="font-semibold">인플루언서 추가</h3>
                            <button onClick={() => setShowAdd(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="p-5 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">이름 *</label>
                                    <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">핸들</label>
                                    <input value={form.handle} onChange={e => setForm(p => ({ ...p, handle: e.target.value }))}
                                        placeholder="@handle"
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">플랫폼</label>
                                    <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm bg-white focus:outline-none">
                                        {PLATFORMS.map(pl => <option key={pl}>{pl}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">티어</label>
                                    <select value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm bg-white focus:outline-none">
                                        {TIERS.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">팔로워 수</label>
                                    <input type="number" value={form.followers} onChange={e => setForm(p => ({ ...p, followers: e.target.value }))}
                                        placeholder="10000"
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">단가 (원)</label>
                                    <input type="number" value={form.fee} onChange={e => setForm(p => ({ ...p, fee: e.target.value }))}
                                        placeholder="500000"
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">카테고리</label>
                                <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                    placeholder="뷰티, 패션, 테크 등"
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowAdd(false)}
                                    className="flex-1 border border-neutral-200 py-2 text-sm hover:bg-neutral-50 transition-colors">취소</button>
                                <button type="submit"
                                    className="flex-1 bg-neutral-900 text-white py-2 text-sm hover:bg-neutral-700 transition-colors">추가</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
