'use client';

// 광고 캠페인 — marketing_campaigns 실 DB
import { useEffect, useState } from 'react';
import { Plus, Megaphone, X, TrendingUp } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

interface Campaign {
    id: string; name: string; type: string; status: string; brand_id: string;
    budget: number; spent: number; start_date: string | null; end_date: string | null;
    target_audience: string; channel: string; metrics: Record<string, unknown>; created_at: string;
}
interface CampaignResp {
    campaigns: Campaign[]; total: number; totalBudget: number; totalSpent: number;
    byStatus: Record<string, number>; byChannel: Record<string, number>;
}

const STATUS_COLOR: Record<string, string> = {
    draft: '#94a3b8', scheduled: '#3b82f6', running: '#10b981', paused: '#f59e0b',
    completed: '#64748b', cancelled: '#ef4444',
};
const STATUS_LABEL: Record<string, string> = {
    draft: '초안', scheduled: '예약', running: '집행 중', paused: '일시정지',
    completed: '완료', cancelled: '취소',
};
const CHANNEL_LABEL: Record<string, string> = {
    naver_sa: '네이버 SA', naver_da: '네이버 DA', google_ads: '구글 광고',
    meta: '메타', kakao: '카카오', youtube: '유튜브', email: '이메일',
};

export default function CampaignsPage() {
    const [data, setData] = useState<CampaignResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: '', channel: 'naver_sa', budget: '', start_date: '', end_date: '', target_audience: '' });

    const reload = () => {
        setLoading(true);
        fetch('/api/smarcomm/campaigns').then(r => r.json()).then(setData).finally(() => setLoading(false));
    };
    useEffect(reload, []);

    const submit = async () => {
        if (!form.name.trim()) return;
        await fetch('/api/smarcomm/campaigns', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, budget: parseInt(form.budget || '0', 10) }),
        });
        setShowCreate(false);
        setForm({ name: '', channel: 'naver_sa', budget: '', start_date: '', end_date: '', target_audience: '' });
        reload();
    };

    const del = async (id: string) => {
        if (!confirm('삭제하시겠습니까?')) return;
        await fetch(`/api/smarcomm/campaigns?id=${id}`, { method: 'DELETE' });
        reload();
    };

    const utilization = data && data.totalBudget > 0 ? Math.round((data.totalSpent / data.totalBudget) * 100) : 0;

    return (
        <div className="max-w-5xl">
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">광고 캠페인</h1><GuideHelpButton /></div>
                    <p className="mt-1 text-xs text-text-muted">매체별 광고 캠페인의 예산·집행 현황을 관리합니다</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
                    <Plus size={15} /> 새 캠페인
                </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Kpi label="캠페인 수" value={data?.total ?? 0} accent="#0F172A" loading={loading} />
                <Kpi label="집행 중" value={data?.byStatus.running ?? 0} accent="#10b981" loading={loading} />
                <Kpi label="총 예산" value={data?.totalBudget ?? 0} accent="#3b82f6" loading={loading} format={v => `₩${(v / 10000).toLocaleString()}만`} />
                <Kpi label="집행률" value={utilization} accent="#8b5cf6" loading={loading} suffix="%" />
            </div>

            {!loading && data && data.campaigns.length === 0 ? (
                <div className="rounded-2xl border border-border bg-white p-12 text-center">
                    <Megaphone size={32} className="mx-auto mb-3 text-text-muted" />
                    <div className="text-sm font-semibold text-text">아직 캠페인이 없습니다</div>
                    <p className="mt-2 text-xs text-text-muted">"새 캠페인"으로 매체·예산·기간을 등록하세요. 외부 광고 매체 API 연동 시 spent·CTR 자동 갱신.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data?.campaigns.map(c => {
                        const pct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0;
                        return (
                            <div key={c.id} className="rounded-2xl border border-border bg-white p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                                                style={{ background: (STATUS_COLOR[c.status] || '#64748b') + '15', color: STATUS_COLOR[c.status] || '#64748b' }}>
                                                {STATUS_LABEL[c.status] || c.status}
                                            </span>
                                            {c.channel && <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-text-sub">{CHANNEL_LABEL[c.channel] || c.channel}</span>}
                                            {c.brand_id && <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-text-sub">{c.brand_id}</span>}
                                        </div>
                                        <h3 className="text-sm font-semibold text-text">{c.name}</h3>
                                        {c.target_audience && <p className="mt-1 text-[10px] text-text-muted">타겟: {c.target_audience}</p>}

                                        <div className="mt-3 flex items-center gap-4 text-[10px] text-text-muted">
                                            {c.start_date && <span>시작 {c.start_date}</span>}
                                            {c.end_date && <span>종료 {c.end_date}</span>}
                                        </div>

                                        {c.budget > 0 && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-[10px] mb-1">
                                                    <span className="text-text-muted">예산 집행</span>
                                                    <span className="text-text-sub">₩{c.spent.toLocaleString()} / ₩{c.budget.toLocaleString()} ({pct}%)</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                                                    <div className="h-full rounded-full bg-info" style={{ width: `${Math.min(pct, 100)}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => del(c.id)} className="rounded-lg p-1.5 text-text-muted hover:bg-surface hover:text-danger" title="삭제">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="mb-4 text-base font-bold text-text">새 캠페인</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-text-muted">캠페인명</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">채널</label>
                                <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm">
                                    {Object.entries(CHANNEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">예산 (원)</label>
                                <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                                    placeholder="1000000"
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-text-muted">시작</label>
                                    <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted">종료</label>
                                    <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                                        className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">타겟 오디언스</label>
                                <input value={form.target_audience} onChange={e => setForm({ ...form, target_audience: e.target.value })}
                                    placeholder="25-44 직장인 마케터"
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div className="mt-5 flex gap-2 justify-end">
                            <button onClick={() => setShowCreate(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-text-sub hover:bg-surface">취소</button>
                            <button onClick={submit} disabled={!form.name.trim()} className="rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">생성</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted leading-relaxed">
                <strong className="text-text-sub">🔬 출처</strong> · DB <code className="font-mono text-[10px]">marketing_campaigns</code> · 캠페인 메타(예산·기간·채널·타겟). spent·CTR·CPA 등은 매체별 API 연동 시 자동 갱신(Phase C 예정).
            </div>
        </div>
    );
}

function Kpi({ label, value, accent, loading, suffix, format }: { label: string; value: number; accent: string; loading: boolean; suffix?: string; format?: (n: number) => string }) {
    return (
        <div className="rounded-2xl border border-border bg-white p-4">
            <div className="text-xs text-text-muted">{label}</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: accent }}>
                {loading ? '—' : (format ? format(value) : `${value.toLocaleString()}${suffix ?? ''}`)}
            </div>
        </div>
    );
}
