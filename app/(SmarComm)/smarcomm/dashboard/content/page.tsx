'use client';

// 콘텐츠 라이브러리 — marketing_content 실 DB
import { useEffect, useState } from 'react';
import { Plus, FileText, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

interface Item {
    id: string; title: string; type: string; status: string; brand_id: string;
    content: string; channels: string[]; published_at: string | null; created_at: string;
}
interface ContentResp { items: Item[]; total: number; byStatus: Record<string, number>; byType: Record<string, number> }

const TYPE_LABEL: Record<string, string> = {
    blog: '블로그', social: '소셜', newsletter: '뉴스레터', press: '보도자료', case: '사례',
};
const STATUS_COLOR: Record<string, string> = {
    draft: '#94a3b8', review: '#f59e0b', scheduled: '#3b82f6', published: '#10b981', archived: '#64748b',
};
const STATUS_LABEL: Record<string, string> = {
    draft: '초안', review: '리뷰', scheduled: '예약', published: '발행', archived: '보관',
};

export default function ContentPage() {
    const [data, setData] = useState<ContentResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [form, setForm] = useState({ title: '', type: 'blog', content: '', channels: '' });

    const reload = () => {
        setLoading(true);
        fetch('/api/smarcomm/content').then(r => r.json()).then(setData).finally(() => setLoading(false));
    };
    useEffect(reload, []);

    const submit = async () => {
        if (!form.title.trim()) return;
        await fetch('/api/smarcomm/content', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                channels: form.channels.split(',').map(s => s.trim()).filter(Boolean),
            }),
        });
        setShowCreate(false);
        setForm({ title: '', type: 'blog', content: '', channels: '' });
        reload();
    };

    const del = async (id: string) => {
        if (!confirm('삭제하시겠습니까?')) return;
        await fetch(`/api/smarcomm/content?id=${id}`, { method: 'DELETE' });
        reload();
    };

    const filtered = data?.items.filter(i => !statusFilter || i.status === statusFilter) ?? [];

    return (
        <div className="max-w-5xl">
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">콘텐츠 라이브러리</h1><GuideHelpButton /></div>
                    <p className="mt-1 text-xs text-text-muted">발행물 메타·상태·채널을 통합 관리합니다 (단건 카피·이미지는 AI 소재 제작 참조)</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/smarcomm/dashboard/creative" className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-semibold text-text-sub hover:bg-surface">
                        AI 소재 제작 <ExternalLink size={11} />
                    </Link>
                    <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
                        <Plus size={15} /> 새 콘텐츠
                    </button>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Kpi label="전체" value={data?.total ?? 0} accent="#0F172A" loading={loading} />
                <Kpi label="초안" value={data?.byStatus.draft ?? 0} accent="#94a3b8" loading={loading} />
                <Kpi label="리뷰" value={data?.byStatus.review ?? 0} accent="#f59e0b" loading={loading} />
                <Kpi label="예약" value={data?.byStatus.scheduled ?? 0} accent="#3b82f6" loading={loading} />
                <Kpi label="발행" value={data?.byStatus.published ?? 0} accent="#10b981" loading={loading} />
            </div>

            {Object.keys(data?.byStatus ?? {}).length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-text-muted">상태:</span>
                    <button onClick={() => setStatusFilter(null)}
                        className={`rounded-full px-3 py-1 text-xs ${!statusFilter ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>전체</button>
                    {Object.entries(data!.byStatus).map(([s, count]) => (
                        <button key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                            className={`rounded-full px-3 py-1 text-xs ${statusFilter === s ? 'text-white' : 'hover:opacity-80'}`}
                            style={statusFilter === s ? { background: STATUS_COLOR[s] || '#64748b' } : { background: (STATUS_COLOR[s] || '#64748b') + '15', color: STATUS_COLOR[s] || '#64748b' }}>
                            {STATUS_LABEL[s] || s} · {count}
                        </button>
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 ? (
                <div className="rounded-2xl border border-border bg-white p-12 text-center">
                    <FileText size={32} className="mx-auto mb-3 text-text-muted" />
                    <div className="text-sm font-semibold text-text">
                        {(data?.total ?? 0) === 0 ? '아직 콘텐츠가 없습니다' : '필터 결과 없음'}
                    </div>
                    <p className="mt-2 text-xs text-text-muted">발행물(블로그·뉴스레터·소셜 등) 메타를 등록해 라이브러리를 구축하세요.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(i => (
                        <div key={i.id} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:bg-surface">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-text-sub">{TYPE_LABEL[i.type] || i.type}</span>
                                    <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                                        style={{ background: (STATUS_COLOR[i.status] || '#64748b') + '15', color: STATUS_COLOR[i.status] || '#64748b' }}>
                                        {STATUS_LABEL[i.status] || i.status}
                                    </span>
                                </div>
                                <div className="text-sm font-semibold text-text truncate">{i.title}</div>
                                {i.channels.length > 0 && (
                                    <div className="mt-1 text-[10px] text-text-muted">채널: {i.channels.join(', ')}</div>
                                )}
                            </div>
                            <span className="text-xs text-text-muted">{i.created_at}</span>
                            <button onClick={() => del(i.id)} className="rounded-lg p-1.5 text-text-muted hover:text-danger" title="삭제">
                                <X size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="mb-4 text-base font-bold text-text">새 콘텐츠</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-text-muted">제목</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">유형</label>
                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm">
                                    {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">채널 (쉼표 구분)</label>
                                <input value={form.channels} onChange={e => setForm({ ...form, channels: e.target.value })}
                                    placeholder="블로그, 인스타그램, 뉴스레터"
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">본문 (요약)</label>
                                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div className="mt-5 flex gap-2 justify-end">
                            <button onClick={() => setShowCreate(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-text-sub hover:bg-surface">취소</button>
                            <button onClick={submit} disabled={!form.title.trim()} className="rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">생성</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted leading-relaxed">
                <strong className="text-text-sub">🔬 출처</strong> · DB <code className="font-mono text-[10px]">marketing_content</code> · 콘텐츠 메타(제목·유형·상태·채널). SEO 점수·조회수 등 metrics는 외부 분석 연동 시 채워집니다.
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
