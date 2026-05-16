'use client';

// A/B 테스트 — mkt_experiments 실 DB
import { useEffect, useState } from 'react';
import { Plus, FlaskConical, X, Trophy, Calculator } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';
import { computeChiSquare, requiredSampleSize } from '@/lib/smarcomm/abtest-chi-square';

interface Variant { name: string; traffic: number; visitors?: number; conversions?: number; }
interface Experiment {
    id: string; name: string; brand_id: string; status: string; type: string;
    hypothesis: string; start_date: string | null; end_date: string | null;
    sample_size: number; confidence: number; variants: Variant[];
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

    const saveObs = async (e: Experiment, idx: number, field: 'visitors' | 'conversions', value: number) => {
        const next = e.variants.map((v, i) => i === idx ? { ...v, [field]: Math.max(0, value | 0) } : v);
        // 조기 종료 결정 — 유의 시 winner + confidence 자동 갱신
        const r = computeChiSquare(next.map(v => ({ name: v.name, visitors: v.visitors ?? 0, conversions: v.conversions ?? 0 })));
        const patch: Record<string, unknown> = { id: e.id, variants: next };
        if (r && r.winnerIdx !== null) {
            patch.winner = next[r.winnerIdx].name;
            patch.confidence = r.significance === '99' ? 99 : r.significance === '95' ? 95 : r.significance === '90' ? 90 : 0;
        }
        await fetch('/api/smarcomm/experiments', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
        });
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
                                        <ExperimentStats experiment={e} onObsChange={saveObs} />
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

function ExperimentStats({ experiment, onObsChange }: {
    experiment: Experiment;
    onObsChange: (e: Experiment, idx: number, field: 'visitors' | 'conversions', value: number) => void;
}) {
    const variants = experiment.variants;
    const result = computeChiSquare(variants.map(v => ({ name: v.name, visitors: v.visitors ?? 0, conversions: v.conversions ?? 0 })));

    const sigColor = result?.significance === '99' ? '#10b981'
        : result?.significance === '95' ? '#3b82f6'
        : result?.significance === '90' ? '#f59e0b'
        : '#94a3b8';

    return (
        <div className="mt-3">
            <div className="grid grid-cols-2 gap-2">
                {variants.map((v, i) => {
                    const rate = v.visitors && v.visitors > 0 ? ((v.conversions ?? 0) / v.visitors * 100) : null;
                    return (
                        <div key={i} className="rounded-lg border border-border p-3">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold text-text">{v.name}</div>
                                <div className="text-[10px] text-text-muted">트래픽 {v.traffic}%</div>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-1.5">
                                <label className="block">
                                    <span className="text-[9px] text-text-muted">방문자</span>
                                    <input
                                        type="number" min={0}
                                        value={v.visitors ?? ''}
                                        onChange={ev => onObsChange(experiment, i, 'visitors', Number(ev.target.value))}
                                        className="mt-0.5 w-full rounded border border-border px-2 py-1 text-xs"
                                        placeholder="0"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-[9px] text-text-muted">전환</span>
                                    <input
                                        type="number" min={0}
                                        value={v.conversions ?? ''}
                                        onChange={ev => onObsChange(experiment, i, 'conversions', Number(ev.target.value))}
                                        className="mt-0.5 w-full rounded border border-border px-2 py-1 text-xs"
                                        placeholder="0"
                                    />
                                </label>
                            </div>
                            <div className="mt-1.5 text-[10px] text-text-sub">
                                전환율 <span className="font-bold text-text">{rate === null ? '—' : rate.toFixed(2) + '%'}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {result && (variants.some(v => (v.visitors ?? 0) > 0)) && (
                <div className="mt-2 rounded-lg border px-3 py-2" style={{ borderColor: sigColor + '40', background: sigColor + '08' }}>
                    <div className="flex items-center gap-2 text-[11px]">
                        <Calculator size={11} style={{ color: sigColor }} />
                        <span className="font-semibold" style={{ color: sigColor }}>
                            {result.significance === 'none' ? '유의차 없음' : `${result.significance}% 신뢰수준`}
                        </span>
                        <span className="text-text-muted">·</span>
                        <span className="text-text-sub">χ² = {result.chiSquare.toFixed(3)}</span>
                        <span className="text-text-muted">·</span>
                        <span className="text-text-sub">p = {result.pValue < 0.001 ? '< 0.001' : result.pValue.toFixed(4)}</span>
                        {result.liftPct !== null && (
                            <>
                                <span className="text-text-muted">·</span>
                                <span className="text-text-sub">리프트 {result.liftPct > 0 ? '+' : ''}{result.liftPct.toFixed(1)}%</span>
                            </>
                        )}
                    </div>
                    <div className="mt-1 text-[10px] text-text-muted">{result.note}</div>
                    {!result.sampleAdequate && variants[0].visitors !== undefined && (
                        <SampleSizeHint variants={variants} />
                    )}
                </div>
            )}
        </div>
    );
}

function SampleSizeHint({ variants }: { variants: Variant[] }) {
    const a = variants[0];
    const baselineRate = a.visitors && a.visitors > 0 ? (a.conversions ?? 0) / a.visitors : 0;
    if (baselineRate <= 0) return null;
    const need10 = requiredSampleSize(baselineRate, 10);
    const need20 = requiredSampleSize(baselineRate, 20);
    return (
        <div className="mt-1 text-[10px] text-text-muted">
            🔬 출처: 정규근사 (α=0.05·power=0.80) · 10% 리프트 검출 표본 {Number.isFinite(need10) ? need10.toLocaleString() : '∞'}/변형 · 20% 리프트 {Number.isFinite(need20) ? need20.toLocaleString() : '∞'}/변형
        </div>
    );
}
