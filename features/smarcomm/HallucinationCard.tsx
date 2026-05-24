'use client';

// Phase 3.4 — 환각 감지 (Hallucination) Report 섹션
// D.SaiO의 핵심 차별점 대응.
//
// 입력:
//   - hallucinations: AI 응답에서 감지된 사실 오류·부분 일치·미언급
//   - brandFacts: 자사 사이트에서 추출한 ground truth (참고용)
//
// 정직성:
//   - 데이터 없으면 카드 자체를 노출하지 않음 (호출 측에서 length 체크)
//   - factual_error / partial_match / unverifiable 명확히 구분
//   - 가짜 점수·억지 결론 금지

import { AlertOctagon, AlertTriangle, HelpCircle, ShieldCheck } from 'lucide-react';

export interface Hallucination {
    platform: string;
    claim_text: string;
    claim_type: string | null;
    ground_truth: Record<string, unknown> | null;
    severity: 'factual_error' | 'partial_match' | 'unverifiable';
    explanation: string | null;
    confidence: number;
    detected_at: string;
}

export interface BrandFact {
    fact_type: string;
    fact_value: Record<string, unknown>;
    source: string;
    raw_excerpt: string | null;
    confidence: number;
}

const PLATFORM_LABEL: Record<string, string> = {
    claude: 'Claude',
    chatgpt: 'ChatGPT',
    perplexity: 'Perplexity',
    'google-aio': 'Google AI Overview',
    'naver-cue': '네이버 Cue',
};

const FACT_TYPE_LABEL: Record<string, string> = {
    price: '가격',
    features: '핵심 기능',
    strengths: '강점',
    founded: '설립 연도',
    category: '업종',
    location: '위치',
    spec: '스펙',
    other: '기타',
};

const SEVERITY_META = {
    factual_error: {
        label: '사실 오류',
        description: 'AI가 사이트와 다른 사실을 단언',
        icon: AlertOctagon,
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-800',
    },
    partial_match: {
        label: '부분 일치',
        description: '방향은 맞지만 세부 다름',
        icon: AlertTriangle,
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-800',
    },
    unverifiable: {
        label: '미언급',
        description: 'AI가 해당 사실을 다루지 않음',
        icon: HelpCircle,
        bg: 'bg-neutral-50',
        border: 'border-neutral-200',
        text: 'text-neutral-700',
        badge: 'bg-neutral-100 text-neutral-700',
    },
} as const;

function formatFactValue(value: Record<string, unknown> | null): string {
    if (!value) return '—';
    if (typeof value.value === 'string') return value.value;
    if (typeof value.value === 'number') return String(value.value);
    if (typeof value.year === 'number') return `${value.year}년`;
    if (Array.isArray(value.items)) return value.items.slice(0, 3).join(', ');
    if (value.currency && value.value) {
        const symbol = value.currency === 'KRW' ? '원' : value.currency === 'USD' ? '$' : '€';
        const period = value.period === 'month' ? '/월' : value.period === 'year' ? '/년' : '';
        return `${Number(value.value).toLocaleString('ko-KR')}${symbol}${period}`;
    }
    return JSON.stringify(value).slice(0, 60);
}

