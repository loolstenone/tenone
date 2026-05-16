'use client';

// 고객 관리 — crm_people + crm_segments 실 DB 데이터
// V2.0 § 3-B Smart-Data Hub의 회원/리드 데이터 소스

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Bell, Mail, MessageSquare, ChevronRight, Users, Tag } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

interface Person {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    position: string;
    lifecycle_stage: string;
    status: string;
    source: string;
    tags: string[];
    last_contacted: string | null;
    avatar_initials: string | null;
    do_not_email: boolean;
    created_at: string;
}

interface Segment {
    id: string;
    name: string;
    description: string;
    kind: string;
    color: string;
    count: number | null;
}

interface PeopleResp {
    people: Person[];
    total: number;
    byStage: Record<string, number>;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    emailReachable: number;
}

const STAGE_LABEL: Record<string, string> = {
    subscriber: '구독자',
    lead: '리드',
    mql: 'MQL',
    sql: 'SQL',
    opportunity: '기회',
    customer: '고객',
    evangelist: '추천자',
    churned: '이탈',
};

const STAGE_COLOR: Record<string, string> = {
    subscriber: '#94a3b8',
    lead: '#3b82f6',
    mql: '#8b5cf6',
    sql: '#a855f7',
    opportunity: '#f59e0b',
    customer: '#10b981',
    evangelist: '#ec4899',
    churned: '#64748b',
};

