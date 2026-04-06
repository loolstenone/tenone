"use client";

import { useState, useEffect } from "react";
import { fetchCampaigns, createCampaign } from "@/lib/supabase/marketing";

import { Campaign, CampaignType, CampaignStatus } from "@/types/marketing";
import { DollarSign, Loader2, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

const CAMPAIGN_TYPES: CampaignType[] = ['Brand', 'Product', 'Event', 'Content', 'Partnership'];
const CAMPAIGN_STATUSES: CampaignStatus[] = ['Draft', 'Active', 'Paused', 'Completed'];
const ALL_CHANNELS = ['Instagram', 'YouTube', 'TikTok', 'Email', 'Blog', 'Paid', 'SEO', 'Event'];

const EMPTY_FORM = {
    name: '',
    type: 'Brand' as CampaignType,
    status: 'Draft' as CampaignStatus,
    budget: '',
    startDate: '',
    endDate: '',
    assignee: '',
    description: '',
    kpi: '',
    channels: [] as string[],
};

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchCampaigns()
            .then(data => {
                if (cancelled) return;
                setCampaigns(data);
            })
            .catch(() => {
                if (!cancelled) setCampaigns([]);
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);

    const toggleChannel = (ch: string) => {
        setForm(f => ({
            ...f,
            channels: f.channels.includes(ch)
                ? f.channels.filter(c => c !== ch)
                : [...f.channels, ch],
        }));
    };

    const handleCreate = async () => {
        if (!form.name.trim()) { setFormError('캠페인 이름을 입력하세요.'); return; }
        if (!form.startDate) { setFormError('시작일을 입력하세요.'); return; }
        setSaving(true);
        setFormError('');
        try {
            const created = await createCampaign({
                name: form.name.trim(),
                type: form.type,
                status: form.status,
                brandId: 'tenone',
                description: form.description.trim(),
                budget: Number(form.budget) || 0,
                spent: 0,
                kpi: form.kpi.trim(),
                assignee: form.assignee.trim(),
                startDate: form.startDate,
                endDate: form.endDate || undefined,
                channels: form.channels,
            });
            setCampaigns(prev => [created, ...prev]);
            setShowModal(false);
            setForm({ ...EMPTY_FORM });
        } catch {
            setFormError('저장에 실패했습니다. 다시 시도하세요.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <PageHeader title="Campaigns" description="마케팅 캠페인을 관리합니다." />
                <button
                    onClick={() => { setShowModal(true); setFormError(''); }}
                    className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 transition-colors mt-1"
                >
                    <Plus className="h-3.5 w-3.5" />
                    새 캠페인
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="border border-neutral-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'Active').length}</p>
                            <p className="text-xs text-neutral-500">Active</p>
                        </div>
                        <div className="border border-neutral-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold">₩{(totalBudget / 10000).toLocaleString()}만</p>
                            <p className="text-xs text-neutral-500">총 예산</p>
                        </div>
                        <div className="border border-neutral-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold">₩{(totalSpent / 10000).toLocaleString()}만</p>
                            <p className="text-xs text-neutral-500">총 집행</p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {campaigns.map(camp => {
                            const spendRate = camp.budget > 0 ? Math.round((camp.spent / camp.budget) * 100) : 0;
                            return (
                                <div key={camp.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-400 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-sm font-semibold">{camp.name}</h3>
                                            <p className="text-xs mt-0.5 text-neutral-500">{camp.type}</p>
                                        </div>
                                        <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{camp.status}</span>
                                    </div>
                                    <p className="text-sm text-neutral-500">{camp.description}</p>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
                                        <span>{camp.startDate}</span>
                                        {camp.endDate && <><span>→</span><span>{camp.endDate}</span></>}
                                        <span>·</span>
                                        <span>{camp.assignee}</span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <DollarSign className="h-3 w-3 text-neutral-300" />
                                        <div className="flex-1 h-1.5 bg-neutral-100 overflow-hidden">
                                            <div className="h-full bg-neutral-900" style={{ width: `${spendRate}%` }} />
                                        </div>
                                        <span className="text-xs text-neutral-400">₩{(camp.spent / 10000).toLocaleString()}만 / {(camp.budget / 10000).toLocaleString()}만</span>
                                    </div>
                                    <div className="flex gap-1 mt-3">{camp.channels.map(ch => <span key={ch} className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{ch}</span>)}</div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* 새 캠페인 모달 */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg bg-white shadow-xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                            <h2 className="text-sm font-semibold">새 캠페인</h2>
                            <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* 이름 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">캠페인 이름 *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="예: Q2 브랜드 캠페인"
                                />
                            </div>
                            {/* 유형 + 상태 */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">유형</label>
                                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as CampaignType }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400">
                                        {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">상태</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as CampaignStatus }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400">
                                        {CAMPAIGN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* 예산 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">예산 (원)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.budget}
                                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="예: 5000000"
                                />
                                {form.budget && (
                                    <p className="mt-1 text-xs text-neutral-400">₩{Number(form.budget).toLocaleString()} ({(Number(form.budget) / 10000).toLocaleString()}만원)</p>
                                )}
                            </div>
                            {/* 시작일 / 종료일 */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">시작일 *</label>
                                    <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">종료일</label>
                                    <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400" />
                                </div>
                            </div>
                            {/* 담당자 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">담당자</label>
                                <input type="text" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="예: 김민수" />
                            </div>
                            {/* KPI */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">KPI</label>
                                <input type="text" value={form.kpi} onChange={e => setForm(f => ({ ...f, kpi: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="예: 팔로워 +10,000" />
                            </div>
                            {/* 채널 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">채널</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {ALL_CHANNELS.map(ch => (
                                        <button key={ch} type="button" onClick={() => toggleChannel(ch)}
                                            className={`text-xs px-2.5 py-1 border transition-colors ${form.channels.includes(ch) ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}>
                                            {ch}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* 설명 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">설명</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={2}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400 resize-none"
                                    placeholder="캠페인 목표 및 주요 내용" />
                            </div>

                            {formError && <p className="text-xs text-red-500">{formError}</p>}
                        </div>
                        <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-100">
                            <button onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-xs text-neutral-500 border border-neutral-200 hover:bg-neutral-50">
                                취소
                            </button>
                            <button onClick={handleCreate} disabled={saving}
                                className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors">
                                {saving ? '저장 중...' : '캠페인 생성'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
