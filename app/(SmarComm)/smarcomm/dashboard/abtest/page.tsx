'use client';

// A/B 테스트 — mkt_experiments 실 DB
import { useEffect, useState } from 'react';
import { Plus, FlaskConical, X, Trophy } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

interface Experiment {
    id: string; name: string; brand_id: string; status: string; type: string;
    hypothesis: string; start_date: string | null; end_date: string | null;
    sample_size: number; confidence: number; variants: { name: string; traffic: number }[];
    winner: string | null; notes: string; created_at: string;
}
interface ExpResp { experiments: Experiment[]; total: number; byStatus: Record<string, number> }

const STATUS_COLOR: Record<string, string> = {
    draft: '#94a3b8', running: '#3b82f6', paused: '#f59e0b', completed: '#10b981', cancelled: '#ef4444',
};
const STATUS_LABEL: Record<string, string> = {
    draft: '초안', running: '진행 중', paused: '일시정지', completed: '종료', cancelled: '취소',
};

export default function AbtestPage() {
    const [data, setData] = useState<ExpResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: '', hypothesis: '', type: 'split', start_date: '', end_date: '' });

    const reload = () => {
        setLoading(true);
        fetch('/api/smarcomm/experiments').then(r => r.json()).then(setData).finally(() => setLoading(false));
    };
    useEffect(reload, []);

    const submit = async () => {
        if (!form.name.trim()) return;
        await fetch('/api/smarcomm/experiments', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setShowCreate(false);
        setForm({ name: '', hypothesis: '', type: 'split', start_date: '', end_date: '' });
        reload();
    };

    const del = async (id: string) => {
        if (!confirm('삭제하시겠습니까?')) return;
        await fetch(`/api/smarcomm/experiments?id=${id}`, { method: 'DELETE' });
        reload();
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">A/B 테스트</h1><GuideHelpButton /></div>
                    <p className="mt-1 text-xs text-text-muted">가설을 변형 비교로 검증합니다</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
                    <Plus size={15} /> 새 실험
                </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Kpi label="전체" value={data?.total ?? 0} accent="#0F172A" loading={loading} />
                <Kpi label="진행 중" value={data?.byStatus.running ?? 0} accent="#3b82f6" loading={loading} />
                <Kpi label="종료" value={data?.byStatus.completed ?? 0} accent="#10b981" loading={loading} />
                <Kpi label="초안" value={data?.byStatus.draft ?? 0} accent="#94a3b8" loading={loading} />
            </div>

            {!loading && data && data.experiments.length === 0 ? (
                <div className="rounded-2xl border border-border bg-white p-12 text-center">
                    <FlaskConical size={32} className="mx-auto mb-3 text-text-muted" />
                    <div className="text-sm font-semibold text-text">아직 실험이 없습니다</div>
                    <p className="mt-2 text-xs text-text-muted">"새 실험"으로 가설·변형·기간을 정의해 첫 A/B 테스트를 시작하세요.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data?.experiments.map(e => (
                        <div key={e.id} className="rounded-2xl border border-border bg-white p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                                            style={{ background: (STATUS_COLOR[e.status] || '#64748b') + '15', color: STATUS_COLOR[e.status] || '#64748b' }}>
                                            {STATUS_LABEL[e.status] || e.status}
                                        </span>
                                        <span className="text-[10px] text-text-muted">{e.type}</span>
                                        {e.winner && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] text-success">
                                                <Trophy size={9} /> {e.winner} 승
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-semibold text-text">{e.name}</h3>
                                    {e.hypothesis && <p className="mt-1 text-xs text-text-sub line-clamp-2">{e.hypothesis}</p>}
                                    {e.variants && Array.isArray(e.variants) && e.variants.length > 0 && (
                                        <div className="mt-3 flex gap-2">
                                            {e.variants.map((v, i) => (
                                                <div key={i} className="flex-1 rounded-lg border border-border px-3 py-2">
                                                    <div className="text-[10px] text-text-muted">{v.name}</div>
                                                    <div className="text-sm font-bold text-text">{v.traffic}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-2 flex items-center gap-4 text-[10px] text-text-muted">
                                        {e.start_date && <span>시작 {e.start_date}</span>}
                                        {e.end_date && <span>종료 {e.end_date}</span>}
                                        {e.sample_size > 0 && <span>샘플 {e.sample_size.toLocaleString()}</span>}
                                        {e.confidence > 0 && <span>신뢰도 {e.confidence}%</span>}
                                    </div>
                                </div>
                                <button onClick={() => del(e.id)} className="rounded-lg p-1.5 text-text-muted hover:bg-surface hover:text-danger" title="삭제">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="mb-4 text-base font-bold text-text">새 A/B 실험</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-text-muted">실험명</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="예: 헤드라인 카피 A vs B"
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-text focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">가설</label>
                                <textarea value={form.hypothesis} onChange={e => setForm({ ...form, hypothesis: e.target.value })} rows={2}
                                    placeholder="예: 짧은 헤드라인이 CTR을 20% 높일 것"
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-text focus:outline-none" />
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
                        </div>
                        <div className="mt-5 flex gap-2 justify-end">
                            <button onClick={() => setShowCreate(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-text-sub hover:bg-surface">취소</button>
                            <button onClick={submit} disabled={!form.name.trim()} className="rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">생성</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted leading-relaxed">
                <strong className="text-text-sub">🔬 출처</strong> · DB <code className="font-mono text-[10px]">mkt_experiments</code> · 변형은 jsonb로 저장(name + traffic %). 결과 데이터 자동 집계는 외부 분석 SDK 연동 시 활성화.
            </div>
        </div>
    );
}

function Kpi({ label, value, accent, loading }: { label: string; value: number; accent: string; loading: boolean }) {
    return (
        <div className="rounded-2xl border border-border bg-white p-4">
            <div className="text-xs text-text-muted">{label}</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: accent }}>{loading ? '—' : value.toLocaleString()}</div>
        </div>
    );
}