export default function CRMPage() {
    const router = useRouter();
    const [data, setData] = useState<PeopleResp | null>(null);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch('/api/smarcomm/crm/people').then(r => r.json()),
            fetch('/api/smarcomm/crm/segments').then(r => r.json()),
        ]).then(([p, s]) => {
            if (!('error' in p)) setData(p);
            if (Array.isArray(s?.segments)) setSegments(s.segments);
        }).finally(() => setLoading(false));
    }, []);

    const filtered = (data?.people ?? []).filter(p => {
        if (stageFilter && p.lifecycle_stage !== stageFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.company.toLowerCase().includes(q));
        }
        return true;
    });

    const stageEntries = Object.entries(data?.byStage ?? {}).sort((a, b) => b[1] - a[1]);

    return (
        <div className="max-w-6xl">
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">고객 관리</h1><GuideHelpButton /></div>
                    <p className="mt-1 text-xs text-text-muted">리드부터 고객까지, 라이프사이클 단계별로 관리합니다</p>
                </div>
                <button className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
                    <Plus size={15} /> 고객 추가
                </button>
            </div>

            {/* 채널 바로가기 */}
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {[
                    { icon: Bell, label: '푸시 메시지', href: '/smarcomm/dashboard/crm/push' },
                    { icon: Mail, label: '이메일', href: '/smarcomm/dashboard/crm/email' },
                    { icon: MessageSquare, label: '카카오 메시지', href: '/smarcomm/dashboard/crm/kakao' },
                ].map((channel, i) => (
                    <button key={i} onClick={() => router.push(channel.href)}
                        className="flex items-center justify-between rounded-2xl border border-border bg-white p-4 hover:bg-surface text-left">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface"><channel.icon size={16} className="text-text-sub" /></div>
                            <div className="text-sm font-semibold text-text">{channel.label}</div>
                        </div>
                        <ChevronRight size={14} className="text-text-muted" />
                    </button>
                ))}
            </div>

            {/* KPI */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <KpiCard label="총 고객" value={data?.total ?? 0} accent="#0F172A" loading={loading} />
                <KpiCard label="발송 가능 이메일" value={data?.emailReachable ?? 0} accent="#10b981" loading={loading} />
                <KpiCard label="세그먼트" value={segments.length} accent="#3b82f6" loading={loading} />
                <KpiCard label="활성" value={data?.byStatus?.Active ?? 0} accent="#8b5cf6" loading={loading} />
            </div>

            {/* 세그먼트 */}
            {segments.length > 0 && (
                <div className="mb-6 rounded-2xl border border-border bg-white p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <Tag size={14} className="text-text-sub" />
                        <h2 className="text-sm font-semibold text-text">세그먼트</h2>
                        <span className="text-xs text-text-muted">{segments.length}개</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {segments.map(s => (
                            <div key={s.id} className="rounded-xl border border-border p-3">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                                    <span className="text-xs font-medium text-text">{s.name}</span>
                                    <span className="ml-auto text-[10px] text-text-muted">{s.kind}</span>
                                </div>
                                {s.description && <p className="mt-1 text-[10px] text-text-muted line-clamp-1">{s.description}</p>}
                                <div className="mt-2 text-xs font-bold" style={{ color: s.color }}>
                                    {s.count !== null ? `${s.count}명` : '계산 대기'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 라이프사이클 단계 필터 */}
            {stageEntries.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-text-muted">라이프사이클:</span>
                    <button onClick={() => setStageFilter(null)}
                        className={`rounded-full px-3 py-1 text-xs ${!stageFilter ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>전체 {data?.total ?? 0}</button>
                    {stageEntries.map(([stage, count]) => (
                        <button key={stage} onClick={() => setStageFilter(stageFilter === stage ? null : stage)}
                            className={`rounded-full px-3 py-1 text-xs ${stageFilter === stage ? 'text-white' : 'hover:opacity-80'}`}
                            style={stageFilter === stage ? { background: STAGE_COLOR[stage] || '#64748b' } : { background: (STAGE_COLOR[stage] || '#64748b') + '15', color: STAGE_COLOR[stage] || '#64748b' }}>
                            {STAGE_LABEL[stage] || stage} · {count}
                        </button>
                    ))}
                </div>
            )}

            {/* 검색 */}
            <div className="mb-4 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="이름·이메일·회사 검색"
                    className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
            </div>

            {/* 고객 목록 */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
                {loading && <div className="p-12 text-center text-sm text-text-muted">불러오는 중...</div>}
                {!loading && filtered.length === 0 && (
                    <div className="p-12 text-center">
                        <Users size={32} className="mx-auto mb-3 text-text-muted" />
                        <div className="text-sm font-semibold text-text">
                            {(data?.total ?? 0) === 0 ? '아직 고객이 없습니다' : '검색 결과 없음'}
                        </div>
                        <p className="mt-2 text-xs text-text-muted">
                            회원가입·문의·뉴스레터 구독 시 자동으로 추가됩니다.
                        </p>
                    </div>
                )}
                {!loading && filtered.length > 0 && (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs text-text-muted">
                                <th className="px-5 py-3 text-left font-medium">고객</th>
                                <th className="px-5 py-3 text-left font-medium">이메일</th>
                                <th className="px-5 py-3 text-left font-medium">단계</th>
                                <th className="px-5 py-3 text-left font-medium">출처</th>
                                <th className="px-5 py-3 text-right font-medium">최근 접촉</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-text text-white text-[10px] font-bold">
                                                {p.avatar_initials || p.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-text">{p.name}</div>
                                                {p.company && <div className="text-[10px] text-text-muted">{p.company}{p.position ? ` · ${p.position}` : ''}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-text-sub">
                                        {p.email}
                                        {p.do_not_email && <span className="ml-1.5 rounded bg-danger/10 px-1.5 py-0.5 text-[9px] text-danger">발송불가</span>}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                                            style={{ background: (STAGE_COLOR[p.lifecycle_stage] || '#64748b') + '15', color: STAGE_COLOR[p.lifecycle_stage] || '#64748b' }}>
                                            {STAGE_LABEL[p.lifecycle_stage] || p.lifecycle_stage}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-text-muted text-xs">{p.source || '-'}</td>
                                    <td className="px-5 py-3 text-right text-xs text-text-muted">{p.last_contacted || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted leading-relaxed">
                <strong className="text-text-sub">🔬 출처</strong> · DB <code className="font-mono text-[10px]">crm_people</code> + <code className="font-mono text-[10px]">crm_segments</code> ·
                회원가입 · 뉴스레터 구독 · 문의 폼에서 자동 동기화됩니다. 세그먼트는 dynamic(쿼리 기반) 또는 static(수동 큐레이션) 방식.
            </div>
        </div>
    );
}

function KpiCard({ label, value, accent, loading }: { label: string; value: number; accent: string; loading: boolean }) {
    return (
        <div className="rounded-2xl border border-border bg-white p-4">
            <div className="text-xs text-text-muted">{label}</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: accent }}>
                {loading ? '—' : value.toLocaleString()}
            </div>
        </div>
    );
}
