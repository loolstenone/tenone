'use client';

// 이벤트 관리 — AI 답변 변화 이벤트 (smarcomm_ai_diff_events)
// V2.0 § 3-C AIRM ④ 검증 + § 3-B Smart-Data Hub 모니터링 소스
// 정직성: 데이터 없으면 정직하게 빈 상태 안내 (휴리스틱 fallback 금지)

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

interface DiffEvent {
    id: string;
    platform: string;
    query: string;
    diff_type: string;
    before_excerpt: string | null;
    after_excerpt: string | null;
    summary: string | null;
    detected_at: string;
}

interface ApiResponse {
    events: DiffEvent[];
    total: number;
    byType: Record<string, number>;
    byPlatform: Record<string, number>;
    timeline: { date: string; improved: number; degraded: number; other: number }[];
    days: number;
}

const DIFF_META: Record<string, { label: string; color: string; bg: string; Icon: typeof TrendingUp }> = {
    improved: { label: '개선', color: '#16a34a', bg: '#16a34a15', Icon: TrendingUp },
    degraded: { label: '악화', color: '#dc2626', bg: '#dc262615', Icon: TrendingDown },
    unchanged: { label: '변화 없음', color: '#64748b', bg: '#64748b15', Icon: Activity },
    sentiment_flip: { label: '감성 반전', color: '#f59e0b', bg: '#f59e0b15', Icon: RefreshCw },
    fact_corrected: { label: '사실 교정', color: '#0ea5e9', bg: '#0ea5e915', Icon: CheckCircle2 },
    fact_introduced: { label: '오류 등장', color: '#ef4444', bg: '#ef444415', Icon: AlertTriangle },
};

const PLATFORM_COLORS: Record<string, string> = {
    claude: '#D4A574',
    chatgpt: '#10A37F',
    perplexity: '#20808D',
    naver_cue: '#03C75A',
    google_ai: '#4285F4',
};