export default function HallucinationCard({
    hallucinations,
    brandFacts,
}: {
    hallucinations: Hallucination[];
    brandFacts: BrandFact[];
}) {
    const counts = {
        factual_error: hallucinations.filter(h => h.severity === 'factual_error').length,
        partial_match: hallucinations.filter(h => h.severity === 'partial_match').length,
        unverifiable: hallucinations.filter(h => h.severity === 'unverifiable').length,
    };
    const errorTotal = counts.factual_error;
    const total = hallucinations.length;
    const factsCount = brandFacts.length;

    // 정직성: 검증 자체가 안 됐으면 (siteTruth=0 or LLM skip) 그 사실을 표기
    const noGroundTruth = factsCount === 0;

    return (
        <div className="mb-10 rounded-2xl border border-border bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <ShieldCheck size={18} className="text-text" />
                <h2 className="text-[15px] font-bold text-text">환각 감지 (Hallucination Detection)</h2>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">D.SaiO 대응 신규</span>
                <span className="ml-auto text-[10px] text-text-muted">
                    Ground truth {factsCount}건 · AI 주장 {total}건 분석
                </span>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-text-sub">
                AI가 자사 브랜드를 어떻게 묘사하는지, 사이트에서 추출한 사실(Schema·Meta·본문)과 대조해 검증합니다.
                LLM이 의미적으로 판정하므로 단순 키워드 매칭보다 정교합니다.
            </p>

            {/* 정직성 — Ground truth 없을 때 */}
            {noGroundTruth && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                    <strong>검증 불가</strong> — 사이트에서 추출 가능한 정형 사실(Schema·Meta)이 없어 환각 비교를 수행하지 못했습니다.
                    Schema.org Organization·Product 마크업을 추가하면 정확도가 향상됩니다.
                </div>
            )}

            {/* 요약 통계 */}
            {!noGroundTruth && (
                <div className="mb-5 grid grid-cols-3 gap-2">
                    {(['factual_error', 'partial_match', 'unverifiable'] as const).map(sev => {
                        const meta = SEVERITY_META[sev];
                        const Icon = meta.icon;
                        const count = counts[sev];
                        return (
                            <div key={sev} className={`rounded-xl border ${meta.border} ${meta.bg} p-3`}>
                                <div className="mb-1 flex items-center gap-1.5">
                                    <Icon size={14} className={meta.text} />
                                    <span className={`text-xs font-bold ${meta.text}`}>{meta.label}</span>
                                </div>
                                <p className={`text-2xl font-extrabold tabular-nums ${meta.text}`}>{count}</p>
                                <p className="text-[10px] text-text-muted leading-tight mt-0.5">{meta.description}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Ground truth 요약 */}
            {factsCount > 0 && (
                <div className="mb-5 rounded-xl border border-border bg-surface p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                        Ground Truth — 사이트에서 추출한 사실
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {brandFacts.map((f, i) => (
                            <div key={i} className="rounded-md border border-border bg-white px-2 py-1 text-[11px]">
                                <span className="font-semibold text-text">{FACT_TYPE_LABEL[f.fact_type] ?? f.fact_type}</span>
                                <span className="ml-1.5 text-text-sub">{formatFactValue(f.fact_value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 사실 오류 + 부분 일치만 상세 노출 — unverifiable은 요약만 */}
            {errorTotal + counts.partial_match > 0 && (
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">상세 — 검증 가능한 주장</p>
                    {hallucinations
                        .filter(h => h.severity !== 'unverifiable')
                        .slice(0, 20)
                        .map((h, i) => {
                            const meta = SEVERITY_META[h.severity];
                            return (
                                <div key={i} className={`rounded-xl border ${meta.border} ${meta.bg} p-3`}>
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}>
                                            {meta.label}
                                        </span>
                                        <span className="text-[10px] font-medium text-text-sub">
                                            {PLATFORM_LABEL[h.platform] ?? h.platform}
                                        </span>
                                        {h.claim_type && (
                                            <span className="text-[10px] text-text-muted">
                                                · {FACT_TYPE_LABEL[h.claim_type] ?? h.claim_type}
                                            </span>
                                        )}
                                        <span className="ml-auto text-[10px] text-text-muted">신뢰도 {h.confidence}%</span>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-text-muted">AI 주장</p>
                                            <p className="text-xs text-text">{h.claim_text}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-text-muted">실제 (사이트)</p>
                                            <p className="text-xs text-text">{formatFactValue(h.ground_truth)}</p>
                                        </div>
                                    </div>
                                    {h.explanation && (
                                        <p className="mt-2 text-[11px] italic text-text-sub">🤖 {h.explanation}</p>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )}

            {!noGroundTruth && errorTotal === 0 && counts.partial_match === 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
                    <strong>환각 감지 0건</strong> — AI 응답이 사이트 사실과 모순되지 않습니다. (미언급은 환각이 아니라 노출 부족 문제이며, AI Visibility Map에서 별도 분석됩니다.)
                </div>
            )}
        </div>
    );
}
