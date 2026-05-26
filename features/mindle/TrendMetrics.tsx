// Mindle 5대 분석 모듈 컴포넌트 — Phase 1-D (Server Component 호환)
//
// 정직성 원칙:
//   - 데이터 없으면 "🚧 Phase 2 도입 예정" 안내 명시
//   - 신뢰도(confidence) 낮으면 노출
//   - 출처(source) 표기 (whole-see-llm / sometrend-api / manual 등)
//
// 사용: 트렌드 상세 페이지에서
//   <TrendMetrics metrics={metrics} />
// metrics는 fetchTrendMetrics(trendId)의 결과 (Partial<Record<MetricType, TrendMetric>>)

import {
    TrendingUp, MessageSquare, Smile, BarChart3, Users,
} from "lucide-react";
import type {
    TrendMetric,
    MetricType,
    MentionTrendPayload,
    RelatedKeywordsPayload,
    SentimentPayload,
    ComparisonPayload,
    CommunityPayload,
} from "@/lib/mindle/metrics";

interface TrendMetricsProps {
    metrics: Partial<Record<MetricType, TrendMetric>>;
}

export default function TrendMetrics({ metrics }: TrendMetricsProps) {
    const all: Array<{ type: MetricType; label: string; icon: React.ComponentType<{ className?: string }>; render: () => React.ReactNode }> = [
        { type: "mention_trend",    label: "언급량 추이", icon: TrendingUp,    render: () => <MentionTrendBlock m={metrics.mention_trend} /> },
        { type: "related_keywords", label: "연관어",      icon: MessageSquare, render: () => <RelatedKeywordsBlock m={metrics.related_keywords} /> },
        { type: "sentiment",        label: "감성",        icon: Smile,         render: () => <SentimentBlock m={metrics.sentiment} /> },
        { type: "comparison",       label: "비교 분석",   icon: BarChart3,     render: () => <ComparisonBlock m={metrics.comparison} /> },
        { type: "community",        label: "커뮤니티 반응", icon: Users,       render: () => <CommunityBlock m={metrics.community} /> },
    ];

    return (
        <section className="mt-10 mb-12">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-white">5대 분석</h2>
                <span className="text-[10px] text-neutral-500">
                    🔬 Sometrend 패턴 5종 — 데이터 없으면 "Phase 2 도입 예정" 명시 (정직성)
                </span>
            </div>
            <div className="space-y-3">
                {all.map(({ type, label, icon: Icon, render }) => (
                    <article key={type} className="rounded-xl border border-neutral-800/50 bg-neutral-900/40 p-5">
                        <header className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-[#F5C518]" />
                                <h3 className="text-sm font-semibold text-white">{label}</h3>
                            </div>
                            <MetricMeta m={metrics[type]} />
                        </header>
                        <div className="text-sm text-neutral-300">{render()}</div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function MetricMeta({ m }: { m?: TrendMetric }) {
    if (!m) {
        return (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                🚧 Phase 2 도입 예정
            </span>
        );
    }
    return (
        <div className="flex items-center gap-2 text-[10px] text-neutral-500">
            <span>출처: {m.source}</span>
            <span>·</span>
            <span>{m.computed_at.slice(0, 10)}</span>
            {m.confidence !== null && (
                <>
                    <span>·</span>
                    <span>신뢰도 {m.confidence}%</span>
                </>
            )}
        </div>
    );
}

function EmptyMetric({ note }: { note: string }) {
    return (
        <p className="text-xs text-neutral-500 leading-relaxed">
            현재 이 카드에 대한 실측 데이터가 없습니다. {note}
        </p>
    );
}

// ── 5종 블록 ──────────────────────────────────────────────────────────

function MentionTrendBlock({ m }: { m?: TrendMetric }) {
    if (!m) return <EmptyMetric note="Whole See 시계열 인덱싱(Phase 2) 도입 후 자동 채워집니다." />;
    const p = m.payload as MentionTrendPayload;
    if (!p.points || p.points.length === 0) return <EmptyMetric note="데이터 포인트 0건." />;
    // 단순 막대 차트 (Recharts 도입 없이 SVG)
    const max = Math.max(...p.points.map(pt => pt.count), 1);
    return (
        <div>
            <div className="flex items-end gap-1 h-24 mb-2">
                {p.points.map((pt) => {
                    const h = (pt.count / max) * 100;
                    return (
                        <div key={pt.date} className="flex-1 group relative">
                            <div
                                className="bg-[#F5C518]/40 hover:bg-[#F5C518] rounded-t transition-colors"
                                style={{ height: `${h}%` }}
                                title={`${pt.date}: ${pt.count.toLocaleString()}`}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="text-[10px] text-neutral-500 flex justify-between">
                <span>{p.points[0]?.date.slice(5)}</span>
                <span>총 {p.total.toLocaleString()}회 · {p.window}</span>
                <span>{p.points[p.points.length - 1]?.date.slice(5)}</span>
            </div>
        </div>
    );
}

function RelatedKeywordsBlock({ m }: { m?: TrendMetric }) {
    if (!m) return <EmptyMetric note="Whole See LLM 연관어 추출(Phase 2) 도입 후 자동 채워집니다." />;
    const p = m.payload as RelatedKeywordsPayload;
    if (!p.keywords || p.keywords.length === 0) return <EmptyMetric note="연관어 0건." />;
    const max = Math.max(...p.keywords.map(k => k.weight), 1);
    return (
        <div className="flex flex-wrap gap-2">
            {p.keywords.slice(0, 30).map((k) => {
                const size = 0.75 + (k.weight / max) * 0.5; // 0.75~1.25rem
                const color = k.sentiment === "pos" ? "text-emerald-300"
                            : k.sentiment === "neg" ? "text-rose-300"
                            : "text-neutral-300";
                return (
                    <span
                        key={k.word}
                        className={`${color} font-medium`}
                        style={{ fontSize: `${size}rem` }}
                    >
                        {k.word}
                    </span>
                );
            })}
        </div>
    );
}

function SentimentBlock({ m }: { m?: TrendMetric }) {
    if (!m) return <EmptyMetric note="Whole See LLM 감성 분류(Phase 2) 도입 후 자동 채워집니다." />;
    const p = m.payload as SentimentPayload;
    const total = p.positive + p.neutral + p.negative;
    if (total === 0) return <EmptyMetric note="감성 샘플 0건." />;
    const pos = Math.round((p.positive / total) * 100);
    const neu = Math.round((p.neutral / total) * 100);
    const neg = 100 - pos - neu;
    return (
        <div>
            <div className="h-3 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500" style={{ width: `${pos}%` }} title={`긍정 ${pos}%`} />
                <div className="bg-neutral-500" style={{ width: `${neu}%` }} title={`중립 ${neu}%`} />
                <div className="bg-rose-500" style={{ width: `${neg}%` }} title={`부정 ${neg}%`} />
            </div>
            <div className="mt-2 flex items-center gap-4 text-[11px]">
                <span className="text-emerald-400">긍정 {pos}%</span>
                <span className="text-neutral-400">중립 {neu}%</span>
                <span className="text-rose-400">부정 {neg}%</span>
                <span className="ml-auto text-neutral-500">샘플 {p.sample_size.toLocaleString()}</span>
            </div>
        </div>
    );
}

function ComparisonBlock({ m }: { m?: TrendMetric }) {
    if (!m) return <EmptyMetric note="키워드 2~3개 동시 비교(Phase 2) 도입 예정. 다른 트렌드 카드와의 시계열 동기 분석." />;
    const p = m.payload as ComparisonPayload;
    if (!p.items || p.items.length === 0) return <EmptyMetric note="비교 대상 0건." />;
    return (
        <div className="space-y-3">
            {p.items.map(it => {
                const max = Math.max(...it.values.map(v => v.count), 1);
                return (
                    <div key={it.label}>
                        <div className="text-xs text-neutral-300 mb-1">{it.label}</div>
                        <div className="flex items-end gap-0.5 h-12">
                            {it.values.map(v => (
                                <div
                                    key={v.date}
                                    className="flex-1 bg-blue-400/40 rounded-t"
                                    style={{ height: `${(v.count / max) * 100}%` }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function CommunityBlock({ m }: { m?: TrendMetric }) {
    if (!m) return <EmptyMetric note="커뮤니티(Twitter·Reddit·네이버 카페 등) 반응 크롤(Phase 2) 도입 예정." />;
    const p = m.payload as CommunityPayload;
    if (!p.snippets || p.snippets.length === 0) return <EmptyMetric note="커뮤니티 반응 0건." />;
    return (
        <ul className="space-y-2">
            {p.snippets.slice(0, 5).map((s, i) => (
                <li key={i} className="text-xs text-neutral-300 border-l-2 border-neutral-700 pl-3">
                    <div className="flex items-center gap-2 mb-0.5 text-[10px] text-neutral-500">
                        <span className="font-semibold">{s.platform}</span>
                        {s.engagement !== undefined && <span>· 반응 {s.engagement.toLocaleString()}</span>}
                    </div>
                    {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {s.text}
                        </a>
                    ) : (
                        <span>{s.text}</span>
                    )}
                </li>
            ))}
        </ul>
    );
}