export default function EventsPage() {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(30);
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterPlatform, setFilterPlatform] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ days: String(days) });
        if (filterType) params.set('diff_type', filterType);
        if (filterPlatform) params.set('platform', filterPlatform);
        fetch(`/api/smarcomm/ai-events?${params}`)
            .then(r => r.json())
            .then((res: ApiResponse | { error: string }) => {
                if ('error' in res) setError(res.error);
                else { setData(res); setError(null); }
            })
            .catch(e => setError(String(e)))
            .finally(() => setLoading(false));
    }, [days, filterType, filterPlatform]);

    const totalImproved = data ? (data.byType.improved ?? 0) + (data.byType.fact_corrected ?? 0) : 0;
    const totalDegraded = data ? (data.byType.degraded ?? 0) + (data.byType.fact_introduced ?? 0) : 0;
    const totalFlipped = data ? (data.byType.sentiment_flip ?? 0) : 0;

    return (
        <div className="max-w-6xl">
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-text">AI 답변 변화 이벤트</h1>
                        <GuideHelpButton />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                        주간 재진단으로 감지된 AI 답변 변화 — AIRM 교정 액션이 실제로 답변을 바꿨는지 검증합니다
                    </p>
                </div>
                <div className="flex gap-1">
                    {[7, 30, 90].map(d => (
                        <button key={d} onClick={() => setDays(d)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${days === d ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
                            {d}일
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <KpiCard label="총 변화" value={data?.total ?? 0} accent="#0F172A" loading={loading} />
                <KpiCard label="개선·교정" value={totalImproved} accent="#16a34a" loading={loading} />
                <KpiCard label="악화·오류" value={totalDegraded} accent="#dc2626" loading={loading} />
                <KpiCard label="감성 반전" value={totalFlipped} accent="#f59e0b" loading={loading} />
            </div>

            {/* 필터 */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-text-muted">변화 유형:</span>
                <button onClick={() => setFilterType(null)}
                    className={`rounded-full px-3 py-1 text-xs ${!filterType ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>전체</button>
                {Object.entries(DIFF_META).map(([key, meta]) => (
                    <button key={key} onClick={() => setFilterType(filterType === key ? null : key)}
                        className={`rounded-full px-3 py-1 text-xs ${filterType === key ? 'text-white' : 'hover:opacity-80'}`}
                        style={filterType === key ? { background: meta.color } : { background: meta.bg, color: meta.color }}>
                        {meta.label} {data?.byType[key] ? `· ${data.byType[key]}` : ''}
                    </button>
                ))}
            </div>

            {Object.keys(data?.byPlatform ?? {}).length > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-text-muted">플랫폼:</span>
                    <button onClick={() => setFilterPlatform(null)}
                        className={`rounded-full px-3 py-1 text-xs ${!filterPlatform ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>전체</button>
                    {Object.entries(data!.byPlatform).map(([p, count]) => (
                        <button key={p} onClick={() => setFilterPlatform(filterPlatform === p ? null : p)}
                            className={`rounded-full px-3 py-1 text-xs ${filterPlatform === p ? 'text-white' : 'bg-surface text-text-sub hover:text-text'}`}
                            style={filterPlatform === p ? { background: PLATFORM_COLORS[p] || '#0F172A' } : {}}>
                            {p} · {count}
                        </button>
                    ))}
                </div>
            )}

            {/* 빈 상태 / 에러 / 이벤트 목록 */}
            {loading && (
                <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-text-muted">
                    불러오는 중...
                </div>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6 text-sm text-danger">
                    에러: {error}
                </div>
            )}

            {!loading && !error && data && data.events.length === 0 && (
                <div className="rounded-2xl border border-border bg-white p-12 text-center">
                    <Activity size={32} className="mx-auto mb-3 text-text-muted" />
                    <div className="text-sm font-semibold text-text">감지된 답변 변화가 없습니다</div>
                    <p className="mt-2 text-xs text-text-muted leading-relaxed">
                        주간 자동 재진단(매주 월요일)이 누적되면 AI 답변 변화가 여기 표시됩니다.<br />
                        AIRM 교정 액션 → 30일 후 자동 재진단 → 답변 변화 감지의 흐름입니다.
                    </p>
                </div>
            )}

            {!loading && !error && data && data.events.length > 0 && (
                <div className="space-y-3">
                    {data.events.map(ev => {
                        const meta = DIFF_META[ev.diff_type] ?? DIFF_META.unchanged;
                        const Icon = meta.Icon;
                        return (
                            <div key={ev.id} className="rounded-2xl border border-border bg-white p-5">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                                            style={{ background: meta.bg, color: meta.color }}>
                                            <Icon size={11} /> {meta.label}
                                        </span>
                                        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                                            style={{ background: PLATFORM_COLORS[ev.platform] || '#64748b' }}>
                                            {ev.platform}
                                        </span>
                                        <span className="truncate text-sm font-medium text-text">{ev.query}</span>
                                    </div>
                                    <span className="shrink-0 text-xs text-text-muted">
                                        {new Date(ev.detected_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>

                                {ev.summary && (
                                    <p className="mb-3 text-sm text-text-sub leading-relaxed">{ev.summary}</p>
                                )}

                                {(ev.before_excerpt || ev.after_excerpt) && (
                                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
                                        <div className="rounded-lg border border-border bg-surface p-3">
                                            <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">이전</div>
                                            <div className="text-xs text-text-sub leading-relaxed line-clamp-4">{ev.before_excerpt || '—'}</div>
                                        </div>
                                        <ArrowRight size={16} className="hidden sm:block mt-6 mx-auto text-text-muted" />
                                        <div className="rounded-lg border p-3"
                                            style={{ borderColor: `${meta.color}30`, background: meta.bg }}>
                                            <div className="mb-1 text-[10px] font-medium uppercase tracking-wide" style={{ color: meta.color }}>이후</div>
                                            <div className="text-xs text-text-sub leading-relaxed line-clamp-4">{ev.after_excerpt || '—'}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted leading-relaxed">
                <strong className="text-text-sub">🔬 출처</strong> · DB <code className="font-mono text-[10px]">smarcomm_ai_diff_events</code> ·
                감지 방식 = 주간 자동 재진단 cron이 직전 진단과 답변 텍스트 diff → diff_type 분류 ·
                AIRM 교정 액션 효과 검증에 사용됩니다.
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
